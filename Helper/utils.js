// utils.js

/**
 * Gets the current time as a formatted HH:MM string.
 * @returns {string} The current time.
 */
export function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}