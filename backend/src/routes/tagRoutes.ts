// tagRoutes.ts
import { Router, Response, NextFunction } from "express";
import { listTags, createTag, deleteTag, listWeights, updateTag } from "../controllers/tagController";
import { authMiddleware, roleMiddleware, CustomRequest } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        await listTags(req, res);
    } catch (err) {
        next(err);
    }
});

router.get("/weights", authMiddleware, async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        await listWeights(req, res);
    } catch (err) {
        next(err);
    }
});

router.post("/create", authMiddleware, roleMiddleware(["ADMIN"]), async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        await createTag(req, res);
    } catch (err) {
        next(err);
    }
});

router.put("/:name", authMiddleware, roleMiddleware(["ADMIN"]), async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        await updateTag(req, res);
    } catch (err) {
        next(err);
    }
});

router.delete("/:name", authMiddleware, roleMiddleware(["ADMIN"]), async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        await deleteTag(req, res);
    } catch (err) {
        next(err);
    }
});

export default router;