// ===== ELEMENTOS HTML =====
const board = document.getElementById('board');
const scoreBoard = document.getElementById('scoreBoard');
const highScoreBoard = document.getElementById('highScore');
const levelBoard = document.getElementById('levelBoard');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const settingsButton = document.getElementById('settings');
const gameOverSign = document.getElementById('gameOver');
const pauseOverlay = document.getElementById('pauseOverlay');
const finalScore = document.getElementById('finalScore');
const finalLevel = document.getElementById('finalLevel');
const newHighScoreEl = document.getElementById('newHighScore');
const restartButton = document.getElementById('restart');
const menuButton = document.getElementById('menu');

// Modales
const settingsModal = document.getElementById('settingsModal');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const soundToggle = document.getElementById('soundToggle');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const musicToggle = document.getElementById('musicToggle');
const particlesToggle = document.getElementById('particlesToggle');
const saveSettingsButton = document.getElementById('saveSettings');
const closeSettingsButton = document.getElementById('closeSettings');

// Canvas para partículas
const particlesCanvas = document.getElementById('particles');
const particlesCtx = particlesCanvas.getContext('2d');

// ===== CONFIGURACIÓN DEL JUEGO =====
const boardSize = 10;
let gameSpeed = 150;
let currentLevel = 1;
let isGameRunning = false;
let isPaused = false;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let moveCounter = 0; // Para sonidos de movimiento ocasionales

const squareTypes = {
    emptySquare: 0,
    snakeSquare: 1,
    foodSquare: 2
};

const directions = {
    ArrowUp: -10,
    ArrowDown: 10,
    ArrowRight: 1,
    ArrowLeft: -1,
};

// ===== VARIABLES DEL JUEGO =====
let snake;
let score;
let direction;
let nextDirection;
let boardSquares;
let emptySquares;
let moveInterval;
let particles = [];
let backgroundMusicInterval;
let settings = {
    soundEnabled: true,
    musicEnabled: false,
    particlesEnabled: true,
    gameSpeed: 150,
    volume: 0.7
};

// ===== SISTEMA DE PARTÍCULAS =====
class Particle {
    constructor(x, y, color = '#ff6b6b', size = 3) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 1;
        this.decay = 0.02;
        this.color = color;
        this.size = size;
        this.gravity = 0.1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= this.decay;
        this.size *= 0.99;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0 || this.size <= 0.1;
    }
}

// ===== FUNCIONES DE CONFIGURACIÓN =====
const loadSettings = () => {
    const savedSettings = localStorage.getItem('snakeSettings');
    if (savedSettings) {
        settings = { ...settings, ...JSON.parse(savedSettings) };
    }
    
    gameSpeed = settings.gameSpeed;
    speedSlider.value = gameSpeed;
    speedValue.textContent = `${gameSpeed}ms`;
    soundToggle.checked = settings.soundEnabled;
    musicToggle.checked = settings.musicEnabled;
    volumeSlider.value = settings.volume;
    volumeValue.textContent = `${Math.round(settings.volume * 100)}%`;
    particlesToggle.checked = settings.particlesEnabled;
    
    // Aplicar configuraciones de audio
    if (window.gameAudio) {
        window.gameAudio.setEnabled(settings.soundEnabled);
        window.gameAudio.setVolume(settings.volume);
        window.gameAudio.setMusicEnabled(settings.musicEnabled);
    }
};

const saveSettings = () => {
    settings.gameSpeed = parseInt(speedSlider.value);
    settings.soundEnabled = soundToggle.checked;
    settings.musicEnabled = musicToggle.checked;
    settings.volume = parseFloat(volumeSlider.value);
    settings.particlesEnabled = particlesToggle.checked;
    
    localStorage.setItem('snakeSettings', JSON.stringify(settings));
    gameSpeed = settings.gameSpeed;
    
    // Aplicar configuraciones de audio
    if (window.gameAudio) {
        window.gameAudio.setEnabled(settings.soundEnabled);
        window.gameAudio.setVolume(settings.volume);
        window.gameAudio.setMusicEnabled(settings.musicEnabled);
    }
    
    if (isGameRunning && !isPaused) {
        clearInterval(moveInterval);
        moveInterval = setInterval(() => moveSnake(), gameSpeed);
    }
};

// ===== FUNCIONES DE PARTÍCULAS =====
const resizeCanvas = () => {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
};

const createParticles = (x, y, count = 8, color = '#ff6b6b') => {
    if (!settings.particlesEnabled) return;
    
    const rect = board.getBoundingClientRect();
    const particleX = rect.left + x * 37 + 18;
    const particleY = rect.top + y * 37 + 18;
    
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(particleX, particleY, color, Math.random() * 4 + 2));
    }
};

const updateParticles = () => {
    particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    
    particles = particles.filter(particle => {
        particle.update();
        particle.draw(particlesCtx);
        return !particle.isDead();
    });
};

// ===== FUNCIONES DE ANIMACIÓN =====
const animateScore = (newScore) => {
    scoreBoard.style.transform = 'scale(1.3)';
    scoreBoard.style.color = '#ffe66d';
    
    setTimeout(() => {
        scoreBoard.style.transform = 'scale(1)';
        scoreBoard.style.color = '';
    }, 300);
};

const shakeScreen = () => {
    document.body.classList.add('shake');
    setTimeout(() => {
        document.body.classList.remove('shake');
    }, 500);
};

const showFloatingScore = (row, column, points = 1) => {
    const rect = board.getBoundingClientRect();
    const floatingScore = document.createElement('div');
    floatingScore.className = 'floating-score';
    floatingScore.textContent = `+${points}`;
    floatingScore.style.left = `${rect.left + column * 37}px`;
    floatingScore.style.top = `${rect.top + row * 37}px`;
    
    document.body.appendChild(floatingScore);
    
    setTimeout(() => {
        floatingScore.remove();
    }, 1000);
};

// ===== FUNCIONES PRINCIPALES DEL JUEGO =====
const drawSnake = () => {
    snake.forEach((square, index) => {
        const element = document.getElementById(square);
        if (element) {
            element.classList.remove('head');
            if (index === snake.length - 1) {
                element.classList.add('head');
            }
            drawSquare(square, 'snakeSquare');
        }
    });
};

const drawSquare = (square, type) => {
    const [row, column] = square.split('').map(Number);
    if (row >= boardSize || column >= boardSize) return;
    
    boardSquares[row][column] = squareTypes[type];
    const squareElement = document.getElementById(square);
    
    if (squareElement) {
        squareElement.className = `square ${type}`;
        
        // Efecto de aparición
        if (type === 'foodSquare') {
            squareElement.style.transform = 'scale(0)';
            setTimeout(() => {
                squareElement.style.transform = '';
            }, 50);
        }
    }

    if (type === 'emptySquare') {
        emptySquares.push(square);
    } else {
        const index = emptySquares.indexOf(square);
        if (index !== -1) {
            emptySquares.splice(index, 1);
        }
    }
};

const moveSnake = () => {
    if (isPaused) return;
    
    // Usar la siguiente dirección si está definida
    if (nextDirection) {
        direction = nextDirection;
        nextDirection = null;
    }
    
    const newSquare = String(
        Number(snake[snake.length - 1]) + directions[direction]
    ).padStart(2, '0');
    
    const [row, column] = newSquare.split('').map(Number);

    // Verificar colisiones
    if (newSquare < 0 || 
        newSquare > (boardSize * boardSize - 1) ||
        (direction === 'ArrowRight' && column === 0) ||
        (direction === 'ArrowLeft' && column === (boardSize - 1)) ||
        boardSquares[row][column] === squareTypes.snakeSquare) {
        
        // Efectos de game over
        shakeScreen();
        createParticles(column, row, 15, '#ff4757');
        
        // 🔊 SONIDO DE GAME OVER
        if (window.gameAudio) {
            window.gameAudio.playGameOver();
        }
        
        gameOver();
        return;
    }

    snake.push(newSquare);
    
    // 🔊 SONIDO DE MOVIMIENTO (ocasional para no saturar)
    moveCounter++;
    if (moveCounter % 8 === 0 && window.gameAudio) {
        window.gameAudio.playMove();
    }
    
    if (boardSquares[row][column] === squareTypes.foodSquare) {
        // Comer comida
        score++;
        createParticles(column, row, 12, '#ffe66d');
        showFloatingScore(row, column);
        
        // 🔊 SONIDO DE COMER
        if (window.gameAudio) {
            window.gameAudio.playEat();
        }
        
        animateScore(score);
        updateScore();
        checkLevelUp();
        addFood();
    } else {
        // Mover normalmente
        const emptySquare = snake.shift();
        drawSquare(emptySquare, 'emptySquare');
    }
    
    drawSnake();
};

const addFood = () => {
    if (emptySquares.length === 0) {
        // ¡Ganaste! (tablero lleno)
        gameOver(true);
        return;
    }
    
    const randomEmptySquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    drawSquare(randomEmptySquare, 'foodSquare');
};

const checkLevelUp = () => {
    const newLevel = Math.floor(score / 10) + 1;
    if (newLevel > currentLevel) {
        currentLevel = newLevel;
        levelBoard.textContent = currentLevel;
        
        // 🔊 SONIDO DE SUBIDA DE NIVEL
        if (window.gameAudio) {
            window.gameAudio.playLevelUp();
        }
        
        // Aumentar velocidad
        gameSpeed = Math.max(50, 150 - (currentLevel - 1) * 10);
        clearInterval(moveInterval);
        moveInterval = setInterval(() => moveSnake(), gameSpeed);
        
        // Efecto visual de subida de nivel
        levelBoard.style.transform = 'scale(1.5)';
        levelBoard.style.color = '#ffe66d';
        setTimeout(() => {
            levelBoard.style.transform = 'scale(1)';
            levelBoard.style.color = '';
        }, 500);
    }
};

const updateScore = () => {
    scoreBoard.textContent = score;
    
    // Actualizar high score
    if (score > highScore) {
        highScore = score;
        highScoreBoard.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
};

const gameOver = (won = false) => {
    isGameRunning = false;
    clearInterval(moveInterval);
    
    // Parar música de fondo
    if (backgroundMusicInterval) {
        clearInterval(backgroundMusicInterval);
        backgroundMusicInterval = null;
    }
    
    // Mostrar estadísticas finales
    finalScore.textContent = score;
    finalLevel.textContent = currentLevel;
    
    // Verificar si es nuevo high score
    if (score >= highScore && score > 0) {
        newHighScoreEl.style.display = 'block';
    } else {
        newHighScoreEl.style.display = 'none';
    }
    
    if (won) {
        gameOverSign.querySelector('h2').textContent = '🎉 YOU WON!';
    } else {
        gameOverSign.querySelector('h2').textContent = '💀 GAME OVER';
    }
    
    gameOverSign.style.display = 'flex';
    startButton.disabled = false;
    pauseButton.disabled = true;
};

// ===== CONTROL DE DIRECCIONES =====
const setDirection = (newDirection) => {
    // Prevenir movimientos opuestos inmediatos
    const opposites = {
        'ArrowUp': 'ArrowDown',
        'ArrowDown': 'ArrowUp',
        'ArrowLeft': 'ArrowRight',
        'ArrowRight': 'ArrowLeft'
    };
    
    if (direction !== opposites[newDirection]) {
        nextDirection = newDirection;
    }
};

const directionEvent = (key) => {
    if (!isGameRunning) return;
    
    switch (key.code) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            key.preventDefault();
            setDirection(key.code);
            break;
        case 'Space':
            key.preventDefault();
            togglePause();
            break;
    }
};

// ===== CONTROL DE PAUSA =====
const togglePause = () => {
    if (!isGameRunning) return;
    
    if (isPaused) {
        isPaused = false;
        pauseOverlay.style.display = 'none';
        pauseButton.innerHTML = '<span class="button-icon">⏸️</span>PAUSE';
        moveInterval = setInterval(() => moveSnake(), gameSpeed);
        
        // Reanudar música de fondo
        if (settings.musicEnabled) {
            startBackgroundMusic();
        }
    } else {
        isPaused = true;
        pauseOverlay.style.display = 'flex';
        pauseButton.innerHTML = '<span class="button-icon">▶️</span>RESUME';
        clearInterval(moveInterval);
        
        // 🔊 SONIDO DE PAUSA
        if (window.gameAudio) {
            window.gameAudio.playPause();
        }
        
        // Pausar música de fondo
        if (backgroundMusicInterval) {
            clearInterval(backgroundMusicInterval);
            backgroundMusicInterval = null;
        }
    }
};

// ===== MÚSICA DE FONDO =====
const startBackgroundMusic = () => {
    if (!settings.musicEnabled || backgroundMusicInterval) return;
    
    // Reproducir música ambiente cada 8 segundos
    backgroundMusicInterval = setInterval(() => {
        if (window.gameAudio && isGameRunning && !isPaused) {
            window.gameAudio.playBackgroundMusic();
        }
    }, 8000);
    
    // Reproducir inmediatamente
    if (window.gameAudio) {
        window.gameAudio.playBackgroundMusic();
    }
};

// ===== CREACIÓN DEL TABLERO =====
const createBoard = () => {
    board.innerHTML = '';
    emptySquares = [];
    
    boardSquares.forEach((row, rowIndex) => {
        row.forEach((column, columnIndex) => {
            const squareValue = `${rowIndex}${columnIndex}`;
            const squareElement = document.createElement('div');
            squareElement.className = 'square emptySquare';
            squareElement.id = squareValue;
            
            // Animación de aparición escalonada
            squareElement.style.opacity = '0';
            squareElement.style.transform = 'scale(0)';
            
            board.appendChild(squareElement);
            emptySquares.push(squareValue);
            
            setTimeout(() => {
                squareElement.style.transition = 'all 0.3s ease';
                squareElement.style.opacity = '1';
                squareElement.style.transform = 'scale(1)';
            }, (rowIndex + columnIndex) * 30);
        });
    });
};

// ===== INICIALIZACIÓN DEL JUEGO =====
const setGame = () => {
    snake = ['00', '01', '02', '03'];
    score = snake.length - 4; // Empezar en 0
    direction = 'ArrowRight';
    nextDirection = null;
    currentLevel = 1;
    gameSpeed = settings.gameSpeed;
    moveCounter = 0;
    boardSquares = Array.from(Array(boardSize), () => 
        new Array(boardSize).fill(squareTypes.emptySquare)
    );
    
    particles = [];
    createBoard();
};

const startGame = () => {
    if (isGameRunning) return;
    
    setGame();
    isGameRunning = true;
    isPaused = false;
    
    gameOverSign.style.display = 'none';
    pauseOverlay.style.display = 'none';
    startButton.disabled = true;
    pauseButton.disabled = false;
    pauseButton.innerHTML = '<span class="button-icon">⏸️</span>PAUSE';
    
    // 🔊 SONIDO DE INICIO
    if (window.gameAudio) {
        window.gameAudio.playStart();
    }
    
    // Esperar a que termine la animación del tablero
    setTimeout(() => {
        drawSnake();
        updateScore();
        addFood();
        document.addEventListener('keydown', directionEvent);
        moveInterval = setInterval(() => moveSnake(), gameSpeed);
        
        // Iniciar música de fondo
        if (settings.musicEnabled) {
            setTimeout(() => startBackgroundMusic(), 2000);
        }
    }, 1000);
};

const resetGame = () => {
    isGameRunning = false;
    isPaused = false;
    clearInterval(moveInterval);
    
    if (backgroundMusicInterval) {
        clearInterval(backgroundMusicInterval);
        backgroundMusicInterval = null;
    }
    
    gameOverSign.style.display = 'none';
    pauseOverlay.style.display = 'none';
    startButton.disabled = false;
    pauseButton.disabled = true;
    
    particles = [];
    particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    
    document.removeEventListener('keydown', directionEvent);
};

// ===== EVENT LISTENERS =====
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', () => {
    resetGame();
    startGame();
});
menuButton.addEventListener('click', resetGame);

// Configuraciones
settingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
});

closeSettingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

saveSettingsButton.addEventListener('click', () => {
    saveSettings();
    settingsModal.style.display = 'none';
});

speedSlider.addEventListener('input', () => {
    speedValue.textContent = `${speedSlider.value}ms`;
});

volumeSlider.addEventListener('input', () => {
    volumeValue.textContent = `${Math.round(volumeSlider.value * 100)}%`;
});

// Cerrar modales al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

// ===== INICIALIZACIÓN =====
window.addEventListener('load', () => {
    loadSettings();
    resizeCanvas();
    highScoreBoard.textContent = highScore;
    
    // Loop de partículas
    const particleLoop = () => {
        updateParticles();
        requestAnimationFrame(particleLoop);
    };
    particleLoop();
});

window.addEventListener('resize', resizeCanvas);

// Prevenir scroll con las flechas
window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
});