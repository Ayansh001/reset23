
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Square, Clock, Quote } from 'lucide-react';
import { useEnhancedSessionTracker } from '@/hooks/useEnhancedSessionTracker';

interface EnhancedSessionControlsProps {
  compact?: boolean;
  className?: string;
}

export function EnhancedSessionControls({ compact = false, className = '' }: EnhancedSessionControlsProps) {
  const {
    currentSession,
    isTracking,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    getSessionStats,
    quotes
  } = useEnhancedSessionTracker();

  const sessionStats = getSessionStats();
  const lastBreak = currentSession?.breaks[currentSession.breaks.length - 1];
  const isOnBreak = lastBreak && !lastBreak.end;

  const handleStartSession = () => {
    startSession('general');
  };

  const handlePauseResume = () => {
    if (!currentSession) return;
    
    if (isOnBreak) {
      resumeSession();
    } else {
      pauseSession();
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {!isTracking ? (
          <Button size="sm" onClick={handleStartSession}>
            <Play className="h-3 w-3 mr-1" />
            Start
          </Button>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={handlePauseResume}>
              {isOnBreak ? (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Break
                </>
              )}
            </Button>
            <Button size="sm" variant="destructive" onClick={endSession}>
              <Square className="h-3 w-3 mr-1" />
              Stop
            </Button>
            {sessionStats && (
              <Badge variant={isOnBreak ? "secondary" : "default"} className="text-xs">
                {sessionStats.totalTime}m
              </Badge>
            )}
          </>
        )}
        
        <Badge variant="outline" className="text-xs">
          <Quote className="h-3 w-3 mr-1" />
          AI Quotes
        </Badge>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Study Session</span>
            <Badge variant="outline" className="text-xs">
              <Quote className="h-3 w-3 mr-1" />
              AI quotes enabled
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {!isTracking ? (
              <Button onClick={handleStartSession}>
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handlePauseResume}>
                  {isOnBreak ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Break
                    </>
                  )}
                </Button>
                <Button variant="destructive" onClick={endSession}>
                  <Square className="h-4 w-4 mr-2" />
                  End Session
                </Button>
              </>
            )}
          </div>
        </div>
        
        {isTracking && sessionStats && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>⏱️ {sessionStats.totalTime} minutes</span>
              <span>📊 {sessionStats.productivity}% productive</span>
              <span>🎯 {sessionStats.activitiesCount} activities</span>
            </div>
            <Badge variant={isOnBreak ? "secondary" : "default"}>
              {isOnBreak ? "On Break" : "Active"}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
