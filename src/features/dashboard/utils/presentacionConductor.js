/**
 * Presentación del conductor: nombre, iniciales, saludo, filtro de vehículos
 * y formatos. Funciones puras compartidas por las vistas web y móvil del
 * conductor y por el layout, para que no vuelvan a divergir.
 * Ubicación: src/features/dashboard/utils/presentacionConductor.js
 */

export function primerNombre(nombre, respaldo = 'Conductor') {
    const crudo = String(nombre || '').trim();
    if (!crudo) return respaldo;
    const primera = crudo.split(/\s+/)[0];
    return primera.charAt(0).toUpperCase() + primera.slice(1).toLowerCase();
}

export function iniciales(nombre, respaldo = 'CO') {
    const partes = String(nombre || '').trim().split(/\s+/).filter(Boolean);
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return (partes[0] || respaldo).substring(0, 2).toUpperCase();
}

export function saludoPorHora(fecha = new Date()) {
    const hora = fecha.getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
}

/** Filtra por placa, marca, línea o número interno (sin distinguir mayúsculas). */
export function filtrarVehiculos(lista, consulta) {
    const q = String(consulta || '').trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((v) =>
        ['plate', 'brand', 'line', 'internal_number'].some((campo) => String(v[campo] || '').toLowerCase().includes(q)),
    );
}

export function formatearNumero(valor) {
    if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return '0';
    return Number(valor).toLocaleString('es-CO');
}

/** Placa colombiana de 6 caracteres: GUX649 -> GUX · 649. */
export function formatearPlaca(placa) {
    if (!placa) return 'SIN-PLACA';
    const limpia = String(placa).trim().toUpperCase();
    if (limpia.length === 6) return `${limpia.substring(0, 3)} · ${limpia.substring(3)}`;
    return limpia;
}
