import { Router } from 'express';
import * as estadisticasController from '../controllers/estadisticas.controller';

const router = Router();

router.get('/posiciones', estadisticasController.getPosiciones);
router.get('/goleadores', estadisticasController.getGoleadores);
router.get('/tarjetas', estadisticasController.getTarjetas);
router.post('/recalcular-posiciones', estadisticasController.recalcularPosiciones);

export default router;
