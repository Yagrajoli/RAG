import express from "express";
import { chatController } from "../controllers/chat.controllers.js";

const router = express.Router();

router.post("/", chatController);

export default router;