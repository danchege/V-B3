const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');
const { check } = require('express-validator');

// Chat routes
router.post(
  '/',
  [
    auth,
    check('participants', 'At least one participant is required').isArray({ min: 1 }),
    check('participants.*', 'Invalid participant ID').isMongoId(),
    check('type', 'Invalid chat type').optional().isIn(['direct', 'group']),
    check('name', 'Chat name is required for group chats')
      .if((value, { req }) => req.body.type === 'group')
      .notEmpty()
  ],
  chatController.createChat
);

router.get(
  '/',
  [
    auth,
    check('page', 'Page number must be a positive integer').optional().isInt({ min: 1 }),
    check('limit', 'Limit must be a positive integer').optional().isInt({ min: 1, max: 100 })
  ],
  chatController.getUserChats
);

// Message routes within a chat
router.get(
  '/:chatId/messages',
  [
    auth,
    check('before', 'Invalid timestamp').optional().isISO8601(),
    check('limit', 'Limit must be a positive integer').optional().isInt({ min: 1, max: 100 })
  ],
  chatController.getChatMessages
);

router.post(
  '/:chatId/messages',
  [
    auth,
    check('content', 'Message content is required')
      .if((value, { req }) => !req.body.attachment)
      .notEmpty(),
    check('type', 'Invalid message type').optional().isIn([
      'text', 'image', 'video', 'audio', 'document', 'location', 'contact'
    ]),
    check('replyTo', 'Invalid message ID to reply to').optional().isMongoId()
  ],
  chatController.sendMessage
);

// Message actions
router.delete(
  '/messages/:messageId',
  [auth],
  chatController.deleteMessage
);

router.post(
  '/messages/:messageId/reactions',
  [
    auth,
    check('emoji', 'Emoji is required').notEmpty()
  ],
  chatController.addReaction
);

// For backward compatibility with existing frontend
router.get(
  '/:matchId',
  [auth],
  (req, res, next) => {
    // Transform the request to match the new format
    req.params.chatId = req.params.matchId;
    return chatController.getChatMessages(req, res, next);
  }
);

router.post(
  '/',
  [
    auth,
    check('matchId', 'Match ID is required').notEmpty(),
    check('text', 'Message text is required').notEmpty()
  ],
  (req, res, next) => {
    // Transform the request to match the new format
    req.params.chatId = req.body.matchId;
    req.body.content = req.body.text;
    return chatController.sendMessage(req, res, next);
  }
);

module.exports = router;
