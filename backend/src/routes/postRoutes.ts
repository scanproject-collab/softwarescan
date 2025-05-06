import { Router, Response, NextFunction } from 'express';
import { createPost, listUserPosts, getPostById, uploadImage, deletePost, updatePost } from '../controllers/postController';
import { authMiddleware, roleMiddleware, CustomRequest } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @openapi
 * /posts:
 *   post:
 *     summary: Create a new post
 *     description: Create a new post with optional image upload
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to create posts
 */
router.post('/', authMiddleware, roleMiddleware(['OPERATOR', 'ADMIN', 'MANAGER']), uploadImage, async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await createPost(req, res);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /posts/my:
 *   get:
 *     summary: List user's posts
 *     description: Retrieve a list of posts created by the current operator
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's posts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an operator
 */
router.get('/my', authMiddleware, roleMiddleware(['OPERATOR']), async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await listUserPosts(req, res);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /posts/{postId}:
 *   get:
 *     summary: Get post details
 *     description: Retrieve detailed information about a specific post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to retrieve
 *     responses:
 *       200:
 *         description: Post details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Post not found
 */
router.get('/:postId', authMiddleware, roleMiddleware(['OPERATOR', 'ADMIN', 'MANAGER']), async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await getPostById(req, res);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     description: Delete a post from the system
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to delete this post
 *       404:
 *         description: Post not found
 */
router.delete('/:postId', authMiddleware, roleMiddleware(['OPERATOR', 'ADMIN', 'MANAGER']), async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await deletePost(req, res);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /posts/{postId}:
 *   put:
 *     summary: Update a post
 *     description: Updates an existing post with optional image upload
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to edit
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               tags:
 *                 type: string
 *                 description: Comma-separated list of tags
 *               location:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               ranking:
 *                 type: string
 *               weight:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to edit this post
 *       404:
 *         description: Post not found
 */
router.put('/:postId', authMiddleware, roleMiddleware(['OPERATOR', 'ADMIN', 'MANAGER']), uploadImage, async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await updatePost(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
