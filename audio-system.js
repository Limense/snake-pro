// ===== SISTEMA DE AUDIO SINTÉTICO =====
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.enabled = true;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API no soportado:', error);
            this.enabled = false;
        }
    }

    // Asegurar que el contexto esté activo
    async ensureAudioContext() {
        if (!this.audioContext || !this.enabled) return false;
        
        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (error) {
                console.warn('No se pudo reanudar el contexto de audio:', error);
                return false;
            }
        }
        return true;
    }

    // Generar tono básico
    createOscillator(frequency, type = 'sine') {
        const oscillator = this.audioContext.createOscillator();
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        return oscillator;
    }

    // Crear envelope (ADSR)
    createGainEnvelope(attack = 0.01, decay = 0.1, sustain = 0.5, release = 0.2) {
        const gainNode = this.audioContext.createGain();
        const now = this.audioContext.currentTime;
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume, now + attack);
        gainNode.gain.linearRampToValueAtTime(sustain * this.masterVolume, now + attack + decay);
        
        return gainNode;
    }

    // ===== SONIDOS DEL JUEGO =====

    // Sonido cuando la serpiente come
    async playEatSound() {
        if (!await this.ensureAudioContext()) return;

        const duration = 0.15;
        const now = this.audioContext.currentTime;

        // Crear dos osciladores para armonía
        const osc1 = this.createOscillator(800, 'square');
        const osc2 = this.createOscillator(1200, 'sine');
        
        // Crear filtro paso bajo para suavizar
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + duration);

        // Envelope para cada oscilador
        const gain1 = this.createGainEnvelope(0.01, 0.05, 0.3, 0.1);
        const gain2 = this.createGainEnvelope(0.02, 0.03, 0.2, 0.1);

        // Conectar todo
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(filter);
        gain2.connect(filter);
        filter.connect(this.audioContext.destination);

        // Programar el release
        gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // Iniciar y parar
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
    }

    // Sonido de game over
    async playGameOverSound() {
        if (!await this.ensureAudioContext()) return;

        const duration = 1.5;
        const now = this.audioContext.currentTime;

        // Secuencia descendente dramática
        const frequencies = [440, 370, 311, 262, 220, 185, 147];
        const noteDuration = duration / frequencies.length;

        frequencies.forEach((freq, index) => {
            const startTime = now + (index * noteDuration);
            
            // Oscilador principal
            const osc = this.createOscillator(freq, 'sawtooth');
            
            // Oscilador de sub-bass
            const subOsc = this.createOscillator(freq / 2, 'sine');
            
            // Filtro para efecto dramático
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, startTime);
            filter.frequency.exponentialRampToValueAtTime(200, startTime + noteDuration);
            filter.Q.setValueAtTime(5, startTime);

            // Ganancia con envelope
            const gain = this.audioContext.createGain();
            const subGain = this.audioContext.createGain();
            
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.3, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
            
            subGain.gain.setValueAtTime(0, startTime);
            subGain.gain.linearRampToValueAtTime(this.masterVolume * 0.2, startTime + 0.05);
            subGain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

            // Conectar
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            
            subOsc.connect(subGain);
            subGain.connect(this.audioContext.destination);

            // Reproducir
            osc.start(startTime);
            subOsc.start(startTime);
            osc.stop(startTime + noteDuration);
            subOsc.stop(startTime + noteDuration);
        });
    }

    // Sonido de movimiento de la serpiente
    async playMoveSound() {
        if (!await this.ensureAudioContext()) return;

        const duration = 0.08;
        const now = this.audioContext.currentTime;

        // Sonido sutil de "tick"
        const osc = this.createOscillator(200, 'square');
        const gain = this.audioContext.createGain();
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.1, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(now);
        osc.stop(now + duration);
    }

    // Sonido de inicio de juego
    async playStartSound() {
        if (!await this.ensureAudioContext()) return;

        const duration = 0.8;
        const now = this.audioContext.currentTime;

        // Secuencia ascendente optimista
        const frequencies = [262, 330, 392, 523]; // C, E, G, C
        const noteDuration = duration / frequencies.length;

        frequencies.forEach((freq, index) => {
            const startTime = now + (index * noteDuration * 0.7); // Overlap slight
            
            const osc = this.createOscillator(freq, 'triangle');
            const gain = this.audioContext.createGain();
            
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.4, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start(startTime);
            osc.stop(startTime + noteDuration);
        });
    }

    // Sonido de subida de nivel
    async playLevelUpSound() {
        if (!await this.ensureAudioContext()) return;

        const duration = 0.6;
        const now = this.audioContext.currentTime;

        // Arpeggio ascendente brillante
        const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
        const noteDuration = 0.12;

        frequencies.forEach((freq, index) => {
            const startTime = now + (index * 0.08);
            
            // Oscilador principal
            const osc1 = this.createOscillator(freq, 'sine');
            // Armónico
            const osc2 = this.createOscillator(freq * 2, 'sine');
            
            const gain1 = this.audioContext.createGain();
            const gain2 = this.audioContext.createGain();
            
            gain1.gain.setValueAtTime(0, startTime);
            gain1.gain.linearRampToValueAtTime(this.masterVolume * 0.4, startTime + 0.02);
            gain1.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
            
            gain2.gain.setValueAtTime(0, startTime);
            gain2.gain.linearRampToValueAtTime(this.masterVolume * 0.2, startTime + 0.02);
            gain2.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

            osc1.connect(gain1);
            osc2.connect(gain2);
            gain1.connect(this.audioContext.destination);
            gain2.connect(this.audioContext.destination);

            osc1.start(startTime);
            osc2.start(startTime);
            osc1.stop(startTime + noteDuration);
            osc2.stop(startTime + noteDuration);
        });
    }

    // Sonido de pausa
    async playPauseSound() {
        if (!await this.ensureAudioContext()) return;

        const duration = 0.3;
        const now = this.audioContext.currentTime;

        // Dos tonos que crean sensación de "pausa"
        const osc1 = this.createOscillator(400, 'sine');
        const osc2 = this.createOscillator(300, 'sine');
        
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        
        // Primera nota
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(this.masterVolume * 0.3, now + 0.05);
        gain1.gain.linearRampToValueAtTime(0, now + 0.15);
        
        // Segunda nota (ligeramente después)
        gain2.gain.setValueAtTime(0, now + 0.1);
        gain2.gain.linearRampToValueAtTime(this.masterVolume * 0.3, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(this.audioContext.destination);
        gain2.connect(this.audioContext.destination);

        osc1.start(now);
        osc2.start(now + 0.1);
        osc1.stop(now + 0.15);
        osc2.stop(now + duration);
    }

    // Música de fondo ambiental (opcional)
    async playBackgroundMusic() {
        if (!await this.ensureAudioContext()) return;

        // Ambiente minimalista con delay
        const createAmbientTone = (freq, delay, duration) => {
            const now = this.audioContext.currentTime + delay;
            
            const osc = this.createOscillator(freq, 'sine');
            const gain = this.audioContext.createGain();
            
            // Crear delay effect
            const delayNode = this.audioContext.createDelay();
            delayNode.delayTime.setValueAtTime(0.3, now);
            
            const feedbackGain = this.audioContext.createGain();
            feedbackGain.gain.setValueAtTime(0.2, now);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.05, now + 0.5);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.05, now + duration - 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            osc.connect(gain);
            gain.connect(delayNode);
            delayNode.connect(feedbackGain);
            feedbackGain.connect(delayNode);
            delayNode.connect(this.audioContext.destination);

            osc.start(now);
            osc.stop(now + duration);
        };

        // Secuencia ambient
        const ambientSequence = [
            { freq: 220, delay: 0, duration: 4 },
            { freq: 330, delay: 2, duration: 4 },
            { freq: 165, delay: 4, duration: 4 },
            { freq: 247, delay: 6, duration: 4 }
        ];

        ambientSequence.forEach(note => {
            createAmbientTone(note.freq, note.delay, note.duration);
        });
    }

    // Control de volumen
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    // Activar/desactivar sonido
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    // Cleanup
    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// ===== MANAGER DE AUDIO PARA EL JUEGO =====
class GameAudioManager {
    constructor() {
        this.audioSystem = new AudioSystem();
        this.settings = {
            enabled: true,
            volume: 0.7,
            musicEnabled: false
        };
        this.loadSettings();
        this.setupAudioContext();
    }

    loadSettings() {
        const saved = localStorage.getItem('snakeAudioSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('snakeAudioSettings', JSON.stringify(this.settings));
    }

    applySettings() {
        this.audioSystem.setEnabled(this.settings.enabled);
        this.audioSystem.setVolume(this.settings.volume);
    }

    setupAudioContext() {
        // Inicializar contexto de audio en la primera interacción del usuario
        const initAudio = () => {
            this.audioSystem.ensureAudioContext();
            document.removeEventListener('click', initAudio);
            document.removeEventListener('keydown', initAudio);
            document.removeEventListener('touchstart', initAudio);
        };

        document.addEventListener('click', initAudio);
        document.addEventListener('keydown', initAudio);
        document.addEventListener('touchstart', initAudio);
    }

    // ===== API PÚBLICA =====
    playEat() {
        if (this.settings.enabled) {
            this.audioSystem.playEatSound();
        }
    }

    playGameOver() {
        if (this.settings.enabled) {
            this.audioSystem.playGameOverSound();
        }
    }

    playMove() {
        if (this.settings.enabled) {
            this.audioSystem.playMoveSound();
        }
    }

    playStart() {
        if (this.settings.enabled) {
            this.audioSystem.playStartSound();
        }
    }

    playLevelUp() {
        if (this.settings.enabled) {
            this.audioSystem.playLevelUpSound();
        }
    }

    playPause() {
        if (this.settings.enabled) {
            this.audioSystem.playPauseSound();
        }
    }

    playBackgroundMusic() {
        if (this.settings.enabled && this.settings.musicEnabled) {
            this.audioSystem.playBackgroundMusic();
        }
    }

    setVolume(volume) {
        this.settings.volume = volume;
        this.applySettings();
        this.saveSettings();
    }

    setEnabled(enabled) {
        this.settings.enabled = enabled;
        this.applySettings();
        this.saveSettings();
    }

    setMusicEnabled(enabled) {
        this.settings.musicEnabled = enabled;
        this.saveSettings();
    }

    getSettings() {
        return { ...this.settings };
    }
}

// ===== INSTANCIA GLOBAL =====
window.gameAudio = new GameAudioManager();