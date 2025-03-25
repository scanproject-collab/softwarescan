import {authMiddleware, roleMiddleware} from "../middlewares/authMiddleware";
import {createPolygon, deletePolygon, listPolygons, updatePolygon} from "../controllers/polygnosController";
import {Router} from "express";

const router = Router();

router.post('/create', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), createPolygon);
router.get('/', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), listPolygons);
router.put('/:polygonId', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), updatePolygon);
router.delete('/:polygonId', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), deletePolygon);

export default router;