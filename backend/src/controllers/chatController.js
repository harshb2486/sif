// Chat Controller
// Handles chat endpoint logic

const Chat = require('../models/Chat');
const chatbotService = require('../services/chatbotService');
const logger = require('../utils/logger');
const { AppError, ValidationError } = require('../utils/AppError');
const { v4: uuidv4 } = require('uuid');

/**
 * Send message and get AI response
 * POST /chat/message
 */
const sendMessage = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    // Validation
    if (!message || !message.trim()) {
      throw new ValidationError('Message content is required');
    }

    if (message.length > 5000) {
      throw new ValidationError('Message exceeds maximum length (5000 characters)');
    }

    if (!userId || !companyId) {
      throw new AppError('Authentication required', 401);
    }

    // Generate conversation ID if not provided
    const convId = conversationId || uuidv4();

    // Create or update session
    const sessionTitle = !conversationId ? chatbotService.generateConversationTitle(message) : null;
    await Chat.createOrUpdateSession(userId, companyId, convId, sessionTitle);

    // Save user message
    await Chat.createMessage(userId, companyId, convId, 'user', message);

    // Get conversation history (last 10 messages for context)
    const history = await Chat.getConversationMessages(companyId, convId, 10);

    // Get sales context
    const context = await chatbotService.getSalesContext(userId, companyId);

    // Get AI response
    const aiResponse = await chatbotService.chat(message, history, context);

    // Save assistant message
    await Chat.createMessage(
      userId,
      companyId,
      convId,
      'assistant',
      aiResponse.message,
      aiResponse.tokensUsed,
      aiResponse.metadata
    );

    // Update session tokens
    await Chat.updateSessionTokens(convId, aiResponse.tokensUsed);

    logger.info('Chat message processed', {
      userId,
      conversationId: convId,
      tokensUsed: aiResponse.tokensUsed
    });

    res.json({
      success: true,
      data: {
        conversationId: convId,
        userMessage: message,
        aiResponse: aiResponse.message,
        metadata: {
          tokensUsed: aiResponse.tokensUsed,
          model: aiResponse.model
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get conversation history
 * GET /chat/conversations/:conversationId
 */
const getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const companyId = req.user?.company_id;

    if (!companyId) {
      throw new AppError('Authentication required', 401);
    }

    const messages = await Chat.getConversationMessages(companyId, conversationId, 100);

    res.json({
      success: true,
      data: {
        conversationId,
        messages,
        messageCount: messages.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's conversations
 * GET /chat/conversations
 */
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.company_id;
    const limit = parseInt(req.query.limit) || 20;

    if (!userId || !companyId) {
      throw new AppError('Authentication required', 401);
    }

    const conversations = await Chat.getUserConversations(userId, companyId, limit);

    res.json({
      success: true,
      data: {
        conversations,
        count: conversations.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search conversations
 * GET /chat/search
 */
const searchConversations = async (req, res, next) => {
  try {
    const { q } = req.query;
    const userId = req.user?.id;
    const companyId = req.user?.company_id;

    if (!q || q.length < 2) {
      throw new ValidationError('Search query must be at least 2 characters');
    }

    if (!userId || !companyId) {
      throw new AppError('Authentication required', 401);
    }

    const results = await Chat.searchConversations(userId, companyId, q);

    res.json({
      success: true,
      data: {
        query: q,
        results,
        count: results.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete conversation
 * DELETE /chat/conversations/:conversationId
 */
const deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const companyId = req.user?.company_id;

    if (!companyId) {
      throw new AppError('Authentication required', 401);
    }

    await Chat.deleteConversation(conversationId, companyId);

    logger.info('Conversation deleted', {
      conversationId,
      companyId
    });

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get chat status/health
 * GET /chat/status
 */
const getChatStatus = async (req, res, next) => {
  try {
    const hasApiKey = !!process.env.OPENAI_API_KEY;

    res.json({
      success: true,
      data: {
        status: hasApiKey ? 'ready' : 'unconfigured',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        features: ['message', 'conversation-history', 'search', 'commission-calc'],
        message: hasApiKey ? 'Chat service is ready' : 'OpenAI API key not configured'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  searchConversations,
  deleteConversation,
  getChatStatus
};
