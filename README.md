# devnity-bfb
Build For Bharat  Hackathon 

SarkarSathi | सरकार साथी
AI Voice Assistant for Government Schemes (Build For Bharat)

Problem Statement
Millions of citizens in India are unable to access government welfare schemes effectively due to fragmented portals, lack of regional language support, and low digital literacy. Many people depend on cyber cafés or middlemen just to understand or apply for schemes, which creates barriers and inefficiencies.

Solution
SarkarSathi is a voice-first AI assistant that helps citizens discover, understand, and apply for government schemes in their own language. Users can select their state, speak naturally, and receive personalized guidance about eligibility, required documents, and application steps.

Key Features

Voice-first interaction designed for low-literacy users

Multilingual support: Hindi, Marathi, Gujarati, English

State-specific knowledge base for accurate recommendations

AI-powered eligibility checking

Step-by-step application guidance

Text fallback mode for low connectivity environments

Unique Value Proposition
Unlike traditional chatbots, SarkarSathi focuses on voice interaction and localized intelligence. It does not just list schemes but helps users determine eligibility and guides them through the application process in a conversational manner.

Architecture Overview
User speaks → Speech-to-Text (Azure) → AI Engine (Grok + State Knowledge Base) → Eligibility + Steps + Documents → Text + Voice Output (Azure TTS)

Tech Stack
Frontend: Next.js, Tailwind CSS
Backend: FastAPI (Python)
AI Engine: Grok API (xAI)
Speech: Azure Cognitive Services (STT + TTS)
Deployment: Vercel (Frontend), Railway (Backend)

Impact
SarkarSathi enables first-time digital users to independently access government schemes, reduces dependency on agents, and improves awareness and adoption of welfare programs, especially in rural areas.

Demo Flow

User selects a state (e.g., Maharashtra)

User speaks a query (e.g., “Mujhe farmer loan scheme ke baare mein batao”)

AI responds with eligibility, required documents, and application steps in voice and text

Future Scope

Expand to all 28 states and union territories

Add profile-based personalized scheme recommendations

Integrate DigiLocker for document handling

Introduce offline support via SMS or IVR

Develop a mobile application with in-app voice interaction

One-Line Pitch
SarkarSathi is a voice-first AI assistant that helps Indian citizens access government schemes easily in their own language without needing digital literacy or middlemen.

Team Devnity




