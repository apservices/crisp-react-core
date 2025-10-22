import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Plus, Eye, EyeOff } from 'lucide-react';
import { useTrackComments } from '@/hooks/useTrackComments';
import { Badge } from '@/components/ui/badge';

interface Comment {
  id: string;
  content: string;
  timestamp_mark: number;
  type: 'general' | 'cue_point' | 'beatmatch' | 'transition';
  color_code: string;
  created_at: string;
  parent_id?: string;
}

interface WaveformWithCommentsProps {
  trackId: string;
  waveformData?: number[];
  duration: string;
  className?: string;
}

export const WaveformWithComments: React.FC<WaveformWithCommentsProps> = ({
  trackId,
  waveformData = [],
  duration,
  className = ""
}) => {
  const { comments, loading, addComment } = useTrackComments(trackId);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<Comment['type']>('general');
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);
  const [showComments, setShowComments] = useState(true);
  const waveformRef = useRef<HTMLDivElement>(null);

  // Convert duration string to seconds for calculations
  const durationInSeconds = useMemo(() => {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // mm:ss
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // hh:mm:ss
    }
    return 180; // fallback
  }, [duration]);

  const handleWaveformClick = (event: React.MouseEvent) => {
    if (!waveformRef.current) return;
    
    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const timestamp = percentage * durationInSeconds;
    
    setSelectedTimestamp(timestamp);
    setIsAddingComment(true);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || selectedTimestamp === null) return;
    
    try {
      await addComment(newComment, selectedTimestamp, commentType);
      setNewComment('');
      setIsAddingComment(false);
      setSelectedTimestamp(null);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCommentPosition = (timestamp: number) => {
    return (timestamp / durationInSeconds) * 100;
  };

  const normalizedData = waveformData.length > 0 
    ? waveformData.map(value => Math.max(0.1, Math.min(1, value)))
    : Array.from({ length: 100 }, (_, i) => 0.3 + Math.sin(i * 0.1) * 0.2);

  const temporalComments = comments.filter(comment => comment.timestamp_mark !== null && comment.timestamp_mark !== undefined);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Waveform & Comments</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowComments(!showComments)}
        >
          {showComments ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showComments ? 'Hide' : 'Show'} Comments
        </Button>
      </div>

      {/* Waveform Container */}
      <div className="relative">
        <div
          ref={waveformRef}
          className="relative h-24 bg-muted rounded-lg cursor-pointer overflow-hidden"
          onClick={handleWaveformClick}
        >
          {/* Waveform bars */}
          <div className="flex items-center justify-center h-full px-2">
            {normalizedData.map((value, index) => (
              <div
                key={index}
                className="bg-primary mx-px flex-1 min-w-[1px] transition-all hover:bg-primary/80"
                style={{ height: `${value * 100}%` }}
              />
            ))}
          </div>

          {/* Comment markers */}
          {showComments && temporalComments.map((comment) => (
            <div
              key={comment.id}
              className="absolute top-0 bottom-0 w-1 group cursor-pointer"
              style={{
                left: `${getCommentPosition(comment.timestamp_mark!)}%`,
                backgroundColor: comment.color_code || '#06b6d4',
              }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border rounded p-2 z-10 min-w-48">
                <div className="text-xs font-medium">{formatTimestamp(comment.timestamp_mark!)}</div>
                <div className="text-xs text-muted-foreground mb-1">{comment.type.replace('_', ' ')}</div>
                <div className="text-sm">{comment.content}</div>
              </div>
            </div>
          ))}

          {/* Selected timestamp marker */}
          {selectedTimestamp !== null && (
            <div
              className="absolute top-0 bottom-0 w-1 bg-accent"
              style={{ left: `${getCommentPosition(selectedTimestamp)}%` }}
            />
          )}
        </div>

        {/* Comment form */}
        {isAddingComment && selectedTimestamp !== null && (
          <div className="mt-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Add comment at {formatTimestamp(selectedTimestamp)}
              </span>
            </div>
            <div className="space-y-3">
              <Select value={commentType} onValueChange={(value: Comment['type']) => setCommentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Comment</SelectItem>
                  <SelectItem value="cue_point">Cue Point</SelectItem>
                  <SelectItem value="beatmatch">Beatmatch</SelectItem>
                  <SelectItem value="transition">Transition</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Enter your comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  Add Comment
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingComment(false);
                    setSelectedTimestamp(null);
                    setNewComment('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comments list */}
      {showComments && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comments ({temporalComments.length})
          </h4>
          {temporalComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Click on the waveform to add your first comment
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {temporalComments
                .sort((a, b) => (a.timestamp_mark || 0) - (b.timestamp_mark || 0))
                .map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded">
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: comment.color_code || '#06b6d4' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {formatTimestamp(comment.timestamp_mark!)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {comment.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WaveformWithComments;