# AETHER OS 🚀
> The world's most advanced Neuro-Sync learning protocol.

![AETHER OS Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)

AETHER OS (formerly Orbit AI) is a premium, AI-powered productivity and learning platform designed to eliminate cognitive friction and help users achieve total mastery. Built with a world-class, animated UI, AETHER OS dynamically calibrates to your mental bandwidth and generates adaptive curriculums to guide you toward your goals.

## ✨ Features
- **Neuro-Sync Calibration:** Analyzes your daily cognitive load and adjusts task difficulty automatically.
- **Deep Work Nexus:** A full-screen, cinematic focus mode with glowing progress tracking to eliminate distractions.
- **The Oracle Protocol:** A cybernetic AI mentor powered by LLMs that answers any question instantly with typewriter text effects.
- **Identity Radar:** Visual analytics utilizing glowing spider charts to map your discipline, execution, and mastery.
- **HiveMind Ledger:** A real-time terminal feed simulating global user activity for collective momentum.
- **Dynamic Roadmaps:** The Forge (AI) generates personalized curriculums based on your unique goals.

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Express.js, MongoDB, Google Generative AI (Gemini)
- **State Management:** React Context API
- **Routing:** React Router DOM
- **Charts:** Recharts

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/aether-os.git
   cd aether-os
   ```

2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

4. **Environment Variables:**
   Create a `.env` file in the `/server` directory and add your MongoDB URI and Google AI API Key:
   ```env
   MONGO_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_google_gemini_api_key
   PORT=8787
   ```

## ⚡ Development

To run both the Vite frontend and the Express backend concurrently:

```bash
npm run dev:all
```
- The frontend will be available at `http://localhost:5174/`
- The backend API will be available at `http://localhost:8787/`

## 🌐 Deployment
This project is optimized for deployment on **Vercel** (Frontend) and **Render / Heroku** (Backend).

1. Build the frontend:
   ```bash
   npm run build
   ```
2. Set your environment variables in your hosting provider's dashboard.
3. Deploy the `/server` folder as a Node.js web service.

## 🎨 Design System
AETHER OS utilizes a custom "White Mode" design language to ensure maximum clarity and professionalism. The UI uses glassmorphism, soft drop shadows, and an Emerald Green (`#10b981`) primary accent color to highlight critical actions. All animations are hardware-accelerated via Framer Motion for a 60fps experience.

---
*Built for excellence. Stop scrolling. Start building your legacy.*