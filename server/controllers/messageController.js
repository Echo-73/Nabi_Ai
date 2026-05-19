import Chat from "../models/Chat.js";
import User from "../models/User.js";

import axios from "axios";

import imagekit from "../configs/imageKit.js";

import genAI from "../configs/gemini.js";   

// TEXT MESSAGE CONTROLLER
export const textMessageController = async (
    req,
    res
) => {

    try {

        const userId = req.user._id;

        // Check Credits
        if (req.user.credits < 1) {

            return res.json({
                success: false,
                message:
                    "You don't have enough credits"
            });

        }

        const {
            chatId,
            prompt
        } = req.body;

        // Find Chat
        const chat = await Chat.findOne({
            _id: chatId,
            userId
        });

        if (!chat) {

            return res.json({
                success: false,
                message: "Chat not found"
            });

        }

        // Save User Message
        chat.messages.push({

            role: "user",

            content: prompt,

            timestamp: Date.now(),

            isImage: false

        });

        // Gemini API Request
        const model =
            genAI.getGenerativeModel({
                model: "gemini-pro"
            });

        const result =
            await model.generateContent(prompt);

        const response =
            result.response.text();

        const reply = {

            role: "assistant",

            content: response,

            timestamp: Date.now(),

            isImage: false

        };

        // Send Reply
        res.json({
            success: true,
            reply
        });

        // Save Reply
        chat.messages.push(reply);

        await chat.save();

        // Deduct Credits
        await User.updateOne(
            { _id: userId },
            {
                $inc: {
                    credits: -1
                }
            }
        );

    } catch (error) {

        console.log(
            JSON.stringify(
                error,
                null,
                2
            )
        );

        res.json({

            success: false,

            message:
                error?.error?.message ||
                error.message

        });

    }

};

// IMAGE MESSAGE CONTROLLER
export const imageMessageController = async (
    req,
    res
) => {

    try {

        const userId = req.user._id;

        // Check Credits
        if (req.user.credits < 2) {

            return res.json({
                success: false,
                message:
                    "You don't have enough credits"
            });

        }

        const {
            prompt,
            chatId,
            isPublished
        } = req.body;

        // Find Chat
        const chat = await Chat.findOne({
            _id: chatId,
            userId
        });

        if (!chat) {

            return res.json({
                success: false,
                message: "Chat not found"
            });

        }

        // Save User Prompt
        chat.messages.push({

            role: "user",

            content: prompt,

            timestamp: Date.now(),

            isImage: false

        });

        // Encode Prompt
        const encodedPrompt =
            encodeURIComponent(prompt);

        // Generate Image URL
        const generatedImageUrl =
            `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/nabiai/${Date.now()}.png?tr=w-800,h-800`;

        // Generate Image
        const aiImageResponse =
            await axios.get(
                generatedImageUrl,
                {
                    responseType:
                        "arraybuffer"
                }
            );

        // Convert To Base64
        const base64Image =
            `data:image/png;base64,${
                Buffer.from(
                    aiImageResponse.data,
                    "binary"
                ).toString("base64")
            }`;

        // Upload To ImageKit
        const uploadResponse =
            await imagekit.upload({

                file: base64Image,

                fileName:
                    `${Date.now()}.png`,

                folder: "/nabiai"

            });

        // AI Reply
        const reply = {

            role: "assistant",

            content:
                uploadResponse.url,

            timestamp: Date.now(),

            isImage: true,

            isPublished

        };

        // Send Reply
        res.json({
            success: true,
            reply
        });

        // Save Reply
        chat.messages.push(reply);

        await chat.save();

        // Deduct Credits
        await User.updateOne(
            { _id: userId },
            {
                $inc: {
                    credits: -2
                }
            }
        );

    } catch (error) {

        console.log(
            JSON.stringify(
                error,
                null,
                2
            )
        );

        res.json({

            success: false,

            message:
                error?.error?.message ||
                error.message

        });

    }

};