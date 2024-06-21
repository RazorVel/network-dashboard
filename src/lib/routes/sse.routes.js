import { Router, json} from "express";
import controllers from "../controllers/sse.controller.js";

const router = Router();

router.get("/", controllers.sse);

export default router;