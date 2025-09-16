import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  studyTime: {
    daily: Array<{ date: string; minutes: number; sessions: number }>;
    weekly: Array<{ week: string; minutes: number; sessions: number }>;
    monthly: Array<{ month: string; minutes: number; sessions: number }>;
  };
  contentUsage: {
    notes: Array<{ id: string; title: string; accessCount: number; lastAccessed: string }>;
    files: Array<{ id: string; name: string; accessCount: number; lastAccessed: string }>;
  };
  performance: {
    productivity: Array<{ date: string; score: number }>;
    streaks: { current: number; longest: number };
    goals: Array<{ id: string; title: string; progress: number; target: number }>;
  };
  insights: {
    bestStudyTime: string;
    averageSessionLength: number;
    mostProductiveDay: string;
    knowledgeAreas: Array<{ area: string; timeSpent: number; proficiency: number }>;
  };
}

export class AnalyticsService {
  private static localStorageKey = 'study_analytics';

  static async fetchAnalyticsData(userId: string, days: number = 30): Promise<AnalyticsData> {
    try {
      // Fetch data from multiple sources
      const [
        sessionData,
        analyticsData,
        usageData,
        goalsData
      ] = await Promise.all([
        this.fetchStudySessions(userId, days),
        this.fetchLearningAnalytics(userId, days),
        this.fetchUsageTracking(userId, days),
        this.fetchStudyGoals(userId)
      ]);

      // Combine and process data
      const analytics: AnalyticsData = {
        studyTime: this.processStudyTimeData(sessionData),
        contentUsage: await this.processContentUsageData(userId, days),
        performance: this.processPerformanceData(sessionData, analyticsData),
        insights: this.generateInsights(sessionData, analyticsData)
      };

      // Cache in local storage
      this.cacheAnalytics(analytics);

      return analytics;
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      return this.getLocalAnalytics() || this.getEmptyAnalytics();
    }
  }

  private static async fetchStudySessions(userId: string, days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('started_at', startDate.toISOString())
      .order('started_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  private static async fetchLearningAnalytics(userId: string, days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('learning_analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  private static async fetchUsageTracking(userId: string, days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('ai_usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  private static async fetchStudyGoals(userId: string) {
    const { data, error } = await supabase
      .from('study_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  }

  private static processStudyTimeData(sessions: any[]) {
    const dailyData = new Map<string, { minutes: number; sessions: number }>();
    const weeklyData = new Map<string, { minutes: number; sessions: number }>();
    const monthlyData = new Map<string, { minutes: number; sessions: number }>();

    sessions.forEach(session => {
      const date = new Date(session.started_at);
      const dateStr = date.toISOString().split('T')[0];
      const weekStr = this.getWeekString(date);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const minutes = session.duration_minutes || 0;

      // Daily data
      const daily = dailyData.get(dateStr) || { minutes: 0, sessions: 0 };
      daily.minutes += minutes;
      daily.sessions += 1;
      dailyData.set(dateStr, daily);

      // Weekly data
      const weekly = weeklyData.get(weekStr) || { minutes: 0, sessions: 0 };
      weekly.minutes += minutes;
      weekly.sessions += 1;
      weeklyData.set(weekStr, weekly);

      // Monthly data
      const monthly = monthlyData.get(monthStr) || { minutes: 0, sessions: 0 };
      monthly.minutes += minutes;
      monthly.sessions += 1;
      monthlyData.set(monthStr, monthly);
    });

    return {
      daily: Array.from(dailyData.entries()).map(([date, data]) => ({ date, ...data })),
      weekly: Array.from(weeklyData.entries()).map(([week, data]) => ({ week, ...data })),
      monthly: Array.from(monthlyData.entries()).map(([month, data]) => ({ month, ...data }))
    };
  }

  private static async processContentUsageData(userId: string, days: number) {
    // Simulate content usage tracking (would need to implement actual tracking)
    const localSessions = this.getLocalSessions();
    
    const notesUsage = new Map<string, { count: number; lastAccessed: string }>();
    const filesUsage = new Map<string, { count: number; lastAccessed: string }>();

    localSessions.forEach(session => {
      session.activities?.forEach((activity: any) => {
        if (activity.type === 'content_viewed' && activity.data?.type === 'note') {
          const noteId = activity.data.id;
          const usage = notesUsage.get(noteId) || { count: 0, lastAccessed: activity.timestamp };
          usage.count += 1;
          if (new Date(activity.timestamp) > new Date(usage.lastAccessed)) {
            usage.lastAccessed = activity.timestamp;
          }
          notesUsage.set(noteId, usage);
        }
        
        if (activity.type === 'content_viewed' && activity.data?.type === 'file') {
          const fileId = activity.data.id;
          const usage = filesUsage.get(fileId) || { count: 0, lastAccessed: activity.timestamp };
          usage.count += 1;
          if (new Date(activity.timestamp) > new Date(usage.lastAccessed)) {
            usage.lastAccessed = activity.timestamp;
          }
          filesUsage.set(fileId, usage);
        }
      });
    });

    // Fetch actual content details
    const [notesData, filesData] = await Promise.all([
      this.fetchNotesDetails(userId, Array.from(notesUsage.keys())),
      this.fetchFilesDetails(userId, Array.from(filesUsage.keys()))
    ]);

    return {
      notes: notesData.map(note => ({
        ...note,
        accessCount: notesUsage.get(note.id)?.count || 0,
        lastAccessed: notesUsage.get(note.id)?.lastAccessed || note.updated_at
      })),
      files: filesData.map(file => ({
        ...file,
        accessCount: filesUsage.get(file.id)?.count || 0,
        lastAccessed: filesUsage.get(file.id)?.lastAccessed || file.updated_at
      }))
    };
  }

  private static async fetchNotesDetails(userId: string, noteIds: string[]) {
    if (noteIds.length === 0) {
      const { data } = await supabase
        .from('notes')
        .select('id, title, updated_at')
        .eq('user_id', userId)
        .limit(10);
      return data || [];
    }

    const { data } = await supabase
      .from('notes')
      .select('id, title, updated_at')
      .eq('user_id', userId)
      .in('id', noteIds);
    return data || [];
  }

  private static async fetchFilesDetails(userId: string, fileIds: string[]) {
    if (fileIds.length === 0) {
      const { data } = await supabase
        .from('files')
        .select('id, name, updated_at')
        .eq('user_id', userId)
        .limit(10);
      return data || [];
    }

    const { data } = await supabase
      .from('files')
      .select('id, name, updated_at')
      .eq('user_id', userId)
      .in('id', fileIds);
    return data || [];
  }

  private static processPerformanceData(sessions: any[], analytics: any[]) {
    const productivity = sessions
      .filter(s => s.started_at)
      .map(session => {
        const activities = analytics.find(a => 
          a.activity_data?.session_id === session.id
        )?.activity_data;

        const score = activities?.productivity_score || 
          this.calculateSessionProductivity(session);

        return {
          date: new Date(session.started_at).toISOString().split('T')[0],
          score
        };
      });

    const streaks = this.calculateStreaks(sessions);

    return {
      productivity,
      streaks,
      goals: [] // Would be populated from study_goals table
    };
  }

  private static calculateSessionProductivity(session: any): number {
    // Fallback productivity calculation
    const duration = session.duration_minutes || 0;
    const activities = session.ai_queries + session.notes_created + session.files_uploaded;
    
    if (duration === 0) return 0;
    
    const activityDensity = activities / (duration / 60); // per hour
    const durationScore = Math.min(duration / 120, 1); // normalize to 2 hours
    
    return Math.round((activityDensity * 30 + durationScore * 70));
  }

  private static calculateStreaks(sessions: any[]) {
    const sessionDates = sessions
      .map(s => new Date(s.started_at).toISOString().split('T')[0])
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Calculate current streak
    if (sessionDates.includes(today) || sessionDates.includes(yesterday)) {
      let checkDate = new Date();
      if (!sessionDates.includes(today)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (sessionDates.includes(checkDate.toISOString().split('T')[0])) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Calculate longest streak
    for (let i = 1; i < sessionDates.length; i++) {
      const prevDate = new Date(sessionDates[i - 1]);
      const currDate = new Date(sessionDates[i]);
      const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak };
  }

  private static generateInsights(sessions: any[], analytics: any[]) {
    const hourlyActivity = new Map<number, number>();
    const dailyActivity = new Map<number, number>();
    const knowledgeAreas = new Map<string, number>();

    sessions.forEach(session => {
      const date = new Date(session.started_at);
      const hour = date.getHours();
      const day = date.getDay();
      const duration = session.duration_minutes || 0;

      hourlyActivity.set(hour, (hourlyActivity.get(hour) || 0) + duration);
      dailyActivity.set(day, (dailyActivity.get(day) || 0) + duration);
    });

    analytics.forEach(item => {
      if (item.knowledge_areas) {
        item.knowledge_areas.forEach((area: string) => {
          knowledgeAreas.set(area, (knowledgeAreas.get(area) || 0) + (item.time_spent_minutes || 0));
        });
      }
    });

    const bestHour = Array.from(hourlyActivity.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 9;
    
    const bestDay = Array.from(dailyActivity.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 1;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const avgSessionLength = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessions.length 
      : 0;

    return {
      bestStudyTime: `${bestHour}:00`,
      averageSessionLength: Math.round(avgSessionLength),
      mostProductiveDay: dayNames[bestDay],
      knowledgeAreas: Array.from(knowledgeAreas.entries()).map(([area, timeSpent]) => ({
        area,
        timeSpent,
        proficiency: Math.min(timeSpent / 100, 10) // Simple proficiency calc
      }))
    };
  }

  private static getWeekString(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${String(week).padStart(2, '0')}`;
  }

  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private static cacheAnalytics(analytics: AnalyticsData) {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify({
        data: analytics,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to cache analytics:', error);
    }
  }

  private static getLocalAnalytics(): AnalyticsData | null {
    try {
      const cached = localStorage.getItem(this.localStorageKey);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > 5 * 60 * 1000; // 5 minutes

      return isExpired ? null : data;
    } catch (error) {
      return null;
    }
  }

  private static getLocalSessions(): any[] {
    try {
      return JSON.parse(localStorage.getItem('study_sessions') || '[]');
    } catch (error) {
      return [];
    }
  }

  private static getEmptyAnalytics(): AnalyticsData {
    return {
      studyTime: { daily: [], weekly: [], monthly: [] },
      contentUsage: { notes: [], files: [] },
      performance: { productivity: [], streaks: { current: 0, longest: 0 }, goals: [] },
      insights: {
        bestStudyTime: '9:00',
        averageSessionLength: 0,
        mostProductiveDay: 'Monday',
        knowledgeAreas: []
      }
    };
  }

  static async exportAnalytics(userId: string, format: 'csv' | 'json' = 'json') {
    const analytics = await this.fetchAnalyticsData(userId, 90);
    
    if (format === 'csv') {
      return this.convertToCSV(analytics);
    }
    
    return JSON.stringify(analytics, null, 2);
  }

  private static convertToCSV(analytics: AnalyticsData): string {
    const headers = ['Date', 'Study Time (min)', 'Sessions', 'Productivity Score'];
    const rows = analytics.studyTime.daily.map(day => {
      const productivityData = analytics.performance.productivity.find(p => p.date === day.date);
      return [
        day.date,
        day.minutes,
        day.sessions,
        productivityData?.score || 0
      ];
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}