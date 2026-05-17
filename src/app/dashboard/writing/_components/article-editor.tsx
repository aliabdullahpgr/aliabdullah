"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { UploadButton } from "~/lib/uploadthing";

interface ArticleEditorProps {
  articleId?: string;
}

function useAutoResize() {
  const ref = useRef<HTMLTextAreaElement>(null);
  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);
  return { ref, resize };
}

export default function ArticleEditor({ articleId }: ArticleEditorProps) {
  const router = useRouter();
  const isNew = !articleId;

  const { data: article } = api.article.getById.useQuery(
    { id: articleId ?? "" },
    { enabled: !!articleId },
  );

  const createArticle = api.article.create.useMutation({
    onSuccess: () => router.push("/dashboard/writing"),
  });
  const updateArticle = api.article.update.useMutation({
    onSuccess: () => router.push("/dashboard/writing"),
  });
  const deleteArticle = api.article.delete.useMutation({
    onSuccess: () => router.push("/dashboard/writing"),
  });

  const [title, setTitle] = useState("");
  const [lede, setLede] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]!,
  );
  const [readTime, setReadTime] = useState("");
  const [category, setCategory] = useState("Engineering");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [ogImage, setOgImage] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);

  const titleRef = useAutoResize();
  const ledeRef = useAutoResize();
  const contentRef = useAutoResize();

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setLede(article.lede);
      setContent(article.content);
      setSlug(article.slug);
      setDate(article.date.replace(/ · /g, "-"));
      setReadTime(article.readTime ?? "");
      setCategory(article.category ?? "Engineering");
      setTags(article.tags.join(", "));
      setImage(article.image ?? null);
      setPublished(article.published);
      setOgDescription(article.lede);
    }
  }, [article]);

  useEffect(() => {
    titleRef.resize();
    ledeRef.resize();
    contentRef.resize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, lede, content]);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const calculatedReadTime = Math.max(1, Math.round(wordCount / 220));

  const handleSave = async (opts?: { publish?: boolean }) => {
    setSaving(true);
    const data = {
      slug:
        slug ||
        title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      title,
      lede,
      date: date.replace(/-/g, " · "),
      readTime: readTime || `${calculatedReadTime} min read`,
      category,
      tags: tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      content,
      image,
      published: opts?.publish ? true : published,
    };

    if (isNew) {
      await createArticle.mutateAsync(data);
    } else {
      await updateArticle.mutateAsync({ id: articleId, ...data });
    }
    setSaved(true);
    setSaving(false);
  };

  const handlePublish = () => handleSave({ publish: true });

  const markDirty = () => setSaved(false);

  const dateDisplay = date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 72px)",
        margin: "-36px -32px -56px",
      }}
    >
      {/* Writer bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "var(--bg)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/writing"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.1em",
              textDecoration: "none",
            }}
            className="transition-colors hover:text-[var(--fg)]"
          >
            ← Writing
          </Link>
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: saved ? "var(--accent)" : "#d4a853",
              }}
            />
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                color: "var(--muted)",
                letterSpacing: "0.06em",
              }}
            >
              {saving ? "Saving…" : saved ? "Saved · just now" : "Editing…"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="hidden items-center gap-3 sm:flex"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "10px",
              color: "var(--muted)",
              letterSpacing: "0.06em",
            }}
          >
            <span>
              <b style={{ color: "var(--fg)" }}>{wordCount.toLocaleString()}</b>{" "}
              words
            </span>
            <span>
              <b style={{ color: "var(--fg)" }}>{calculatedReadTime}</b> min
              read
            </span>
          </div>
          <button
            onClick={() => handleSave()}
            className="transition-colors hover:border-[var(--fg-2)] hover:text-[var(--fg)]"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--fg-2)",
              padding: "7px 12px",
              cursor: "pointer",
            }}
          >
            Save draft
          </button>
          <button
            onClick={handlePublish}
            className="transition-colors"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "var(--accent)",
              border: "1px solid var(--accent)",
              color: "#0d1410",
              fontWeight: 500,
              padding: "7px 12px",
              cursor: "pointer",
            }}
          >
            {published ? "Update" : "Publish"}
          </button>
        </div>
      </header>

      {/* Writer body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Canvas */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "36px 48px",
            maxWidth: "760px",
          }}
        >
          <div
            className="flex flex-wrap items-center gap-2"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.06em",
              marginBottom: "20px",
            }}
          >
            <span>{category}</span>
            <span style={{ color: "var(--dim)" }}>·</span>
            <span>{dateDisplay}</span>
            <span style={{ color: "var(--dim)" }}>·</span>
            <span style={{ color: "var(--dim)" }}>
              ali.abdullah.dev/writing/{slug || "draft"}
            </span>
          </div>

          <textarea
            ref={titleRef.ref}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              markDirty();
              titleRef.resize();
            }}
            placeholder="Title"
            rows={1}
            style={{
              width: "100%",
              background: "transparent",
              border: "0",
              outline: "none",
              color: "var(--fg)",
              fontSize: "28px",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              resize: "none",
              fontFamily: "var(--sans)",
              padding: 0,
              marginBottom: "16px",
            }}
          />

          <textarea
            ref={ledeRef.ref}
            value={lede}
            onChange={(e) => {
              setLede(e.target.value);
              markDirty();
              ledeRef.resize();
            }}
            placeholder="Write a short lede…"
            rows={1}
            style={{
              width: "100%",
              background: "transparent",
              border: "0",
              outline: "none",
              color: "var(--fg-2)",
              fontSize: "16px",
              lineHeight: 1.5,
              resize: "none",
              fontFamily: "var(--sans)",
              padding: 0,
              marginBottom: "24px",
            }}
          />

          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.05)",
              marginBottom: "24px",
            }}
          />

          <textarea
            ref={contentRef.ref}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              markDirty();
              contentRef.resize();
            }}
            placeholder="Start writing…"
            rows={12}
            style={{
              width: "100%",
              background: "transparent",
              border: "0",
              outline: "none",
              color: "var(--fg-2)",
              fontSize: "15px",
              lineHeight: 1.65,
              resize: "none",
              fontFamily: "var(--sans)",
              padding: 0,
              marginBottom: "24px",
            }}
          />

          <div className="flex items-center gap-2">
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "13px",
                color: "var(--dim)",
              }}
            >
              #
            </span>
            <input
              type="text"
              value={tags}
              onChange={(e) => {
                setTags(e.target.value);
                markDirty();
              }}
              placeholder="Add tags…"
              style={{
                flex: 1,
                background: "transparent",
                border: "0",
                outline: "none",
                color: "var(--fg-2)",
                fontSize: "13px",
                fontFamily: "var(--sans)",
                padding: 0,
              }}
            />
          </div>
        </main>

        {/* Meta drawer */}
        <aside
          className="hidden lg:block"
          style={{
            width: "280px",
            borderLeft: "1px solid rgba(255,255,255,0.05)",
            background: "var(--bg-2)",
            overflowY: "auto",
            padding: "24px",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <h4
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                color: "var(--muted)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 400,
                marginBottom: "12px",
              }}
            >
              Status
            </h4>
            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                <span style={{ fontSize: "13px", color: "var(--fg-2)" }}>
                  Cover image
                </span>
                {image ? (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt=""
                      style={{
                        width: 96,
                        height: 64,
                        objectFit: "cover",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        markDirty();
                      }}
                      style={{
                        fontSize: "12px",
                        color: "var(--muted)",
                        background: "none",
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "6px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <UploadButton
                    endpoint="articleImage"
                    onClientUploadComplete={(res) => {
                      const url = res?.[0]?.url;
                      if (url) {
                        setImage(url);
                        markDirty();
                      }
                    }}
                    onUploadError={(err) => alert(`Upload failed: ${err.message}`)}
                  />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--fg-2)",
                  }}
                >
                  Stage
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    border: published
                      ? "1px solid rgba(125,211,168,0.35)"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: published ? "var(--accent)" : "var(--muted)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {published && (
                    <span
                      className="h-1 w-1 rounded-full"
                      style={{ background: "var(--accent)" }}
                    />
                  )}
                  {published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: "13px", color: "var(--fg-2)" }}>
                  Visibility
                </span>
                <button
                  onClick={() => {
                    setPublished(!published);
                    markDirty();
                  }}
                  style={{
                    width: "32px",
                    height: "18px",
                    borderRadius: "9px",
                    border: "0",
                    background: published
                      ? "var(--accent)"
                      : "rgba(255,255,255,0.12)",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.15s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: published ? "16px" : "2px",
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      background: "var(--fg)",
                      transition: "left 0.15s",
                    }}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: "13px", color: "var(--fg-2)" }}>
                  Featured
                </span>
                <button
                  onClick={() => {
                    setFeatured(!featured);
                    markDirty();
                  }}
                  style={{
                    width: "32px",
                    height: "18px",
                    borderRadius: "9px",
                    border: "0",
                    background: featured
                      ? "var(--accent)"
                      : "rgba(255,255,255,0.12)",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.15s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: featured ? "16px" : "2px",
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      background: "var(--fg)",
                      transition: "left 0.15s",
                    }}
                  />
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h4
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                color: "var(--muted)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 400,
                marginBottom: "12px",
              }}
            >
              Article
            </h4>
            <div className="space-y-3">
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    markDirty();
                  }}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: "12px",
                    outline: "none",
                    fontFamily: "var(--mono)",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    markDirty();
                  }}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: "12px",
                    outline: "none",
                    fontFamily: "var(--sans)",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    markDirty();
                  }}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: "12px",
                    outline: "none",
                    fontFamily: "var(--sans)",
                  }}
                >
                  <option>Engineering</option>
                  <option>AI</option>
                  <option>Database</option>
                  <option>Career</option>
                  <option>Process</option>
                  <option>Personal</option>
                  <option>Design</option>
                  <option>Notes</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Read time (override)
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => {
                    setReadTime(e.target.value);
                    markDirty();
                  }}
                  placeholder="Auto-calculated"
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: "12px",
                    outline: "none",
                    fontFamily: "var(--sans)",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h4
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                color: "var(--muted)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 400,
                marginBottom: "12px",
              }}
            >
              Social card
            </h4>
            <div className="space-y-3">
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  OG image URL
                </label>
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => {
                    setOgImage(e.target.value);
                    markDirty();
                  }}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: "12px",
                    outline: "none",
                    fontFamily: "var(--mono)",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Description
                </label>
                <textarea
                  value={ogDescription}
                  onChange={(e) => {
                    setOgDescription(e.target.value);
                    markDirty();
                  }}
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: "12px",
                    lineHeight: 1.5,
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "var(--sans)",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h4
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                color: "var(--muted)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 400,
                marginBottom: "12px",
              }}
            >
              Stats
            </h4>
            <div className="space-y-2">
              {[
                { label: "Words", value: wordCount.toLocaleString() },
                { label: "Characters", value: charCount.toLocaleString() },
                { label: "Reading time", value: `${calculatedReadTime} min` },
                {
                  label: "Created",
                  value: article
                    ? new Date(article.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : dateDisplay || "—",
                },
                { label: "Updated", value: saved ? "just now" : "editing…" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between"
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--fg-2)",
                    }}
                  >
                    {stat.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "11px",
                      color: "var(--muted)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {!isNew && (
            <div>
              <button
                onClick={() => {
                  if (confirm("Delete this article? This cannot be undone.")) {
                    deleteArticle.mutate({ id: articleId });
                  }
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "transparent",
                  border: "1px solid rgba(201,122,114,0.35)",
                  color: "#c97a72",
                  fontWeight: 500,
                  padding: "9px 14px",
                  cursor: "pointer",
                }}
              >
                Delete article
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
