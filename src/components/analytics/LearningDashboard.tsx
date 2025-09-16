
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Brain, 
  FileText, 
  Trophy, 
  Clock, 
  Target,
  BookOpen,
  BarChart3,
  Download
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService, type AnalyticsData } from '@/services/analyticsService';
import { EnhancedSessionControls } from './EnhancedSessionControls';
import { StudyTimeChart } from './charts/StudyTimeChart';
import { ProductivityChart } from './charts/ProductivityChart';
import { ContentUsageChart } from './charts/ContentUsageChart';

export function LearningDashboard() {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  // Fetch comprehensive analytics data using AnalyticsService
  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ['comprehensive-analytics', user?.id],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user) throw new Error('User not authenticated');
      return await AnalyticsService.fetchAnalyticsData(user.id, 30);
    },
    enabled: !!user,
    refetchInterval: 30000 // Regular updates for analytics
  });

  // Handle data export
  const handleExport = async (format: 'csv' | 'json' = 'json') => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      const exportData = await AnalyticsService.exportAnalytics(user.id, format);
      
      const blob = new Blob([exportData], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `study-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Session Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Learning Analytics</h1>
            <p className="text-muted-foreground">Track your study progress and insights</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </div>

      {/* Enhanced Session Tracking Controls with Quotes */}
      <EnhancedSessionControls />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Study Time</p>
                <p className="text-2xl font-bold">
                  {Math.round(analyticsData.studyTime.daily.reduce((sum, day) => sum + day.minutes, 0) / 60)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{analyticsData.performance.streaks.current}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Productivity</p>
                <p className="text-2xl font-bold">
                  {Math.round(analyticsData.performance.productivity.reduce((sum, p) => sum + p.score, 0) / Math.max(analyticsData.performance.productivity.length, 1))}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Best Study Time</p>
                <p className="text-2xl font-bold">{analyticsData.insights.bestStudyTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts */}
      <Tabs defaultValue="study-time" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="study-time">Study Time</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="content">Content Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="study-time" className="space-y-6">
          <StudyTimeChart data={analyticsData.studyTime} />
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <ProductivityChart data={analyticsData.performance} />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentUsageChart data={analyticsData.contentUsage} />
        </TabsContent>
      </Tabs>

      {/* Insights Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Study Insights</CardTitle>
          <CardDescription>
            Personalized recommendations based on your study patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Study Patterns</h4>
              <div className="space-y-2 text-sm">
                <p>🕘 Best study time: <strong>{analyticsData.insights.bestStudyTime}</strong></p>
                <p>📅 Most productive day: <strong>{analyticsData.insights.mostProductiveDay}</strong></p>
                <p>⏱️ Average session: <strong>{analyticsData.insights.averageSessionLength} minutes</strong></p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Knowledge Areas</h4>
              <div className="space-y-2">
                {analyticsData.insights.knowledgeAreas.slice(0, 5).map((area, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{area.area}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={area.proficiency * 10} className="w-16 h-2" />
                      <span className="text-xs text-muted-foreground">{area.timeSpent}m</span>
                    </div>
                  </div>
                ))}
                {analyticsData.insights.knowledgeAreas.length === 0 && (
                  <p className="text-muted-foreground text-sm">Start studying to build your knowledge areas!</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
