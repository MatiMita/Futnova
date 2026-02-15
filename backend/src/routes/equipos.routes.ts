import { Router } from 'express';
import * as equiposController from '../controllers/equipos.controller';

const router = Router();

router.get('/', equiposController.getEquipos);
router.post('/', equiposController.createEquipo);
router.get('/:id', equiposController.getEquipoById);
router.put('/:id', equiposController.updateEquipo);
router.delete('/:id', equiposController.deleteEquipo);

export default router;
