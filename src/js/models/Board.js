/**
 * Modelo del Tablero
 * Maneja la lógica del tablero de juego
 * 
 * Responsabilidades:
 * - Mantener dimensiones del tablero
 * - Validar posiciones
 * - Proporcionar posiciones disponibles
 * - Calcular distancias y coordenadas
 */

export class Board {
    /**
     * Constructor del tablero
     * @param {number} size - Tamaño del tablero (size x size)
     */
    constructor(size = 20) {
        this.size = size;
        this.totalCells = size * size;
        
        // Crear grid bidimensional para representación interna (opcional)
        this.grid = this.createGrid();
        
        console.log(`🎯 Board created: ${size}x${size} (${this.totalCells} cells)`);
    }
    
    /**
     * Crea una matriz bidimensional vacía
     * @returns {Array} Grid bidimensional
     * @private
     */
    createGrid() {
        const grid = [];
        for (let y = 0; y < this.size; y++) {
            grid[y] = [];
            for (let x = 0; x < this.size; x++) {
                grid[y][x] = 'empty';
            }
        }
        return grid;
    }
    
    /**
     * Obtiene el centro del tablero
     * @returns {Object} Posición central {x, y}
     */
    getCenter() {
        return {
            x: Math.floor(this.size / 2),
            y: Math.floor(this.size / 2)
        };
    }
    
    /**
     * Verifica si una posición está dentro de los límites
     * @param {Object} position - Posición a verificar {x, y}
     * @returns {boolean}
     */
    isValidPosition(position) {
        return position.x >= 0 && 
               position.x < this.size && 
               position.y >= 0 && 
               position.y < this.size;
    }
    
    /**
     * Verifica si una posición está en el borde del tablero
     * @param {Object} position - Posición a verificar {x, y}
     * @returns {boolean}
     */
    isEdgePosition(position) {
        if (!this.isValidPosition(position)) return false;
        
        return position.x === 0 || 
               position.x === this.size - 1 || 
               position.y === 0 || 
               position.y === this.size - 1;
    }
    
    /**
     * Verifica si una posición está en una esquina
     * @param {Object} position - Posición a verificar {x, y}
     * @returns {boolean}
     */
    isCornerPosition(position) {
        if (!this.isValidPosition(position)) return false;
        
        return (position.x === 0 || position.x === this.size - 1) &&
               (position.y === 0 || position.y === this.size - 1);
    }
    
    /**
     * Obtiene todas las posiciones disponibles (no ocupadas)
     * @param {Array} occupiedPositions - Array de posiciones ocupadas [{x, y}, ...]
     * @returns {Array} Array de posiciones disponibles
     */
    getAvailablePositions(occupiedPositions = []) {
        const available = [];
        
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                const position = { x, y };
                
                // Verificar si no está ocupada
                const isOccupied = occupiedPositions.some(occupied => 
                    occupied.x === x && occupied.y === y
                );
                
                if (!isOccupied) {
                    available.push(position);
                }
            }
        }
        
        return available;
    }
    
    /**
     * Obtiene posiciones adyacentes a una posición dada
     * @param {Object} position - Posición central {x, y}
     * @param {boolean} includeDiagonals - Incluir diagonales (default: false)
     * @returns {Array} Array de posiciones adyacentes válidas
     */
    getAdjacentPositions(position, includeDiagonals = false) {
        const adjacents = [];
        
        // Direcciones cardinales
        const directions = [
            { x: 0, y: -1 }, // Norte
            { x: 1, y: 0 },  // Este
            { x: 0, y: 1 },  // Sur
            { x: -1, y: 0 }  // Oeste
        ];
        
        // Agregar diagonales si se requiere
        if (includeDiagonals) {
            directions.push(
                { x: -1, y: -1 }, // Noroeste
                { x: 1, y: -1 },  // Noreste
                { x: 1, y: 1 },   // Sureste
                { x: -1, y: 1 }   // Suroeste
            );
        }
        
        directions.forEach(dir => {
            const adjacent = {
                x: position.x + dir.x,
                y: position.y + dir.y
            };
            
            if (this.isValidPosition(adjacent)) {
                adjacents.push(adjacent);
            }
        });
        
        return adjacents;
    }
    
    /**
     * Calcula la distancia Manhattan entre dos posiciones
     * @param {Object} pos1 - Primera posición {x, y}
     * @param {Object} pos2 - Segunda posición {x, y}
     * @returns {number} Distancia Manhattan
     */
    getManhattanDistance(pos1, pos2) {
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    }
    
    /**
     * Calcula la distancia euclidiana entre dos posiciones
     * @param {Object} pos1 - Primera posición {x, y}
     * @param {Object} pos2 - Segunda posición {x, y}
     * @returns {number} Distancia euclidiana
     */
    getEuclideanDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Convierte coordenadas 2D a índice lineal
     * @param {Object} position - Posición {x, y}
     * @returns {number} Índice lineal
     */
    positionToIndex(position) {
        return position.y * this.size + position.x;
    }
    
    /**
     * Convierte índice lineal a coordenadas 2D
     * @param {number} index - Índice lineal
     * @returns {Object} Posición {x, y}
     */
    indexToPosition(index) {
        return {
            x: index % this.size,
            y: Math.floor(index / this.size)
        };
    }
    
    /**
     * Obtiene una posición aleatoria válida
     * @param {Array} excludePositions - Posiciones a excluir
     * @returns {Object|null} Posición aleatoria o null si no hay disponibles
     */
    getRandomPosition(excludePositions = []) {
        const available = this.getAvailablePositions(excludePositions);
        
        if (available.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * available.length);
        return available[randomIndex];
    }
    
    /**
     * Obtiene el perímetro del tablero
     * @returns {Array} Array de posiciones del perímetro
     */
    getPerimeter() {
        const perimeter = [];
        
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (this.isEdgePosition({ x, y })) {
                    perimeter.push({ x, y });
                }
            }
        }
        
        return perimeter;
    }
    
    /**
     * Verifica si el tablero está casi lleno
     * @param {Array} occupiedPositions - Posiciones ocupadas
     * @param {number} threshold - Umbral de porcentaje (default: 0.9 = 90%)
     * @returns {boolean}
     */
    isAlmostFull(occupiedPositions, threshold = 0.9) {
        const occupiedCount = occupiedPositions.length;
        const occupiedPercentage = occupiedCount / this.totalCells;
        return occupiedPercentage >= threshold;
    }
    
    /**
     * Obtiene estadísticas del tablero
     * @param {Array} occupiedPositions - Posiciones ocupadas
     * @returns {Object} Estadísticas
     */
    getStats(occupiedPositions = []) {
        const occupied = occupiedPositions.length;
        const available = this.totalCells - occupied;
        const occupiedPercentage = (occupied / this.totalCells) * 100;
        
        return {
            size: this.size,
            totalCells: this.totalCells,
            occupied,
            available,
            occupiedPercentage: parseFloat(occupiedPercentage.toFixed(2))
        };
    }
    
    /**
     * Crea una representación visual del tablero (para debug)
     * @param {Array} snakePositions - Posiciones de la serpiente
     * @param {Object} foodPosition - Posición de la comida
     * @returns {string} Representación visual
     */
    visualize(snakePositions = [], foodPosition = null) {
        let visual = '\n';
        
        for (let y = 0; y < this.size; y++) {
            let row = '';
            for (let x = 0; x < this.size; x++) {
                const pos = { x, y };
                
                if (foodPosition && pos.x === foodPosition.x && pos.y === foodPosition.y) {
                    row += '🍎';
                } else if (snakePositions.some(s => s.x === pos.x && s.y === pos.y)) {
                    // Primera posición es la cabeza
                    const isHead = snakePositions[0] && snakePositions[0].x === pos.x && snakePositions[0].y === pos.y;
                    row += isHead ? '🐍' : '🟢';
                } else {
                    row += '⬜';
                }
            }
            visual += row + '\n';
        }
        
        return visual;
    }
    
    /**
     * Redimensiona el tablero
     * @param {number} newSize - Nuevo tamaño
     */
    resize(newSize) {
        this.size = newSize;
        this.totalCells = newSize * newSize;
        this.grid = this.createGrid();
        
        console.log(`🎯 Board resized to: ${newSize}x${newSize}`);
    }
    
    /**
     * Obtiene información completa del tablero
     * @returns {Object}
     */
    getInfo() {
        return {
            size: this.size,
            totalCells: this.totalCells,
            center: this.getCenter(),
            corners: [
                { x: 0, y: 0 },
                { x: this.size - 1, y: 0 },
                { x: this.size - 1, y: this.size - 1 },
                { x: 0, y: this.size - 1 }
            ]
        };
    }
    
    /**
     * Obtiene el grid (matriz bidimensional)
     * @returns {Array}
     */
    getGrid() {
        // Retornar copia para evitar mutaciones
        return this.grid.map(row => [...row]);
    }
}