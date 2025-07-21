import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { QuizQuestion } from '../../services/quizGeneration';

interface QuizRequest {
  text: string;
  numberOfQuestions: number;
  difficulty: string;
  questionTypes: string[];
  instructions: string;
}

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `quiz_rate_limit:${userId}`;
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    // First request or window expired - don't increment yet
    const resetTime = now + WINDOW_MS;
    return { allowed: true, remaining: RATE_LIMIT - 1, resetTime };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  // Don't increment yet - just check if allowed
  return { allowed: true, remaining: RATE_LIMIT - record.count - 1, resetTime: record.resetTime };
}

function incrementRateLimit(userId: string): void {
  const now = Date.now();
  const key = `quiz_rate_limit:${userId}`;
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    // First request or window expired
    const resetTime = now + WINDOW_MS;
    rateLimitStore.set(key, { count: 1, resetTime });
  } else {
    // Increment existing count
    record.count += 1;
    rateLimitStore.set(key, record);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetTime);
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: `You've reached the daily limit of ${RATE_LIMIT} quizzes. Try again after ${resetDate.toLocaleString()}`,
          resetTime: rateLimit.resetTime
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      );
    }
    const body: QuizRequest = await request.json();
    const { text, numberOfQuestions = 10 } = body;

    if (!text || text.trim().length < 100) {
      return NextResponse.json(
        { error: 'Text too short for quiz generation' },
        { status: 400 }
      );
    }
    
    // Generate quiz using Groq API
    try {
      const groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!groqApiKey) {
        console.error('Groq API key missing from environment variables');
        throw new Error('Groq API key not configured');
      }

      const prompt = `Generate ${numberOfQuestions} high-quality multiple-choice quiz questions about "${body.instructions || 'the content'}" based on the following text.

SOURCE TEXT:
${text.substring(0, 8000)}

SPECIFIC REQUIREMENTS:
1. Create exactly ${numberOfQuestions} questions
2. Each question must have exactly 4 options (A, B, C, D)
3. Only one option should be definitively correct
4. Focus on key concepts, main ideas, and important details
5. Test understanding and application, not just memorization
6. Create realistic distractors based on common misconceptions

QUESTION TYPES TO INCLUDE:
- Comprehension: "What does X mean?" "How does Y work?"
- Application: "In situation Z, what would happen?" "How would you apply X?"
- Analysis: "What is the relationship between X and Y?" "Why does Z occur?"
- Inference: "Based on the text, what can be concluded?" "What is implied by X?"

DISTRACTOR GUIDELINES:
- Make incorrect options plausible but clearly wrong
- Base distractors on related concepts or common errors
- Avoid obviously incorrect or silly options
- Ensure all options are grammatically parallel

EXPLANATION REQUIREMENTS:
- Explain why the correct answer is right
- Briefly mention why other options are incorrect when helpful
- Connect to broader concepts when relevant
- Keep explanations concise but educational

Return the response in this exact JSON format:
{
  "questions": [
    {
      "question": "Clear, specific question text ending with a question mark?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": 0,
      "explanation": "Comprehensive explanation of the correct answer and why it's right."
    }
  ]
}`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are an expert educational assessment designer with expertise in cognitive learning theory and quiz creation. Your goal is to create meaningful, well-structured multiple-choice questions that effectively test comprehension, analysis, and application of knowledge.

PEDAGOGICAL PRINCIPLES:
- Design questions at appropriate cognitive levels (Bloom's Taxonomy: Remember, Understand, Apply, Analyze)
- Avoid trivial recall questions - focus on understanding and application
- Create plausible distractors that represent common misconceptions
- Ensure questions are clear, unambiguous, and free from cultural bias
- Test one concept per question to maintain focus

QUALITY STANDARDS:
- Questions should be challenging but fair
- All options should be grammatically consistent and similar in length
- Avoid "all of the above" or "none of the above" options
- Use clear, concise language appropriate for the content level
- Ensure the correct answer is definitively correct, not just "best"

RESPONSE REQUIREMENTS:
- Return ONLY valid JSON, no additional text or formatting
- Include brief but insightful explanations that enhance learning
- Maintain consistent difficulty level across all questions
- Focus on the most important concepts from the provided text`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 6000,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });
        throw new Error(`Groq API error: ${response.status} - ${response.statusText}. ${errorText}`);
      }

      const groqData = await response.json();
      const content = groqData.choices[0]?.message?.content;

      if (!content) {
        console.error('No content in Groq response:', groqData);
        throw new Error('No content received from Groq API');
      }

      // Parse the JSON response
      let quizData;
      try {
        quizData = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse Groq response - Invalid JSON format');
        throw new Error('Invalid response format from AI service - not valid JSON');
      }

      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Invalid quiz format received');
      }

      // Validate questions format
      const validQuestions = quizData.questions.filter((q: any) => 
        q.question && 
        Array.isArray(q.options) && 
        q.options.length === 4 &&
        typeof q.correctAnswer === 'number' &&
        q.correctAnswer >= 0 && 
        q.correctAnswer < 4 &&
        q.explanation
      );

      if (validQuestions.length === 0) {
        throw new Error('No valid questions generated');
      }

      const finalQuestions = validQuestions.slice(0, numberOfQuestions);

      incrementRateLimit(userId);
      
      const updatedRateLimit = checkRateLimit(userId);

      return NextResponse.json(
        { 
          questions: finalQuestions,
          totalGenerated: finalQuestions.length
        },
        { 
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': updatedRateLimit.remaining.toString(),
            'X-RateLimit-Reset': updatedRateLimit.resetTime.toString()
          }
        }
      );

    } catch (apiError) {
      console.error('Quiz generation error details:', {
        error: apiError,
        message: apiError instanceof Error ? apiError.message : 'Unknown error',
        userId: userId
      });
      
      // Return specific error message based on the type of error
      let errorMessage = 'Check Your PDF or Topic';
      let errorDetails = '';
      
      if (apiError instanceof Error) {
        if (apiError.message.includes('API key')) {
          errorMessage = 'API configuration error';
          errorDetails = 'The AI service is not properly configured';
        } else if (apiError.message.includes('API error')) {
          errorMessage = 'AI service temporarily unavailable';
          errorDetails = 'Please try again in a few moments';
        } else if (apiError.message.includes('parse')) {
          errorMessage = 'AI response processing failed';
          errorDetails = 'The AI service returned an unexpected format';
        } else {
          errorDetails = apiError.message;
        }
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails
        },
        { 
          status: 500,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      );
    }

  } catch (error) {
    console.error('Error generating quiz:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate quiz questions' },
      { status: 500 }
    );
  }
}
