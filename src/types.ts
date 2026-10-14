export interface StudentMetrics {
  id?: string;
  studentName: string;
  courseName: string;
  studyHours: number; // hrs/week
  attendance: number; // 0-100%
  quizScore: number; // 0-100%
  assignmentScore?: number;
  recentTrend: 'improving' | 'steady' | 'declining';
  participation: 'high' | 'medium' | 'low';
  targetScore: number; // 0-100%
  notes?: string;
}

export interface PredictionResult {
  projectedScore: number;
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  strengths: string[];
  actionPlan: string[];
  formattedMarkdown: string;
  encouragementQuote?: string;
  isSimulated?: boolean;
  timestamp?: string;
}

export interface StudentProfileWithPrediction extends StudentMetrics {
  prediction?: PredictionResult;
  lastUpdated?: string;
}
