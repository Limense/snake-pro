/**
 * Modelo de la Serpiente
 * Maneja toda la lógica relacionada con la serpiente del juego
 * 
 * Responsabilidades:
 * - Mantener posiciones de la serpiente
 * - Manejar movimiento y dirección
 * - Detectar colisiones
 * - Crecimiento de la serpiente
 */

import { EventEmitter } from '../utils/EventEmitter.js';

export class Snake extends EventEmitter {
    /**
     * Constructor de la serpiente
     * @param {Object} startPosition - Posición inicial {x, y}
     */
    constructor(startPosition = { x: 10, y: 10 }) {
        super();
        
        // === CONFIGURACIÓN DE LA SERPIENTE ===
        this.initialLength = 3;
        this.initialPosition = { ...startPosition };
        
        // === DIRECCIONES POSIBLES ===
        this.directions = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };
        
        // === ESTADO DE LA SERPIENTE ===
        this.reset(startPosition);
        
        console.log('🐍 Snake initialized at:', startPosition);
    }
    
    /**
     * Reinicia la serpiente a su estado inicial
     * @param {Object} startPosition - Posición inicial
     */
    reset(startPosition = this.initialPosition) {
        this.positions = [];
        this.currentDirection = this.directions.right;
        this.nextDirection = this.directions.right;
        this.justAte = false;
        
        // Crear serpiente inicial (horizontal hacia la derecha)
        for (let i = 0; i < this.initialLength; i++) {
            this.positions.push({
                x: startPosition.x - i,
                y: startPosition.y
            });
        }
        
        console.log('🔄 Snake reset:', this.positions);
        this.emit('reset', this.getPositions());
    }
    
    /**
     * Mueve la serpiente una posición
     * @param {Board} board - Instancia del tablero para verificar límites
     * @returns {Object} Resultado del movimiento {success, collision, newHead}
     */
    move(board) {
        // Actualizar dirección (previene cambios demasiado rápidos)
        this.currentDirection = this.nextDirection;
        
        // Calcular nueva posición de la cabeza
        const head = this.getHead();
        const newHead = {
            x: head.x + this.currentDirection.x,
            y: head.y + this.currentDirection.y
        };
        
        // Verificar colisiones
        const collision = this.checkCollisions(newHead, board);
        
        if (collision) {
            console.log('💥 Snake collision detected!');
            this.emit('collision', { position: newHead, type: collision });
            return { success: false, collision: collision, newHead };
        }
        
        // Mover serpiente
        this.positions.unshift(newHead); // Agregar nueva cabeza
        
        // Quitar cola (excepto si acaba de comer)
        if (!this.justAte) {
            const removedTail = this.positions.pop();
            this.emit('tailRemoved', removedTail);
        } else {
            this.justAte = false; // Reset flag
        }
        
        // Emitir evento de movimiento exitoso
        this.emit('move', {
            head: newHead,
            tail: this.positions[this.positions.length - 1],
            direction: this.currentDirection,
            length: this.positions.length
        });
        
        return { success: true, collision: null, newHead };
    }
    
    /**
     * Verifica colisiones de la nueva cabeza
     * @param {Object} newHead - Nueva posición de la cabeza
     * @param {Board} board - Instancia del tablero
     * @returns {string|null} Tipo de colisión o null si no hay
     * @private
     */
    checkCollisions(newHead, board) {
        // Colisión con paredes
        if (newHead.x < 0 || newHead.x >= board.size || 
            newHead.y < 0 || newHead.y >= board.size) {
            return 'wall';
        }
        
        // Colisión consigo misma (excepto la cola que se va a quitar)
        const bodyToCheck = this.justAte ? this.positions : this.positions.slice(0, -1);
        
        for (let segment of bodyToCheck) {
            if (newHead.x === segment.x && newHead.y === segment.y) {
                return 'self';
            }
        }
        
        return null; // No hay colisión
    }
    
    /**
     * Cambia la dirección de la serpiente
     * @param {string} direction - Nueva dirección ('up', 'down', 'left', 'right')
     */
    setDirection(direction) {
        const newDirection = this.directions[direction];
        
        if (!newDirection) {
            console.warn('⚠️ Invalid direction:', direction);
            return;
        }
        
        // Prevenir movimiento en dirección opuesta
        if (this.isOppositeDirection(newDirection)) {
            console.log('🚫 Cannot move in opposite direction');
            return;
        }
        
        this.nextDirection = newDirection;
        
        console.log(`🧭 Direction changed to: ${direction}`);
        this.emit('directionChange', { direction, vector: newDirection });
    }
    
    /**
     * Verifica si una dirección es opuesta a la actual
     * @param {Object} direction - Dirección a verificar
     * @returns {boolean}
     * @private
     */
    isOppositeDirection(direction) {
        const current = this.currentDirection;
        return (current.x === -direction.x && current.y === -direction.y);
    }
    
    /**
     * Hace crecer la serpiente (llamado cuando come)
     */
    grow() {
        this.justAte = true;
        
        console.log(`🌱 Snake grew! New length: ${this.positions.length + 1}`);
        this.emit('grow', { 
            newLength: this.positions.length + 1,
            head: this.getHead()
        });
    }
    
    /**
     * Obtiene la posición de la cabeza
     * @returns {Object} Posición de la cabeza {x, y}
     */
    getHead() {
        return { ...this.positions[0] };
    }
    
    /**
     * Obtiene la posición de la cola
     * @returns {Object} Posición de la cola {x, y}
     */
    getTail() {
        return { ...this.positions[this.positions.length - 1] };
    }
    
    /**
     * Obtiene todas las posiciones de la serpiente
     * @returns {Array} Array de posiciones [{x, y}, ...]
     */
    getPositions() {
        return this.positions.map(pos => ({ ...pos })); // Retornar copias
    }
    
    /**
     * Obtiene el cuerpo de la serpiente (sin la cabeza)
     * @returns {Array} Array de posiciones del cuerpo
     */
    getBody() {
        return this.positions.slice(1).map(pos => ({ ...pos }));
    }
    
    /**
     * Obtiene la longitud actual de la serpiente
     * @returns {number}
     */
    getLength() {
        return this.positions.length;
    }
    
    /**
     * Obtiene la dirección actual
     * @returns {Object} Vector de dirección {x, y}
     */
    getCurrentDirection() {
        return { ...this.currentDirection };
    }
    
    /**
     * Obtiene la próxima dirección
     * @returns {Object} Vector de dirección {x, y}
     */
    getNextDirection() {
        return { ...this.nextDirection };
    }
    
    /**
     * Verifica si una posición está ocupada por la serpiente
     * @param {Object} position - Posición a verificar {x, y}
     * @returns {boolean}
     */
    occupiesPosition(position) {
        return this.positions.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
    }
    
    /**
     * Obtiene información completa de la serpiente
     * @returns {Object} Información completa
     */
    getInfo() {
        return {
            head: this.getHead(),
            tail: this.getTail(),
            body: this.getBody(),
            positions: this.getPositions(),
            length: this.getLength(),
            currentDirection: this.getCurrentDirection(),
            nextDirection: this.getNextDirection(),
            justAte: this.justAte
        };
    }
    
    /**
     * Verifica si la serpiente puede moverse en una dirección
     * @param {string} direction - Dirección a verificar
     * @returns {boolean}
     */
    canMoveInDirection(direction) {
        const newDirection = this.directions[direction];
        return newDirection && !this.isOppositeDirection(newDirection);
    }
    
    /**
     * Obtiene las direcciones válidas actuales
     * @returns {Array} Array de direcciones válidas
     */
    getValidDirections() {
        return Object.keys(this.directions).filter(dir => 
            this.canMoveInDirection(dir)
        );
    }
    
    /**
     * Serializa la serpiente para guardar estado
     * @returns {Object} Estado serializable
     */
    serialize() {
        return {
            positions: this.getPositions(),
            currentDirection: this.getCurrentDirection(),
            nextDirection: this.getNextDirection(),
            justAte: this.justAte,
            length: this.getLength()
        };
    }
    
    /**
     * Restaura la serpiente desde un estado serializado
     * @param {Object} state - Estado serializado
     */
    deserialize(state) {
        this.positions = state.positions.map(pos => ({ ...pos }));
        this.currentDirection = { ...state.currentDirection };
        this.nextDirection = { ...state.nextDirection };
        this.justAte = state.justAte;
        
        console.log('📥 Snake state restored:', state);
        this.emit('stateRestored', this.getInfo());
    }
    
    /**
     * Limpia recursos y eventos
     */
    destroy() {
        this.removeAllListeners();
        this.positions = [];
        console.log('🗑️ Snake destroyed');
    }
}