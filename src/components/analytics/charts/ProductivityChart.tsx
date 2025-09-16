import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Award } from 'lucide-react';

interface ProductivityData {
  productivity: Array<{ date: string; score: number }>;
  streaks: { current: number; longest: number };
  goals: Array<{ id: string; title: string; progress: number; target: number }>;
}

interface ProductivityChartProps {
  data: ProductivityData;
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const averageScore = data.productivity.length > 0
    ? data.productivity.reduce((sum, item) => sum + item.score, 0) / data.productivity.length
    : 0;

  const latestScore = data.productivity[data.productivity.length - 1]?.score || 0;
  const previousScore = data.productivity[data.productivity.length - 2]?.score || 0;
  const scoreChange = latestScore - previousScore;
  const isImproving = scoreChange > 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'hsl(var(--chart-1))'; // Green
    if (score >= 60) return 'hsl(var(--chart-2))'; // Yellow
    if (score >= 40) return 'hsl(var(--chart-3))'; // Orange
    return 'hsl(var(--chart-4))'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium mb-1">{formatDate(label)}</p>
          <p className="text-sm">
            <span style={{ color: payload[0].color }}>
              Productivity: {score}% ({getScoreLabel(score)})
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(averageScore)}%</div>
                <div className="text-xs text-muted-foreground">Avg Productivity</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isImproving ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
              }`}>
                {isImproving ? (
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {scoreChange > 0 ? '+' : ''}{Math.round(scoreChange)}%
                </div>
                <div className="text-xs text-muted-foreground">Recent Change</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{data.streaks.current}</div>
                <div className="text-xs text-muted-foreground">Current Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{data.streaks.longest}</div>
                <div className="text-xs text-muted-foreground">Best Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Trend</CardTitle>
          <CardDescription>
            Track your study productivity over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.productivity.slice(-14)}>
                <defs>
                  <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  className="text-xs"
                />
                <YAxis 
                  domain={[0, 100]}
                  className="text-xs"
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine 
                  y={70} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  label={{ value: "Target", position: "right" }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#productivityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={latestScore >= 70 ? "default" : "secondary"}>
                Latest: {latestScore}% ({getScoreLabel(latestScore)})
              </Badge>
              {isImproving && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Improving
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Target: 70%+ productivity
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Progress */}
      {data.goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Study Goals</CardTitle>
            <CardDescription>
              Track progress towards your learning objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.goals.map((goal) => {
                const progressPercentage = (goal.progress / goal.target) * 100;
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{goal.title}</h4>
                      <span className="text-sm text-muted-foreground">
                        {goal.progress} / {goal.target}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{Math.round(progressPercentage)}% complete</span>
                      {progressPercentage >= 100 && (
                        <Badge variant="default" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}