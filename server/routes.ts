import { Router, Request, Response } from 'express';
import { GeminiService } from './geminiService.ts';

export const geminiRouter = Router();

// Middleware to handle Gemini errors consistently
function handleGeminiError(res: Response, error: unknown, context: string) {
  console.error(`Error in ${context}:`, error);
  const message = error instanceof Error ? error.message : 'Unknown Gemini error';

  const isApiKeyMissing =
    message.includes('GEMINI_API_KEY') ||
    message.includes('API key not valid') ||
    message.includes('API_KEY_INVALID');

  res.status(isApiKeyMissing ? 401 : 500).json({
    error: message,
    context,
    isApiKeyMissing,
    help: isApiKeyMissing
      ? 'Please make sure GEMINI_API_KEY is configured in your .env file or AI Studio Secrets.'
      : undefined,
  });
}

// 0. Status check
geminiRouter.get('/status', async (_req: Request, res: Response) => {
  const result = await GeminiService.checkConnection();
  res.json({
    ...result,
    hasEnvKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 1. AI Tutor
geminiRouter.post('/tutor', async (req: Request, res: Response) => {
  try {
    const { message, topic, subject, style, history } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Field "message" is required and must be a string.' });
      return;
    }
    const result = await GeminiService.askTutor({
      message,
      topic,
      subject,
      style,
      history,
    });
    res.json(result);
  } catch (error) {
    handleGeminiError(res, error, 'AI Tutor');
  }
});

// 2. Study Material Summarization
geminiRouter.post('/summarize', async (req: Request, res: Response) => {
  try {
    const { content, depth, format } = req.body;
    if (!content || typeof content !== 'string') {
      res.status(400).json({ error: 'Field "content" is required and must be a string.' });
      return;
    }
    const result = await GeminiService.summarizeMaterial({
      content,
      depth,
      format,
    });
    res.json(result);
  } catch (error) {
    handleGeminiError(res, error, 'Study Material Summarization');
  }
});

// 3. Quiz Generation
geminiRouter.post('/quiz', async (req: Request, res: Response) => {
  try {
    const { topicOrContent, questionCount, difficulty, type } = req.body;
    if (!topicOrContent || typeof topicOrContent !== 'string') {
      res.status(400).json({ error: 'Field "topicOrContent" is required.' });
      return;
    }
    const result = await GeminiService.generateQuiz({
      topicOrContent,
      questionCount: questionCount ? Number(questionCount) : undefined,
      difficulty,
      type,
    });
    res.json(result);
  } catch (error) {
    handleGeminiError(res, error, 'Quiz Generation');
  }
});

// 4. Flashcard Generation
geminiRouter.post('/flashcards', async (req: Request, res: Response) => {
  try {
    const { topicOrContent, count, focus } = req.body;
    if (!topicOrContent || typeof topicOrContent !== 'string') {
      res.status(400).json({ error: 'Field "topicOrContent" is required.' });
      return;
    }
    const result = await GeminiService.generateFlashcards({
      topicOrContent,
      count: count ? Number(count) : undefined,
      focus,
    });
    res.json(result);
  } catch (error) {
    handleGeminiError(res, error, 'Flashcard Generation');
  }
});

// 5. Important Questions
geminiRouter.post('/important-questions', async (req: Request, res: Response) => {
  try {
    const { topicOrContent, examType, difficulty } = req.body;
    if (!topicOrContent || typeof topicOrContent !== 'string') {
      res.status(400).json({ error: 'Field "topicOrContent" is required.' });
      return;
    }
    const result = await GeminiService.generateImportantQuestions({
      topicOrContent,
      examType,
      difficulty,
    });
    res.json(result);
  } catch (error) {
    handleGeminiError(res, error, 'Important Questions Generation');
  }
});

// 6. Viva Voce - Question & Evaluation
geminiRouter.post('/viva/question', async (req: Request, res: Response) => {
  try {
    const { topic, level, previousQuestions } = req.body;
    if (!topic || typeof topic !== 'string') {
      res.status(400).json({ error: 'Field "topic" is required.' });
      return;
    }
    const result = await GeminiService.generateVivaQuestion({
      topic,
      level,
      previousQuestions,
    });
    res.json(result);
  } catch (error) {
    handleGeminiError(res, error, 'Viva Voce Question Generation');
  }
});

geminiRouter.post('/viva/evaluate', async (req: Request, res: Response) => {
  try {
    const { topic, question, studentAnswer } = req.body;
    if (!topic || !question || !studentAnswer) {
      res.status(400).json({ error: 'Fields "topic", "question", and "studentAnswer" are required.' });
      return;
    }
    const result = await GeminiService.evaluateVivaAnswer({
      topic,
      question,
      studentAnswer,
    });
    res.json(result);
  } catch (error) {
    handleGeminiError(res, error, 'Viva Voce Evaluation');
  }
});

// 7. Study Planning
geminiRouter.post('/study-plan', async (req: Request, res: Response) => {
  try {
    const { subject, syllabusOrTopics, daysUntilExam, dailyAvailableHours, targetScore, currentMasteryLevel } = req.body;
    if (!subject || !syllabusOrTopics) {
      res.status(400).json({ error: 'Fields "subject" and "syllabusOrTopics" are required.' });
      return;
    }
    const result = await GeminiService.generateStudyPlan({
      subject,
      syllabusOrTopics,
      daysUntilExam: daysUntilExam ? Number(daysUntilExam) : 7,
      dailyAvailableHours: dailyAvailableHours ? Number(dailyAvailableHours) : 4,
      targetScore,
      currentMasteryLevel,
    });
    res.json(result);
  } catch (error) {
    handleGeminiError(res, error, 'Study Plan Generation');
  }
});

// 8. AI Study Insights
geminiRouter.post('/insights', async (req: Request, res: Response) => {
  try {
    const { subject, stats, weakTopics, strongTopics, targetExamName } = req.body;
    if (!subject || !stats) {
      res.status(400).json({ error: 'Fields "subject" and "stats" are required.' });
      return;
    }
    const result = await GeminiService.generateStudyInsights({
      subject,
      stats,
      weakTopics,
      strongTopics,
      targetExamName,
    });
    res.json(result);
  } catch (error) {
    handleGeminiError(res, error, 'Study Insights Generation');
  }
});
