const OwnerSalesChat = require('../models/OwnerSalesChat');

const getContacts = async (req, res) => {
  try {
    const currentUser = req.user;
    const actor = await OwnerSalesChat.getUserById(currentUser.id);

    if (!actor) {
      return res.status(404).json({
        success: false,
        message: 'Current user not found'
      });
    }

    const contacts = await OwnerSalesChat.getAvailableContacts(
      actor.id,
      actor.company_id,
      actor.role
    );

    return res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: error.message
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const currentUser = req.user;
    const actor = await OwnerSalesChat.getUserById(currentUser.id);

    if (!actor) {
      return res.status(404).json({
        success: false,
        message: 'Current user not found'
      });
    }

    const conversations = await OwnerSalesChat.getConversationListForUser(
      actor.id,
      actor.company_id,
      actor.role
    );

    return res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const currentUser = req.user;
    const actor = await OwnerSalesChat.getUserById(currentUser.id);

    if (!actor) {
      return res.status(404).json({
        success: false,
        message: 'Current user not found'
      });
    }

    const contactUserId = Number(req.params.contactUserId);
    const limit = Number(req.query.limit) || 100;

    if (!contactUserId || Number.isNaN(contactUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid contact user id is required'
      });
    }

    const permission = await OwnerSalesChat.canCommunicate(actor, contactUserId);
    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message: permission.reason
      });
    }

    const conversation = await OwnerSalesChat.createOrGetConversation(
      permission.companyId || actor.company_id,
      actor,
      permission.targetUser
    );

    const messages = await OwnerSalesChat.getMessagesByConversationId(conversation.id, limit);

    return res.status(200).json({
      success: true,
      data: {
        conversation,
        contact: permission.targetUser,
        messages
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const currentUser = req.user;
    const actor = await OwnerSalesChat.getUserById(currentUser.id);

    if (!actor) {
      return res.status(404).json({
        success: false,
        message: 'Current user not found'
      });
    }

    const { contactUserId, content } = req.body;

    const targetId = Number(contactUserId);

    if (!targetId || Number.isNaN(targetId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid contact user id is required'
      });
    }

    if (!content || !String(content).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const permission = await OwnerSalesChat.canCommunicate(actor, targetId);
    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message: permission.reason
      });
    }

    const conversation = await OwnerSalesChat.createOrGetConversation(
      permission.companyId || actor.company_id,
      actor,
      permission.targetUser
    );

    const message = await OwnerSalesChat.createMessage(
      conversation.id,
      actor.id,
      String(content).trim()
    );

    return res.status(201).json({
      success: true,
      data: {
        conversation,
        message
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

module.exports = {
  getContacts,
  getConversations,
  getConversationMessages,
  sendMessage
};