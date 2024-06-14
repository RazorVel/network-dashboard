import { Router, json } from "express";
import controllers from "../controllers/general.controller.js";

const router = Router();

router.get("/", controllers.field)
router.post("/", json(), controllers.field);

export default router;