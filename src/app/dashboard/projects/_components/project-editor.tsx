"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { UploadButton } from "~/lib/uploadthing";

interface ProjectEditorProps {
  projectId?: string;
}

interface SectionDraft {
  id?: string;
  tempId: string;
  heading: string;
  content: string;
  order: number;
  dirty: boolean;
  removed?: boolean;
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

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function ProjectEditor({ projectId }: ProjectEditorProps) {
  const router = useRouter();
  const isNew = !projectId;

  const { data: project } = api.project.getByIdAdmin.useQuery(
    { id: projectId ?? "" },
    { enabled: !!projectId },
  );

  const createProject = api.project.create.useMutation();
  const updateProject = api.project.update.useMutation();
  const deleteProject = api.project.delete.useMutation({
    onSuccess: () => router.push("/dashboard/projects"),
  });
  const createSection = api.project.createSection.useMutation();
  const updateSection = api.project.updateSection.useMutation();
  const deleteSectionApi = api.project.deleteSection.useMutation();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [lede, setLede] = useState("");
  const [desc, setDesc] = useState("");
  const [label, setLabel] = useState("");
  const [meta, setMeta] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [status, setStatus] = useState("In production");
  const [role, setRole] = useState("Full-stack");
  const [category, setCategory] = useState("General");
  const [stack, setStack] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [liveUrl, setLiveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [published, setPublished] = useState(false);
  const [sections, setSections] = useState<SectionDraft[]>([]);

  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const titleRef = useAutoResize();
  const ledeRef = useAutoResize();
  const descRef = useAutoResize();
  const slugTouched = useRef(false);

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setSlug(project.slug);
      slugTouched.current = true;
      setLede(project.lede);
      setDesc(project.desc);
      setLabel(project.label);
      setMeta(project.meta);
      setYear(project.year);
      setStatus(project.status);
      setRole(project.role);
      setCategory(project.category);
      setStack((project.stack as unknown as string[]).join(", "));
      setTags((project.tags as unknown as string[]).join(", "));
      setImage(project.image ?? null);
      setLiveUrl(project.liveUrl ?? "");
      setGithubUrl(project.githubUrl ?? "");
      setOrder(project.order);
      setPublished(project.published);
      setSections(
        project.sections.map((s, i) => ({
          id: s.id,
          tempId: s.id,
          heading: s.heading,
          content: s.content,
          order: s.order ?? i,
          dirty: false,
        })),
      );
    }
  }, [project]);

  useEffect(() => {
    titleRef.resize();
    ledeRef.resize();
    descRef.resize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, lede, desc]);

  const markDirty = () => setSaved(false);

  useEffect(() => {
    if (!slugTouched.current && title) {
      setSlug(slugify(title));
    }
  }, [title]);

  const buildPayload = () => ({
    slug: slug || slugify(title),
    title,
    lede,
    desc,
    label: label || `screenshot — ${(title || "project").toLowerCase()}`,
    meta: meta || `${year} · ${category}`,
    year,
    status,
    role,
    category,
    stack: stack.split(",").map((s) => s.trim()).filter(Boolean),
    tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
    image,
    liveUrl: liveUrl.trim() || null,
    githubUrl: githubUrl.trim() || null,
    order,
  });

  const syncSections = async (pid: string) => {
    for (const s of sections) {
      if (s.removed && s.id) {
        await deleteSectionApi.mutateAsync({ id: s.id });
        continue;
      }
      if (s.removed) continue;
      if (!s.heading.trim() && !s.content.trim()) continue;
      if (!s.id) {
        await createSection.mutateAsync({
          projectId: pid,
          heading: s.heading || "Untitled",
          content: s.content || " ",
          order: s.order,
        });
      } else if (s.dirty) {
        await updateSection.mutateAsync({
          id: s.id,
          heading: s.heading,
          content: s.content,
          order: s.order,
        });
      }
    }
  };

  const handleSave = useCallback(
    async (opts?: { publish?: boolean; silent?: boolean }) => {
      if (!title.trim()) {
        if (!opts?.silent) setError("Title is required before saving.");
        return;
      }
      setSaving(true);
      if (!opts?.silent) setError(null);
      const wantPublished = opts?.publish ? true : published;

      try {
        if (isNew) {
          const created = await createProject.mutateAsync({
            ...buildPayload(),
            published: wantPublished,
          });
          await syncSections(created.id);
          setPublished(wantPublished);
          setSaved(true);
          router.push(`/dashboard/projects/edit/${created.id}`);
          return;
        }

        await updateProject.mutateAsync({
          id: projectId,
          ...buildPayload(),
          published: wantPublished,
        });
        await syncSections(projectId);
        setPublished(wantPublished);
        setSections((prev) =>
          prev.filter((s) => !s.removed).map((s) => ({ ...s, dirty: false })),
        );
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      } finally {
        setSaving(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      title, slug, lede, desc, label, meta, year, status, role, category,
      stack, tags, image, liveUrl, githubUrl, order, published, sections, projectId, isNew,
    ],
  );

  // Cmd/Ctrl+S to save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave]);

  const updateSectionField = (
    tempId: string,
    field: "heading" | "content" | "order",
    value: string | number,
  ) => {
    setSections((prev) =>
      prev.map((s) =>
        s.tempId === tempId ? { ...s, [field]: value, dirty: true } : s,
      ),
    );
    markDirty();
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        tempId: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        heading: "",
        content: "",
        order: prev.filter((s) => !s.removed).length,
        dirty: true,
      },
    ]);
    markDirty();
  };

  const removeSection = (tempId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.tempId === tempId ? { ...s, removed: true } : s)),
    );
    markDirty();
  };

  const visibleSections = sections.filter((s) => !s.removed);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "calc(100vh - 72px)",
        margin: "-36px -32px -56px",
        background: "var(--bg)",
      }}
    >
      {/* Canvas — full width */}
      <main
        style={{
          padding: "64px clamp(24px, 6vw, 96px) 120px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Tiny breadcrumb */}
        <div
          className="flex items-center justify-between"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "11px",
            color: "var(--dim)",
            letterSpacing: "0.06em",
            marginBottom: "28px",
          }}
        >
          <Link
            href="/dashboard/projects"
            style={{ color: "var(--dim)", textDecoration: "none" }}
            className="transition-colors hover:text-[var(--fg-2)]"
          >
            ← projects
          </Link>
          <div className="flex items-center gap-3">
            <span style={{ color: "var(--dim)" }}>
              /projects/{slug || "draft"}
            </span>
            <span
              style={{
                color: saving
                  ? "#d4a853"
                  : saved
                    ? "var(--dim)"
                    : "#d4a853",
              }}
            >
              {saving
                ? "saving…"
                : saved
                  ? "saved"
                  : "● unsaved (⌘S)"}
            </span>
          </div>
        </div>

        <textarea
          ref={titleRef.ref}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            markDirty();
            titleRef.resize();
          }}
          placeholder="Untitled project"
          rows={1}
          style={{
            width: "100%",
            background: "transparent",
            border: 0,
            outline: "none",
            color: "var(--fg)",
            fontSize: "44px",
            fontWeight: 500,
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
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
          placeholder="One-sentence lede."
          rows={1}
          style={{
            width: "100%",
            background: "transparent",
            border: 0,
            outline: "none",
            color: "var(--fg-2)",
            fontSize: "20px",
            lineHeight: 1.45,
            resize: "none",
            fontFamily: "var(--sans)",
            padding: 0,
            marginBottom: "12px",
          }}
        />

        <textarea
          ref={descRef.ref}
          value={desc}
          onChange={(e) => {
            setDesc(e.target.value);
            markDirty();
            descRef.resize();
          }}
          placeholder="Card description — what people see in the projects list."
          rows={2}
          style={{
            width: "100%",
            background: "transparent",
            border: 0,
            outline: "none",
            color: "var(--muted)",
            fontSize: "15px",
            lineHeight: 1.6,
            resize: "none",
            fontFamily: "var(--sans)",
            padding: 0,
            marginBottom: "48px",
          }}
        />

        {/* Sections — paste markdown */}
        {visibleSections.map((s) => (
          <div key={s.tempId} style={{ marginBottom: "48px" }}>
            <div
              className="flex items-center gap-3"
              style={{ marginBottom: "12px" }}
            >
              <input
                type="text"
                value={s.heading}
                onChange={(e) =>
                  updateSectionField(s.tempId, "heading", e.target.value)
                }
                placeholder="## Section heading"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: 0,
                  outline: "none",
                  color: "var(--fg)",
                  fontSize: "26px",
                  fontWeight: 500,
                  letterSpacing: "-0.015em",
                  lineHeight: 1.3,
                  fontFamily: "var(--sans)",
                  padding: 0,
                }}
              />
              <button
                type="button"
                onClick={() => removeSection(s.tempId)}
                title="Remove section"
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  background: "transparent",
                  border: 0,
                  color: "var(--dim)",
                  cursor: "pointer",
                  opacity: 0.5,
                }}
                className="transition-opacity hover:opacity-100"
              >
                ✕
              </button>
            </div>
            <textarea
              value={s.content}
              onChange={(e) =>
                updateSectionField(s.tempId, "content", e.target.value)
              }
              placeholder="Write or paste markdown here…

# Headings work
**bold**, *italic*, `code`, [links](https://example.com)

- bullet
- lists

```js
fenced code blocks
```"
              rows={Math.max(6, s.content.split("\n").length)}
              style={{
                width: "100%",
                background: "transparent",
                border: 0,
                outline: "none",
                color: "var(--fg-2)",
                fontSize: "16px",
                lineHeight: 1.75,
                resize: "none",
                fontFamily: "var(--sans)",
                padding: 0,
              }}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addSection}
          style={{
            fontFamily: "var(--mono)",
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: "transparent",
            border: "1px dashed rgba(255,255,255,0.12)",
            color: "var(--muted)",
            padding: "10px 16px",
            cursor: "pointer",
            marginTop: "8px",
          }}
          className="transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          + Add section
        </button>
      </main>

      {/* Floating sidebar toggle + save */}
      <div
        style={{
          position: "fixed",
          right: "24px",
          bottom: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          zIndex: 20,
        }}
      >
        <button
          type="button"
          onClick={() => handleSave({ publish: true })}
          disabled={saving}
          title="Save & publish (⌘S to save draft)"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: "var(--accent)",
            border: "1px solid var(--accent)",
            color: "#0d1410",
            fontWeight: 500,
            padding: "11px 18px",
            cursor: saving ? "wait" : "pointer",
            opacity: saving ? 0.6 : 1,
            boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
          }}
        >
          {saving ? "…" : published ? "Update" : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          title="Toggle metadata panel"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: "var(--bg-2)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--fg-2)",
            padding: "9px 14px",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
          }}
          className="transition-colors hover:border-[var(--fg-2)]"
        >
          {sidebarOpen ? "Close ✕" : "Meta ⌥"}
        </button>
      </div>

      {/* Error toast */}
      {error && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            top: "24px",
            transform: "translateX(-50%)",
            padding: "10px 16px",
            border: "1px solid rgba(255,138,138,0.35)",
            background: "rgba(40,12,12,0.95)",
            backdropFilter: "blur(8px)",
            fontFamily: "var(--mono)",
            fontSize: "11px",
            color: "#ff8a8a",
            display: "flex",
            gap: "12px",
            alignItems: "center",
            zIndex: 40,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <span>⚠ {error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              background: "none",
              border: 0,
              color: "#ff8a8a",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Metadata side panel */}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 30,
            }}
          />
          <aside
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100vh",
              width: "min(360px, 92vw)",
              background: "var(--bg-2)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              overflowY: "auto",
              padding: "32px 28px",
              zIndex: 35,
              boxShadow: "-8px 0 24px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: "24px" }}
            >
              <h3
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  color: "var(--muted)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Metadata
              </h3>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: "none",
                  border: 0,
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontFamily: "var(--mono)",
                  fontSize: "12px",
                }}
              >
                ✕
              </button>
            </div>

            <Block title="Cover image">
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
                    style={removeBtnStyle}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <UploadButton
                  endpoint="projectImage"
                  onClientUploadComplete={(res) => {
                    const url = res?.[0]?.url;
                    if (url) {
                      setImage(url);
                      markDirty();
                    }
                  }}
                  onUploadError={(err) =>
                    setError(`Upload failed: ${err.message}`)
                  }
                />
              )}
            </Block>

            <Block title="Visibility">
              <div className="flex items-center justify-between">
                <span style={{ fontSize: "13px", color: "var(--fg-2)" }}>
                  Published
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPublished(!published);
                    markDirty();
                  }}
                  style={{
                    width: "32px",
                    height: "18px",
                    borderRadius: "9px",
                    border: 0,
                    background: published
                      ? "var(--accent)"
                      : "rgba(255,255,255,0.12)",
                    cursor: "pointer",
                    position: "relative",
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
            </Block>

            <Block title="Identification">
              <Field label="Slug">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    slugTouched.current = true;
                    setSlug(e.target.value);
                    markDirty();
                  }}
                  style={fieldInputStyle}
                />
              </Field>
              <Field label="Year">
                <input
                  type="text"
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    markDirty();
                  }}
                  style={fieldInputStyle}
                />
              </Field>
              <Field label="Category">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    markDirty();
                  }}
                  style={fieldInputStyle}
                />
              </Field>
              <Field label="Status">
                <input
                  type="text"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    markDirty();
                  }}
                  style={fieldInputStyle}
                />
              </Field>
              <Field label="Role">
                <input
                  type="text"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    markDirty();
                  }}
                  style={fieldInputStyle}
                />
              </Field>
              <Field label="Order">
                <input
                  type="number"
                  value={order}
                  onChange={(e) => {
                    setOrder(parseInt(e.target.value, 10) || 0);
                    markDirty();
                  }}
                  style={fieldInputStyle}
                />
              </Field>
            </Block>

            <Block title="Card">
              <Field label="Label">
                <input
                  type="text"
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
                    markDirty();
                  }}
                  placeholder="screenshot — dashboard"
                  style={fieldInputStyle}
                />
              </Field>
              <Field label="Meta">
                <input
                  type="text"
                  value={meta}
                  onChange={(e) => {
                    setMeta(e.target.value);
                    markDirty();
                  }}
                  placeholder={`${year} · ${category}`}
                  style={fieldInputStyle}
                />
              </Field>
            </Block>

            <Block title="Taxonomy">
              <Field label="Stack (comma)">
                <input
                  type="text"
                  value={stack}
                  onChange={(e) => {
                    setStack(e.target.value);
                    markDirty();
                  }}
                  placeholder="React, Node"
                  style={fieldInputStyle}
                />
              </Field>
              <Field label="Tags (comma)">
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => {
                    setTags(e.target.value);
                    markDirty();
                  }}
                  style={fieldInputStyle}
                />
              </Field>
            </Block>

            <Block title="Links">
              <Field label="Live URL">
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => {
                    setLiveUrl(e.target.value);
                    markDirty();
                  }}
                  placeholder="https://example.com"
                  style={fieldInputStyle}
                />
              </Field>
              <Field label="GitHub repo">
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => {
                    setGithubUrl(e.target.value);
                    markDirty();
                  }}
                  placeholder="https://github.com/you/repo"
                  style={fieldInputStyle}
                />
              </Field>
            </Block>

            {!isNew && (
              <Block title="Danger">
                {confirmDelete ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={deleteProject.isPending}
                      onClick={() => deleteProject.mutate({ id: projectId })}
                      style={{
                        flex: 1,
                        fontFamily: "var(--mono)",
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        background: "rgba(255,138,138,0.08)",
                        border: "1px solid rgba(255,138,138,0.45)",
                        color: "#ff8a8a",
                        padding: "9px 14px",
                        cursor: deleteProject.isPending ? "wait" : "pointer",
                      }}
                    >
                      {deleteProject.isPending ? "Deleting…" : "Confirm"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      style={removeBtnStyle}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    style={{
                      width: "100%",
                      fontFamily: "var(--mono)",
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      background: "transparent",
                      border: "1px solid rgba(201,122,114,0.35)",
                      color: "#c97a72",
                      padding: "9px 14px",
                      cursor: "pointer",
                    }}
                  >
                    Delete project
                  </button>
                )}
              </Block>
            )}
          </aside>
        </>
      )}
    </div>
  );
}

const fieldInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "var(--bg)",
  color: "var(--fg)",
  fontSize: "13px",
  outline: "none",
  fontFamily: "var(--sans)",
};

const removeBtnStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: "11px",
  letterSpacing: "0.08em",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "var(--muted)",
  padding: "9px 14px",
  cursor: "pointer",
};

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "28px" }}>
      <h4
        style={{
          fontFamily: "var(--mono)",
          fontSize: "10px",
          color: "var(--dim)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        {title}
      </h4>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          color: "var(--muted)",
          marginBottom: "4px",
          fontFamily: "var(--mono)",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
