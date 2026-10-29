"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Send, ChevronDown, Loader2 } from "lucide-react"
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
  const [isOpen, setIsOpen] = useState(false)

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

  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0)

  // Collapsed into one row by default: the lesson is the point of the page
  return (
    <section className="rounded-[28px] border bg-card">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 rounded-[28px] px-5 py-4 text-left transition-colors hover:bg-accent/60"
      >
        <MessageCircle className="size-5 shrink-0 text-muted-foreground" />
        <span className="flex-1 font-bold">Questions about this lesson</span>
        <span className="text-sm font-bold text-muted-foreground">{isLoading ? "…" : total === 0 ? "None yet" : `${total} ${total === 1 ? "comment" : "comments"}`}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="grid gap-4 px-5 pb-5">
          {userId && (
            <Composer
              value={newComment}
              onChange={setNewComment}
              onSubmit={handleSubmitComment}
              busy={isSubmitting}
              placeholder="Ask a question about this lesson…"
            />
          )}

          {isLoading ? (
            <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
          ) : comments.length === 0 ? (
            <p className="text-center text-sm font-semibold text-muted-foreground">No questions yet. Ask the first one.</p>
          ) : (
            <ul className="grid gap-4">
              {comments.map((comment) => (
                <li key={comment.id} className="grid gap-2">
                  <CommentRow comment={comment} when={formatDate(comment.createdAt)} />
                  <div className="ml-10 flex gap-3 text-xs font-bold text-muted-foreground">
                    {userId && (
                      <button type="button" className="hover:text-foreground" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>
                        Reply
                      </button>
                    )}
                    {comment.replies.length > 0 && (
                      <button type="button" className="hover:text-foreground" onClick={() => toggleReplies(comment.id)}>
                        {expandedReplies.has(comment.id)
                          ? "Hide replies"
                          : `${comment.replies.length} ${comment.replies.length === 1 ? "reply" : "replies"}`}
                      </button>
                    )}
                  </div>
                  {expandedReplies.has(comment.id) && comment.replies.length > 0 && (
                    <ul className="ml-10 grid gap-3 border-l-[1.5px] pl-3">
                      {comment.replies.map((reply) => (
                        <li key={reply.id}>
                          <CommentRow comment={reply} when={formatDate(reply.createdAt)} small />
                        </li>
                      ))}
                    </ul>
                  )}
                  {replyingTo === comment.id && (
                    <div className="ml-10">
                      <Composer
                        value={replyContent}
                        onChange={setReplyContent}
                        onSubmit={() => handleSubmitReply(comment.id)}
                        busy={isSubmitting}
                        placeholder="Write a reply…"
                        autoFocus
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

function CommentRow({ comment, when, small = false }: { comment: Comment; when: string; small?: boolean }) {
  return (
    <div className="flex gap-3">
      <Avatar className={cn("shrink-0", small ? "size-6" : "size-7")}>
        <AvatarImage src={comment.author.image || ""} />
        <AvatarFallback className="bg-lav text-xs font-bold text-on-pastel">{comment.author.name?.charAt(0) || "S"}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-bold">{comment.author.name || "Student"}</span>{" "}
          <span className="text-xs font-semibold text-muted-foreground">{when}</span>
        </p>
        <p className="whitespace-pre-wrap break-words text-sm">{comment.content}</p>
      </div>
    </div>
  )
}

// One-line input that grows with the text; Enter sends, Shift+Enter makes a new line
function Composer({
  value,
  onChange,
  onSubmit,
  busy,
  placeholder,
  autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  busy: boolean
  placeholder: string
  autoFocus?: boolean
}) {
  return (
    <div className="flex items-end gap-2 rounded-[22px] border-[1.5px] bg-background p-1.5 pl-4 focus-within:border-lav-2">
      <textarea
        rows={1}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            onSubmit()
          }
        }}
        className="max-h-40 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm outline-none [field-sizing:content] placeholder:text-muted-foreground"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!value.trim() || busy}
        aria-label="Send"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-background disabled:opacity-40"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
      </button>
    </div>
  )
}
