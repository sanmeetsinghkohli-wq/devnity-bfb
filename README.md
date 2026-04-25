# devnity-bfb
Build For Bharat  Hackathon 
🏛️ SarkarSathi | सरकार साथी
Your AI-powered voice assistant for Indian government schemes.
Helping citizens find and apply for central & state welfare programs — in their own language, by voice.

🌍 Problem Statement
Millions of Indians remain unaware or unable to apply for government welfare schemes due to:

Fragmented and complex online portals
Lack of regional language support
Limited digital literacy
No integrated, voice-first solution tailored by state and language
A common citizen often needs an agent or cyber café to navigate basic processes — SarkarSathi aims to change that.

💡 Solution
SarkarSathi is an AI-driven voice assistant that helps citizens easily discover, understand, and apply for government schemes.

Select your state
Speak in Hindi, Marathi, Gujarati, or English
Get personalized information on:
Eligibility criteria
Required documents
Application steps (online/offline)
The AI handles both central and state-specific schemes — conversationally and inclusively.

✨ Key Features
🗺️ State-wise scheme knowledge base
Currently covers: Maharashtra, Uttar Pradesh, Gujarat, Rajasthan, and Bihar
(Expandable to all 28 states)
🎤 Multilingual Voice Input
Speech recognition in Hindi, Marathi, Gujarati, and English
🔊 Natural Voice Output (TTS)
Uses Azure Neural TTS for clear, regional-accented voice responses
🤖 AI Scheme Advisor
Powered by Grok API (xAI) for contextual understanding and interactive eligibility checks
📋 Scheme Browser
Explore all relevant schemes with document checklists and step-by-step guidance
🇮🇳 Unified Database
Combines Central + State Government scheme data in one conversational platform
💬 Text fallback mode
Works efficiently even in low-connectivity rural areas
🧠 AI Architecture
Each state has its own curated knowledge base — containing all current central and state-level schemes, eligibility logic, and application details.

Flow:
User Interaction
Citizens talk to SarkarSathi in their language (voice or text).
Speech Recognition
Input → Azure Speech-to-Text
Language auto-detection (Hindi, Marathi, Gujarati, English)
AI Reasoning
Query sent to Grok API
Injects the relevant state-specific knowledge base
Performs eligibility reasoning, returns structured responses
Natural Response Delivery
Text response → converted into natural voice via Azure Neural TTS
Output in user’s preferred language
Display UI (Fallback Mode)
Shows the same structured guidance (eligibility, docs, apply steps) as text
Logical Diagram


🎤 Citizen Question (Voice)
       ↓
🗣️ Azure STT → Text → Language Detection  
       ↓
🧠 Grok AI Engine (context: state KB)
       ↓
🎯 Eligibility Check + Steps + Docs
       ↓
🔊 Azure Neural TTS → Voice Output  
       ↓
🪟 Frontend (Text + Audio Display)
🧩 Tech Stack
Layer	Technology
Frontend	Next.js 14, Tailwind CSS
AI Engine	Grok API (xAI)
Speech to Text	Azure Cognitive Services Speech SDK
Text to Speech	Azure Neural TTS (Azure Speech Services)
Backend	FastAPI (Python)
Deployment	Vercel (frontend) + Railway (backend)
🧱 Architecture Overview


Frontend (Next.js)
 ├─ Voice Input (Mic)
 ├─ Audio Player Output
 ├─ State Selector
 └─ UI for Text Fallback
         │
         ▼
Backend (FastAPI)
 ├─ STT / TTS Integration (Azure)
 ├─ State KB Retriever
 ├─ Query Orchestrator
 └─ Grok API Handler
         │
         ▼
AI Engine (Grok API)
 ├─ Inject State-Specific Context
 ├─ Multilingual Reasoning
 └─ Outputs Structured JSON Response
📈 Impact
600M+ eligible citizens potentially reached
Reduces reliance on middlemen and agents
Brings digital governance to low-literacy rural users
Encourages awareness and uptake of welfare programs
Locally adaptable — works for any state or language ecosystem
🚀 Future Roadmap
➕ Add all 28 states + union territories
🧾 Link with official DigiLocker for document uploads
🔍 Introduce offline mode with SMS fallback
🧮 Add automatic scheme comparison by eligibility
📱 Build Android app with in-app voice chat
🛠️ Installation & Setup
Prerequisites
Node.js (v18+)
Python (v3.10+)
Azure credentials for Speech services
Grok API key (xAI)
Steps
Clone the repository
bash


git clone [github.com](https://github.com/yourusername/sarkarsathi.git)
cd sarkarsathi
Setup Frontend
bash


cd frontend
npm install
npm run dev
Setup Backend
bash


cd backend
pip install -r requirements.txt
uvicorn main:app --reload
Configure Environment Variables


GROK_API_KEY=your_grok_key
AZURE_SPEECH_KEY=your_azure_key
AZURE_REGION=your_region
Run Application
Frontend: 
localhost
Backend: 
localhost
🧾 License
This project is licensed under the MIT License — free to use, modify, and distribute with attribution.

🙌 Contributors
Project Lead: [Your Name / Organization]
AI Integration: [Names]
Frontend Development: [Names]
Backend & API Engineering: [Names]
Data Curation (State KBs): [Names]
