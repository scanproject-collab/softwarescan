import { Router, Request, Response, NextFunction } from 'express';
import { createInstitution, updateInstitution, deleteInstitution, listInstitutions } from '../controllers/institutionController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { CustomRequest } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @openapi
 * /institutions:
 *   post:
 *     summary: Create a new institution
 *     description: Create a new institution in the system
 *     tags:
 *       - Institutions
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
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Institution created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin or manager
 */
router.post('/', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createInstitution(req as CustomRequest, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /institutions/{id}:
 *   put:
 *     summary: Update an institution
 *     description: Update an existing institution's information
 *     tags:
 *       - Institutions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the institution to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Institution updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin or manager
 *       404:
 *         description: Institution not found
 */
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateInstitution(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /institutions/{id}:
 *   delete:
 *     summary: Delete an institution
 *     description: Remove an institution from the system
 *     tags:
 *       - Institutions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the institution to delete
 *     responses:
 *       200:
 *         description: Institution deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin or manager
 *       404:
 *         description: Institution not found
 */
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteInstitution(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /institutions:
 *   get:
 *     summary: List all institutions
 *     description: Retrieve a list of all institutions in the system
 *     tags:
 *       - Institutions
 *     responses:
 *       200:
 *         description: List of institutions
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('GET /institutions request received');
    await listInstitutions(req, res);
  } catch (error) {
    console.error('Error handling GET /institutions:', error);
    next(error);
  }
});

export default router;