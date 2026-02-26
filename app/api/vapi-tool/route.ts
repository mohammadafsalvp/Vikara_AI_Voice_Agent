import { NextRequest, NextResponse } from 'next/server';
import { createCalendarEvent } from '@/lib/google-calendar';

/**
 * Vapi Tool Webhook Handler
 * 
 * This API endpoint acts as the bridge between Vapi's AI voice processing
 * and our backend services. When the AI agent decides it needs to 
 * "schedule a meeting", it sends a POST request here with the parsed 
 * details from the conversation.
 */

export async function POST(req: NextRequest) {
    try {
        // Parse the incoming webhook payload from Vapi
        const payload = await req.json();

        // Logging the incoming request for debugging purposes
        console.log('📬 Received Vapi Tool Call');

        const { message } = payload;

        // Verify that this is a 'tool-calls' message from Vapi
        if (message?.type === 'tool-calls') {
            const toolCall = message.toolCalls[0]; // Process the first tool call
            const { name, args } = toolCall.function;

            // Handle the 'scheduleMeeting' tool
            if (name === 'scheduleMeeting') {
                const { title, name: guestName, date, time } = args;

                console.log(`🎙️ AI is requesting to schedule a meeting for: ${guestName}`);

                // Combine the date and time strings provided by the AI into a standard ISO format
                // Expected 'date' format: YYYY-MM-DD
                // Expected 'time' format: HH:mm
                const startTime = new Date(`${date}T${time}:00`).toISOString();

                // Trigger the calendar event creation service
                const result = await createCalendarEvent({
                    title,
                    name: guestName,
                    startTime,
                    description: `Meeting scheduled by Vikara Voice AI for ${guestName}.`,
                });

                // Return the result back to Vapi so the AI agent can confirm it to the user
                return NextResponse.json({
                    results: [
                        {
                            toolCallId: toolCall.id,
                            result: `Successfully scheduled the meeting: ${result.htmlLink}`,
                        },
                    ],
                });
            }
        }

        // Handle cases where the tool call is not recognized
        console.warn('⚠️ Received unsupported tool call type');
        return NextResponse.json({ error: 'Unsupported tool call' }, { status: 400 });

    } catch (error: any) {
        // Log the error for server-side monitoring
        console.error('❌ Vapi Tool Webhook Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
