import {
  ApiStatus,
  ChatMessage,
  FlashcardDeck,
  ImportantQuestionsResult,
  QuizResult,
  StudyInsightsResult,
  StudyPlanResult,
  SummaryResult,
  TutorStyle,
  VivaEvaluationResult,
  VivaQuestionData,
} from '../types/index.ts';

/**
 * Reusable client-side API layer communicating with server-side Gemini routes.
 * The browser never has direct access to the GEMINI_API_KEY.
 */

async function postJSON<T>(endpoint: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as Error & { isApiKeyMissing?: boolean; help?: string };
    err.isApiKeyMissing = data.isApiKeyMissing;
    err.help = data.help;
    throw err;
  }

  return data as T;
}

export const geminiClient = {
  /**
   * Check connection status and server Gemini health
   */
  async getStatus(): Promise<ApiStatus> {
    try {
      const response = await fetch('/api/gemini/status');
      return await response.json();
    } catch (err) {
      return {
        ok: false,
        model: 'gemini-3.8-flash',
        message: (err as Error).message || 'Server unreachable',
        hasEnvKey: false,
      };
    }
  },

  /**
   * 1. Ask AI Tutor
   */
  async askTutor(params: {
    message: string;
    topic?: string;
    subject?: string;
    style?: TutorStyle;
    history?: Array<{ role: 'user' | 'model'; text: string }>;
  }): Promise<{ reply: string; followUpQuestions: string[]; keyTakeaway?: string }> {
    return postJSON('/api/gemini/tutor', params);
  },

  /**
   * 2. Summarize Study Material
   */
  async summarizeMaterial(params: {
    content: string;
    depth?: 'tldr' | 'standard' | 'comprehensive';
    format?: 'bullets' | 'structured' | 'exam_cram';
  }): Promise<SummaryResult> {
    return postJSON('/api/gemini/summarize', params);
  },

  /**
   * 3. Generate Quiz
   */
  async generateQuiz(params: {
    topicOrContent: string;
    questionCount?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive';
    type?: 'multiple_choice' | 'true_false' | 'mixed';
  }): Promise<QuizResult> {
    return postJSON('/api/gemini/quiz', params);
  },

  /**
   * 4. Generate Flashcards
   */
  async generateFlashcards(params: {
    topicOrContent: string;
    count?: number;
    focus?: 'definitions' | 'formulas' | 'conceptual' | 'all';
  }): Promise<FlashcardDeck> {
    return postJSON('/api/gemini/flashcards', params);
  },

  /**
   * 5. Generate Important Questions
   */
  async generateImportantQuestions(params: {
    topicOrContent: string;
    examType?: 'university_semester' | 'competitive_entrance' | 'board_exam' | 'general';
    difficulty?: 'standard' | 'high_yield' | 'challenger';
  }): Promise<ImportantQuestionsResult> {
    return postJSON('/api/gemini/important-questions', params);
  },

  /**
   * 6. Viva Voce - Generate Question & Evaluate Answer
   */
  async generateVivaQuestion(params: {
    topic: string;
    level?: 'introductory' | 'in_depth' | 'practical_lab' | 'stress_test';
    previousQuestions?: string[];
  }): Promise<VivaQuestionData> {
    return postJSON('/api/gemini/viva/question', params);
  },

  async evaluateVivaAnswer(params: {
    topic: string;
    question: string;
    studentAnswer: string;
  }): Promise<VivaEvaluationResult> {
    return postJSON('/api/gemini/viva/evaluate', params);
  },

  /**
   * 7. Generate Study Plan
   */
  async generateStudyPlan(params: {
    subject: string;
    syllabusOrTopics: string;
    daysUntilExam: number;
    dailyAvailableHours: number;
    targetScore?: string;
    currentMasteryLevel?: 'beginner' | 'intermediate' | 'revision_ready';
  }): Promise<StudyPlanResult> {
    return postJSON('/api/gemini/study-plan', params);
  },

  /**
   * 8. Generate AI Study Insights
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
  }): Promise<StudyInsightsResult> {
    return postJSON('/api/gemini/insights', params);
  },
};
