export type ActiveTab =
  | 'tutor'
  | 'summarizer'
  | 'quiz'
  | 'flashcards'
  | 'important_questions'
  | 'viva'
  | 'planner'
  | 'insights';

export interface ApiStatus {
  ok: boolean;
  model: string;
  message: string;
  hasEnvKey: boolean;
}

// 1. AI Tutor Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  keyTakeaway?: string;
  followUpQuestions?: string[];
}

export type TutorStyle = 'intuitive' | 'first-principles' | 'exam-focused' | 'socratic';

// 2. Summarizer Types
export interface SummaryResult {
  title: string;
  tldr: string;
  coreConcepts: Array<{
    name: string;
    explanation: string;
    significance: string;
  }>;
  keyFormulasOrTerms: Array<{
    term: string;
    definition: string;
  }>;
  commonExamTraps: string[];
  quickRecapBullets: string[];
}

// 3. Quiz Types
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint: string;
  subtopic: string;
}

export interface QuizResult {
  quizTitle: string;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
}

// 4. Flashcard Types
export interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
  mnemonicOrHint?: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  status?: 'unseen' | 'mastered' | 'review';
}

export interface FlashcardDeck {
  deckTitle: string;
  topic: string;
  cards: Flashcard[];
}

// 5. Important Questions Types
export interface ImportantQuestion {
  id: number;
  question: string;
  marksWeightage: number;
  questionCategory: 'Short Answer (2M)' | 'Medium Conceptual (5M)' | 'Long / Essay / Case Study (10M)' | 'Numerical / Practical';
  frequencyLikelihood: 'High' | 'Very High' | 'Crucial';
  answerFramework: string[];
  keyKeywordsToInclude: string[];
  commonMistakes: string;
}

export interface ImportantQuestionsResult {
  subject: string;
  totalPredictedQuestions: number;
  examStrategy: string;
  questions: ImportantQuestion[];
}

// 6. Viva Voce Types
export interface VivaQuestionData {
  question: string;
  context: string;
  examinerPersona: string;
  expectedDimensions: string[];
}

export interface VivaEvaluationResult {
  overallScore: number;
  scoreBreakdown: {
    technicalAccuracy: number;
    conceptualDepth: number;
    clarityAndStructure: number;
  };
  verdict: 'Distinction' | 'Satisfactory' | 'Needs Improvement' | 'Unsatisfactory';
  strengths: string[];
  missingKeyPoints: string[];
  idealModelAnswer: string;
  examinerComment: string;
  followUpQuestion: string;
}

export interface VivaTurn {
  id: string;
  question: string;
  studentAnswer: string;
  evaluation?: VivaEvaluationResult;
}

// 7. Study Plan Types
export interface StudyPlanDay {
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
}

export interface StudyPlanResult {
  planTitle: string;
  overview: string;
  totalStudyHours: number;
  recommendedMethodology: string;
  dailySchedule: StudyPlanDay[];
  spacedRepetitionDates: string[];
  examEveChecklist: string[];
}

// 8. AI Study Insights Types
export interface StudyInsightsResult {
  readinessScore: number;
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
}
