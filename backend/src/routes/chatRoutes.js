// Chat Routes
// Endpoints for chatbot interactions

const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { validate } = require('../middleware/validationMiddleware');
const Joi = require('joi');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /chat/status:
 *   get:
 *     summary: Get chat service status
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat service status
 */
router.get('/status', asyncHandler(chatController.getChatStatus));

/**
 * @swagger
 * /chat/message:
 *   post:
 *     summary: Send message to AI assistant
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: User message
 *               conversationId:
 *                 type: string
 *                 description: Optional conversation ID (creates new if not provided)
 *             required:
 *               - message
 *     responses:
 *       200:
 *         description: AI response received
 */
router.post('/message',
  validate(Joi.object({
    message: Joi.string().max(5000).required(),
    conversationId: Joi.string().optional()
  })),
  asyncHandler(chatController.sendMessage)
);

/**
 * @swagger
 * /chat/conversations:
 *   get:
 *     summary: Get user's conversations
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of conversations to retrieve
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get('/conversations', asyncHandler(chatController.getConversations));

/**
 * @swagger
 * /chat/conversations/{conversationId}:
 *   get:
 *     summary: Get conversation messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation messages
 */
router.get('/conversations/:conversationId', asyncHandler(chatController.getConversation));

/**
 * @swagger
 * /chat/conversations/{conversationId}:
 *   delete:
 *     summary: Delete conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation deleted
 */
router.delete('/conversations/:conversationId', asyncHandler(chatController.deleteConversation));

/**
 * @swagger
 * /chat/search:
 *   get:
 *     summary: Search conversations
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', asyncHandler(chatController.searchConversations));

module.exports = router;
