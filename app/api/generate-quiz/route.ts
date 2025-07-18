import { NextRequest, NextResponse } from 'next/server';

interface QuizRequest {
  text: string;
  numberOfQuestions: number;
  difficulty: string;
  questionTypes: string[];
  instructions: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: QuizRequest = await request.json();
    const { text, numberOfQuestions = 10 } = body;

    if (!text || text.trim().length < 100) {
      return NextResponse.json(
        { error: 'Text too short for quiz generation' },
        { status: 400 }
      );
    }
    
    const mockQuestions: QuizQuestion[] = [
      {
        question: "Based on the document content, which of the following statements is most accurate?",
        options: [
          "The document discusses key concepts relevant to the subject matter",
          "The document is primarily about unrelated topics",
          "The document contains no meaningful information",
          "The document is purely fictional content"
        ],
        correctAnswer: 0,
        explanation: "The first option is correct as the document contains relevant subject matter that can be used to generate meaningful quiz questions."
      },
      {
        question: "What is the primary purpose of the content in this document?",
        options: [
          "To provide entertainment only",
          "To convey information and knowledge",
          "To serve as a placeholder text",
          "To test reading comprehension skills"
        ],
        correctAnswer: 1,
        explanation: "The primary purpose is to convey information and knowledge, which is why it can be used to generate educational quiz questions."
      }
    ];

    return NextResponse.json({
      questions: mockQuestions.slice(0, numberOfQuestions),
      metadata: {
        generatedAt: new Date().toISOString(),
        textLength: text.length,
        requestedQuestions: numberOfQuestions,
        actualQuestions: Math.min(mockQuestions.length, numberOfQuestions)
      }
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate quiz questions' },
      { status: 500 }
    );
  }
}
