# QuizzDrop - AI-Powered PDF Quiz Generator

Transform your PDF documents into interactive quizzes using AI! QuizzDrop extracts text from PDF files and generates multiple-choice questions automatically.

## 🚀 Features

- **PDF Upload**: Drag & drop or click to upload PDF files
- **AI Quiz Generation**: Automatically generate multiple-choice questions from PDF content
- **Interactive Quiz Interface**: Answer questions with immediate feedback
- **Progress Tracking**: Visual progress bar and score tracking
- **Modern UI**: Beautiful glassmorphism design with purple gradient theme
- **Client-side PDF Processing**: Fast, secure PDF text extraction using PDF.js

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **PDF Processing**: PDF.js (pdfjs-dist)
- **Icons**: React Icons
- **AI Integration**: Configurable (OpenAI, custom API)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd quizzdrop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Edit environment variables** (optional)
   ```env
   # For OpenRouter integration (recommended - free model available)
   NEXT_PUBLIC_OPENROUTER_API_KEY=your-openrouter-api-key

   # For OpenAI integration
   NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key

   # For custom AI API
   NEXT_PUBLIC_AI_API_URL=your-api-url
   NEXT_PUBLIC_AI_API_KEY=your-api-key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:3000`

## 🎯 How to Use

1. **Upload a PDF**: 
   - Drag and drop a PDF file onto the upload area
   - Or click the upload area to browse for files
   - Only PDF files are accepted

2. **Generate Quiz**:
   - Click the "Generate Quiz" button
   - Wait for AI processing (this may take a few moments)
   - The app will extract text and generate questions

3. **Take the Quiz**:
   - Answer multiple-choice questions
   - Get immediate feedback with explanations
   - Track your progress and score
   - Navigate between questions

4. **Restart**: 
   - Click "Restart" to upload a new PDF
   - Or click the QuizzDrop logo to return to upload

## 🤖 AI Integration Options

### Option 1: OpenRouter API (Recommended)
The app now supports OpenRouter API with the free Venice model. This provides high-quality quiz generation at no cost:

1. Get an API key from [OpenRouter](https://openrouter.ai/)
2. Add it to your `.env.local` file:
   ```env
   NEXT_PUBLIC_OPENROUTER_API_KEY=your-openrouter-api-key-here
   ```
3. The app will automatically use the Venice model for quiz generation

### Option 2: Local API (Default Fallback)
The app includes a built-in API route at `/api/generate-quiz` that returns mock questions for testing. This works out of the box without any configuration.

### Option 3: OpenAI Integration
To use OpenAI for real quiz generation:

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com)
2. Add it to your `.env.local` file:
   ```env
   NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
   ```
3. Update the quiz generation service to use OpenAI method

### Option 4: Custom AI API
Integrate with any AI service by:

1. Setting up your API endpoint
2. Configuring the API URL in environment variables
3. Ensuring your API follows the expected request/response format

## 📁 Project Structure

```
quizzdrop/
├── app/
│   ├── components/
│   │   └── QuizDisplay.tsx       # Quiz interface component
│   ├── services/
│   │   └── quizGeneration.ts     # AI service integration
│   ├── api/
│   │   └── generate-quiz/
│   │       └── route.ts          # Local API route
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # App layout
│   └── page.tsx                  # Main upload page
├── public/                       # Static assets
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

## 🔧 API Reference

### POST /api/generate-quiz

Generate quiz questions from extracted text.

**Request Body:**
```json
{
  "text": "extracted PDF text content",
  "numberOfQuestions": 10,
  "difficulty": "medium",
  "questionTypes": ["multiple-choice"],
  "instructions": "generation instructions"
}
```

**Response:**
```json
{
  "questions": [
    {
      "question": "What is...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "The correct answer is A because..."
    }
  ]
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

---

Made with ❤️ using Next.js and AI
