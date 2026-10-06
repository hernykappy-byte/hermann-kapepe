export interface Question {
  q: string;
  opts: string[];
  ans: string;
  diff: "Easy" | "Medium" | "Hard" | "Expert";
  use: string;
  fact: string;
  explanations?: { [key: string]: string };
  zambia?: boolean;
}

export interface UserProfile {
  username: string;
  displayName: string;
  email: string;
  profilePictureUrl?: string;
  bio?: string;
  locationCity: string;
  locationCountry: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  teamId?: string;
  pointsEarnedToday?: number;
  lastLoginDate?: string;
}

export interface TeamProfile {
  id: string;
  name: string;
  logoUrl: string;
  bio?: string;
  type: "school" | "company" | "friends" | "community" | "pub";
  locationCity: string;
  locationCountry: string;
  totalPoints: number;
  captainId: string;
  memberCount: number;
}

export interface QuizSession {
  category: string;
  questions: Question[];
  currentIndex: number;
  selectedAnswer: string | null;
  score: number;
  pointsEarned: number;
  startTime: number;
  answersHistory: {
    questionText: string;
    selected: string;
    correct: string;
    points: number;
    timeTakenMs: number;
    wasCorrect: boolean;
  }[];
  completed: boolean;
}

export interface Challenge1v1 {
  id: string;
  challenger: string;
  recipient: string;
  category: string;
  questionCount: number;
  status: "pending" | "active" | "completed";
  challengerScore: number;
  recipientScore: number;
  winner?: string;
  createdAt: string;
}

export interface ActivityFeedItem {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  type: "quiz_completed" | "badge_earned" | "challenge_completed" | "team_joined";
  timestamp: string;
  details: string;
  emoji: string;
  likes: number;
  comments: { username: string; text: string }[];
}
