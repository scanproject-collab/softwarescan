// polygonsRoutes.ts
import { Router } from "express";
import { createPolygon, deletePolygon, listPolygons, updatePolygon } from "../controllers/polygonsController";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";

const router = Router();

/**
 * @openapi
 * /polygons:
 *   post:
 *     summary: Create a new polygon
 *     description: Create a new polygon for institution areas
 *     tags:
 *       - Polygons
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
 *               - points
 *             properties:
 *               name:
 *                 type: string
 *               points:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                     lng:
 *                       type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Polygon created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), createPolygon);

/**
 * @openapi
 * /polygons:
 *   get:
 *     summary: List all polygons
 *     description: Retrieve a list of all polygons
 *     tags:
 *       - Polygons
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of polygons
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), listPolygons);

/**
 * @openapi
 * /polygons/{polygonId}:
 *   put:
 *     summary: Update a polygon
 *     description: Update an existing polygon's details
 *     tags:
 *       - Polygons
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: polygonId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the polygon to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               points:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                     lng:
 *                       type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Polygon updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Polygon not found
 */
router.put('/:polygonId', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), updatePolygon);

/**
 * @openapi
 * /polygons/{polygonId}:
 *   delete:
 *     summary: Delete a polygon
 *     description: Delete an existing polygon
 *     tags:
 *       - Polygons
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: polygonId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the polygon to delete
 *     responses:
 *       200:
 *         description: Polygon deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Polygon not found
 */
router.delete('/:polygonId', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), deletePolygon);

export default router; 