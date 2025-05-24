/**
 * Modelo de la Comida
 * Maneja la lógica de la comida en el juego Snake
 * 
 * Responsabilidades:
 * - Mantener posición de la comida
 * - Validar posiciones
 * - Generar efectos especiales (comida dorada, etc.)
 */

import { EventEmitter } from '../utils/EventEmitter.js';

export class Food extends EventEmitter {
    /**
     * Constructor de la comida
     * @param {Object} config - Configuración de la comida
     */
    constructor(config = {}) {
        super();
        
        // === CONFIGURACIÓN ===
        this.config = {
            normalPoints: 10,
            specialPoints: 50,
            specialChance: 0.1, // 10% chance de comida especial
            specialDuration: 5000, // 5 segundos
            ...config
        };
        
        // === ESTADO DE LA COMIDA ===
        this.position = { x: 0, y: 0 };
        this.isSpecial = false;
        this.specialTimer = null;
        this.type = 'normal'; // 'normal', 'golden', 'bonus'
        
        console.log('🍎 Food model initialized');
    }
    
    /**
     * Establece la posición de la comida
     * @param {Object} position - Nueva posición {x, y}
     */
    setPosition(position) {
        this.position = { ...position };
        
        // Determinar si será comida especial
        this.determineType();
        
        console.log(`🍎 Food placed at (${position.x}, ${position.y}) - Type: ${this.type}`);
        
        this.emit('positionChanged', {
            position: this.position,
            type: this.type,
            isSpecial: this.isSpecial,
            points: this.getPoints()
        });
        
        // Configurar timer para comida especial
        if (this.isSpecial) {
            this.startSpecialTimer();
        }
    }
    
    /**
     * Determina el tipo de comida (normal o especial)
     * @private
     */
    determineType() {
        const random = Math.random();
        
        if (random < this.config.specialChance) {
            this.type = Math.random() < 0.5 ? 'golden' : 'bonus';
            this.isSpecial = true;
        } else {
            this.type = 'normal';
            this.isSpecial = false;
        }
    }
    
    /**
     * Inicia el timer para comida especial
     * @private
     */
    startSpecialTimer() {
        if (this.specialTimer) {
            clearTimeout(this.specialTimer);
        }
        
        this.specialTimer = setTimeout(() => {
            this.expireSpecial();
        }, this.config.specialDuration);
        
        console.log(`⏰ Special food timer started (${this.config.specialDuration}ms)`);
    }
    
    /**
     * Expira la comida especial convirtiéndola en normal
     * @private
     */
    expireSpecial() {
        if (!this.isSpecial) return;
        
        console.log('⏰ Special food expired, converting to normal');
        
        this.type = 'normal';
        this.isSpecial = false;
        this.specialTimer = null;
        
        this.emit('specialExpired', {
            position: this.position,
            newType: this.type
        });
    }
    
    /**
     * Obtiene los puntos que da esta comida
     * @returns {number}
     */
    getPoints() {
        switch (this.type) {
            case 'golden':
                return this.config.specialPoints;
            case 'bonus':
                return this.config.specialPoints * 2;
            default:
                return this.config.normalPoints;
        }
    }
    
    /**
     * Obtiene la posición actual
     * @returns {Object} Posición {x, y}
     */
    getPosition() {
        return { ...this.position };
    }
    
    /**
     * Verifica si está en una posición específica
     * @param {Object} position - Posición a verificar {x, y}
     * @returns {boolean}
     */
    isAtPosition(position) {
        return this.position.x === position.x && this.position.y === position.y;
    }
    
    /**
     * Obtiene información completa de la comida
     * @returns {Object}
     */
    getInfo() {
        return {
            position: this.getPosition(),
            type: this.type,
            isSpecial: this.isSpecial,
            points: this.getPoints(),
            timeRemaining: this.getTimeRemaining()
        };
    }
    
    /**
     * Obtiene el tiempo restante para comida especial
     * @returns {number} Tiempo en milisegundos (0 si no es especial)
     */
    getTimeRemaining() {
        if (!this.isSpecial || !this.specialTimer) return 0;
        
        // Esta es una aproximación, en un juego real usarías timestamps
        return this.config.specialDuration;
    }
    
    /**
     * Fuerza la expiración de comida especial
     */
    forceExpire() {
        if (this.specialTimer) {
            clearTimeout(this.specialTimer);
            this.expireSpecial();
        }
    }
    
    /**
     * Consume la comida (cuando la serpiente la come)
     * @returns {Object} Información de la comida consumida
     */
    consume() {
        const foodInfo = this.getInfo();
        
        // Limpiar timer si existe
        if (this.specialTimer) {
            clearTimeout(this.specialTimer);
            this.specialTimer = null;
        }
        
        console.log(`🍽️ Food consumed! Points: ${foodInfo.points}, Type: ${foodInfo.type}`);
        
        this.emit('consumed', foodInfo);
        
        return foodInfo;
    }
    
    /**
     * Valida si una posición es válida para colocar comida
     * @param {Object} position - Posición a validar
     * @param {number} boardSize - Tamaño del tablero
     * @returns {boolean}
     */
    static isValidPosition(position, boardSize) {
        return position.x >= 0 && 
               position.x < boardSize && 
               position.y >= 0 && 
               position.y < boardSize;
    }
    
    /**
     * Genera una posición aleatoria válida
     * @param {number} boardSize - Tamaño del tablero
     * @param {Array} excludePositions - Posiciones a excluir
     * @returns {Object|null} Posición válida o null si no hay disponibles
     */
    static generateRandomPosition(boardSize, excludePositions = []) {
        const availablePositions = [];
        
        // Generar todas las posiciones posibles
        for (let x = 0; x < boardSize; x++) {
            for (let y = 0; y < boardSize; y++) {
                const position = { x, y };
                
                // Verificar que no esté en posiciones excluidas
                const isExcluded = excludePositions.some(excluded => 
                    excluded.x === x && excluded.y === y
                );
                
                if (!isExcluded) {
                    availablePositions.push(position);
                }
            }
        }
        
        if (availablePositions.length === 0) {
            return null; // No hay posiciones disponibles
        }
        
        // Seleccionar posición aleatoria
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        return availablePositions[randomIndex];
    }
    
    /**
     * Resetea la comida a su estado inicial
     */
    reset() {
        if (this.specialTimer) {
            clearTimeout(this.specialTimer);
            this.specialTimer = null;
        }
        
        this.position = { x: 0, y: 0 };
        this.isSpecial = false;
        this.type = 'normal';
        
        console.log('🔄 Food reset to initial state');
        this.emit('reset');
    }
    
    /**
     * Limpia recursos
     */
    destroy() {
        if (this.specialTimer) {
            clearTimeout(this.specialTimer);
        }
        
        this.removeAllListeners();
        console.log('🗑️ Food destroyed');
    }
}