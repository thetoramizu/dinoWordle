export interface StreakInfo {
  daily: StreakDetail;
  sequence: StreakDetail;
}

export interface StreakDetail {
  currentStreak: number;
  bestStreak: number;
  lastSuccessDate: string | null; // YYYY-MM-DD
}
