export interface QuizQuestion {
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
    numberOfQuestions: number = 10,
    topic: string
  ): Promise<QuizQuestion[]> {
    if (!extractedText || extractedText.trim().length < 100) {
      throw new Error('Extracted text is too short to generate meaningful questions');
    }

    if (!topic || topic.trim().length === 0) {
      throw new Error('Topic is required to generate focused quiz questions');
    }

    if (!this.GROQ_API_KEY) {
      throw new Error('API ran into error.');
    }

    try {
      return await this.generateQuizWithGroq(extractedText, numberOfQuestions, topic);
    } catch (error) {
      throw error;
    }
  }

  private static async generateQuizWithGroq(
    extractedText: string,
    numberOfQuestions: number,
    topic: string
  ): Promise<QuizQuestion[]> {
    const randomSeed = Math.random().toString(36).substring(7);
    const timestamp = new Date().getTime();
    
    const systemPrompt = `You are an expert quiz generator that creates high-quality, focused questions from academic or professional documents. 

SESSION ID: ${randomSeed}-${timestamp} (Generate completely NEW and DIFFERENT questions each time - never repeat previous questions)

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

CONTENT ANALYSIS RULES:
1. First, identify the most important concepts, theories, facts, and key information from the text
2. Focus on substantive content like definitions, processes, relationships, causes/effects, and significant details
3. Ignore: headers, footers, page numbers, references, author names, publication details, table of contents
4. Prioritize: core concepts, technical terms, important facts, processes, examples, and case studies
5. Skip trivial details like formatting, citation styles, or non-essential background information

QUESTION DIVERSITY REQUIREMENTS:
- Generate exactly ${numberOfQuestions} UNIQUE and VARIED multiple choice questions
- Each question must approach the content from a DIFFERENT ANGLE
- Use different question types: definition, application, analysis, comparison, cause-effect, example-based
- Each question must have exactly 4 options with one clearly correct answer
- correctAnswer is the index (0-3) of the correct option
- Focus on testing understanding, not memorization of trivial details
- Create questions that assess comprehension, analysis, and application of key concepts
- Avoid questions about formatting, page numbers, author names, or publication details
- Make distractors (wrong answers) plausible but clearly incorrect to someone who understands the material
- Provide clear, educational explanations that reinforce learning
- NEVER repeat questions from previous generations - always create fresh, original questions

TOPIC FOCUS: Create questions specifically related to "${topic}". Only generate questions that are directly relevant to this topic based on the content in the document. If the document doesn't contain sufficient information about "${topic}", focus on the most relevant content available and try to relate it to the topic. Use different aspects and subtopics within "${topic}" for variety.`;

    const filteredText = this.extractImportantContent(extractedText, topic);
    
    const contentSections = this.getRandomizedContentSections(filteredText);
    const userPrompt = `Generate ${numberOfQuestions} high-quality, DIVERSE quiz questions from this content. Make each question unique and focus on different aspects:\n\n${contentSections}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
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
        temperature: 0.7 + (Math.random() * 0.3),
        max_tokens: 4000,
        top_p: 0.9 + (Math.random() * 0.1),
        stream: false,
        presence_penalty: 0.3,
        frequency_penalty: 0.5
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

  private static getRandomizedContentSections(text: string): string {
    const sections = text.split(/\n\s*\n/).filter(section => section.trim().length > 50);
    
    if (sections.length > 10) {
      const shuffledSections = [...sections].sort(() => Math.random() - 0.5);
      const selectedSections = shuffledSections.slice(0, Math.min(15, sections.length));
      return selectedSections.join('\n\n');
    }
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const shuffledSentences = [...sentences].sort(() => Math.random() - 0.5);
    const result = shuffledSentences.slice(0, Math.min(100, sentences.length)).join('. ');
    
    return result.length > 8000 ? result.substring(0, 8000) : result;
  }

  private static extractImportantContent(text: string, topic: string): string {
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 20);
    
    const filteredSentences = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      
      const skipPatterns = [
        /page\s+\d+/,
        /^(figure|table|chart|diagram)\s+\d+/,
        /^(references?|bibliography|citations?|acknowledgments?)/,
        /^\s*(author|editor|publisher|isbn|doi|url)/,
        /^(copyright|©|\(c\))/,
        /^(header|footer)/,
        /^(chapter|section)\s+\d+/,
        /^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d+/,
        /^\d{1,3}\s*$/,
        /^\s*[-–—]\s*$/
      ];
      
      return !skipPatterns.some(pattern => pattern.test(lowerSentence));
    });

    const topicKeywords = topic.toLowerCase().split(/\s+/);
    const topicRelevantSentences = filteredSentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return topicKeywords.some(keyword => lowerSentence.includes(keyword));
    });
    
    if (topicRelevantSentences.length > 10) {
      const result = topicRelevantSentences.slice(0, 100).join('. ');
      return result.length > 8000 ? result.substring(0, 8000) : result;
    }

    const substantiveKeywords = [
      'define', 'definition', 'concept', 'theory', 'principle', 'method', 'process',
      'analysis', 'result', 'conclusion', 'research', 'study', 'experiment',
      'significant', 'important', 'key', 'main', 'primary', 'essential',
      'cause', 'effect', 'relationship', 'correlation', 'factor', 'influence',
      'example', 'case', 'instance', 'application', 'implementation',
      'characteristic', 'feature', 'property', 'attribute', 'function'
    ];

    const importantSentences = filteredSentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return substantiveKeywords.some(keyword => lowerSentence.includes(keyword)) ||
             sentence.length > 50 && sentence.length < 300;
    });

    const selectedSentences = importantSentences.length > 0 ? importantSentences : filteredSentences;
    const result = selectedSentences.slice(0, 120).join('. ');
    
    return result.length > 8000 ? result.substring(0, 8000) : result;
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
}
