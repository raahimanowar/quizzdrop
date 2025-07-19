# QuizzDrop

AI-powered quiz generator that transforms PDF documents into interactive learning experiences.

## 🎥 Demo Video

> **Watch QuizzDrop in action!** See how easy it is to transform any PDF into an interactive quiz.

https://github.com/user-attachments/assets/733923e3-07ff-4521-88e9-a3b1d92a5858

## Features

- **PDF to Quiz**: Upload any PDF and generate multiple-choice questions automatically
- **AI-Powered**: Uses Groq's Llama 3.1 model for intelligent question generation
- **User Authentication**: Secure sign-in with Clerk
- **Rate Limiting**: 3 quizzes per day per user
- **Interactive Interface**: Real-time feedback with explanations
- **Responsive Design**: Works seamlessly on desktop and mobile

## Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/raahimanowar/quizzdrop.git
   cd quizzdrop
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys:
   ```env
   # Authentication (required)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # AI Service (required)
   GROQ_API_KEY=your_groq_api_key
   ```

3. **Run the application**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## API Keys Setup

### Clerk Authentication
1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Copy keys from dashboard

### Groq AI Service
1. Sign up at [console.groq.com](https://console.groq.com)
2. Generate API key

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Authentication**: Clerk
- **AI**: Groq API (Llama 3.1)
- **PDF Processing**: PDF.js
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

---

Built with ❤️ by [Raahim Anowar](https://github.com/raahimanowar)
