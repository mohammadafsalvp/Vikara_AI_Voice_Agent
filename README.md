<img width="1887" height="899" alt="Screenshot 2026-02-26 161243" src="https://github.com/user-attachments/assets/1ef60a8a-7acf-4972-9586-4da8e8fcf2ce" /># Vikara Voice AI

A premium, real-time voice assistant that schedules meetings directly into Google Calendar. This project demonstrates the seamless integration of Voice AI (Vapi) with enterprise tools (Google Calendar API) within a modern Next.js environment.

---

## 🚀 Live Experience
- **Deployed Application**: [Check out the Live Demo](https://vikara-ai-scheduler.vercel.app) *(Replace with your URL)*
- **Core Stack**: GPT-4o voice processing, ElevenLabs high-fidelity audio, and Google Workspace integration.

## 🎙️ How to Test the Agent
1. **Initialize**: Click the blue microphone button on the web dashboard.
2. **Grant Access**: Ensure your browser has microphone permissions enabled.
3. **Speak Naturally**: Try saying:
   - *"I'd like to schedule a meeting with Mohd for tomorrow at 2 PM."*
   - *"Can you book a 30-minute sync for Friday at 10 AM?"*
4. **Confirmation**: The AI will ask for any missing details (like a meeting title). Once confirmed, you'll see a **"Meeting Secured!"** card appear on the screen, and the event will be created in the calendar.

## 🛠️ Local Setup & Development

### 1. Prerequisites
- **Google Cloud**: A project with **Google Calendar API** enabled.
- **Service Account**: A JSON key for a Service Account.
- **Vapi account**: Public Key and a configured Agent ID.

### 2. Installation
```bash
git clone https://github.com/your-username/vikara-ai-scheduler.git
cd vikara-ai-scheduler
npm install
```

### 3. Configuration
Create a `.env.local` file (use `.env.example` as a template):
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="..."
VAPI_PUBLIC_KEY=...
VAPI_AGENT_ID=...
NEXT_PUBLIC_VAPI_PUBLIC_KEY=...
NEXT_PUBLIC_VAPI_AGENT_ID=...
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start the assistant.

## ⚙️ Vapi Agent Configuration
To finalize the assistant, configure your Vapi agent with the following specifications:


### 2. Tool Schema (`scheduleMeeting`)
Add a new tool in Vapi with the following JSON schema. Ensure the **Server URL** points to your deployed `/api/vapi-tool` endpoint.

```json
{
  "name": "scheduleMeeting",
  "async": true,
  "description": "Schedules a meeting in the Google Calendar.",
  "parameters": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "The name of the person scheduling the meeting." },
      "date": { "type": "string", "description": "The date of the meeting in YYYY-MM-DD format." },
      "time": { "type": "string", "description": "The time of the meeting in HH:mm format (24-hour)." },
      "title": { "type": "string", "description": "The title of the meeting (optional)." }
    },
    "required": ["name", "date", "time"]
  },
  "server": {
    "url": "https://vikara-ai-scheduler.vercel.app/api/vapi-tool"
  }
}
```

## 🧠 Technical Architecture: Calendar Integration
The application uses a **Server-to-Server** authentication model via a **Google Service Account**.

- **Workflow**: 
  1. The Vapi Agent identifies a "scheduling" intent and extracts parameters (date, time, guest name).
  2. Vapi triggers our `/api/vapi-tool` webhook.
  3. The server validates the request and uses the `google-calendar.ts` utility.
  4. Authentication is handled via **JWT (JSON Web Tokens)** using the Service Account's private key.
  5. The event is inserted into the target calendar using the `googleapis` library.
- **Benefits**: This approach avoids complex OAuth redirects for the end-user, providing a smooth, "invisible" background integration.

## 📸 Proof of Functionality

### API Execution Log
```json
// Successfully processed tool call from Vapi
{
  "toolCallId": "call_123...",
  "result": "Successfully scheduled the meeting: https://calendar.google.com/..."
}
```

### Visual Confirmation
![Scheduled Event](https://raw.githubusercontent.com/vikara-ai/assets/main/event_confirmation.png)
*Example of an event created by the AI agent showing precise timing and guest details.*


![Uploading Screenshot 2026-02-26 161243.png…]()

