/**
 * Modelo principal del juego Snake
 * Representa el estado global del juego y coordina otros modelos
 * 
 * Patrón: Singleton + Observer
 * Responsabilidades:
 * - Mantener estado del juego
 * - Coordinar Snake, Food y Board
 * - Manejar puntuación y niveles
 * - Notificar cambios a observadores
 */

import { Snake } from './Snake.js';
import { Food } from './Food.js';
import { Board } from './Board.js';
import { EventEmitter } from '../utils/EventEmitter.js';

export class Game extends EventEmitter {
    /**
     * Constructor del juego
     * @param {Object} config - Configuración inicial del juego
     */
    constructor(config = {}) {
        super(); // Heredamos capacidades de EventEmitter
        
        // === CONFIGURACIÓN POR DEFECTO ===
        this.config = {
            boardSize: 20,
            initialSpeed: 200,
            speedIncrement: 10,
            pointsPerFood: 10,
            pointsForLevelUp: 100,
            ...config // Sobrescribir con config personalizada
        };
        
        // === ESTADO DEL JUEGO ===
        this.state = {
            isPlaying: false,
            isPaused: false,
            isGameOver: false,
            score: 0,
            highScore: this.loadHighScore(),
            level: 1,
            speed: this.config.initialSpeed,
            foodEaten: 0
        };
        
        // === MODELOS RELACIONADOS ===
        this.board = new Board(this.config.boardSize);
        this.snake = new Snake(this.board.getCenter());
        this.food = new Food();
        
        // === CONFIGURACIÓN INICIAL ===
        this.initializeGame();
        
        console.log('🎮 Game model initialized', this.state);
    }
    
    /**
     * Inicializa el estado del juego
     * @private
     */
    initializeGame() {
        // Generar primera comida
        this.generateFood();
        
        // Suscribirse a eventos del snake
        this.snake.on('move', (data) => {
            this.handleSnakeMove(data);
        });
        
        this.snake.on('collision', () => {
            this.handleGameOver();
        });
        
        // Emitir estado inicial
        this.emit('stateChange', this.getState());
    }
    
    /**
     * Inicia el juego
     */
    start() {
        if (this.state.isPlaying) return;
        
        console.log('🚀 Starting game...');
        
        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.state.isGameOver = false;
        
        this.emit('gameStart', this.getState());
        this.emit('stateChange', this.getState());
    }
    
    /**
     * Pausa/reanuda el juego
     */
    togglePause() {
        if (!this.state.isPlaying || this.state.isGameOver) return;
        
        this.state.isPaused = !this.state.isPaused;
        
        console.log(`⏸️ Game ${this.state.isPaused ? 'paused' : 'resumed'}`);
        
        this.emit('gamePause', { isPaused: this.state.isPaused });
        this.emit('stateChange', this.getState());
    }
    
    /**
     * Reinicia el juego completamente
     */
    reset() {
        console.log('🔄 Resetting game...');
        
        // Resetear estado
        this.state = {
            ...this.state,
            isPlaying: false,
            isPaused: false,
            isGameOver: false,
            score: 0,
            level: 1,
            speed: this.config.initialSpeed,
            foodEaten: 0
        };
        
        // Resetear modelos
        this.snake.reset(this.board.getCenter());
        this.generateFood();
        
        this.emit('gameReset', this.getState());
        this.emit('stateChange', this.getState());
    }
    
    /**
     * Actualiza el juego (llamado por el game loop)
     */
    update() {
        // No actualizar si no está jugando o está pausado
        if (!this.state.isPlaying || this.state.isPaused || this.state.isGameOver) {
            return;
        }
        
        // Mover la serpiente
        const moveResult = this.snake.move(this.board);
        
        // Verificar colisiones
        if (moveResult.collision) {
            this.handleGameOver();
            return;
        }
        
        // Verificar si comió
        if (this.checkFoodCollision()) {
            this.handleFoodEaten();
        }
        
        // Emitir actualización
        this.emit('gameUpdate', this.getGameData());
    }
    
    /**
     * Maneja el movimiento de la serpiente
     * @param {Object} data - Datos del movimiento
     * @private
     */
    handleSnakeMove(data) {
        // Verificar colisión con comida
        if (this.checkFoodCollision()) {
            this.handleFoodEaten();
        }
        
        this.emit('snakeMove', data);
    }
    
    /**
     * Verifica colisión con la comida
     * @returns {boolean}
     * @private
     */
    checkFoodCollision() {
        const head = this.snake.getHead();
        return head.x === this.food.position.x && head.y === this.food.position.y;
    }
    
    /**
     * Maneja cuando la serpiente come
     * @private
     */
    handleFoodEaten() {
        console.log('🍎 Food eaten!');
        
        // Hacer crecer la serpiente
        this.snake.grow();
        
        // Actualizar puntuación
        this.updateScore();
        
        // Generar nueva comida
        this.generateFood();
        
        // Verificar subida de nivel
        this.checkLevelUp();
        
        this.emit('foodEaten', {
            score: this.state.score,
            level: this.state.level,
            foodPosition: this.food.position
        });
    }
    
    /**
     * Actualiza la puntuación
     * @private
     */
    updateScore() {
        this.state.score += this.config.pointsPerFood;
        this.state.foodEaten++;
        
        // Actualizar high score si es necesario
        if (this.state.score > this.state.highScore) {
            this.state.highScore = this.state.score;
            this.saveHighScore(this.state.highScore);
            this.emit('newHighScore', this.state.highScore);
        }
        
        console.log(`📊 Score updated: ${this.state.score}`);
    }
    
    /**
     * Verifica y maneja subida de nivel
     * @private
     */
    checkLevelUp() {
        const newLevel = Math.floor(this.state.score / this.config.pointsForLevelUp) + 1;
        
        if (newLevel > this.state.level) {
            this.state.level = newLevel;
            this.state.speed = Math.max(50, this.state.speed - this.config.speedIncrement);
            
            console.log(`🎊 Level up! New level: ${this.state.level}, Speed: ${this.state.speed}`);
            
            this.emit('levelUp', {
                level: this.state.level,
                speed: this.state.speed
            });
        }
    }
    
    /**
     * Genera nueva comida en posición aleatoria
     * @private
     */
    generateFood() {
        const occupiedPositions = this.snake.getPositions();
        const availablePositions = this.board.getAvailablePositions(occupiedPositions);
        
        if (availablePositions.length === 0) {
            // ¡El jugador ganó! (tablero lleno)
            this.handleWin();
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        const position = availablePositions[randomIndex];
        
        this.food.setPosition(position);
        
        console.log('🍎 Food generated at:', position);
    }
    
    /**
     * Maneja el game over
     * @private
     */
    handleGameOver() {
        console.log('💀 Game Over!');
        
        this.state.isPlaying = false;
        this.state.isGameOver = true;
        
        this.emit('gameOver', {
            score: this.state.score,
            highScore: this.state.highScore,
            level: this.state.level
        });
        
        this.emit('stateChange', this.getState());
    }
    
    /**
     * Maneja la victoria (tablero lleno)
     * @private
     */
    handleWin() {
        console.log('🏆 You Win! Board is full!');
        
        this.state.isPlaying = false;
        
        this.emit('gameWin', {
            score: this.state.score,
            highScore: this.state.highScore,
            level: this.state.level
        });
        
        this.emit('stateChange', this.getState());
    }
    
    /**
     * Cambia la dirección de la serpiente
     * @param {string} direction - Nueva dirección ('up', 'down', 'left', 'right')
     */
    changeDirection(direction) {
        if (!this.state.isPlaying || this.state.isPaused) return;
        
        this.snake.setDirection(direction);
    }
    
    /**
     * Obtiene los datos completos del juego para renderizado
     * @returns {Object}
     */
    getGameData() {
        return {
            board: this.board.getGrid(),
            snake: this.snake.getPositions(),
            snakeHead: this.snake.getHead(),
            food: this.food.position,
            state: this.getState()
        };
    }
    
    /**
     * Obtiene el estado actual del juego
     * @returns {Object}
     */
    getState() {
        return { ...this.state }; // Retornar copia para evitar mutaciones
    }
    
    /**
     * Actualiza la configuración del juego
     * @param {Object} newConfig - Nueva configuración
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Reinicializar si es necesario
        if (newConfig.boardSize && newConfig.boardSize !== this.board.size) {
            this.board = new Board(newConfig.boardSize);
            this.reset();
        }
        
        console.log('⚙️ Config updated:', this.config);
        this.emit('configChange', this.config);
    }
    
    /**
     * Obtiene la velocidad actual del juego
     * @returns {number}
     */
    getCurrentSpeed() {
        return this.state.speed;
    }
    
    /**
     * Carga el high score desde localStorage
     * @returns {number}
     * @private
     */
    loadHighScore() {
        try {
            // Nota: En Claude artifacts no podemos usar localStorage
            // En un proyecto real usarías: localStorage.getItem('snakeHighScore')
            return 0;
        } catch (error) {
            console.warn('Could not load high score:', error);
            return 0;
        }
    }
    
    /**
     * Guarda el high score
     * @param {number} score - Puntuación a guardar
     * @private
     */
    saveHighScore(score) {
        try {
            // Nota: En Claude artifacts no podemos usar localStorage
            // En un proyecto real usarías: localStorage.setItem('snakeHighScore', score)
            console.log(`💾 High score saved: ${score}`);
        } catch (error) {
            console.warn('Could not save high score:', error);
        }
    }
    
    /**
     * Destruye el juego y limpia recursos
     */
    destroy() {
        this.removeAllListeners();
        this.snake.destroy();
        console.log('🗑️ Game destroyed');
    }
}