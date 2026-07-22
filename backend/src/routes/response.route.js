import { Router } from "express";
import { generateResponse } from "../controllers/response.controller.js";

const router = Router();

router.post("/generate-response", generateResponse);

export default router;
