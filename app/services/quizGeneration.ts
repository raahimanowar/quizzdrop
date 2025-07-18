interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class QuizGenerationService {
  private static readonly GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  static async generateQuiz(
    extractedText: string, 
    numberOfQuestions: number = 10
  ): Promise<QuizQuestion[]> {
    if (!extractedText || extractedText.trim().length < 100) {
      throw new Error('Extracted text is too short to generate meaningful questions');
    }

    if (!this.GROQ_API_KEY) {
      console.warn('Groq API key not configured, using fallback questions');
      return this.generateFallbackQuiz(extractedText);
    }

    try {
      return await this.generateQuizWithGroq(extractedText, numberOfQuestions);
    } catch (error) {
      console.error('Error with Groq API:', error);
      
      if (process.env.NODE_ENV === 'development') {
        console.warn('Groq API failed, using fallback questions');
        return this.generateFallbackQuiz(extractedText);
      }
      
      throw error;
    }
  }

  private static async generateQuizWithGroq(
    extractedText: string,
    numberOfQuestions: number
  ): Promise<QuizQuestion[]> {
    const systemPrompt = `You are a quiz generator. Generate ${numberOfQuestions} multiple choice questions based on the provided text. 

IMPORTANT: Return ONLY a valid JSON object with this exact structure (no additional text, markdown, or formatting):

{
  "questions": [
    {
      "question": "question text here",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0,
      "explanation": "explanation text here"
    }
  ]
}

Rules:
- Each question must have exactly 4 options
- correctAnswer is the index (0-3) of the correct option
- Make questions challenging but fair
- Focus on key concepts from the text
- Provide clear explanations`;

    const userPrompt = `Generate ${numberOfQuestions} quiz questions from this text:\n\n${extractedText.substring(0, 8000)}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.5,
        max_tokens: 4000,
        top_p: 1,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API request failed: ${response.status} - ${errorText}`);
    }

    const data: GroqResponse = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from Groq API');
    }

    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    let parsedResponse: { questions: QuizQuestion[] };
    try {
      parsedResponse = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse Groq response:', cleanContent);
      throw new Error('Invalid JSON response from Groq API');
    }

    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid response structure from Groq API');
    }

    const validQuestions = parsedResponse.questions.filter(this.validateQuestion);
    
    if (validQuestions.length === 0) {
      throw new Error('No valid questions received from Groq API');
    }

    return validQuestions;
  }

  private static validateQuestion(question: any): question is QuizQuestion {
    return (
      question &&
      typeof question.question === 'string' &&
      Array.isArray(question.options) &&
      question.options.length === 4 &&
      typeof question.correctAnswer === 'number' &&
      question.correctAnswer >= 0 &&
      question.correctAnswer < 4 &&
      typeof question.explanation === 'string'
    );
  }

  private static generateFallbackQuiz(extractedText: string): QuizQuestion[] {
    const words = extractedText.split(' ').filter(word => word.length > 5);
    const uniqueWords = [...new Set(words)].slice(0, 5);

    return [
      {
        question: `Based on the document, which of the following concepts is most relevant to the content?`,
        options: [
          uniqueWords[0] || 'Primary concept',
          uniqueWords[1] || 'Secondary concept', 
          uniqueWords[2] || 'Alternative concept',
          uniqueWords[3] || 'Unrelated concept'
        ],
        correctAnswer: 0,
        explanation: `This appears to be a key concept based on its frequency and context in the document.`
      },
      {
        question: `What is the main topic discussed in this document?`,
        options: [
          'The primary subject matter',
          'An unrelated topic',
          'Background information',
          'Conclusion only'
        ],
        correctAnswer: 0,
        explanation: `The document primarily focuses on the main subject matter as indicated by the content analysis.`
      }
    ];
  }
}

export type { QuizQuestion };
