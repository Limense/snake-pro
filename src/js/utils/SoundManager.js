/**
 * SoundManager - Gestión de efectos de sonido
 * Maneja la reproducción de sonidos usando Web Audio API y HTML5 Audio
 * 
 * Características:
 * - Genera sonidos sintéticos para evitar archivos externos
 * - Control de volumen global y por sonido
 * - Soporte para silenciar/desmutear
 * - Fallback para navegadores sin Web Audio API
 */

export class SoundManager {
    constructor() {
        // Configuración
        this.enabled = true;
        this.masterVolume = 0.3;
        
        // Web Audio API
        this.audioContext = null;
        this.gainNode = null;
        
        // Inicializar contexto de audio
        this.initAudioContext();
        
        // Banco de sonidos predefinidos
        this.sounds = new Map();
        this.initSounds();
        
        console.log('🔊 SoundManager initialized');
    }
    
    /**
     * Inicializa el contexto de Web Audio API
     * @private
     */
    initAudioContext() {
        try {
            // Crear contexto de audio
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            
            if (AudioContext) {
                this.audioContext = new AudioContext();
                
                // Crear nodo de ganancia principal
                this.gainNode = this.audioContext.createGain();
                this.gainNode.connect(this.audioContext.destination);
                this.gainNode.gain.value = this.masterVolume;
                
                console.log('🎵 Web Audio API initialized');
            } else {
                console.warn('⚠️ Web Audio API not supported');
            }
        } catch (error) {
            console.error('❌ Error initializing Web Audio API:', error);
        }
    }
    
    /**
     * Inicializa los sonidos del juego
     * @private
     */
    initSounds() {
        // Definir parámetros de sonidos
        this.soundParams = {
            eat: {
                frequency: 800,
                duration: 0.1,
                type: 'square',
                volume: 0.3
            },
            gameOver: {
                frequency: 150,
                duration: 0.5,
                type: 'sawtooth',
                volume: 0.4,
                decay: true
            },
            levelUp: {
                frequency: 440,
                duration: 0.3,
                type: 'sine',
                volume: 0.3,
                ascending: true
            },
            move: {
                frequency: 200,
                duration: 0.05,
                type: 'square',
                volume: 0.1
            },
            pause: {
                frequency: 600,
                duration: 0.2,
                type: 'triangle',
                volume: 0.2
            },
            start: {
                frequency: 523,
                duration: 0.2,
                type: 'sine',
                volume: 0.3
            }
        };
        
        console.log('🎼 Sound bank initialized');
    }
    
    /**
     * Reproduce un sonido específico
     * @param {string} soundName - Nombre del sonido
     * @param {Object} options - Opciones adicionales
     */
    play(soundName, options = {}) {
        if (!this.enabled || !this.audioContext) {
            return;
        }
        
        const params = this.soundParams[soundName];
        if (!params) {
            console.warn(`⚠️ Sound "${soundName}" not found`);
            return;
        }
        
        try {
            // Si el contexto está suspendido, intentar reanudarlo
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            this.generateSound({ ...params, ...options });
        } catch (error) {
            console.error(`❌ Error playing sound "${soundName}":`, error);
        }
    }
    
    /**
     * Genera un sonido sintético
     * @param {Object} params - Parámetros del sonido
     * @private
     */
    generateSound(params) {
        const {
            frequency = 440,
            duration = 0.2,
            type = 'sine',
            volume = 0.3,
            decay = false,
            ascending = false
        } = params;
        
        const currentTime = this.audioContext.currentTime;
        
        // Crear oscilador
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Configurar oscilador
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        // Conectar nodos
        oscillator.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        // Configurar envolvente de volumen
        gainNode.gain.value = 0;
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.01);
        
        if (decay) {
            // Decay exponencial para sonidos como game over
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
        } else {
            // Decay lineal normal
            gainNode.gain.linearRampToValueAtTime(volume * 0.5, currentTime + duration * 0.7);
            gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);
        }
        
        // Efectos especiales
        if (ascending) {
            // Frecuencia ascendente para level up
            oscillator.frequency.setValueAtTime(frequency, currentTime);
            oscillator.frequency.linearRampToValueAtTime(frequency * 2, currentTime + duration);
        }
        
        // Reproducir sonido
        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration);
        
        // Limpiar nodos después de la reproducción
        oscillator.onended = () => {
            try {
                oscillator.disconnect();
                gainNode.disconnect();
            } catch (e) {
                // Ignorar errores de desconexión
            }
        };
    }
    
    /**
     * Reproduce sonido de comer
     */
    playEat() {
        this.play('eat');
    }
    
    /**
     * Reproduce sonido de game over
     */
    playGameOver() {
        this.play('gameOver');
    }
    
    /**
     * Reproduce sonido de subir de nivel
     */
    playLevelUp() {
        this.play('levelUp');
    }
    
    /**
     * Reproduce sonido de movimiento (opcional)
     */
    playMove() {
        this.play('move');
    }
    
    /**
     * Reproduce sonido de pausa
     */
    playPause() {
        this.play('pause');
    }
    
    /**
     * Reproduce sonido de inicio
     */
    playStart() {
        this.play('start');
    }
    
    /**
     * Habilita o deshabilita todos los sonidos
     * @param {boolean} enabled - true para habilitar
     */
    setEnabled(enabled) {
        this.enabled = Boolean(enabled);
        console.log(`🔊 Sounds ${this.enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Obtiene si los sonidos están habilitados
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }
    
    /**
     * Establece el volumen maestro
     * @param {number} volume - Volumen (0.0 - 1.0)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        if (this.gainNode) {
            this.gainNode.gain.value = this.masterVolume;
        }
        
        console.log(`🔊 Master volume set to: ${this.masterVolume}`);
    }
    
    /**
     * Obtiene el volumen maestro
     * @returns {number}
     */
    getMasterVolume() {
        return this.masterVolume;
    }
    
    /**
     * Silencia temporalmente todos los sonidos
     */
    mute() {
        if (this.gainNode) {
            this.gainNode.gain.value = 0;
        }
        console.log('🔇 Sounds