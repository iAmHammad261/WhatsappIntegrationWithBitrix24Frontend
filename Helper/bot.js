// bot.js

/**
 * Generates a simple bot reply based on the user's message.
 * @param {string} userMessage - The text from the user.
 * @returns {string} The bot's reply.
 */
export function getBotReply(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return 'Hello there! How can I help you today?';
    }
    if (lowerMessage.includes('how are you')) {
        return "I'm just a bot, but I'm fully operational! Thanks for asking.";
    }
    if (lowerMessage.includes('bye')) {
        return 'Goodbye! Have a great day.';
    }
    if (lowerMessage.includes('help')) {
        return 'I can answer simple questions. Try asking me "how are you" or just say "hello".';
    }
    
    return `I received your message: "${userMessage}". I am still learning!`;
}