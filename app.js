// app.js
// Main entry point that connects everything

// Import modules with new paths
import { chatForm, messageInput, sendButton } from './Helper/dom.js';
// 'addMessage' is already imported, which is perfect!
import { addMessage, setChatHeader } from './Helper/ui.js'; 
import { sendWhatsappMessageToContact, setWhatsappPhoneNumber } from './Helper/sendWhatsappMessage.js';
import { initializeAndLogPlacement } from './Helper/Bitrix/getContactInfo.js';
import { initializeWebSocket } from './Helper/Websocket/websocketClient.js';

// NEW: Variable to store the current contact's phone number
let currentContactPhoneNumber = null;

/**
 * Handles the form submission when a user sends a message.
 * This function is async to handle the API call.
 */
async function handleMessageSubmit(event) {
    event.preventDefault();

    const messageText = messageInput.value.trim();

    if (messageText !== '') {
        // 1. Add the user's message (from "ui.js")
        addMessage(messageText, 'user');

        // 2. Clear the input and disable the button
        const originalInput = messageText; // Store original message
        messageInput.value = '';
        sendButton.disabled = true;

        // 3. Show "sending" indicator (optional)
        // toggleTypingIndicator(true);

        // 4. Send the message via the API
        try {
            const success = await sendWhatsappMessageToContact(originalInput);

            if (!success) {
                console.error("Message failed to send.");
                // Optionally restore input for retry
                // messageInput.value = originalInput; 
            }

            // If successful, do nothing (message already in chat)
        } catch (error) {
            console.error("An error occurred during message submission:", error);
            // messageInput.value = originalInput; // Restore input on error
        } finally {
            // 5. Hide "sending" indicator
            // toggleTypingIndicator(false);

            // Re-check input in case user started typing again
            handleTextInput();
        }
    }
}

/**
 * Enables or disables the send button based on input.
 */
function handleTextInput() {
    sendButton.disabled = messageInput.value.trim() === '';
}

// NEW: Function to handle incoming messages from the WebSocket
/**
 * Handles incoming messages broadcast from the WebSocket.
 */
function handleIncomingMessage(event) {
    console.log("Incoming message event received:", event.detail);
    const payload = event.detail;

    // Use optional chaining to safely extract the message and sender
    const message = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    // Check if it's a valid text message
    if (message && message.type === 'text') {
        const messageFrom = message.from;       // e.g., "923135801665"
        const messageBody = message.text.body;  // e.g., "Hello"

        // Clean both numbers (remove '+', spaces, etc.) for a reliable comparison
        const cleanContactPhone = ('' + currentContactPhoneNumber).replace(/\D/g, '');
        const cleanMessageFrom = ('' + messageFrom).replace(/\D/g, '');

        // Only add the message if it's from the contact we are currently chatting with
        if (cleanContactPhone === cleanMessageFrom) {
            // Use 'received' as the sender type to style it on the "other side"
            addMessage(messageBody, 'received');
        } else {
            console.warn(`Ignoring message from ${cleanMessageFrom} (current chat is with ${cleanContactPhone})`);
        }
    }
}


/**
 * Main function to initialize the app.
 * Async to await Bitrix24 data.
 */
async function main() {
    // Add event listeners
    chatForm.addEventListener('submit', handleMessageSubmit);
    messageInput.addEventListener('input', handleTextInput);
    
    // NEW: Listen for the custom 'incoming_message' event from the WebSocket
    window.addEventListener('incoming_message', handleIncomingMessage);

    // Start the WebSocket connection
    initializeWebSocket();

    // Initialize Bitrix24 and fetch data
    try {
        const { leadName, phoneNumber } = await initializeAndLogPlacement();
        console.log(`App.js received: Name=${leadName}, Phone=${phoneNumber}`);

        // NEW: Store the phone number in our local variable
        currentContactPhoneNumber = phoneNumber;

        // Set the phone number for WhatsApp API
        setWhatsappPhoneNumber(phoneNumber);

        // Set the chat header UI
        setChatHeader(leadName, phoneNumber);
    } catch (error) {
        console.error("Failed to initialize app with Bitrix24 data:", error);
        setChatHeader("Error", "Could not load contact");
    }
}

// Run the app once the DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main(); // DOM is already loaded
}