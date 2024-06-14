import { Router, text} from "express";
import controllers from "../controllers/general.controller.js";

const router = Router();

router.post("/", text(), controllers.logUpload);

export default router;