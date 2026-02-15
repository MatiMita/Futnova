import { Router } from 'express';
import * as partidosController from '../controllers/partidos.controller';

const router = Router();

router.get('/', partidosController.getPartidos);
router.post('/', partidosController.createPartido);
router.put('/:id', partidosController.updatePartido);
router.put('/:id/resultado', partidosController.updateResultado);
router.delete('/:id', partidosController.deletePartido);

export default router;
