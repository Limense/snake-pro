/**
 * GameController - Controlador principal del juego
 * Coordina entre modelos y vistas, maneja entrada del usuario
 * 
 * Patrón MVC: Este es el Controller
 * Responsabilidades:
 * - Manejar entrada del usuario (teclado, botones)
 * - Coordinar modelos y vista
 * - Manejar el game loop
 * - Gestionar configuraciones
 */

import { Game } from '../models/Game.js';
import { GameView } from '../views/GameView.js';
import { InputHandler } from '../utils/InputHandler.js';
import { SoundManager } from '../utils/SoundManager.js';

export class GameController {
    /**
     * Constructor del controlador
     * @param {HTMLElement} container - Contenedor del juego
     */
    constructor(container) {
        this.container = container;
        
        // === CONFIGURACIÓN INICIAL ===
        this.config = {
            boardSize: 20,
            difficulty: 'medium',
            soundEnabled: true,
            vibrationEnabled: true
        };
        
        // === SISTEMA DE GAME LOOP ===
        this.gameLoopId = null;
        this.lastUpdateTime = 0;
        this.targetFPS = 60;
        this.gameSpeed = 200; // ms entre movimientos de serpiente
        this.lastMoveTime = 0;
        
        // === ESTADO DEL CONTROLADOR ===
        this.isInitialized = false;
        this.isPaused = false;
        
        // Inicializar componentes
        this.initializeComponents();
        
        console.log('🎮 GameController initialized');
    }
    
    /**
     * Inicializa todos los componentes del juego
     * @private
     */
    async initializeComponents() {
        try {
            // Inicializar modelo del juego
            this.game = new Game(this.config);
            
            // Inicializar vista
            this.view = new GameView(this.container);
            
            // Inicializar manejador de entrada
            this.inputHandler = new InputHandler();
            
            // Inicializar sonidos
            this.soundManager = new SoundManager();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Renderizado inicial
            this.render();
            
            this.isInitialized = true;
            console.log('✅ All components initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing game components:', error);
        }
    }
    
    /**
     * Configura todos los event listeners
     * @private
     */
    setupEventListeners() {
        // === EVENTOS DEL MODELO ===
        this.game.on('stateChange', (state) => {
            this.handleStateChange(state);
        });
        
        this.game.on('gameStart', () => {
            this.startGameLoop();
            this.soundManager.play('gameStart');
        });
        
        this.game.on('gamePause', (data) => {
            if (data.isPaused) {
                this.pauseGameLoop();
            } else {
                this.resumeGameLoop();
            }
        });
        
        this.game.on('gameOver', (data) => {
            this.handleGameOver(data);
        });
        
        this.game.on('gameWin', (data) => {
            this.handleGameWin(data);
        });
        
        this.game.on('foodEaten', (data) => {
            this.handleFoodEaten(data);
        });
        
        this.game.on('levelUp', (data) => {
            this.handleLevelUp(data);
        });
        
        // === EVENTOS DE LA VISTA ===
        this.view.on('startGame', () => {
            this.startGame();
        });
        
        this.view.on('pauseGame', () => {
            this.togglePause();
        });
        
        this.view.on('resetGame', () => {
            this.resetGame();
        });
        
        this.view.on('configChange', (config) => {
            this.updateConfig(config);
        });
        
        // === EVENTOS DE ENTRADA ===
        this.inputHandler.on('direction', (direction) => {
            this.changeDirection(direction);
        });
        
        this.inputHandler.on('pause', () => {
            this.togglePause();
        });
        
        this.inputHandler.on('reset', () => {
            this.resetGame();
        });
        
        this.inputHandler.on('start', () => {
            this.startGame();
        });
    }
    
    /**
     * Inicia el juego
     */