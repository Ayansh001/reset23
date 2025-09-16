import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface StudyTimeData {
  daily: Array<{ date: string; minutes: number; sessions: number }>;
  weekly: Array<{ week: string; minutes: number; sessions: number }>;
  monthly: Array<{ month: string; minutes: number; sessions: number }>;
}

interface StudyTimeChartProps {
  data: StudyTimeData;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function StudyTimeChart({ data }: StudyTimeChartProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatWeek = (weekStr: string) => {
    const [year, week] = weekStr.split('-W');
    return `W${week}`;
  };

  const formatMonth = (monthStr: string) => {
    return new Date(monthStr + '-01').toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium mb-2">{formatter ? formatter(label) : label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'minutes' ? 'Study Time' : 'Sessions'}: {' '}
              {entry.dataKey === 'minutes' ? formatTime(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Prepare distribution data for pie chart
  const distributionData = data.daily
    .slice(-7)
    .map(day => ({
      name: formatDate(day.date),
      value: day.minutes,
      sessions: day.sessions
    }))
    .filter(day => day.value > 0);

  const totalMinutes = data.daily.reduce((sum, day) => sum + day.minutes, 0);
  const totalSessions = data.daily.reduce((sum, day) => sum + day.sessions, 0);
  const averageSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Study Time Analysis
        </CardTitle>
        <CardDescription>
          Track your study patterns and time distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{formatTime(totalMinutes)}</div>
            <div className="text-sm text-muted-foreground">Total Study Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{totalSessions}</div>
            <div className="text-sm text-muted-foreground">Total Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{formatTime(averageSessionLength)}</div>
            <div className="text-sm text-muted-foreground">Avg Session</div>
          </div>
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.daily.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    content={<CustomTooltip formatter={formatDate} />}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="minutes" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weekly.slice(-8)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="week" 
                    tickFormatter={formatWeek}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    content={<CustomTooltip formatter={formatWeek} />}
                  />
                  <Bar 
                    dataKey="minutes" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={formatMonth}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    content={<CustomTooltip formatter={formatMonth} />}
                  />
                  <Bar 
                    dataKey="minutes" 
                    fill="hsl(var(--secondary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-80">
                <h4 className="text-sm font-medium mb-4 text-center">Last 7 Days Distribution</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatTime(value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatTime(value), 'Study Time']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Study Pattern Summary</h4>
                {distributionData.length > 0 ? (
                  distributionData.map((day, index) => (
                    <div key={day.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{day.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(day.value)} • {day.sessions} session{day.sessions !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No study sessions in the last 7 days
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}