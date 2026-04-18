const { Server } = require('socket.io');
const { verifyToken } = require('../utils/helpers');
const OwnerSalesChat = require('../models/OwnerSalesChat');
const logger = require('../utils/logger');

const onlineUsers = new Map();

const addOnlineUserSocket = (userId, socketId) => {
  const key = String(userId);
  const existing = onlineUsers.get(key) || new Set();
  existing.add(socketId);
  onlineUsers.set(key, existing);
};

const removeOnlineUserSocket = (userId, socketId) => {
  const key = String(userId);
  const existing = onlineUsers.get(key);
  if (!existing) return;
  existing.delete(socketId);
  if (existing.size === 0) {
    onlineUsers.delete(key);
  }
};

const emitPresence = (io, companyId) => {
  const onlineUserIds = Array.from(onlineUsers.keys()).map((id) => Number(id));
  io.to(`company:${companyId}`).emit('presence:update', { onlineUserIds });
};

const initSocket = (httpServer) => {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : '*';

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const authToken = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!authToken) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = verifyToken(authToken);
      const user = await OwnerSalesChat.getUserById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      if (!['company_admin', 'sales'].includes(user.role)) {
        return next(new Error('Only company admins and sales can use realtime communication'));
      }

      socket.user = {
        id: user.id,
        name: user.name,
        role: user.role,
        companyId: user.company_id,
        isVerified: !!user.is_verified
      };

      next();
    } catch (error) {
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const currentUser = socket.user;
    const userRoom = `user:${currentUser.id}`;
    const companyRoom = `company:${currentUser.companyId}`;

    socket.join(userRoom);
    socket.join(companyRoom);
    addOnlineUserSocket(currentUser.id, socket.id);
    emitPresence(io, currentUser.companyId);

    logger.info('Socket connected', {
      userId: currentUser.id,
      socketId: socket.id,
      role: currentUser.role
    });

    socket.on('chat:send', async (payload = {}, callback = () => {}) => {
      try {
        const contactUserId = Number(payload.contactUserId);
        const content = String(payload.content || '').trim();

        if (!contactUserId || Number.isNaN(contactUserId)) {
          callback({ success: false, message: 'Valid contact user id is required' });
          return;
        }

        if (!content) {
          callback({ success: false, message: 'Message content is required' });
          return;
        }

        const permission = await OwnerSalesChat.canCommunicate(currentUser, contactUserId);
        if (!permission.allowed) {
          callback({ success: false, message: permission.reason });
          return;
        }

        const conversation = await OwnerSalesChat.createOrGetConversation(
          permission.companyId || currentUser.companyId,
          currentUser,
          permission.targetUser
        );

        const savedMessage = await OwnerSalesChat.createMessage(
          conversation.id,
          currentUser.id,
          content
        );

        const outbound = {
          conversationId: conversation.id,
          contactUserId,
          message: savedMessage
        };

        io.to(`user:${currentUser.id}`).emit('chat:new', outbound);
        io.to(`user:${contactUserId}`).emit('chat:new', outbound);

        callback({ success: true, data: outbound });
      } catch (error) {
        logger.error('chat:send failed', {
          userId: currentUser.id,
          contactUserId: payload?.contactUserId,
          message: error.message,
          stack: error.stack
        });
        callback({ success: false, message: 'Failed to send message' });
      }
    });

    socket.on('call:initiate', async (payload = {}, callback = () => {}) => {
      try {
        const contactUserId = Number(payload.contactUserId);
        const callType = payload.callType === 'video' ? 'video' : 'audio';

        const permission = await OwnerSalesChat.canCommunicate(currentUser, contactUserId);
        if (!permission.allowed) {
          callback({ success: false, message: permission.reason });
          return;
        }

        const callData = {
          fromUserId: currentUser.id,
          fromUserName: currentUser.name,
          toUserId: contactUserId,
          callType,
          startedAt: new Date().toISOString()
        };

        io.to(`user:${contactUserId}`).emit('call:incoming', callData);
        callback({ success: true, data: callData });
      } catch (error) {
        callback({ success: false, message: 'Failed to initiate call' });
      }
    });

    socket.on('call:accept', (payload = {}) => {
      const targetUserId = Number(payload.targetUserId);
      io.to(`user:${targetUserId}`).emit('call:accepted', {
        byUserId: currentUser.id,
        byUserName: currentUser.name,
        callType: payload.callType || 'audio'
      });
    });

    socket.on('call:reject', (payload = {}) => {
      const targetUserId = Number(payload.targetUserId);
      io.to(`user:${targetUserId}`).emit('call:rejected', {
        byUserId: currentUser.id,
        byUserName: currentUser.name
      });
    });

    socket.on('call:end', (payload = {}) => {
      const targetUserId = Number(payload.targetUserId);
      io.to(`user:${targetUserId}`).emit('call:ended', {
        byUserId: currentUser.id,
        byUserName: currentUser.name
      });
    });

    socket.on('webrtc:offer', (payload = {}) => {
      const targetUserId = Number(payload.targetUserId);
      io.to(`user:${targetUserId}`).emit('webrtc:offer', {
        fromUserId: currentUser.id,
        sdp: payload.sdp
      });
    });

    socket.on('webrtc:answer', (payload = {}) => {
      const targetUserId = Number(payload.targetUserId);
      io.to(`user:${targetUserId}`).emit('webrtc:answer', {
        fromUserId: currentUser.id,
        sdp: payload.sdp
      });
    });

    socket.on('webrtc:ice-candidate', (payload = {}) => {
      const targetUserId = Number(payload.targetUserId);
      io.to(`user:${targetUserId}`).emit('webrtc:ice-candidate', {
        fromUserId: currentUser.id,
        candidate: payload.candidate
      });
    });

    socket.on('disconnect', () => {
      removeOnlineUserSocket(currentUser.id, socket.id);
      emitPresence(io, currentUser.companyId);
      logger.info('Socket disconnected', {
        userId: currentUser.id,
        socketId: socket.id
      });
    });
  });

  return io;
};

module.exports = {
  initSocket
};