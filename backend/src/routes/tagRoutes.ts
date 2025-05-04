import { Router, Response, NextFunction } from "express";
import { listTags, createTag, deleteTag, listWeights, updateTag } from "../controllers/tagController";
import { authMiddleware, roleMiddleware, CustomRequest } from "../middlewares/authMiddleware";

const router = Router();

/**
 * @openapi
 * /tags:
 *   get:
 *     summary: List all tags
 *     description: Retrieve a list of all tags in the system
 *     tags:
 *       - Tags
 *     responses:
 *       200:
 *         description: List of tags
 */
router.get("/", async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        await listTags(req, res);
    } catch (err) {
        next(err);
    }
});

/**
 * @openapi
 * /tags/weights:
 *   get:
 *     summary: List tag weights
 *     description: Retrieve a list of all tag weights
 *     tags:
 *       - Tags
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tag weights
 *       401:
 *         description: Unauthorized
 */
router.get("/weights", authMiddleware, async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        await listWeights(req, res);
    } catch (err) {
        next(err);
    }
});

/**
 * @openapi
 * /tags:
 *   post:
 *     summary: Create a new tag
 *     description: Create a new tag in the system
 *     tags:
 *       - Tags
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               weight:
 *                 type: number
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin or manager
 */
router.post("/", authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        await createTag(req, res);
    } catch (err) {
        next(err);
    }
});

/**
 * @openapi
 * /tags/{name}:
 *   put:
 *     summary: Update a tag
 *     description: Update an existing tag's information
 *     tags:
 *       - Tags
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the tag to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               color:
 *                 type: string
 *               weight:
 *                 type: number
 *     responses:
 *       200:
 *         description: Tag updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin or manager
 *       404:
 *         description: Tag not found
 */
router.put("/:name", authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        await updateTag(req, res);
    } catch (err) {
        next(err);
    }
});

/**
 * @openapi
 * /tags/{name}:
 *   delete:
 *     summary: Delete a tag
 *     description: Remove a tag from the system
 *     tags:
 *       - Tags
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the tag to delete
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin or manager
 *       404:
 *         description: Tag not found
 */
router.delete("/:name", authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        await deleteTag(req, res);
    } catch (err) {
        next(err);
    }
});

export default router;