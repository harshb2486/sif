const express = require('express');
const ownerSalesChatController = require('../controllers/ownerSalesChatController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('company_admin', 'sales'));

router.get('/contacts', ownerSalesChatController.getContacts);
router.get('/conversations', ownerSalesChatController.getConversations);
router.get('/conversations/:contactUserId/messages', ownerSalesChatController.getConversationMessages);
router.post('/messages', ownerSalesChatController.sendMessage);

module.exports = router;