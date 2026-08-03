import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Node } from "@tiptap/core";
import { useEffect, useRef, useState } from "react";
import { Bold, Italic, List, ListOrdered, Strikethrough, Undo, Redo, Underline as UnderlineIcon, Heading3, Heading4, Pilcrow, Quote, AlignLeft, AlignCenter, AlignRight, Eraser, Link as LinkIcon, Unlink, Image as ImageIcon, Video, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImage } from "@/lib/imageOptimizer";

const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
      playsinline: { default: true },
    };
  },
  parseHTML() {
    return [{ tag: "video" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["video", { ...HTMLAttributes, controls: "", playsInline: "", preload: "metadata" }];
  },
});

type Props = {
  value: string;
  onChange: (html: string) => void;
  onBlur?: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  invalid?: boolean;
};

export const RichEditor = ({ value, onChange, onBlur, placeholder, minHeight = 100, invalid }: Props) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [3, 4] } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      VideoNode,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none px-3 py-2",
          "prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-headings:font-serif",
          "prose-img:my-3 prose-img:max-h-80 prose-img:rounded-md prose-video:my-3 prose-video:max-h-80 prose-video:w-full prose-video:rounded-md",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-3",
          "[&_p:empty]:before:content-[attr(data-placeholder)]"
        ),
        style: `min-height:${minHeight}px`,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onBlur: ({ editor }) => onBlur?.(sanitizeHtml(editor.getHTML())),
  });

  // Sync external changes (e.g., load from DB)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) editor.commands.setContent(value || "", false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const setAlignment = (textAlign: "left" | "center" | "right") => {
    editor.chain().focus().setTextAlign(textAlign).run();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien", previousUrl || "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const uploadMedia = async (file: File, type: "image" | "video") => {
    if (!editor) return;
    setUploading(type);
    const payload = type === "image"
      ? await optimizeImage(file, { maxEdge: 1920, quality: 0.84, sharpen: 0.45 })
      : file;
    const ext = payload.name.split(".").pop() || (type === "image" ? "jpg" : "mp4");
    const path = `${type}s/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("editor-media").upload(path, payload, { contentType: payload.type, upsert: false });
    setUploading(null);
    if (error) {
      window.alert("Impossible d’uploader le fichier.");
      return;
    }
    const { data } = supabase.storage.from("editor-media").getPublicUrl(path);
    if (type === "image") {
      editor.chain().focus().setImage({ src: data.publicUrl, alt: file.name }).run();
      return;
    }
    editor.chain().focus().insertContent({ type: "video", attrs: { src: data.publicUrl } }).run();
  };

  const Btn = ({
    onClick,
    active,
    children,
    label,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    label: string;
  }) => (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "p-1.5 rounded hover:bg-secondary transition-colors",
        active && "bg-secondary text-accent"
      )}
    >
      {children}
    </button>
  );

  return (
    <div
      className={cn(
        "border rounded-md bg-background transition-colors",
        invalid ? "border-destructive ring-1 ring-destructive/30" : "border-input",
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-1.5 py-1">
        <Btn label="Paragraphe" onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")}>
          <Pilcrow className="h-3.5 w-3.5" />
        </Btn>
        <Btn label="Titre 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
          <Heading3 className="h-3.5 w-3.5" />
        </Btn>
        <Btn label="Titre 4" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive("heading", { level: 4 })}>
          <Heading4 className="h-3.5 w-3.5" />
        </Btn>
        <span className="w-px h-4 bg-border mx-1" />
        <Btn label="Gras" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold className="h-3.5 w-3.5" />
        </Btn>
        <Btn label="Italique" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic className="h-3.5 w-3.5" />
        </Btn>
        <Btn label="Souligné" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
          <UnderlineIcon className="h-3.5 w-3.5" />
        </Btn>
        <Btn label="Barré" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
          <Strikethrough className="h-3.5 w-3.5" />
        </Btn>
        <span className="w-px h-4 bg-border mx-1" />
        <Btn label="Liste" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <List className="h-3.5 w-3.5" />
        </Btn>
        <Btn label="Liste numérotée" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrdered className="h-3.5 w-3.5" />
        </Btn>
        <span className="w-px h-4 bg-border mx-1" />
        <Btn label="Citation" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          <Quote className="h-3.5 w-3.5" />
        </Btn>
        <Btn label="Aligner à gauche" onClick={() => setAlignment("left")}>
          <AlignLeft className="h-3.5 w-3.5" />
        </Btn>
        <Btn label="Centrer" onClick={() => setAlignment("center")} active={editor.isActive({ textAlign: "center" })}>
          <AlignCenter className="h-3.5 w-3.5" />
        </Btn>
        <Btn label="Aligner à droite" onClick={() => setAlignment("right")} active={editor.isActive({ textAlign: "right" })}>
          <AlignRight className="h-3.5 w-3.5" />
        </Btn>
        <span className="w-px h-4 bg-border mx-1" />
        <Btn label="Ajouter un lien" onClick={setLink} active={editor.isActive("link")}>
          <LinkIcon className="h-3.5 w-3.5" />
        </Btn>
        <Btn label="Retirer le lien" onClick={() => editor.chain().focus().unsetLink().run()}>
          <Unlink className="h-3.5 w-3.5" />
        </Btn>
        <Btn label="Ajouter une image" onClick={() => imageInputRef.current?.click()}>
          {uploading === "image" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
        </Btn>
        <Btn label="Ajouter une vidéo" onClick={() => videoInputRef.current?.click()}>
          {uploading === "video" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
        </Btn>
        <span className="w-px h-4 bg-border mx-1" />
        <Btn label="Effacer la mise en forme" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <Eraser className="h-3.5 w-3.5" />
        </Btn>
        <span className="w-px h-4 bg-border mx-1" />
        <Btn label="Annuler" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-3.5 w-3.5" />
        </Btn>
        <Btn label="Rétablir" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-3.5 w-3.5" />
        </Btn>
        {placeholder && editor.isEmpty && (
          <span className="ml-2 text-xs text-muted-foreground italic">{placeholder}</span>
        )}
      </div>
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) void uploadMedia(file, "image");
        event.target.value = "";
      }} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) void uploadMedia(file, "video");
        event.target.value = "";
      }} />
      <EditorContent editor={editor} />
    </div>
  );
};
