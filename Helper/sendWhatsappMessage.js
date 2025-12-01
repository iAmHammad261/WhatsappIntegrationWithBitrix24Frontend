// --- WhatsApp API Service ---

// !! IMPORTANT: Fill this in with your credentials
const API_TOKEN = "dZS2f0epItsbnFRmPUNcoaBxa5ivYc98DMuyOUMDc003cbda"; // <-- Add your token

// This will be set by app.js after the Bitrix24 API call
let apiPhoneNumber = null; 

const API_ENDPOINT = "https://apps.oncloudapi.com/api/wpbox/sendmessage";

/**
 * NEW: Sets the phone number to be used by the API.
 * This is called by app.js after fetching data from Bitrix24.
 * @param {string} number - The phone number to use.
 */
export function setWhatsappPhoneNumber(number) {
    apiPhoneNumber = number;
    console.log(`WhatsApp API phone number set to: ${number}`);
}

/**
 * Sends a text message to the WhatsApp API.
 * @param {string} messageText - The text message to send.
 * @returns {Promise<boolean>} - True if the message was sent successfully, false otherwise.
 */
export async function sendWhatsappMessageToContact(messageText) {
    
    // Check if the phone number has been set
    if (!apiPhoneNumber) {
        console.error("API Error: Phone number has not been set.");
        return false;
    }

    const payload = {
        token: API_TOKEN,
        phone: apiPhoneNumber, // Use the dynamically set phone number
        message: messageText
    };

    console.log("Sending message to API:", payload);

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
            return false;
        }

        const result = await response.json();
        console.log("API Success:", result);
        return true;

    } catch (error) {
        console.error("Failed to send message:", error);
        return false;
    }
}