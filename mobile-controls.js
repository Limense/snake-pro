// ===== CONTROLES TÁCTILES PARA MÓVILES =====

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const minSwipeDistance = 50; // Distancia mínima para considerar un swipe

// ===== DETECTAR GESTOS TÁCTILES =====
const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
};

const handleTouchMove = (e) => {
    e.preventDefault(); // Prevenir scroll
};

const handleTouchEnd = (e) => {
    if (!touchStartX || !touchStartY) return;
    
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    
    handleSwipe();
    
    // Reset
    touchStartX = 0;
    touchStartY = 0;
};

const handleSwipe = () => {
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Verificar si el swipe es lo suficientemente largo
    if (Math.abs(diffX) < minSwipeDistance && Math.abs(diffY) < minSwipeDistance) {
        return;
    }
    
    // Determinar dirección del swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Swipe horizontal
        if (diffX > 0) {
            // Swipe izquierda
            const event = { code: 'ArrowLeft', preventDefault: () => {} };
            directionEvent(event);
        } else {
            // Swipe derecha
            const event = { code: 'ArrowRight', preventDefault: () => {} };
            directionEvent(event);
        }
    } else {
        // Swipe vertical
        if (diffY > 0) {
            // Swipe arriba
            const event = { code: 'ArrowUp', preventDefault: () => {} };
            directionEvent(event);
        } else {
            // Swipe abajo
            const event = { code: 'ArrowDown', preventDefault: () => {} };
            directionEvent(event);
        }
    }
};

// ===== CONTROLES TÁCTILES VIRTUALES =====
const createVirtualControls = () => {
    // Solo mostrar en móviles
    if (window.innerWidth > 768) return;
    
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'virtual-controls';
    controlsContainer.innerHTML = `
        <div class="virtual-dpad">
            <button class="virtual-btn up" data-direction="ArrowUp">↑</button>
            <div class="middle-row">
                <button class="virtual-btn left" data-direction="ArrowLeft">←</button>
                <button class="virtual-btn pause-btn" data-action="pause">⏸️</button>
                <button class="virtual-btn right" data-direction="ArrowRight">→</button>
            </div>
            <button class="virtual-btn down" data-direction="ArrowDown">↓</button>
        </div>
    `;
    
    document.body.appendChild(controlsContainer);
    
    // Estilos para los controles virtuales
    const style = document.createElement('style');
    style.textContent = `
        .virtual-controls {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: none;
        }
        
        @media (max-width: 768px) {
            .virtual-controls {
                display: block;
            }
        }
        
        .virtual-dpad {
            display: grid;
            grid-template-rows: 1fr 1fr 1fr;
            gap: 5px;
            background: rgba(0, 0, 0, 0.3);
            padding: 10px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        
        .middle-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 5px;
        }
        
        .virtual-btn {
            width: 50px;
            height: 50px;
            border: none;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            font-size: 1.5rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .virtual-btn:active {
            background: rgba(255, 255, 255, 0.4);
            transform: scale(0.95);
        }
        
        .virtual-btn.up {
            grid-column: 2;
        }
        
        .virtual-btn.down {
            grid-column: 2;
        }
        
        .pause-btn {
            background: rgba(255, 107, 107, 0.3) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Event listeners para los botones virtuales
    controlsContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const btn = e.target.closest('.virtual-btn');
        if (!btn) return;
        
        if (btn.dataset.direction) {
            const event = { code: btn.dataset.direction, preventDefault: () => {} };
            directionEvent(event);
        } else if (btn.dataset.action === 'pause') {
            togglePause();
        }
        
        // Feedback visual
        btn.style.background = 'rgba(255, 255, 255, 0.4)';
        setTimeout(() => {
            btn.style.background = '';
        }, 150);
    });
};

// ===== VIBRACIÓN PARA FEEDBACK TÁCTIL =====
const vibrateDevice = (pattern = [50]) => {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
};

// ===== EVENT LISTENERS PARA MÓVILES =====
document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });
document.addEventListener('touchend', handleTouchEnd, { passive: false });

// ===== DETECCIÓN DE ORIENTACIÓN =====
const handleOrientationChange = () => {
    setTimeout(() => {
        // Recalcular canvas después de cambio de orientación
        if (typeof resizeCanvas === 'function') {
            resizeCanvas();
        }
    }, 500);
};

window.addEventListener('orientationchange', handleOrientationChange);
window.addEventListener('resize', handleOrientationChange);

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    createVirtualControls();
});

// ===== PREVENIR COMPORTAMIENTOS POR DEFECTO EN MÓVILES =====
document.addEventListener('touchstart', (e) => {
    // Prevenir zoom en doble tap
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault(); // Prevenir doble tap zoom
    }
    lastTouchEnd = now;
}, false);

// ===== MEJORAR RENDIMIENTO EN MÓVILES =====
const optimizeForMobile = () => {
    if (window.innerWidth <= 768) {
        // Reducir la frecuencia de actualización de partículas en móviles
        if (typeof settings !== 'undefined') {
            settings.particlesEnabled = false;
        }
        
        // Simplificar animaciones
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }
};

window.addEventListener('load', optimizeForMobile);