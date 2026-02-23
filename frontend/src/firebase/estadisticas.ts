import { getPartidosFinalizados } from './partidos';
import { getEquipos } from './equipos';
import { Posicion } from '../types';

/**
 * Calcula la tabla de posiciones en el cliente a partir de
 * los partidos finalizados almacenados en Firestore.
 */
export const getPosiciones = async (): Promise<Posicion[]> => {
  const [equipos, partidos] = await Promise.all([getEquipos(), getPartidosFinalizados()]);

  const map = new Map<string, Posicion>();

  // Inicializar todos los equipos con 0
  for (const equipo of equipos) {
    map.set(equipo.id, {
      equipoId: equipo.id,
      equipoNombre: equipo.nombre,
      logo: equipo.logo,
      grupo: equipo.grupo,
      partidosJugados: 0,
      partidosGanados: 0,
      partidosEmpatados: 0,
      partidosPerdidos: 0,
      golesFavor: 0,
      golesContra: 0,
      diferenciaGoles: 0,
      puntos: 0,
    });
  }

  // Calcular estadísticas por partido
  for (const partido of partidos) {
    const local = map.get(partido.equipoLocalId);
    const visitante = map.get(partido.equipoVisitanteId);

    if (!local || !visitante) continue;

    local.partidosJugados++;
    visitante.partidosJugados++;

    local.golesFavor += partido.golesLocal;
    local.golesContra += partido.golesVisitante;
    visitante.golesFavor += partido.golesVisitante;
    visitante.golesContra += partido.golesLocal;

    if (partido.golesLocal > partido.golesVisitante) {
      local.partidosGanados++;
      local.puntos += 3;
      visitante.partidosPerdidos++;
    } else if (partido.golesLocal < partido.golesVisitante) {
      visitante.partidosGanados++;
      visitante.puntos += 3;
      local.partidosPerdidos++;
    } else {
      local.partidosEmpatados++;
      local.puntos++;
      visitante.partidosEmpatados++;
      visitante.puntos++;
    }
  }

  return Array.from(map.values())
    .map((pos) => ({
      ...pos,
      diferenciaGoles: pos.golesFavor - pos.golesContra,
    }))
    .sort((a, b) => b.puntos - a.puntos || b.diferenciaGoles - a.diferenciaGoles || b.golesFavor - a.golesFavor);
};
