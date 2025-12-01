/**
 * Helper function to extract the first phone number from Bitrix24 data.
 * @param {object} data - The lead or contact data object.
 * @returns {string | null} The phone number, or null.
 */
function getPhoneNumber(data) {
    if (data && data.PHONE && data.PHONE.length > 0) {
        const phoneNumber = data.PHONE[0].VALUE;
        console.log(`Found phone number: ${phoneNumber}`);
        return phoneNumber;
    }
    console.log("No phone number found in data object.");
    return null;
}

/**
 * Initializes the Bitrix24 integration and fetches all contact data.
 * This function is exported to be called by app.js
 * @returns {Promise<{leadName: string, phoneNumber: string | null}>}
 */
export function initializeAndLogPlacement() {
    
    // Return a promise that will resolve with the contact info
    return new Promise((resolve, reject) => {
        
        // Check if the BX24 object exists
        if (typeof BX24 === 'undefined') {
            console.error("BX24 object not found. Is the app running inside Bitrix24?");
            return reject("BX24 object not found.");
        }
        
        // Initialize the Bitrix24 API
        BX24.init(function() {
            console.log("BX24 API is initialized.");
            
            // This is the core Bitrix24 method.
            const placementInfo = BX24.placement.info();
            
            if (!placementInfo || !placementInfo.options || !placementInfo.options.ID) {
                console.error("Failed to retrieve placement info, or placement.options.ID is missing.");
                console.log("Received placement info:", placementInfo);
                return reject("Invalid placement info.");
            }

            console.log("--- Placement Info Start ---");
            console.log("Successfully retrieved placement info:");
            console.log(placementInfo);
            console.log("Placement: " + placementInfo.placement);
            console.log("Placement Options (e.g., Lead ID):", placementInfo.options);
            console.log("--- Placement Info End ---");

            // --- Step 1: Get Lead Info ---
            const leadId = placementInfo.options.ID;
            console.log(`Fetching data for Lead ID: ${leadId}`);

            BX24.callMethod('crm.lead.get', { ID: leadId }, (result) => {
                const isSuccess = (result.answer && result.answer.result !== undefined);
                
                if (!isSuccess) {
                    const error = (result.answer && result.answer.error) ? result.answer.error : "Unknown error fetching lead";
                    console.error("Error fetching lead data:", error, result);
                    return reject(error);
                }

                const leadData = result.answer.result;
                const leadName = leadData.TITLE || leadData.NAME || "Unnamed Lead";
                console.log("--- Lead Data Start ---");
                console.log("Successfully fetched lead data:", leadData);
                console.log("--- Lead Data End ---");

                const contactId = leadData.CONTACT_ID;

                // --- Step 2: Get Contact Info (if it exists) ---
                if (contactId) {
                    console.log(`Lead associated with Contact ID: ${contactId}. Fetching...`);
                    
                    BX24.callMethod('crm.contact.get', { ID: contactId }, (contactResult) => {
                        const isContactSuccess = (contactResult.answer && contactResult.answer.result !== undefined);
                        
                        if (!isContactSuccess) {
                            const error = (contactResult.answer && contactResult.answer.error) ? contactResult.answer.error : "Unknown error fetching contact";
                            console.error("Error fetching contact data:", error, contactResult);
                            
                            // Fallback: Could not get contact, so check lead for phone
                            const leadPhoneNumber = getPhoneNumber(leadData);
                            console.log("Falling back to lead phone number.");
                            resolve({ leadName, phoneNumber: leadPhoneNumber });
                            return;
                        }

                        const contactData = contactResult.answer.result;
                        console.log("--- Contact Data Start ---");
                        console.log("Successfully fetched contact data:", contactData);
                        console.log("--- Contact Data End ---");

                        const contactPhoneNumber = getPhoneNumber(contactData);
                        resolve({ leadName, phoneNumber: contactPhoneNumber });
                    });
                } else {
                    // --- No Contact ID ---
                    console.log("No CONTACT_ID. Checking lead data for phone.");
                    const leadPhoneNumber = getPhoneNumber(leadData);
                    resolve({ leadName, phoneNumber: leadPhoneNumber });
                }
            });
        });
    });
}