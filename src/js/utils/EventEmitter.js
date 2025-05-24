/**
 * EventEmitter personalizado
 * Implementa el patrón Observer para comunicación entre componentes
 * 
 * Permite que los objetos emitan eventos y otros se suscriban a ellos
 * Esto desacopla los componentes y facilita la comunicación
 */

export class EventEmitter {
    constructor() {
        // Mapa de eventos y sus listeners
        // Estructura: { eventName: [listener1, listener2, ...] }
        this.events = new Map();
    }
    
    /**
     * Suscribe un listener a un evento
     * @param {string} event - Nombre del evento
     * @param {Function} listener - Función callback
     */
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        this.events.get(event).push(listener);
        
        // Retornar función para desuscribirse fácilmente
        return () => this.off(event, listener);
    }
    
    /**
     * Suscribe un listener que se ejecuta solo una vez
     * @param {string} event - Nombre del evento
     * @param {Function} listener - Función callback
     */
    once(event, listener) {
        const onceWrapper = (...args) => {
            this.off(event, onceWrapper);
            listener.apply(this, args);
        };
        
        this.on(event, onceWrapper);
    }
    
    /**
     * Desuscribe un listener de un evento
     * @param {string} event - Nombre del evento
     * @param {Function} listener - Función a desuscribir
     */
    off(event, listener) {
        if (!this.events.has(event)) return;
        
        const listeners = this.events.get(event);
        const index = listeners.indexOf(listener);
        
        if (index > -1) {
            listeners.splice(index, 1);
        }
        
        // Limpiar evento si no tiene listeners
        if (listeners.length === 0) {
            this.events.delete(event);
        }
    }
    
    /**
     * Emite un evento a todos sus listeners
     * @param {string} event - Nombre del evento
     * @param {...any} args - Argumentos para los listeners
     */
    emit(event, ...args) {
        if (!this.events.has(event)) return false;
        
        const listeners = this.events.get(event).slice(); // Copia para evitar modificaciones durante iteración
        
        listeners.forEach(listener => {
            try {
                listener.apply(this, args);
            } catch (error) {
                console.error(`Error in event listener for '${event}':`, error);
            }
        });
        
        return true;
    }
    
    /**
     * Elimina todos los listeners de un evento o todos los eventos
     * @param {string} [event] - Evento específico (opcional)
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }
    
    /**
     * Obtiene la cantidad de listeners para un evento
     * @param {string} event - Nombre del evento
     * @returns {number}
     */
    listenerCount(event) {
        return this.events.has(event) ? this.events.get(event).length : 0;
    }
    
    /**
     * Obtiene todos los nombres de eventos
     * @returns {string[]}
     */
    eventNames() {
        return Array.from(this.events.keys());
    }
}