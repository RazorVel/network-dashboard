import { Router, json} from "express";
import controllers from "../controllers/general.controller.js";

const router = Router();

router.get("/", controllers.parser);
router.post("/", json(), controllers.parser);

export default router;