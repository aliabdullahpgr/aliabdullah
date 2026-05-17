"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function ProjectsManager() {
  const {
    data: projects,
    isLoading,
    refetch,
  } = api.project.getAllAdmin.useQuery();

  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const updateProject = api.project.update.useMutation({
    onMutate: ({ id }) => setBusyId(id),
    onSuccess: () => {
      setError(null);
      void refetch();
    },
    onError: (err) => setError(err.message),
    onSettled: () => setBusyId(null),
  });
  const deleteProject = api.project.delete.useMutation({
    onMutate: ({ id }) => setBusyId(id),
    onSuccess: () => {
      setConfirmId(null);
      setError(null);
      void refetch();
    },
    onError: (err) => setError(err.message),
    onSettled: () => setBusyId(null),
  });


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
        <Link
          href="/dashboard/projects/new"
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
            textDecoration: "none",
          }}
        >
          + New project
        </Link>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "14px",
            padding: "10px 14px",
            border: "1px solid rgba(255,138,138,0.25)",
            background: "rgba(255,138,138,0.06)",
            fontFamily: "var(--mono)",
            fontSize: "11px",
            letterSpacing: "0.04em",
            color: "#ff8a8a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
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
                  style={{
                    opacity: busyId === project.id ? 0.55 : 1,
                    transition: "opacity 0.15s",
                  }}
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
                    <button
                      type="button"
                      title="Click to toggle publish state"
                      disabled={busyId === project.id}
                      onClick={() =>
                        updateProject.mutate({
                          id: project.id,
                          published: !project.published,
                        })
                      }
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
                        background: "transparent",
                        color: project.published
                          ? "var(--accent)"
                          : "var(--muted)",
                        cursor:
                          busyId === project.id ? "wait" : "pointer",
                        opacity: busyId === project.id ? 0.5 : 1,
                      }}
                    >
                      {project.published && (
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ background: "var(--accent)" }}
                        />
                      )}
                      {project.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontSize: "13px",
                      verticalAlign: "middle",
                    }}
                  >
                    <div className="flex gap-3">
                      <Link
                        href={`/dashboard/projects/edit/${project.id}`}
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "10px",
                          color: "var(--muted)",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          background: "transparent",
                          border: "0",
                          cursor: "pointer",
                          textDecoration: "none",
                        }}
                        className="transition-colors hover:text-[var(--fg)]"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/projects/${project.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "10px",
                          color: "var(--muted)",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          background: "transparent",
                          border: "0",
                          cursor: "pointer",
                          textDecoration: "none",
                        }}
                        className="transition-colors hover:text-[var(--fg)]"
                      >
                        View
                      </Link>
                      {confirmId === project.id ? (
                        <>
                          <button
                            type="button"
                            disabled={busyId === project.id}
                            onClick={() =>
                              deleteProject.mutate({ id: project.id })
                            }
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "10px",
                              color: "#ff8a8a",
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              background: "rgba(255,138,138,0.08)",
                              border: "1px solid rgba(255,138,138,0.35)",
                              padding: "2px 6px",
                              cursor:
                                busyId === project.id ? "wait" : "pointer",
                              opacity: busyId === project.id ? 0.5 : 1,
                            }}
                          >
                            {busyId === project.id ? "…" : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "10px",
                              color: "var(--dim)",
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              background: "transparent",
                              border: "0",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmId(project.id)}
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
                          className="transition-colors hover:text-[#ff8a8a]"
                        >
                          Delete
                        </button>
                      )}
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

    </div>
  );
}
