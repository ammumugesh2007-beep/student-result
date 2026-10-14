import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

interface StudentData {
  studentName?: string;
  courseName?: string;
  studyHours: number; // hours/week
  attendance: number; // percentage (0-100)
  quizScore: number; // percentage (0-100)
  assignmentScore?: number;
  recentTrend?: 'improving' | 'steady' | 'declining';
  participation?: 'high' | 'medium' | 'low';
  notes?: string;
  targetScore?: number;
}

// Fallback rule-based calculator for instant response and resiliency
function calculateBaselinePrediction(data: StudentData) {
  // Typical academic weighting:
  // Current quizzes: 50%
  // Attendance factor: Attendance >= 85% gives bonus, < 75% penalizes
  // Study hours: 10-15 hrs/wk is optimal for college/high-school courses
  const quizWeight = 0.55;
  const attendanceWeight = 0.25;
  const studyWeight = 0.20;

  // Study hours normalized: 12 hrs/wk ~ 100% ideal
  const normalizedStudy = Math.min(Math.max((data.studyHours / 12) * 100, 0), 100);
  const normalizedAttendance = Math.min(Math.max(data.attendance, 0), 100);
  const normalizedQuiz = Math.min(Math.max(data.quizScore, 0), 100);

  let baseline = (normalizedQuiz * quizWeight) + (normalizedAttendance * attendanceWeight) + (normalizedStudy * studyWeight);

  if (data.recentTrend === 'improving') baseline += 3;
  if (data.recentTrend === 'declining') baseline -= 4;
  if (data.participation === 'high') baseline += 2;
  if (data.participation === 'low') baseline -= 2;

  const projectedScore = Math.min(Math.max(Math.round(baseline), 20), 100);

  let riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' = 'Low Risk';
  if (projectedScore < 70 || (data.attendance < 75 && data.quizScore < 70)) {
    riskLevel = 'High Risk';
  } else if (projectedScore < 80 || data.attendance < 80 || data.studyHours < 5) {
    riskLevel = 'Moderate Risk';
  } else {
    riskLevel = 'Low Risk';
  }

  return { projectedScore, riskLevel };
}

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', hasApiKey: !!apiKey });
});

// Predict student performance & generate advisor feedback
app.post('/api/predict', async (req: Request, res: Response) => {
  try {
    const data: StudentData = req.body;
    const {
      studentName = 'Student',
      courseName = 'Current Course',
      studyHours = 0,
      attendance = 0,
      quizScore = 0,
      assignmentScore,
      recentTrend = 'steady',
      participation = 'medium',
      notes = '',
      targetScore,
    } = data;

    const baseline = calculateBaselinePrediction({
      studentName,
      courseName,
      studyHours: Number(studyHours),
      attendance: Number(attendance),
      quizScore: Number(quizScore),
      assignmentScore: assignmentScore !== undefined ? Number(assignmentScore) : undefined,
      recentTrend,
      participation,
      notes,
      targetScore,
    });

    if (!ai) {
      // Offline fallback with strictly formatted response
      const strengths = [];
      if (attendance >= 85) strengths.push(`Strong class attendance of ${attendance}%, showing commitment to live learning.`);
      if (studyHours >= 8) strengths.push(`Dedicated study habit with ${studyHours} hours invested each week.`);
      if (quizScore >= 75) strengths.push(`Solid foundation in course material demonstrated by a ${quizScore}% quiz average.`);
      if (strengths.length === 0) strengths.push(`Willingness to review performance early, leaving plenty of runway to turn things around.`);

      const actions = [];
      if (studyHours < 7) {
        actions.push(`Add 30-45 minutes of focused review 3 days a week using active recall or practice flashcards.`);
      } else {
        actions.push(`Maintain current study volume, focusing the first 20 minutes on weak subtopics before practicing easier concepts.`);
      }
      if (attendance < 85) {
        actions.push(`Prioritize attending every scheduled session or lab to catch core exam tips shared directly by the instructor.`);
      } else {
        actions.push(`Form or join a study group with peers to test each other on upcoming quiz concepts.`);
      }
      actions.push(`Review graded quizzes within 48 hours to create a running 'mistakes log' to review before exam day.`);

      const formattedMarkdown = `### 📊 Performance Prediction
* **Projected Final Score:** ${baseline.projectedScore}%
* **Risk Level:** ${baseline.riskLevel}

### 💡 Strengths & Insights
${strengths.map(s => `* ${s}`).join('\n')}

### 🚀 Personalized Action Plan
${actions.map(a => `* ${a}`).join('\n')}`;

      return res.json({
        success: true,
        projectedScore: baseline.projectedScore,
        riskLevel: baseline.riskLevel,
        strengths,
        actionPlan: actions,
        formattedMarkdown,
        isSimulated: true,
      });
    }

    const prompt = `You are the "Student Success Predictor & Advisor AI," a user-friendly application designed for teachers and students.
Analyze this student's data and predict their performance, then generate actionable, encouraging feedback.

STUDENT PROFILE:
- Name: ${studentName}
- Course: ${courseName}
- Weekly Study Hours: ${studyHours} hrs/week
- Class Attendance: ${attendance}%
- Current Quiz/Assignment Average: ${quizScore}%
${assignmentScore !== undefined ? `- Assignment Completion/Score: ${assignmentScore}%` : ''}
- Recent Performance Trend: ${recentTrend}
- Class Participation: ${participation}
${notes ? `- Teacher/Student Notes: "${notes}"` : ''}
${targetScore ? `- Student Goal/Target Score: ${targetScore}%` : ''}
- Mathematical Baseline Estimation: ~${baseline.projectedScore}% (${baseline.riskLevel})

INSTRUCTIONS:
1. Provide a realistic calculated final score projection (as a percentage, e.g., 82%) and assign Risk Level: "Low Risk", "Moderate Risk", or "High Risk".
2. Under "Strengths & Insights", list 1-2 positive patterns based on their current data (e.g. strong attendance, consistent study habits, improving trend).
3. Under "Personalized Action Plan", provide 2-3 specific, realistic bullet points on how the student can improve or maintain their grade. Keep the tone compassionate, direct, and motivating. Avoid overly complex technical jargon.
4. You must provide the EXACT structured response format in markdown:

### 📊 Performance Prediction
* **Projected Final Score:** [e.g., 82%]
* **Risk Level:** [Low Risk / Moderate Risk / High Risk]

### 💡 Strengths & Insights
* [Strength 1]
* [Strength 2 (optional)]

### 🚀 Personalized Action Plan
* [Action item 1]
* [Action item 2]
* [Action item 3]

Return a JSON object with this exact structure:
{
  "projectedScore": <number between 0 and 100>,
  "riskLevel": "<Low Risk | Moderate Risk | High Risk>",
  "strengths": ["<string>", "<string>"],
  "actionPlan": ["<string>", "<string>", "<string>"],
  "formattedMarkdown": "<The exact markdown requested above>",
  "encouragementQuote": "<A short 1-sentence warm motivational message tailored to this student>"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text || '';
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // In case json parsing failed, build from baseline
      parsed = {
        projectedScore: baseline.projectedScore,
        riskLevel: baseline.riskLevel,
        strengths: [`Consistent attendance at ${attendance}% provides a stable foundation.`],
        actionPlan: [
          `Schedule 2 dedicated study blocks of 45 minutes each week.`,
          `Form a review routine reviewing past quiz errors before each new assessment.`
        ],
        formattedMarkdown: responseText,
        encouragementQuote: "Every small improvement today builds the confidence for tomorrow's success!",
      };
    }

    return res.json({
      success: true,
      projectedScore: parsed.projectedScore ?? baseline.projectedScore,
      riskLevel: parsed.riskLevel ?? baseline.riskLevel,
      strengths: parsed.strengths || [],
      actionPlan: parsed.actionPlan || [],
      formattedMarkdown: parsed.formattedMarkdown || responseText,
      encouragementQuote: parsed.encouragementQuote || "Keep pushing forward—progress happens one study session at a time!",
      isSimulated: false,
    });
  } catch (error: any) {
    console.error('Error generating prediction:', error);
    // Provide graceful fallback
    const body = req.body || {};
    const fallback = calculateBaselinePrediction({
      studyHours: Number(body.studyHours || 5),
      attendance: Number(body.attendance || 80),
      quizScore: Number(body.quizScore || 70),
    });

    return res.status(200).json({
      success: true,
      projectedScore: fallback.projectedScore,
      riskLevel: fallback.riskLevel,
      strengths: [`You are actively monitoring your progress, which is the first step toward academic mastery.`],
      actionPlan: [
        `Dedicate 1 additional hour each week to active recall practice.`,
        `Review quiz questions that you missed to understand the underlying principles.`
      ],
      formattedMarkdown: `### 📊 Performance Prediction\n* **Projected Final Score:** ${fallback.projectedScore}%\n* **Risk Level:** ${fallback.riskLevel}\n\n### 💡 Strengths & Insights\n* Active engagement in tracking performance.\n\n### 🚀 Personalized Action Plan\n* Dedicate 1 additional hour each week to active recall practice.\n* Review missed quiz questions to identify conceptual gaps.`,
      encouragementQuote: "Consistency and reflection are the cornerstones of high achievement.",
      isSimulated: true,
    });
  }
});

// Follow-up Advisor Tutor / Questions
app.post('/api/ask-advisor', async (req: Request, res: Response) => {
  try {
    const { question, studentData, previousPrediction } = req.body;
    if (!ai) {
      return res.json({
        answer: "Great question! Focusing on small, consistent 25-minute study intervals (the Pomodoro technique) and reviewing class notes immediately after lecture will provide the highest return on your study time."
      });
    }

    const prompt = `You are the Student Success Predictor & Advisor AI.
A student or teacher is asking a follow-up question regarding their academic plan.

STUDENT CONTEXT:
${JSON.stringify(studentData || {})}

PREVIOUS PREDICTION:
${JSON.stringify(previousPrediction || {})}

USER QUESTION:
"${question}"

Respond warmly, directly, and compassionately with practical, realistic advice. Keep it concise (2-4 paragraphs or a few bullet points), motivating, and free of overly technical jargon.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      answer: response.text || 'Keep up the focused effort and prioritize your key goals!'
    });
  } catch (error: any) {
    console.error('Error in ask-advisor:', error);
    return res.json({
      answer: "Consistency in your daily study routine, attending review sessions, and breaking complex topics into bite-sized summaries will significantly boost your understanding and score!"
    });
  }
});

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Student Success Predictor & Advisor AI running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
