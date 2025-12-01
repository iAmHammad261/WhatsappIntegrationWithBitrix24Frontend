// Helper/websocketClient.js
// Manages the WebSocket connection for receiving live messages.

// The URL of your Render.com hosted server
// We use 'wss://' (WebSocket Secure) because your site is 'https://'
const WS_URL = 'wss://whatsappintegrationwithbitrix24.onrender.com';

// Time to wait before trying to reconnect (in milliseconds)
const RECONNECT_DELAY = 3000;

/**
 * Main connection function.
 */
function connect() {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log('WebSocket connection established.');
    };

    ws.onmessage = (event) => {
        try {
            const parsedData = JSON.parse(event.data);
            
            // Check if it's the message type your server broadcasts
            if (parsedData.type === 'NEW_MESSAGE' && parsedData.data) {
                console.log('New message received via WebSocket:', parsedData.data);
                
                // Dispatch a custom event for app.js to hear
                // This passes the full WhatsApp payload
                window.dispatchEvent(new CustomEvent('incoming_message', {
                    detail: parsedData.data
                }));
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected. Trying to reconnect...');
        // Automatically try to reconnect after a delay
        setTimeout(connect, RECONNECT_DELAY);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // The onclose event will fire next, triggering a reconnect
    };
}

/**
 * Initializes the WebSocket client.
 */
export function initializeWebSocket() {
    connect();
}