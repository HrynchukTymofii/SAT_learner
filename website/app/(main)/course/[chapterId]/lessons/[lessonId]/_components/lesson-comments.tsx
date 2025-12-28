"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send, Reply, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    name: string | null
    image: string | null
  }
  replies: Comment[]
}

interface LessonCommentsProps {
  lessonId: string
  userId: string | null
}

export const LessonComments = ({ lessonId, userId }: LessonCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`/api/user/course/lesson/${lessonId}/comments`)
        setComments(response.data)
      } catch (error) {
        console.error("Error fetching comments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [lessonId])

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !userId) return

    setIsSubmitting(true)
    try {
      const response = await axios.post(`/api/user/course/lesson/${lessonId}/comments`, {
        content: newComment.trim(),
      })
      setComments([response.data, ...comments])
      setNewComment("")
      toast.success("Comment posted!")
    } catch (error) {
      console.error("Error posting comment:", error)
      toast.error("Failed to post comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !userId) return

    setIsSubmitting(true)
    try {
      const response = await axios.post(`/api/user/course/lesson/${lessonId}/comments`, {
        content: replyContent.trim(),
        parentId,
      })

      // Add reply to the parent comment
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...comment.replies, response.data]
          }
        }
        return comment
      }))

      setReplyContent("")
      setReplyingTo(null)
      setExpandedReplies(prev => new Set(prev).add(parentId))
      toast.success("Reply posted!")
    } catch (error) {
      console.error("Error posting reply:", error)
      toast.error("Failed to post reply")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return "recently"
    }
  }

  return (
    <Card className="mt-8 border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5" />
          Discussion ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        {userId ? (
          <div className="space-y-3">
            <Textarea
              placeholder="Ask a question or share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Post Comment
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">
              Please log in to join the discussion
            </p>
          </div>
        )}

        {/* Comments List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to ask a question!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* Main Comment */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={comment.author.image || ""} />
                      <AvatarFallback className="bg-blue-500 text-white text-sm">
                        {comment.author.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.author.name || "Anonymous"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>

                      {/* Comment Actions */}
                      <div className="flex items-center gap-4 mt-3">
                        {userId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          >
                            <Reply className="w-4 h-4 mr-1" />
                            Reply
                          </Button>
                        )}
                        {comment.replies.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                            onClick={() => toggleReplies(comment.id)}
                          >
                            {expandedReplies.has(comment.id) ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                Hide Replies
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                {comment.replies.length} {comment.replies.length === 1 ? "Reply" : "Replies"}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="ml-11 space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[80px] resize-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyContent("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={!replyContent.trim() || isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Reply"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {expandedReplies.has(comment.id) && comment.replies.length > 0 && (
                  <div className="ml-11 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-muted/20 rounded-lg p-3 border-l-2 border-blue-200">
                        <div className="flex gap-3">
                          <Avatar className="h-7 w-7 flex-shrink-0">
                            <AvatarImage src={reply.author.image || ""} />
                            <AvatarFallback className="bg-green-500 text-white text-xs">
                              {reply.author.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {reply.author.name || "Anonymous"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
