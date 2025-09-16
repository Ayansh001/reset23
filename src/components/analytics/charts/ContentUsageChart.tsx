import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { FileText, File, Eye, Clock } from 'lucide-react';

interface ContentUsageData {
  notes: Array<{ id: string; title: string; accessCount: number; lastAccessed: string }>;
  files: Array<{ id: string; name: string; accessCount: number; lastAccessed: string }>;
}

interface ContentUsageChartProps {
  data: ContentUsageData;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted-foreground))'];

export function ContentUsageChart({ data }: ContentUsageChartProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTopContent = (items: any[], limit: number = 5) => {
    return items
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit)
      .map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length]
      }));
  };

  const topNotes = getTopContent(data.notes);
  const topFiles = getTopContent(data.files);

  const totalNoteAccess = data.notes.reduce((sum, note) => sum + note.accessCount, 0);
  const totalFileAccess = data.files.reduce((sum, file) => sum + file.accessCount, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md max-w-xs">
          <p className="font-medium mb-2 truncate">{item.title || item.name}</p>
          <p className="text-sm text-muted-foreground">
            Views: {item.accessCount}
          </p>
          <p className="text-sm text-muted-foreground">
            Last accessed: {formatDate(item.lastAccessed)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{data.notes.length}</div>
                <div className="text-xs text-muted-foreground">Total Notes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <File className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{data.files.length}</div>
                <div className="text-xs text-muted-foreground">Total Files</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalNoteAccess}</div>
                <div className="text-xs text-muted-foreground">Note Views</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Eye className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalFileAccess}</div>
                <div className="text-xs text-muted-foreground">File Views</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Usage Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Most Accessed Content</CardTitle>
          <CardDescription>
            Track which notes and files you access most frequently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notes" className="w-full">
            <TabsList>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="mt-6">
              {topNotes.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topNotes} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis 
                          type="category" 
                          dataKey="title"
                          width={120}
                          className="text-xs"
                          tickFormatter={(value) => 
                            value.length > 15 ? value.substring(0, 15) + '...' : value
                          }
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="accessCount" radius={[0, 4, 4, 0]}>
                          {topNotes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Recent Activity</h4>
                    {topNotes.slice(0, 3).map((note, index) => (
                      <div key={note.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: note.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{note.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Eye className="h-3 w-3" />
                            {note.accessCount} views
                            <Clock className="h-3 w-3 ml-2" />
                            {formatDate(note.lastAccessed)}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No note access data available</p>
                  <p className="text-sm">Start viewing notes to see analytics</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              {topFiles.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topFiles} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis 
                          type="category" 
                          dataKey="name"
                          width={120}
                          className="text-xs"
                          tickFormatter={(value) => 
                            value.length > 15 ? value.substring(0, 15) + '...' : value
                          }
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="accessCount" radius={[0, 4, 4, 0]}>
                          {topFiles.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Recent Activity</h4>
                    {topFiles.slice(0, 3).map((file, index) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: file.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{file.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Eye className="h-3 w-3" />
                            {file.accessCount} views
                            <Clock className="h-3 w-3 ml-2" />
                            {formatDate(file.lastAccessed)}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No file access data available</p>
                  <p className="text-sm">Start viewing files to see analytics</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}