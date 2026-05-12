"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface ProjectFormData {
  slug: string;
  title: string;
  lede: string;
  label: string;
  meta: string;
  desc: string;
  year: string;
  status: string;
  role: string;
  stack: string;
  category: string;
  tags: string;
  published: boolean;
  order: number;
}

const emptyForm: ProjectFormData = {
  slug: "",
  title: "",
  lede: "",
  label: "",
  meta: "",
  desc: "",
  year: new Date().getFullYear().toString(),
  status: "In production",
  role: "Full-stack",
  stack: "",
  category: "General",
  tags: "",
  published: true,
  order: 0,
};

export default function ProjectsManager() {
  const {
    data: projects,
    isLoading,
    refetch,
  } = api.project.getAllAdmin.useQuery();
  const createProject = api.project.create.useMutation({
    onSuccess: () => refetch(),
  });
  const updateProject = api.project.update.useMutation({
    onSuccess: () => refetch(),
  });
  const deleteProject = api.project.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectFormData>(emptyForm);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };
  const openEdit = (project: NonNullable<typeof projects>[number]) => {
    setForm({
      slug: project.slug,
      title: project.title,
      lede: project.lede,
      label: project.label,
      meta: project.meta,
      desc: project.desc,
      year: project.year,
      status: project.status,
      role: project.role,
      stack: project.stack.join(", "),
      category: project.category,
      tags: project.tags.join(", "),
      published: project.published,
      order: project.order,
    });
    setEditingId(project.id);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const data = {
      ...form,
      stack: form.stack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      tags: form.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (editingId) {
      await updateProject.mutateAsync({ id: editingId, ...data });
    } else {
      await createProject.mutateAsync(data);
    }
    setDialogOpen(false);
  };

  return (
    <div>
      <div
        className="mb-8 flex items-end justify-between gap-6"
        style={{ marginBottom: "32px" }}
      >
        <div>
          <h1
            className="h1"
            style={{
              fontSize: "28px",
              color: "var(--fg)",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              margin: "0 0 6px",
            }}
          >
            Projects
          </h1>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.1em",
            }}
          >
            Manage your portfolio projects
          </div>
        </div>
        <button
          onClick={openCreate}
          className="transition-colors"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--mono)",
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: "var(--accent)",
            border: "1px solid var(--accent)",
            color: "#0d1410",
            fontWeight: 500,
            padding: "9px 14px",
            cursor: "pointer",
          }}
        >
          + New project
        </button>
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.05)",
          background: "var(--bg)",
        }}
      >
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  padding: "13px 18px",
                  textAlign: "left",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  fontFamily: "var(--mono)",
                  fontSize: "10px",
                  color: "var(--muted)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 400,
                  background: "var(--bg-2)",
                }}
              >
                Project
              </th>
              <th
                style={{
                  padding: "13px 18px",
                  textAlign: "left",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  fontFamily: "var(--mono)",
                  fontSize: "10px",
                  color: "var(--muted)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 400,
                  background: "var(--bg-2)",
                }}
              >
                Year
              </th>
              <th
                style={{
                  padding: "13px 18px",
                  textAlign: "left",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  fontFamily: "var(--mono)",
                  fontSize: "10px",
                  color: "var(--muted)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 400,
                  background: "var(--bg-2)",
                }}
              >
                Category
              </th>
              <th
                style={{
                  padding: "13px 18px",
                  textAlign: "left",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  fontFamily: "var(--mono)",
                  fontSize: "10px",
                  color: "var(--muted)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 400,
                  background: "var(--bg-2)",
                }}
              >
                Status
              </th>
              <th
                style={{
                  width: "60px",
                  padding: "13px 18px",
                  textAlign: "left",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  fontFamily: "var(--mono)",
                  fontSize: "10px",
                  color: "var(--muted)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 400,
                  background: "var(--bg-2)",
                }}
              ></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    color: "var(--muted)",
                  }}
                >
                  Loading...
                </td>
              </tr>
            ) : (
              projects?.map((project) => (
                <tr
                  key={project.id}
                  className="transition-colors hover:bg-[var(--bg-2)]"
                >
                  <td
                    style={{
                      padding: "13px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontSize: "13px",
                      color: "var(--fg)",
                      fontWeight: 500,
                      verticalAlign: "middle",
                    }}
                  >
                    {project.title}
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "10px",
                        color: "var(--dim)",
                        letterSpacing: "0.06em",
                        marginTop: "2px",
                      }}
                    >
                      /{project.slug}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontSize: "13px",
                      color: "var(--fg-2)",
                      verticalAlign: "middle",
                    }}
                  >
                    {project.year}
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontSize: "13px",
                      color: "var(--fg-2)",
                      verticalAlign: "middle",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "var(--muted)",
                        display: "inline-flex",
                      }}
                    >
                      {project.category}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontSize: "13px",
                      color: "var(--fg-2)",
                      verticalAlign: "middle",
                    }}
                  >
                    <span
                      className="inline-flex items-center gap-1.5"
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        border: project.published
                          ? "1px solid rgba(125,211,168,0.35)"
                          : "1px solid rgba(255,255,255,0.08)",
                        color: project.published
                          ? "var(--accent)"
                          : "var(--muted)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {project.published && (
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ background: "var(--accent)" }}
                        />
                      )}
                      {project.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontSize: "13px",
                      verticalAlign: "middle",
                    }}
                  >
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(project)}
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "10px",
                          color: "var(--muted)",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          background: "transparent",
                          border: "0",
                          cursor: "pointer",
                        }}
                        className="transition-colors hover:text-[var(--fg)]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProject.mutate({ id: project.id })}
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "10px",
                          color: "var(--muted)",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          background: "transparent",
                          border: "0",
                          cursor: "pointer",
                        }}
                        className="transition-colors hover:text-[#c97a72]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!isLoading && !projects?.length && (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: "48px 24px", textAlign: "center" }}
                >
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "11px",
                      color: "var(--dim)",
                      letterSpacing: "0.18em",
                      marginBottom: "10px",
                    }}
                  >
                    ∅
                  </div>
                  <h3
                    style={{
                      fontSize: "16px",
                      color: "var(--fg)",
                      fontWeight: 500,
                      margin: "0 0 8px",
                    }}
                  >
                    No projects
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--muted)",
                      margin: "0",
                      maxWidth: "42ch",
                    }}
                  >
                    Add your first project to get started.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setDialogOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto"
            style={{
              background: "var(--bg-2)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "28px 32px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mb-6 flex items-start justify-between gap-6 pb-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "16px",
                    color: "var(--fg)",
                    fontWeight: 500,
                    margin: "0 0 4px",
                  }}
                >
                  {editingId ? "Edit project" : "New project"}
                </h2>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    color: "var(--muted)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {editingId
                    ? "Update project details"
                    : "Create a new portfolio project"}
                </div>
              </div>
              <button
                onClick={() => setDialogOpen(false)}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  color: "var(--muted)",
                  cursor: "pointer",
                  background: "transparent",
                  border: "0",
                }}
                className="transition-colors hover:text-[var(--fg)]"
              >
                Close
              </button>
            </div>

            <div
              className="grid gap-6"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px 28px",
              }}
            >
              {[
                { label: "Slug", key: "slug", type: "text" },
                { label: "Title", key: "title", type: "text" },
                { label: "Lede", key: "lede", type: "textarea", full: true },
                { label: "Label", key: "label", type: "text" },
                { label: "Meta", key: "meta", type: "text" },
                {
                  label: "Description",
                  key: "desc",
                  type: "textarea",
                  full: true,
                },
                { label: "Year", key: "year", type: "text" },
                { label: "Status", key: "status", type: "text" },
                { label: "Role", key: "role", type: "text" },
                {
                  label: "Stack (comma separated)",
                  key: "stack",
                  type: "text",
                },
                { label: "Tags (comma separated)", key: "tags", type: "text" },
                { label: "Category", key: "category", type: "text" },
                { label: "Order", key: "order", type: "number" },
              ].map((field) => (
                <div
                  key={field.key}
                  className={field.full ? "full" : ""}
                  style={field.full ? { gridColumn: "1 / -1" } : {}}
                >
                  <label
                    style={{
                      fontSize: "13px",
                      color: "var(--fg-2)",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={form[field.key as keyof ProjectFormData] as string}
                      onChange={(e) =>
                        setForm({ ...form, [field.key]: e.target.value })
                      }
                      rows={2}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "var(--bg)",
                        color: "var(--fg)",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "var(--sans)",
                      }}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={form[field.key as keyof ProjectFormData] as string}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [field.key]:
                            field.type === "number"
                              ? parseInt(e.target.value) || 0
                              : e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "var(--bg)",
                        color: "var(--fg)",
                        fontSize: "14px",
                        outline: "none",
                        fontFamily: "var(--sans)",
                      }}
                    />
                  )}
                </div>
              ))}
              <div
                className="full flex items-center gap-2"
                style={{ gridColumn: "1 / -1" }}
              >
                <input
                  type="checkbox"
                  id="published"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                  style={{ accentColor: "var(--accent)" }}
                />
                <label
                  htmlFor="published"
                  style={{ fontSize: "13px", color: "var(--fg-2)" }}
                >
                  Published
                </label>
              </div>
            </div>

            <div
              className="mt-6 flex justify-end gap-2"
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setDialogOpen(false)}
                className="transition-colors hover:border-[var(--fg-2)] hover:text-[var(--fg)]"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--fg-2)",
                  padding: "9px 14px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="transition-colors"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "var(--accent)",
                  border: "1px solid var(--accent)",
                  color: "#0d1410",
                  fontWeight: 500,
                  padding: "9px 14px",
                  cursor: "pointer",
                }}
              >
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
