import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Reply, Trash2, CheckCircle, Circle } from 'lucide-react';
import { useTrackComments } from '@/hooks/useTrackComments';

interface Comment {
  id: string;
  content: string;
  timestamp_mark: number | null;
  type: 'general' | 'cue_point' | 'beatmatch' | 'transition';
  color_code: string;
  created_at: string;
  parent_id?: string;
  is_resolved: boolean;
}

interface CommentsPanelProps {
  trackId: string;
  className?: string;
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({
  trackId,
  className = ""
}) => {
  const { comments, loading, addComment, updateComment, deleteComment } = useTrackComments(trackId);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<Comment['type']>('general');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [filter, setFilter] = useState<'all' | 'temporal' | 'general'>('all');

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await addComment(newComment, null, commentType);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    
    try {
      await addComment(replyContent, undefined, 'general', parentId);
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const toggleResolved = async (commentId: string, currentStatus: boolean) => {
    try {
      await updateComment(commentId, { is_resolved: !currentStatus });
    } catch (error) {
      console.error('Error toggling resolved status:', error);
    }
  };

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredComments = comments.filter(comment => {
    if (filter === 'temporal') return comment.timestamp_mark !== null;
    if (filter === 'general') return comment.timestamp_mark === null;
    return true;
  }).filter(comment => !comment.parent_id); // Only show top-level comments

  const getReplies = (commentId: string) => {
    return comments.filter(comment => comment.parent_id === commentId);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'general': 'bg-blue-500',
      'cue_point': 'bg-emerald-500',
      'beatmatch': 'bg-amber-500',
      'transition': 'bg-violet-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments ({comments.length})
        </h3>
        <Select value={filter} onValueChange={(value: typeof filter) => setFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Comments</SelectItem>
            <SelectItem value="temporal">Temporal Only</SelectItem>
            <SelectItem value="general">General Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Add new comment */}
      <Card>
        <CardContent className="p-4 space-y-3">
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
          <Textarea
            placeholder="Add a general comment about this track..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-20"
          />
          <Button onClick={handleAddComment} disabled={!newComment.trim()}>
            Add Comment
          </Button>
        </CardContent>
      </Card>

      {/* Comments list */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {filter === 'temporal' 
                ? 'No temporal comments yet. Click on the waveform to add one.'
                : 'No comments yet. Add the first one above.'}
            </p>
          </div>
        ) : (
          filteredComments
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((comment) => {
              const replies = getReplies(comment.id);
              
              return (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    {/* Comment header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {comment.timestamp_mark !== null && (
                          <Badge variant="outline" className="text-xs">
                            {formatTimestamp(comment.timestamp_mark)}
                          </Badge>
                        )}
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                          style={{ backgroundColor: comment.color_code || '#06b6d4', color: 'white' }}
                        >
                          {comment.type.replace('_', ' ')}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleResolved(comment.id, comment.is_resolved)}
                          className="p-1 h-auto"
                        >
                          {comment.is_resolved ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground hover:text-green-500" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteComment(comment.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Comment content */}
                    <p className="text-sm mb-3">{comment.content}</p>

                    {/* Comment actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      >
                        <Reply className="w-4 h-4 mr-1" />
                        Reply
                      </Button>
                      {replies.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                        </span>
                      )}
                    </div>

                    {/* Reply form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 p-3 bg-muted/50 rounded space-y-2">
                        <Input
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleReply(comment.id);
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleReply(comment.id)} disabled={!replyContent.trim()}>
                            Reply
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {replies.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {replies.map((reply) => (
                          <div key={reply.id} className="p-3 bg-muted/30 rounded border-l-2 border-primary/20">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(reply.created_at)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteComment(reply.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="text-sm">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
        )}
      </div>
    </div>
  );
};

export default CommentsPanel;