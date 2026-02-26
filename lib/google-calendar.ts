import { google } from 'googleapis';

/**
 * humanized Google Calendar Service
 * 
 * This service facilitates the integration BETWEEN the Vikara Voice AI and 
 * a Google Calendar. It uses a Service Account to perform actions on behalf
 * of the application, ensuring a seamless experience without requiring 
 * individual user logins.
 */

// Define the required scope for managing calendar events.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

/**
 * Initializes and returns a Google Calendar API client.
 * Uses Service Account credentials from environment variables.
 */
const getCalendarClient = () => {
    // We use JWT (JSON Web Token) auth for server-to-server communication.
    // Ensure the Private Key is correctly formatted (handling newline escapes).
    const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: SCOPES,
    });

    return google.calendar({ version: 'v3', auth });
};

/**
 * Creates a new event in the Google Calendar.
 * 
 * @param title - The title of the meeting.
 * @param name - The name of the guest scheduling the meeting.
 * @param startTime - ISO 8601 string representing the start of the meeting.
 * @param description - Additional details for the calendar event.
 */
export async function createCalendarEvent({
    title,
    name,
    startTime,
    description,
}: {
    title?: string;
    name: string;
    startTime: string;
    description?: string;
}) {
    try {
        const calendar = getCalendarClient();

        // Calculate the end time. We default to a 30-minute block.
        const start = new Date(startTime);
        const end = new Date(start.getTime() + 30 * 60000);

        const event = {
            summary: title || `Meeting with ${name}`,
            description: description || `Scheduled via Vikara Voice AI. Guest: ${name}`,
            start: {
                dateTime: start.toISOString(),
                timeZone: 'UTC', // Standardizing on UTC for consistency
            },
            end: {
                dateTime: end.toISOString(),
                timeZone: 'UTC',
            },
        };

        // Insert the event into the 'primary' calendar of the Service Account.
        // NOTE: Make sure the personal calendar is SHARED with the Service Account email!
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });

        console.log(`✅ Event successfully created: ${response.data.htmlLink}`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to create calendar event:', error.message);
        throw new Error(`Calendar Service Error: ${error.message}`);
    }
}
