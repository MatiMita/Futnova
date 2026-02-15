-- ============================================
-- CONSULTAS SQL PARA SISTEMA DE GESTIÓN DE FÚTBOL
-- Base de datos: novaprocup
-- ============================================

-- ============================================
-- 1. CONSULTAS DE EQUIPOS
-- ============================================

-- Obtener todos los equipos
SELECT * FROM equipos ORDER BY nombre;

-- Obtener un equipo específico por ID
SELECT * FROM equipos WHERE id = $1;

-- Insertar un nuevo equipo
INSERT INTO equipos (nombre, logo) 
VALUES ($1, $2) 
RETURNING *;

-- Actualizar información de un equipo
UPDATE equipos 
SET nombre = $1, logo = $2 
WHERE id = $3 
RETURNING *;

-- Eliminar un equipo
DELETE FROM equipos WHERE id = $1;


-- ============================================
-- 2. CONSULTAS DE JUGADORES
-- ============================================

-- Obtener todos los jugadores con información del equipo
SELECT 
    j.id,
    j.nombre,
    j.apellido,
    j.numero_camiseta,
    j.posicion,
    j.goles,
    j.tarjetas_amarillas,
    j.tarjetas_rojas,
    j.fecha_registro,
    e.nombre AS equipo_nombre,
    e.logo AS equipo_logo
FROM jugadores j
LEFT JOIN equipos e ON j.equipo_id = e.id
ORDER BY j.apellido, j.nombre;

-- Obtener jugadores de un equipo específico
SELECT * FROM jugadores 
WHERE equipo_id = $1 
ORDER BY numero_camiseta;

-- Obtener un jugador específico por ID
SELECT 
    j.*,
    e.nombre AS equipo_nombre,
    e.logo AS equipo_logo
FROM jugadores j
LEFT JOIN equipos e ON j.equipo_id = e.id
WHERE j.id = $1;

-- Insertar un nuevo jugador
INSERT INTO jugadores (
    nombre, 
    apellido, 
    numero_camiseta, 
    posicion, 
    equipo_id,
    goles,
    tarjetas_amarillas,
    tarjetas_rojas
) VALUES ($1, $2, $3, $4, $5, 0, 0, 0) 
RETURNING *;

-- Actualizar estadísticas de un jugador
UPDATE jugadores 
SET 
    goles = $1,
    tarjetas_amarillas = $2,
    tarjetas_rojas = $3
WHERE id = $4 
RETURNING *;

-- Obtener máximos goleadores
SELECT 
    j.id,
    j.nombre,
    j.apellido,
    j.numero_camiseta,
    j.goles,
    e.nombre AS equipo_nombre,
    e.logo AS equipo_logo
FROM jugadores j
LEFT JOIN equipos e ON j.equipo_id = e.id
WHERE j.goles > 0
ORDER BY j.goles DESC, j.apellido
LIMIT 10;

-- Obtener jugadores con más tarjetas
SELECT 
    j.id,
    j.nombre,
    j.apellido,
    j.tarjetas_amarillas,
    j.tarjetas_rojas,
    (j.tarjetas_amarillas + j.tarjetas_rojas * 2) AS total_tarjetas,
    e.nombre AS equipo_nombre
FROM jugadores j
LEFT JOIN equipos e ON j.equipo_id = e.id
WHERE (j.tarjetas_amarillas + j.tarjetas_rojas) > 0
ORDER BY total_tarjetas DESC, j.apellido
LIMIT 10;


-- ============================================
-- 3. CONSULTAS DE PARTIDOS
-- ============================================

-- Obtener todos los partidos con información de equipos
SELECT 
    p.id,
    p.fecha,
    p.jornada,
    p.goles_local,
    p.goles_visitante,
    p.finalizado,
    p.fecha_creacion,
    el.id AS equipo_local_id,
    el.nombre AS equipo_local_nombre,
    el.logo AS equipo_local_logo,
    ev.id AS equipo_visitante_id,
    ev.nombre AS equipo_visitante_nombre,
    ev.logo AS equipo_visitante_logo
FROM partidos p
INNER JOIN equipos el ON p.equipo_local_id = el.id
INNER JOIN equipos ev ON p.equipo_visitante_id = ev.id
ORDER BY p.fecha DESC, p.jornada DESC;

-- Obtener partidos de una jornada específica
SELECT 
    p.*,
    el.nombre AS equipo_local_nombre,
    el.logo AS equipo_local_logo,
    ev.nombre AS equipo_visitante_nombre,
    ev.logo AS equipo_visitante_logo
FROM partidos p
INNER JOIN equipos el ON p.equipo_local_id = el.id
INNER JOIN equipos ev ON p.equipo_visitante_id = ev.id
WHERE p.jornada = $1
ORDER BY p.fecha;

-- Obtener partidos finalizados
SELECT 
    p.*,
    el.nombre AS equipo_local_nombre,
    ev.nombre AS equipo_visitante_nombre
FROM partidos p
INNER JOIN equipos el ON p.equipo_local_id = el.id
INNER JOIN equipos ev ON p.equipo_visitante_id = ev.id
WHERE p.finalizado = true
ORDER BY p.fecha DESC;

-- Obtener partidos pendientes
SELECT 
    p.*,
    el.nombre AS equipo_local_nombre,
    ev.nombre AS equipo_visitante_nombre
FROM partidos p
INNER JOIN equipos el ON p.equipo_local_id = el.id
INNER JOIN equipos ev ON p.equipo_visitante_id = ev.id
WHERE p.finalizado = false
ORDER BY p.fecha ASC;

-- Obtener un partido específico con todos los detalles
SELECT 
    p.*,
    el.nombre AS equipo_local_nombre,
    el.logo AS equipo_local_logo,
    ev.nombre AS equipo_visitante_nombre,
    ev.logo AS equipo_visitante_logo
FROM partidos p
INNER JOIN equipos el ON p.equipo_local_id = el.id
INNER JOIN equipos ev ON p.equipo_visitante_id = ev.id
WHERE p.id = $1;

-- Insertar un nuevo partido
INSERT INTO partidos (
    equipo_local_id,
    equipo_visitante_id,
    fecha,
    jornada,
    goles_local,
    goles_visitante,
    finalizado
) VALUES ($1, $2, $3, $4, 0, 0, false)
RETURNING *;

-- Actualizar resultado de un partido
UPDATE partidos 
SET 
    goles_local = $1,
    goles_visitante = $2,
    finalizado = $3
WHERE id = $4
RETURNING *;

-- Obtener historial de enfrentamientos entre dos equipos
SELECT 
    p.*,
    el.nombre AS equipo_local_nombre,
    ev.nombre AS equipo_visitante_nombre
FROM partidos p
INNER JOIN equipos el ON p.equipo_local_id = el.id
INNER JOIN equipos ev ON p.equipo_visitante_id = ev.id
WHERE (p.equipo_local_id = $1 AND p.equipo_visitante_id = $2)
   OR (p.equipo_local_id = $2 AND p.equipo_visitante_id = $1)
ORDER BY p.fecha DESC;


-- ============================================
-- 4. CONSULTAS DE GOLES
-- ============================================

-- Obtener todos los goles de un partido
SELECT 
    g.id,
    g.minuto,
    g.fecha_registro,
    j.nombre,
    j.apellido,
    j.numero_camiseta,
    e.nombre AS equipo_nombre,
    e.logo AS equipo_logo
FROM goles g
INNER JOIN jugadores j ON g.jugador_id = j.id
INNER JOIN equipos e ON j.equipo_id = e.id
WHERE g.partido_id = $1
ORDER BY g.minuto;

-- Insertar un gol
INSERT INTO goles (partido_id, jugador_id, minuto)
VALUES ($1, $2, $3)
RETURNING *;

-- Obtener goles de un jugador
SELECT 
    g.*,
    p.fecha,
    p.jornada,
    el.nombre AS equipo_local,
    ev.nombre AS equipo_visitante
FROM goles g
INNER JOIN partidos p ON g.partido_id = p.id
INNER JOIN equipos el ON p.equipo_local_id = el.id
INNER JOIN equipos ev ON p.equipo_visitante_id = ev.id
WHERE g.jugador_id = $1
ORDER BY p.fecha DESC;

-- Eliminar un gol
DELETE FROM goles WHERE id = $1;


-- ============================================
-- 5. CONSULTAS DE TARJETAS
-- ============================================

-- Obtener todas las tarjetas de un partido
SELECT 
    t.id,
    t.tipo,
    t.minuto,
    t.fecha_registro,
    j.nombre,
    j.apellido,
    j.numero_camiseta,
    e.nombre AS equipo_nombre,
    e.logo AS equipo_logo
FROM tarjetas t
INNER JOIN jugadores j ON t.jugador_id = j.id
INNER JOIN equipos e ON j.equipo_id = e.id
WHERE t.partido_id = $1
ORDER BY t.minuto;

-- Insertar una tarjeta
INSERT INTO tarjetas (partido_id, jugador_id, tipo, minuto)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- Obtener tarjetas de un jugador
SELECT 
    t.*,
    p.fecha,
    p.jornada,
    el.nombre AS equipo_local,
    ev.nombre AS equipo_visitante
FROM tarjetas t
INNER JOIN partidos p ON t.partido_id = p.id
INNER JOIN equipos el ON p.equipo_local_id = el.id
INNER JOIN equipos ev ON p.equipo_visitante_id = ev.id
WHERE t.jugador_id = $1
ORDER BY p.fecha DESC;

-- Obtener jugadores sancionados (con tarjeta roja o múltiples amarillas)
SELECT 
    j.id,
    j.nombre,
    j.apellido,
    j.tarjetas_amarillas,
    j.tarjetas_rojas,
    e.nombre AS equipo_nombre
FROM jugadores j
INNER JOIN equipos e ON j.equipo_id = e.id
WHERE j.tarjetas_rojas > 0 OR j.tarjetas_amarillas >= 3
ORDER BY j.tarjetas_rojas DESC, j.tarjetas_amarillas DESC;

-- Eliminar una tarjeta
DELETE FROM tarjetas WHERE id = $1;


-- ============================================
-- 6. CONSULTAS DE TABLA DE POSICIONES
-- ============================================

-- Obtener tabla de posiciones completa
SELECT 
    pos.id,
    pos.partidos_jugados,
    pos.partidos_ganados,
    pos.partidos_empatados,
    pos.partidos_perdidos,
    pos.goles_favor,
    pos.goles_contra,
    pos.diferencia_goles,
    pos.puntos,
    pos.ultima_actualizacion,
    e.id AS equipo_id,
    e.nombre AS equipo_nombre,
    e.logo AS equipo_logo
FROM posiciones pos
INNER JOIN equipos e ON pos.equipo_id = e.id
ORDER BY pos.puntos DESC, pos.diferencia_goles DESC, pos.goles_favor DESC;

-- Obtener posición de un equipo específico
SELECT 
    pos.*,
    e.nombre AS equipo_nombre,
    e.logo AS equipo_logo
FROM posiciones pos
INNER JOIN equipos e ON pos.equipo_id = e.id
WHERE pos.equipo_id = $1;

-- Insertar posición inicial para un equipo
INSERT INTO posiciones (
    equipo_id,
    partidos_jugados,
    partidos_ganados,
    partidos_empatados,
    partidos_perdidos,
    goles_favor,
    goles_contra,
    diferencia_goles,
    puntos
) VALUES ($1, 0, 0, 0, 0, 0, 0, 0, 0)
RETURNING *;

-- Actualizar posición de un equipo
UPDATE posiciones 
SET 
    partidos_jugados = $1,
    partidos_ganados = $2,
    partidos_empatados = $3,
    partidos_perdidos = $4,
    goles_favor = $5,
    goles_contra = $6,
    diferencia_goles = $7,
    puntos = $8,
    ultima_actualizacion = CURRENT_TIMESTAMP
WHERE equipo_id = $9
RETURNING *;


-- ============================================
-- 7. CONSULTAS ESTADÍSTICAS AVANZADAS
-- ============================================

-- Estadísticas generales del torneo
SELECT 
    COUNT(DISTINCT p.id) AS total_partidos,
    COUNT(DISTINCT CASE WHEN p.finalizado = true THEN p.id END) AS partidos_finalizados,
    COUNT(DISTINCT CASE WHEN p.finalizado = false THEN p.id END) AS partidos_pendientes,
    COALESCE(SUM(p.goles_local + p.goles_visitante), 0) AS total_goles,
    COALESCE(AVG(p.goles_local + p.goles_visitante), 0) AS promedio_goles_partido,
    COUNT(DISTINCT j.id) AS total_jugadores,
    COUNT(DISTINCT e.id) AS total_equipos
FROM partidos p
CROSS JOIN jugadores j
CROSS JOIN equipos e;

-- Equipo con mejor ataque (más goles a favor)
SELECT 
    e.nombre,
    e.logo,
    pos.goles_favor,
    pos.partidos_jugados,
    CASE 
        WHEN pos.partidos_jugados > 0 
        THEN ROUND(pos.goles_favor::numeric / pos.partidos_jugados, 2)
        ELSE 0 
    END AS promedio_goles
FROM posiciones pos
INNER JOIN equipos e ON pos.equipo_id = e.id
ORDER BY pos.goles_favor DESC
LIMIT 1;

-- Equipo con mejor defensa (menos goles en contra)
SELECT 
    e.nombre,
    e.logo,
    pos.goles_contra,
    pos.partidos_jugados,
    CASE 
        WHEN pos.partidos_jugados > 0 
        THEN ROUND(pos.goles_contra::numeric / pos.partidos_jugados, 2)
        ELSE 0 
    END AS promedio_goles_contra
FROM posiciones pos
INNER JOIN equipos e ON pos.equipo_id = e.id
WHERE pos.partidos_jugados > 0
ORDER BY pos.goles_contra ASC
LIMIT 1;

-- Partidos con más goles
SELECT 
    p.id,
    p.fecha,
    p.jornada,
    el.nombre AS equipo_local,
    ev.nombre AS equipo_visitante,
    p.goles_local,
    p.goles_visitante,
    (p.goles_local + p.goles_visitante) AS total_goles
FROM partidos p
INNER JOIN equipos el ON p.equipo_local_id = el.id
INNER JOIN equipos ev ON p.equipo_visitante_id = ev.id
WHERE p.finalizado = true
ORDER BY total_goles DESC
LIMIT 5;

-- Rendimiento local vs visitante por equipo
SELECT 
    e.id,
    e.nombre,
    COUNT(DISTINCT CASE WHEN p.equipo_local_id = e.id THEN p.id END) AS partidos_local,
    COUNT(DISTINCT CASE WHEN p.equipo_visitante_id = e.id THEN p.id END) AS partidos_visitante,
    COUNT(DISTINCT CASE 
        WHEN p.equipo_local_id = e.id AND p.goles_local > p.goles_visitante 
        THEN p.id 
    END) AS victorias_local,
    COUNT(DISTINCT CASE 
        WHEN p.equipo_visitante_id = e.id AND p.goles_visitante > p.goles_local 
        THEN p.id 
    END) AS victorias_visitante
FROM equipos e
LEFT JOIN partidos p ON (p.equipo_local_id = e.id OR p.equipo_visitante_id = e.id) 
    AND p.finalizado = true
GROUP BY e.id, e.nombre
ORDER BY e.nombre;

-- Racha actual de victorias por equipo
WITH ultimos_partidos AS (
    SELECT 
        e.id AS equipo_id,
        e.nombre AS equipo_nombre,
        p.id AS partido_id,
        p.fecha,
        CASE 
            WHEN p.equipo_local_id = e.id AND p.goles_local > p.goles_visitante THEN 'V'
            WHEN p.equipo_visitante_id = e.id AND p.goles_visitante > p.goles_local THEN 'V'
            WHEN p.goles_local = p.goles_visitante THEN 'E'
            ELSE 'D'
        END AS resultado,
        ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY p.fecha DESC) AS num_partido
    FROM equipos e
    LEFT JOIN partidos p ON (p.equipo_local_id = e.id OR p.equipo_visitante_id = e.id)
        AND p.finalizado = true
)
SELECT 
    equipo_nombre,
    STRING_AGG(resultado, '' ORDER BY fecha DESC) AS ultimos_5_resultados
FROM ultimos_partidos
WHERE num_partido <= 5
GROUP BY equipo_id, equipo_nombre
ORDER BY equipo_nombre;

-- Jugadores más efectivos (goles por partido)
SELECT 
    j.id,
    j.nombre,
    j.apellido,
    j.goles,
    e.nombre AS equipo_nombre,
    COUNT(DISTINCT g.partido_id) AS partidos_con_gol,
    CASE 
        WHEN COUNT(DISTINCT g.partido_id) > 0 
        THEN ROUND(j.goles::numeric / COUNT(DISTINCT g.partido_id), 2)
        ELSE 0 
    END AS goles_por_partido
FROM jugadores j
INNER JOIN equipos e ON j.equipo_id = e.id
LEFT JOIN goles g ON g.jugador_id = j.id
WHERE j.goles > 0
GROUP BY j.id, j.nombre, j.apellido, j.goles, e.nombre
ORDER BY goles_por_partido DESC, j.goles DESC
LIMIT 10;


-- ============================================
-- 8. PROCEDIMIENTOS DE ACTUALIZACIÓN AUTOMÁTICA
-- ============================================

-- Actualizar estadísticas de jugador después de registrar un gol
-- (Esta consulta se ejecutaría después de INSERT en tabla goles)
UPDATE jugadores 
SET goles = goles + 1 
WHERE id = $1;

-- Actualizar estadísticas de jugador después de registrar una tarjeta
-- (Esta consulta se ejecutaría después de INSERT en tabla tarjetas)
UPDATE jugadores 
SET tarjetas_amarillas = tarjetas_amarillas + 1 
WHERE id = $1 AND $2 = 'amarilla';

UPDATE jugadores 
SET tarjetas_rojas = tarjetas_rojas + 1 
WHERE id = $1 AND $2 = 'roja';

-- Recalcular tabla de posiciones completa basada en resultados
-- NOTA: Esta es una consulta compleja que recalcula toda la tabla
WITH estadisticas_equipos AS (
    SELECT 
        e.id AS equipo_id,
        -- Partidos jugados
        COUNT(p.id) AS partidos_jugados,
        -- Victorias
        COUNT(CASE 
            WHEN (p.equipo_local_id = e.id AND p.goles_local > p.goles_visitante) 
                OR (p.equipo_visitante_id = e.id AND p.goles_visitante > p.goles_local)
            THEN 1 
        END) AS partidos_ganados,
        -- Empates
        COUNT(CASE 
            WHEN p.goles_local = p.goles_visitante 
            THEN 1 
        END) AS partidos_empatados,
        -- Derrotas
        COUNT(CASE 
            WHEN (p.equipo_local_id = e.id AND p.goles_local < p.goles_visitante) 
                OR (p.equipo_visitante_id = e.id AND p.goles_visitante < p.goles_local)
            THEN 1 
        END) AS partidos_perdidos,
        -- Goles a favor
        COALESCE(SUM(CASE 
            WHEN p.equipo_local_id = e.id THEN p.goles_local 
            WHEN p.equipo_visitante_id = e.id THEN p.goles_visitante 
        END), 0) AS goles_favor,
        -- Goles en contra
        COALESCE(SUM(CASE 
            WHEN p.equipo_local_id = e.id THEN p.goles_visitante 
            WHEN p.equipo_visitante_id = e.id THEN p.goles_local 
        END), 0) AS goles_contra
    FROM equipos e
    LEFT JOIN partidos p ON (p.equipo_local_id = e.id OR p.equipo_visitante_id = e.id)
        AND p.finalizado = true
    GROUP BY e.id
)
UPDATE posiciones pos
SET 
    partidos_jugados = est.partidos_jugados,
    partidos_ganados = est.partidos_ganados,
    partidos_empatados = est.partidos_empatados,
    partidos_perdidos = est.partidos_perdidos,
    goles_favor = est.goles_favor,
    goles_contra = est.goles_contra,
    diferencia_goles = est.goles_favor - est.goles_contra,
    puntos = (est.partidos_ganados * 3) + est.partidos_empatados,
    ultima_actualizacion = CURRENT_TIMESTAMP
FROM estadisticas_equipos est
WHERE pos.equipo_id = est.equipo_id;


-- ============================================
-- 9. CONSULTAS DE VALIDACIÓN
-- ============================================

-- Verificar que no haya partidos duplicados en la misma jornada
SELECT 
    jornada,
    equipo_local_id,
    equipo_visitante_id,
    COUNT(*) AS veces
FROM partidos
GROUP BY jornada, equipo_local_id, equipo_visitante_id
HAVING COUNT(*) > 1;

-- Verificar jugadores sin equipo
SELECT * FROM jugadores WHERE equipo_id IS NULL;

-- Verificar equipos sin jugadores
SELECT e.*
FROM equipos e
LEFT JOIN jugadores j ON j.equipo_id = e.id
WHERE j.id IS NULL;

-- Verificar inconsistencias en goles (goles registrados vs goles en partido)
SELECT 
    p.id AS partido_id,
    p.goles_local,
    p.goles_visitante,
    COUNT(CASE WHEN j.equipo_id = p.equipo_local_id THEN 1 END) AS goles_local_registrados,
    COUNT(CASE WHEN j.equipo_id = p.equipo_visitante_id THEN 1 END) AS goles_visitante_registrados
FROM partidos p
LEFT JOIN goles g ON g.partido_id = p.id
LEFT JOIN jugadores j ON g.jugador_id = j.id
GROUP BY p.id, p.goles_local, p.goles_visitante
HAVING p.goles_local != COUNT(CASE WHEN j.equipo_id = p.equipo_local_id THEN 1 END)
    OR p.goles_visitante != COUNT(CASE WHEN j.equipo_id = p.equipo_visitante_id THEN 1 END);


-- ============================================
-- 10. CONSULTAS DE BÚSQUEDA
-- ============================================

-- Buscar jugadores por nombre
SELECT 
    j.*,
    e.nombre AS equipo_nombre
FROM jugadores j
LEFT JOIN equipos e ON j.equipo_id = e.id
WHERE LOWER(j.nombre || ' ' || j.apellido) LIKE LOWER('%' || $1 || '%')
ORDER BY j.apellido, j.nombre;

-- Buscar equipos por nombre
SELECT * FROM equipos 
WHERE LOWER(nombre) LIKE LOWER('%' || $1 || '%')
ORDER BY nombre;

-- Buscar partidos por equipos
SELECT 
    p.*,
    el.nombre AS equipo_local_nombre,
    ev.nombre AS equipo_visitante_nombre
FROM partidos p
INNER JOIN equipos el ON p.equipo_local_id = el.id
INNER JOIN equipos ev ON p.equipo_visitante_id = ev.id
WHERE LOWER(el.nombre) LIKE LOWER('%' || $1 || '%')
   OR LOWER(ev.nombre) LIKE LOWER('%' || $1 || '%')
ORDER BY p.fecha DESC;
