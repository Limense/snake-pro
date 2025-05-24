/**
 * Utils - Funciones de utilidad general
 * Contiene helpers y funciones reutilizables
 */

/**
 * Genera un número aleatorio entre min y max (inclusive)
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Número aleatorio
 */
export function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Genera una posición aleatoria en un grid
 * @param {number} maxX - Máximo valor X
 * @param {number} maxY - Máximo valor Y
 * @returns {Object} Posición {x, y}
 */
export function randomPosition(maxX, maxY) {
    return {
        x: randomBetween(0, maxX - 1),
        y: randomBetween(0, maxY - 1)
    };
}

/**
 * Verifica si dos posiciones son iguales
 * @param {Object} pos1 - Primera posición {x, y}
 * @param {Object} pos2 - Segunda posición {x, y}
 * @returns {boolean} true si son iguales
 */
export function positionsEqual(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * Calcula la distancia Manhattan entre dos posiciones
 * @param {Object} pos1 - Primera posición {x, y}
 * @param {Object} pos2 - Segunda posición {x, y}
 * @returns {number} Distancia Manhattan
 */
export function manhattanDistance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

/**
 * Calcula la distancia euclidiana entre dos posiciones
 * @param {Object} pos1 - Primera posición {x, y}
 * @param {Object} pos2 - Segunda posición {x, y}
 * @returns {number} Distancia euclidiana
 */
export function euclideanDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Clona un objeto profundamente
 * @param {any} obj - Objeto a clonar
 * @returns {any} Copia profunda del objeto
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    if (typeof obj === 'object') {
        const copy = {};
        Object.keys(obj).forEach(key => {
            copy[key] = deepClone(obj[key]);
        });
        return copy;
    }
}

/**
 * Debounce - Retrasa la ejecución de una función
 * @param {Function} func - Función a ejecutar
 * @param {number} delay - Retraso en milisegundos
 * @returns {Function} Función debounced
 */
export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle - Limita la frecuencia de ejecución de una función
 * @param {Function} func - Función a ejecutar
 * @param {number} delay - Intervalo mínimo entre ejecuciones
 * @returns {Function} Función throttled
 */
export function throttle(func, delay) {
    let lastExec = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastExec >= delay) {
            lastExec = now;
            func.apply(this, args);
        }
    };
}

/**
 * Formatea un número con separadores de miles
 * @param {number} num - Número a formatear
 * @returns {string} Número formateado
 */
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Convierte milisegundos a formato de tiempo legible
 * @param {number} ms - Milisegundos
 * @returns {string} Tiempo formateado (ej: "2:30")
 */
export function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Valida si un valor está dentro de un rango
 * @param {number} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} true si está en rango
 */
export function inRange(value, min, max) {
    return value >= min && value <= max;
}

/**
 * Restringe un valor a un rango específico
 * @param {number} value - Valor a restringir
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Valor restringido
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Interpola linealmente entre dos valores
 * @param {number} start - Valor inicial
 * @param {number} end - Valor final
 * @param {number} t - Factor de interpolación (0-1)
 * @returns {number} Valor interpolado
 */
export function lerp(start, end, t) {
    return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Genera un ID único
 * @returns {string} ID único
 */
export function generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

/**
 * Detecta si el dispositivo es móvil
 * @returns {boolean} true si es móvil
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}

/**
 * Detecta si el dispositivo soporta touch
 * @returns {boolean} true si soporta touch
 */
export function isTouchDevice() {
    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
    );
}

/**
 * Obtiene las dimensiones de la ventana
 * @returns {Object} Dimensiones {width, height}
 */
export function getViewportSize() {
    return {
        width: window.innerWidth || document.documentElement.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight
    };
}

/**
 * Detecta si el usuario prefiere reducir movimiento
 * @returns {boolean} true si prefiere reducir movimiento
 */
export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Convierte una dirección en string a vector
 * @param {string} direction - Dirección ('up', 'down', 'left', 'right')
 * @returns {Object} Vector {x, y}
 */
export function directionToVector(direction) {
    const vectors = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 }
    };
    
    return vectors[direction] || { x: 0, y: 0 };
}

/**
 * Convierte un vector a dirección en string
 * @param {Object} vector - Vector {x, y}
 * @returns {string} Dirección ('up', 'down', 'left', 'right')
 */
export function vectorToDirection(vector) {
    if (vector.x === 0 && vector.y === -1) return 'up';
    if (vector.x === 0 && vector.y === 1) return 'down';
    if (vector.x === -1 && vector.y === 0) return 'left';
    if (vector.x === 1 && vector.y === 0) return 'right';
    return 'unknown';
}

/**
 * Obtiene la dirección opuesta
 * @param {string} direction - Dirección actual
 * @returns {string} Dirección opuesta
 */
export function getOppositeDirection(direction) {
    const opposites = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left'
    };
    
    return opposites[direction] || direction;
}

/**
 * Crea un elemento DOM con atributos
 * @param {string} tag - Etiqueta del elemento
 * @param {Object} attributes - Atributos del elemento
 * @param {string} text - Texto interno (opcional)
 * @returns {HTMLElement} Elemento creado
 */
export function createElement(tag, attributes = {}, text = '') {
    const element = document.createElement(tag);
    
    Object.keys(attributes).forEach(key => {
        if (key === 'className') {
            element.className = attributes[key];
        } else if (key === 'innerHTML') {
            element.innerHTML = attributes[key];
        } else {
            element.setAttribute(key, attributes[key]);
        }
    });
    
    if (text) {
        element.textContent = text;
    }
    
    return element;
}

/**
 * Clase para manejar configuraciones del juego
 */
export class GameConfig {
    constructor(defaultConfig = {}) {
        this.config = { ...defaultConfig };
    }
    
    /**
     * Obtiene un valor de configuración
     * @param {string} key - Clave de configuración
     * @param {any} defaultValue - Valor por defecto
     * @returns {any} Valor de configuración
     */
    get(key, defaultValue = null) {
        return this.config[key] ?? defaultValue;
    }
    
    /**
     * Establece un valor de configuración
     * @param {string} key - Clave de configuración
     * @param {any} value - Valor a establecer
     */
    set(key, value) {
        this.config[key] = value;
    }
    
    /**
     * Actualiza múltiples configuraciones
     * @param {Object} newConfig - Nuevas configuraciones
     */
    update(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    /**
     * Obtiene toda la configuración
     * @returns {Object} Configuración completa
     */
    getAll() {
        return { ...this.config };
    }
    
    /**
     * Reinicia la configuración
     * @param {Object} defaultConfig - Configuración por defecto
     */
    reset(defaultConfig = {}) {
        this.config = { ...defaultConfig };
    }
}