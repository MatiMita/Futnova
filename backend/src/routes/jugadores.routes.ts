import { Router } from 'express';
import * as jugadoresController from '../controllers/jugadores.controller';

const router = Router();

router.get('/', jugadoresController.getJugadores);
router.get('/equipo/:equipoId', jugadoresController.getJugadoresByEquipo);
router.post('/', jugadoresController.createJugador);
router.put('/:id', jugadoresController.updateJugador);
router.delete('/:id', jugadoresController.deleteJugador);

export default router;
