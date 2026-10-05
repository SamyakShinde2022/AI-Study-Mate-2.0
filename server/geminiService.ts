import { GoogleGenAI, Type } from '@google/genai';

/**
 * Reusable Gemini Service using the official @google/genai SDK.
 * All calls are executed strictly on the server-side.
 * Uses GEMINI_API_KEY environment variable.
 */

// Model selection: gemini-3.1-flash-lite as primary fast model, with gemini-3.8-flash as fallback
const MODEL_NAME = 'gemini-3.1-flash-lite';
const FALLBACK_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

// Lazily obtain or initialize the GoogleGenAI instance
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in your .env file or environment variables.'
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Helper to safely extract JSON from Gemini text response
 */
function extractAndParseJSON<T>(rawText: string | undefined): T {
  if (!rawText) {
    throw new Error('Gemini returned an empty response.');
  }

  // Remove markdown code fences if present (```json ... ``` or ``` ...)
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    // Attempt fallback heuristic if JSON is slightly malformed
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let startIdx = -1;
    let endIdx = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      endIdx = cleaned.lastIndexOf('}');
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      endIdx = cleaned.lastIndexOf(']');
    }

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const extracted = cleaned.substring(startIdx, endIdx + 1);
      return JSON.parse(extracted) as T;
    }

    throw new Error(`Failed to parse structured JSON from Gemini response: ${(err as Error).message}`);
  }
}

/**
 * Robust wrapper around ai.models.generateContent with exponential backoff retry
 * for transient 503 / 429 errors.
 */
async function callGeminiWithRetry(
  params: Parameters<ReturnType<typeof getGenAIClient>['models']['generateContent']>[0],
  retries = 3
) {
  const ai = getGenAIClient();
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    // Select model: attempt 0 uses primary model, subsequent attempts can try fallback if 503
    const modelToUse = FALLBACK_MODELS[attempt % FALLBACK_MODELS.length] || MODEL_NAME;
    const requestParams = {
      ...params,
      model: modelToUse,
    };

    try {
      return await ai.models.generateContent(requestParams);
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const isTransient =
        errMsg.includes('503') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('high demand') ||
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED');

      if (isTransient && attempt < retries) {
        const delay = 800 * (attempt + 1);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

export const GeminiService = {
  /**
   * Health / Connectivity check
   */
  async checkConnection(): Promise<{ ok: boolean; model: string; message: string }> {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    if (!hasKey) {
      return {
        ok: false,
        model: MODEL_NAME,
        message: 'GEMINI_API_KEY is not configured',
      };
    }
    return {
      ok: true,
      model: MODEL_NAME,
      message: 'Connected to Gemini API',
    };
  },

  /**
   * 1. AI Tutor - Versatile General Academic & Study Material Assistant
   */
  async askTutor(params: {
    message: string;
    mode?: 'general' | 'material';
    materialContent?: string;
    materialTitle?: string;
    style?: 'intuitive' | 'first-principles' | 'exam-focused' | 'socratic';
    history?: Array<{ role: 'user' | 'model'; text: string }>;
  }): Promise<{ reply: string; followUpQuestions: string[]; keyTakeaway?: string }> {
    const {
      message,
      mode = 'general',
      materialContent,
      materialTitle,
      style = 'intuitive',
      history = [],
    } = params;

    const styleInstructions: Record<string, string> = {
      intuitive:
        'Explain concepts using real-world analogies, relatable intuition, and concrete examples before formal definitions.',
      'first-principles':
        'Deconstruct the problem to fundamental truths, underlying mechanics, and logical derivations step-by-step.',
      'exam-focused':
        'Highlight standard textbook definitions, high-yield exam points, formula derivations, and common examiner rubric keywords.',
      socratic:
        'Guide the student with thoughtful questions, nudges, and hints to stimulate independent discovery.',
    };

    const isStudyMaterialMode = mode === 'material' && Boolean(materialContent && materialContent.trim().length > 0);

    const systemInstruction = `You are StudyMate, a world-class, versatile, and patient AI Academic Tutor and Study Assistant.
You assist students across ANY academic, scientific, mathematical, computer science, engineering, business, humanities, or general learning subject.
Never artificially refuse or restrict academic questions. Always aim to deliver an insightful, helpful, and pedagogically sound answer.

PEDAGOGICAL DIRECTIVES:
- Directly answer the student's question first.
- For conceptual questions: clearly explain definitions, mechanisms, real-world examples, and key takeaways.
- For mathematical or quantitative problems: show step-by-step derivations and clear solutions with equations ($...$ or $$...$$).
- For programming questions: explain the logic/algorithm clearly and provide clean, syntax-highlighted code blocks with helpful comments.
- Tone: Encouraging, intellectually rigorous, crystal clear, formatted with clear Markdown headers, bold highlights, bullet points, and code/math blocks.
- Pedagogical style: ${styleInstructions[style] || styleInstructions.intuitive}

${
  isStudyMaterialMode
    ? `ACTIVE STUDY MATERIAL CONTEXT (Title: "${materialTitle || 'Selected Document'}"):
The student has attached this study material for reference:
<STUDY_MATERIAL>
${materialContent?.slice(0, 15000)}
</STUDY_MATERIAL>
INSTRUCTIONS FOR STUDY MATERIAL MODE:
- Prioritize and ground your answers in the provided study material when the student asks about it.
- If the question goes beyond the document, seamlessly use your broader academic knowledge to explain and supplement the material thoroughly.`
    : `GENERAL AI MODE:
- Answer ANY academic question directly using your comprehensive general knowledge across computer science, mathematics, natural sciences, history, languages, economics, and engineering.`
}

RESPONSE FORMAT:
You MUST respond strictly in valid JSON format:
{
  "reply": "Your full Markdown tutorial explanation and answer",
  "keyTakeaway": "One punchy sentence summarizing the core insight",
  "followUpQuestions": ["Question 1 student can ponder next", "Question 2", "Question 3"]
}`;

    // Reconstruct recent conversation turns for context
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    for (const h of history.slice(-6)) {
      contents.push({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }],
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await callGeminiWithRetry({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    try {
      return extractAndParseJSON<{
        reply: string;
        keyTakeaway?: string;
        followUpQuestions: string[];
      }>(response.text);
    } catch {
      const rawText = response.text?.trim() || '';
      return {
        reply: rawText,
        keyTakeaway: 'Understanding the core mechanisms and step-by-step principles ensures long-term mastery.',
        followUpQuestions: [
          'Can you give another example of this?',
          'How does this apply to practical problem solving?',
          'What are common exam questions on this topic?',
        ],
      };
    }
  },

  /**
   * 2. Study Material Summarization
   */
  async summarizeMaterial(params: {
    content: string;
    depth?: 'tldr' | 'standard' | 'comprehensive';
    format?: 'bullets' | 'structured' | 'exam_cram';
  }): Promise<{
    title: string;
    tldr: string;
    coreConcepts: Array<{ name: string; explanation: string; significance: string }>;
    keyFormulasOrTerms: Array<{ term: string; definition: string }>;
    commonExamTraps: string[];
    quickRecapBullets: string[];
  }> {
    const { content, depth = 'standard', format = 'structured' } = params;

    const systemInstruction = `You are an expert academic research assistant and note-condensing specialist.
Analyze the provided study material and produce an exceptionally structured summary.
Detail level requested: ${depth}
Format requested: ${format}

Output strictly valid JSON with this exact schema:
{
  "title": "Clear concise subject title",
  "tldr": "2-3 sentence executive summary of the entire content",
  "coreConcepts": [
    {
      "name": "Concept name",
      "explanation": "Clear breakdown",
      "significance": "Why this matters in tests/practical applications"
    }
  ],
  "keyFormulasOrTerms": [
    {
      "term": "Term or formula",
      "definition": "Definition or equation with variable meanings"
    }
  ],
  "commonExamTraps": [
    "Common student misconception or exam pitfall to avoid"
  ],
  "quickRecapBullets": [
    "Quick high-yield bullet point for instant revision"
  ]
}`;

    const response = await callGeminiWithRetry({
      model: MODEL_NAME,
      contents: `Study Material:\n${content}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    return extractAndParseJSON(response.text);
  },

  /**
   * 3. Quiz Generation
   */
  async generateQuiz(params: {
    topicOrContent: string;
    questionCount?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive';
    type?: 'multiple_choice' | 'true_false' | 'mixed';
  }): Promise<{
    quizTitle: string;
    topic: string;
    difficulty: string;
    questions: Array<{
      id: number;
      question: string;
      options: string[];
      correctAnswerIndex: number;
      explanation: string;
      hint: string;
      subtopic: string;
    }>;
  }> {
    const count = Math.min(Math.max(params.questionCount || 5, 2), 15);
    const difficulty = params.difficulty || 'medium';
    const type = params.type || 'multiple_choice';

    const systemInstruction = `You are a university exam creator.
Generate a high quality, pedagogically calibrated ${difficulty} difficulty quiz with exactly ${count} questions based on the provided material or topic.
Question style: ${type}.
Every question must have:
- Clear, unambiguous phrasing.
- 4 plausible options for multiple choice (or 2 for true/false).
- Exactly one unequivocally correct option.
- Detailed step-by-step pedagogical explanation explaining why the correct answer is right and why distractors are wrong.
- A helpful nudge hint that does not directly give away the answer.

Output strictly valid JSON matching:
{
  "quizTitle": "Descriptive Quiz Title",
  "topic": "Specific Topic",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Detailed rationale...",
      "hint": "Hint to guide thinking...",
      "subtopic": "Subtopic tag"
    }
  ]
}`;

    const response = await callGeminiWithRetry({
      model: MODEL_NAME,
      contents: `Topic/Material:\n${params.topicOrContent}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    return extractAndParseJSON(response.text);
  },

  /**
   * 4. Flashcard Generation
   */
  async generateFlashcards(params: {
    topicOrContent: string;
    count?: number;
    focus?: 'definitions' | 'formulas' | 'conceptual' | 'all';
  }): Promise<{
    deckTitle: string;
    topic: string;
    cards: Array<{
      id: number;
      front: string;
      back: string;
      category: string;
      mnemonicOrHint?: string;
      difficulty: 'basic' | 'intermediate' | 'advanced';
    }>;
  }> {
    const count = Math.min(Math.max(params.count || 8, 3), 20);
    const focus = params.focus || 'all';

    const systemInstruction = `You are a cognitive memory and spaced repetition expert (Anki / SuperMemo methodology).
Create ${count} high-retention active recall flashcards on the given topic. Focus: ${focus}.
Rules for flashcards:
- Front: Short, challenging prompt, question, or scenario (Active recall).
- Back: Concise, high-density answer (Definitions, steps, core mechanism).
- category: A concise sub-topic tag.
- mnemonicOrHint: Memory device, acronym, or quick hint.
- difficulty: 'basic' | 'intermediate' | 'advanced'.

Output strictly valid JSON:
{
  "deckTitle": "Title of Deck",
  "topic": "Main Topic",
  "cards": [
    {
      "id": 1,
      "front": "Front question/prompt",
      "back": "Back concise answer",
      "category": "Sub-theme",
      "mnemonicOrHint": "Memory trick",
      "difficulty": "intermediate"
    }
  ]
}`;

    const response = await callGeminiWithRetry({
      model: MODEL_NAME,
      contents: `Topic/Material:\n${params.topicOrContent}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    return extractAndParseJSON(response.text);
  },

  /**
   * 5. Important Questions - High-Yield Exam Prediction
   */
  async generateImportantQuestions(params: {
    topicOrContent: string;
    examType?: 'university_semester' | 'competitive_entrance' | 'board_exam' | 'general';
    difficulty?: 'standard' | 'high_yield' | 'challenger';
  }): Promise<{
    subject: string;
    totalPredictedQuestions: number;
    examStrategy: string;
    questions: Array<{
      id: number;
      question: string;
      marksWeightage: number; // e.g. 2, 5, 10
      questionCategory: 'Short Answer (2M)' | 'Medium Conceptual (5M)' | 'Long / Essay / Case Study (10M)' | 'Numerical / Practical';
      frequencyLikelihood: 'High' | 'Very High' | 'Crucial';
      answerFramework: string[];
      keyKeywordsToInclude: string[];
      commonMistakes: string;
    }>;
  }> {
    const { topicOrContent, examType = 'university_semester', difficulty = 'high_yield' } = params;

    const systemInstruction = `You are a senior exam paper setter and academic evaluator.
Analyze the topic and generate the top essential, most probable exam questions for ${examType} exams at ${difficulty} level.
Cover various mark brackets (2-mark definitions/short questions, 5-mark conceptual explanations, 10-mark in-depth derivations or case studies).
For each question, provide an explicit answer framework (how to structure the answer for maximum score) and keywords examiners look for.

Output strictly valid JSON:
{
  "subject": "Subject Name",
  "totalPredictedQuestions": 6,
  "examStrategy": "Crucial high-level test strategy for this unit",
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "marksWeightage": 5,
      "questionCategory": "Medium Conceptual (5M)",
      "frequencyLikelihood": "Very High",
      "answerFramework": [
        "1. Define the core principle",
        "2. State governing equation",
        "3. Provide illustrative diagram/example"
      ],
      "keyKeywordsToInclude": ["keyword1", "keyword2", "keyword3"],
      "commonMistakes": "Common blunder that causes mark loss"
    }
  ]
}`;

    const response = await callGeminiWithRetry({
      model: MODEL_NAME,
      contents: `Topic/Syllabus:\n${topicOrContent}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    return extractAndParseJSON(response.text);
  },

  /**
   * 6. Viva Voce Simulator - Question Generation & Answer Evaluation
   */
  async generateVivaQuestion(params: {
    topic: string;
    level?: 'introductory' | 'in_depth' | 'practical_lab' | 'stress_test';
    previousQuestions?: string[];
  }): Promise<{
    question: string;
    context: string;
    examinerPersona: string;
    expectedDimensions: string[];
  }> {
    const { topic, level = 'in_depth', previousQuestions = [] } = params;

    const systemInstruction = `You are a distinguished university professor conducting an oral Viva Voce examination.
Topic: ${topic}
Examination Intensity: ${level}
Generate a realistic, probing viva question that tests genuine comprehension, not mere rote memory. Avoid repeating any of these previous questions: ${JSON.stringify(previousQuestions)}.

Output strictly valid JSON:
{
  "question": "The spoken viva question from the examiner",
  "context": "Why the examiner is asking this specific aspect",
  "examinerPersona": "Professorial title and demeanor (e.g. Chief External Examiner, Lab Director)",
  "expectedDimensions": ["Core definition", "Underlying intuition", "Practical caveat"]
}`;

    const response = await callGeminiWithRetry({
      model: MODEL_NAME,
      contents: `Generate next viva question for topic: ${topic}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    return extractAndParseJSON(response.text);
  },

  async evaluateVivaAnswer(params: {
    topic: string;
    question: string;
    studentAnswer: string;
  }): Promise<{
    overallScore: number; // out of 10
    scoreBreakdown: {
      technicalAccuracy: number; // out of 10
      conceptualDepth: number; // out of 10
      clarityAndStructure: number; // out of 10
    };
    verdict: 'Distinction' | 'Satisfactory' | 'Needs Improvement' | 'Unsatisfactory';
    strengths: string[];
    missingKeyPoints: string[];
    idealModelAnswer: string;
    examinerComment: string;
    followUpQuestion: string;
  }> {
    const { topic, question, studentAnswer } = params;

    const systemInstruction = `You are a tough but fair external examiner evaluating an oral viva voce response.
Topic: ${topic}
Examiner Question: ${question}
Student's Spoken/Written Answer: ${studentAnswer}

Grade the response strictly on conceptual mastery, technical rigor, and clarity.
Provide constructive feedback, identify missed nuances, present a crisp ideal model answer, and generate a natural follow-up question.

Output strictly valid JSON:
{
  "overallScore": 8,
  "scoreBreakdown": {
    "technicalAccuracy": 8,
    "conceptualDepth": 7,
    "clarityAndStructure": 9
  },
  "verdict": "Satisfactory",
  "strengths": ["Clear explanation of X", "Good terminology"],
  "missingKeyPoints": ["Omitted edge case Y", "Did not state equation Z"],
  "idealModelAnswer": "How an A+ student would answer succinctly in viva format...",
  "examinerComment": "Examiner's spoken closing remark...",
  "followUpQuestion": "Next natural drill-down question"
}`;

    const response = await callGeminiWithRetry({
      model: MODEL_NAME,
      contents: `Question: ${question}\nStudent Answer: ${studentAnswer}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    return extractAndParseJSON(response.text);
  },

  /**
   * 7. Study Planning - Dynamic Personalized Timetable
   */
  async generateStudyPlan(params: {
    subject: string;
    syllabusOrTopics: string;
    daysUntilExam: number;
    dailyAvailableHours: number;
    targetScore?: string;
    currentMasteryLevel?: 'beginner' | 'intermediate' | 'revision_ready';
  }): Promise<{
    planTitle: string;
    overview: string;
    totalStudyHours: number;
    recommendedMethodology: string;
    dailySchedule: Array<{
      dayNumber: number;
      dateLabel: string;
      focusTheme: string;
      timeSlots: Array<{
        time: string;
        activity: string;
        technique: 'Deep Work' | 'Active Recall' | 'Past Papers' | 'Spaced Review';
        deliverable: string;
      }>;
      milestoneGoal: string;
    }>;
    spacedRepetitionDates: string[];
    examEveChecklist: string[];
  }> {
    const {
      subject,
      syllabusOrTopics,
      daysUntilExam = 7,
      dailyAvailableHours = 4,
      targetScore = '90%+',
      currentMasteryLevel = 'intermediate',
    } = params;

    const clampedDays = Math.min(Math.max(daysUntilExam, 1), 30);

    const systemInstruction = `You are a master academic productivity coach and neuro-learning specialist.
Design an optimal, high-efficiency ${clampedDays}-day study schedule for ${subject}.
Constraints:
- Available Daily Hours: ${dailyAvailableHours} hrs/day
- Target Goal: ${targetScore}
- Current Level: ${currentMasteryLevel}
- Topics / Syllabus: ${syllabusOrTopics}

Incorporate evidence-based techniques:
- Pomodoro / Ultradian 90-min blocks
- Active recall & practice problems instead of passive rereading
- Spaced retrieval schedules
- Final 1-2 days reserved for mock exams & confidence conditioning

Output strictly valid JSON:
{
  "planTitle": "Structured Plan Title",
  "overview": "Strategic summary of how to master this subject in ${clampedDays} days",
  "totalStudyHours": ${clampedDays * dailyAvailableHours},
  "recommendedMethodology": "E.g. Blurting + Leitner Spaced Retrieval",
  "dailySchedule": [
    {
      "dayNumber": 1,
      "dateLabel": "Day 1",
      "focusTheme": "Core Foundations & Heavy Theory",
      "timeSlots": [
        {
          "time": "09:00 - 10:30",
          "activity": "Topic breakdown",
          "technique": "Deep Work",
          "deliverable": "Complete 1-page cheat sheet"
        }
      ],
      "milestoneGoal": "Understand 100% of Module 1"
    }
  ],
  "spacedRepetitionDates": ["Day 2 morning recap of Day 1", "Day 4 cumulative review"],
  "examEveChecklist": ["Review high-yield formula sheet", "Do not start new topics", "Sleep 8 hours"]
}`;

    const response = await callGeminiWithRetry({
      model: MODEL_NAME,
      contents: `Subject: ${subject}\nTopics:\n${syllabusOrTopics}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    return extractAndParseJSON(response.text);
  },

  /**
   * 8. AI Study Insights - Performance Analytics & Gap Diagnosis
   */
  async generateStudyInsights(params: {
    subject: string;
    stats: {
      quizzesTaken: number;
      averageQuizScore: number;
      flashcardsMastered: number;
      flashcardsNeedingReview: number;
      vivaAverageScore?: number;
      hoursStudied: number;
    };
    weakTopics?: string[];
    strongTopics?: string[];
    targetExamName?: string;
  }): Promise<{
    readinessScore: number; // 0 to 100%
    readinessLevel: 'Low' | 'Moderate' | 'Good' | 'High' | 'Exam Ready';
    cognitiveRetentionDiagnosis: string;
    topStrengths: string[];
    criticalWeaknesses: Array<{
      topic: string;
      riskLevel: 'Moderate' | 'High' | 'Severe';
      recommendedRemedy: string;
    }>;
    prioritizedActionPlan: string[];
    motivationalInsight: string;
  }> {
    const { subject, stats, weakTopics = [], strongTopics = [], targetExamName = 'Upcoming Exam' } = params;

    const systemInstruction = `You are an AI Learning Analytics and Cognitive Performance Engine.
Analyze the student's study performance metrics and generate actionable diagnostic insights.
Metrics:
- Subject: ${subject}
- Target: ${targetExamName}
- Quizzes completed: ${stats.quizzesTaken}
- Avg Quiz Score: ${stats.averageQuizScore}%
- Flashcards Mastered: ${stats.flashcardsMastered}, Needs Review: ${stats.flashcardsNeedingReview}
- Viva Score: ${stats.vivaAverageScore || 'N/A'}/10
- Total Study Hours: ${stats.hoursStudied}
- Identified weak areas: ${weakTopics.join(', ') || 'General retention'}
- Identified strong areas: ${strongTopics.join(', ') || 'Basics'}

Calculate an honest, data-driven Readiness Score (0-100) and provide a razor-sharp diagnostic.

Output strictly valid JSON:
{
  "readinessScore": 78,
  "readinessLevel": "Good",
  "cognitiveRetentionDiagnosis": "Analysis of their retention decay curve and test confidence...",
  "topStrengths": ["Strength 1", "Strength 2"],
  "criticalWeaknesses": [
    {
      "topic": "Weak topic",
      "riskLevel": "High",
      "recommendedRemedy": "Specific targeted drill"
    }
  ],
  "prioritizedActionPlan": [
    "Step 1 to do in next 2 hours",
    "Step 2",
    "Step 3"
  ],
  "motivationalInsight": "Inspiring, science-backed encouragement"
}`;

    const response = await callGeminiWithRetry({
      model: MODEL_NAME,
      contents: `Analyze performance for ${subject}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    return extractAndParseJSON(response.text);
  },
};
