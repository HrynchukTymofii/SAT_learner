"use client"

import * as React from "react"
import katex from "katex"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import type { Node as PMNode } from "@tiptap/pm/model"

// --- Tiptap extensions (same set as ReadOnlyEditor, so what you write is what students see) ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem } from "@tiptap/extension-task-item"
import { TaskList } from "@tiptap/extension-task-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Underline } from "@tiptap/extension-underline"
import { Link } from "@tiptap/extension-link"
import Youtube from "@tiptap/extension-youtube"
import Mathematics from "@tiptap/extension-mathematics"
import { TextStyleKit } from "@tiptap/extension-text-style"
import { Selection } from "@/components/tiptap-extension/selection-extension"
import { TrailingNode } from "@/components/tiptap-extension/trailing-node-extension"
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Toolbar UI ---
import { Button as TButton } from "@/components/tiptap-ui-primitive/button"
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/components/tiptap-ui-primitive/toolbar"
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockQuoteButton } from "@/components/tiptap-ui/blockquote-button"
import { ColorHighlightPopover } from "@/components/tiptap-ui/color-highlight-popover"
import { LinkPopover } from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"
import "@/components/tiptap-templates/simple/simple-editor.scss"

import { Youtube as YoutubeIcon, Sigma, SquareSigma } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"
import { cn } from "@/lib/utils"

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] }

/** Stored content is Tiptap JSON as a string; old rows can be plain text or HTML. */
function parseContent(value: string | null | undefined) {
  if (!value) return EMPTY_DOC
  try {
    const json = JSON.parse(value)
    if (json && json.type === "doc") return json
  } catch {}
  return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: value.replace(/<[^>]*>/g, "") }] }] }
}

/** True when the editor has no text, image, math or video in it. */
export function isEmptyContent(value: string | null | undefined) {
  if (!value) return true
  const doc = parseContent(value)
  const walk = (n: { type?: string; text?: string; content?: unknown[] }): boolean =>
    (n.type === "text" && !!n.text?.trim()) ||
    ["image", "youtube", "inlineMath", "blockMath"].includes(n.type || "") ||
    (Array.isArray(n.content) && n.content.some((c) => walk(c as typeof n)))
  return !walk(doc)
}

type MathTarget = { mode: "inline" | "block"; pos?: number; latex: string }

export function RichEditor({
  value,
  onChange,
  compact = false,
  placeholder,
  className,
}: {
  value: string | null | undefined
  onChange: (json: string) => void
  /** Smaller editor for hints and explanations */
  compact?: boolean
  placeholder?: string
  className?: string
}) {
  const [math, setMath] = React.useState<MathTarget | null>(null)
  const [youtubeOpen, setYoutubeOpen] = React.useState(false)
  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": placeholder || "Content editor",
        class: cn(
          "focus:outline-none prose dark:prose-invert max-w-none px-5 py-4",
          compact ? "min-h-[140px] prose-base" : "min-h-[50vh] prose-lg",
        ),
      },
    },
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      Mathematics.configure({
        katexOptions: { maxSize: 300, throwOnError: false },
        // Click a formula to edit it
        inlineOptions: { onClick: (node: PMNode, pos: number) => setMath({ mode: "inline", pos, latex: node.attrs.latex }) },
        blockOptions: { onClick: (node: PMNode, pos: number) => setMath({ mode: "block", pos, latex: node.attrs.latex }) },
      }),
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 1,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      TrailingNode,
      Link.configure({ openOnClick: false }),
      Youtube.configure({ nocookie: true, height: 360 }),
      TextStyleKit,
    ],
    content: parseContent(value),
    onUpdate: ({ editor }) => onChangeRef.current(JSON.stringify(editor.getJSON())),
  })

  const saveMath = (latex: string) => {
    if (!editor || !math) return
    const chain = editor.chain().focus()
    if (math.pos !== undefined) {
      if (!latex.trim()) chain.deleteRange({ from: math.pos, to: math.pos + 1 }).run()
      else if (math.mode === "inline") chain.updateInlineMath({ latex, pos: math.pos }).run()
      else chain.updateBlockMath({ latex, pos: math.pos }).run()
    } else if (latex.trim()) {
      if (math.mode === "inline") chain.insertInlineMath({ latex }).run()
      else chain.insertBlockMath({ latex }).run()
    }
    setMath(null)
  }

  return (
    <div className={cn("bg-background overflow-hidden rounded-2xl border", className)}>
      <EditorContext.Provider value={{ editor }}>
        <Toolbar className="!sticky top-0 z-10 flex-wrap border-b">
          <ToolbarGroup>
            <UndoRedoButton action="undo" />
            <UndoRedoButton action="redo" />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <HeadingDropdownMenu levels={[1, 2, 3]} />
            <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
            <BlockQuoteButton />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="underline" />
            <MarkButton type="strike" />
            <ColorHighlightPopover />
            <LinkPopover />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <MarkButton type="superscript" />
            <MarkButton type="subscript" />
            <TButton type="button" data-style="ghost" tooltip="Formula in the line" onClick={() => setMath({ mode: "inline", latex: "" })}>
              <Sigma className="tiptap-button-icon" />
            </TButton>
            <TButton type="button" data-style="ghost" tooltip="Formula on its own line" onClick={() => setMath({ mode: "block", latex: "" })}>
              <SquareSigma className="tiptap-button-icon" />
            </TButton>
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <TextAlignButton align="left" />
            <TextAlignButton align="center" />
            <TextAlignButton align="right" />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <ImageUploadButton text="Image" />
            {!compact && (
              <TButton type="button" data-style="ghost" tooltip="YouTube video" onClick={() => setYoutubeOpen(true)}>
                <YoutubeIcon className="tiptap-button-icon" />
              </TButton>
            )}
          </ToolbarGroup>
        </Toolbar>

        <div className="content-wrapper">
          <EditorContent editor={editor} role="presentation" className="simple-editor-content" />
        </div>
      </EditorContext.Provider>

      <MathDialog target={math} onClose={() => setMath(null)} onSave={saveMath} />
      <YoutubeDialog
        open={youtubeOpen}
        onClose={() => setYoutubeOpen(false)}
        onSave={(src) => {
          editor?.chain().focus().setYoutubeVideo({ src }).run()
          setYoutubeOpen(false)
        }}
      />
    </div>
  )
}

function MathDialog({ target, onClose, onSave }: { target: MathTarget | null; onClose: () => void; onSave: (latex: string) => void }) {
  const [latex, setLatex] = React.useState("")
  React.useEffect(() => setLatex(target?.latex ?? ""), [target])
  const preview = React.useMemo(() => {
    if (!latex.trim()) return ""
    return katex.renderToString(latex, { throwOnError: false, displayMode: target?.mode === "block" })
  }, [latex, target?.mode])

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{target?.pos !== undefined ? "Edit formula" : "Add formula"}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            onSave(latex)
          }}
        >
          <Input autoFocus value={latex} onChange={(e) => setLatex(e.target.value)} placeholder="\frac{a}{b} + x^2" className="font-mono" />
          <div className="bg-muted min-h-16 overflow-x-auto rounded-xl p-4 text-center" dangerouslySetInnerHTML={{ __html: preview }} />
          <p className="text-muted-foreground text-xs">
            LaTeX: <code>x^2</code>, <code>\frac{"{1}{2}"}</code>, <code>\sqrt{"{x}"}</code>, <code>\pi</code>, <code>\le</code>.
            {target?.pos !== undefined && " Leave it empty to delete the formula."}
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function YoutubeDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (src: string) => void }) {
  const [url, setUrl] = React.useState("")
  React.useEffect(() => { if (open) setUrl("") }, [open])
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Embed a YouTube video</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (url.trim()) onSave(url.trim())
          }}
        >
          <Input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Embed</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
