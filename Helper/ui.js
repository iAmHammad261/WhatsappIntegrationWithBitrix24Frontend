// ui.js
// Handles all UI manipulations

// This import path './dom.js' is correct.
// It resolves to 'Helper/dom.js' because this file is in the 'Helper' folder.
import { chatHeaderInfo, chatMessages } from './dom.js';

// --- Helper: Get Current Time ---
function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// --- Helper: Scroll to Bottom ---
function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// --- Exported Function: addMessage ---
export function addMessage(text, sender) {
    const time = getCurrentTime();
    const messageElement = document.createElement('div');
    messageElement.classList.add('message-bubble');
    messageElement.classList.add(sender + '-message');
    
    const textElement = document.createElement('span');
    textElement.textContent = text;
    
    // This tells HTML to respect newlines (\n)
    textElement.style.whiteSpace = 'pre-wrap'; 
    
    const timeElement = document.createElement('span');
    timeElement.classList.add('message-timestamp');
    timeElement.textContent = time;

    messageElement.appendChild(textElement);
    messageElement.appendChild(timeElement);
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

// --- Exported Function: toggleTypingIndicator ---
// export function toggleTypingIndicator(show) {
//      let indicator = document.getElementById('typing-indicator');
//      if (show) {
//          if (!indicator) {
//              indicator = document.createElement('div');
//              indicator.id = 'typing-indicator';
//              indicator.classList.add('typing-indicator');
//              // Basic typing indicator dots
//              indicator.innerHTML = `<span></span><span></span><span></span>`;
//              chatMessages.appendChild(indicator);
//              scrollToBottom();
//          }
//      } else {
//          if (indicator) {
//              indicator.remove();
//          }
//      }
// }

// --- NEW: Exported Function: setChatHeader ---
export function setChatHeader(leadName, phoneNumber) {
    // The error happens here. This means 'chatHeaderInfo'
    // was not successfully imported at the top of the file.
    if (!chatHeaderInfo) {
        console.error("setChatHeader failed: chatHeaderInfo is not defined/imported.");
        return;
    }

    // Find the h2, which we will use for the *name*
    const nameElement = chatHeaderInfo.querySelector('h2');
    if (nameElement) {
        nameElement.textContent = leadName || "Unknown Lead";
        nameElement.style.marginBottom = '2px';
        nameElement.style.lineHeight = '1.1';
    }

    // Find or create a 'p' tag for the phone number
    let phoneElement = chatHeaderInfo.querySelector('p');
    if (!phoneElement) {
        phoneElement = document.createElement('p');
        phoneElement.style.margin = '0';
        phoneElement.style.fontSize = '0.8rem';
        phoneElement.style.color = '#54656F'; // WhatsApp-like status color
        chatHeaderInfo.appendChild(phoneElement);
    }

    if (phoneNumber) {
        // Basic phone number formatting (add +)
        const cleaned = ('' + phoneNumber).replace(/\D/g, '');
        let formattedNumber = cleaned;
        if (cleaned.length > 10) {
            formattedNumber = `+${cleaned}`;
        }
        //
        // I REMOVED THE "nbsp;" ERROR FROM THE LINE BELOW
        //
        phoneElement.textContent = formattedNumber;
    } else {
        // This is the message for when no number is found
        phoneElement.textContent = "No phone number found";
    }
}