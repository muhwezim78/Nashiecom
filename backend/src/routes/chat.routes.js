const express = require("express");
const chatController = require("../controllers/chat.controller");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/", adminOnly, chatController.getAllChats);
router.get("/:orderId", chatController.getOrderMessages);
router.post("/:orderId", chatController.sendMessage);

module.exports = router;
