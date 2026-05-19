import express from "express";

import {
    createChat,
    deleteChat,
    getChats
} from "../controllers/chatController.js";

import { protect } from "../middlewares/auth.js";

const chatRouter = express.Router();

// Create Chat
chatRouter.post(
    '/create',
    protect,
    createChat
);

// Get Chats
chatRouter.get(
    '/get',
    protect,
    getChats
);

// Delete Chat
chatRouter.post(
    '/delete',
    protect,
    deleteChat
);

export default chatRouter;