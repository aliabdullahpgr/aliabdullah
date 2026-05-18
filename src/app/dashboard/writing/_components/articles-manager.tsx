"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

type Filter = "all" | "published" | "draft";

export default function ArticlesManager() {
  const {
    data: articles,
    isLoading,
    refetch,
  } = api.article.getAllAdmin.useQuery();

  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const deleteArticle = api.article.delete.useMutation({
    onMutate: ({ id }) => setBusyId(id),
    onSuccess: () => {
      setConfirmId(null);
      setError(null);
      void refetch();
    },
    onError: (err) => setError(err.message),
    onSettled: () => setBusyId(null),
  });

  const updateArticle = api.article.update.useMutation({
    onMutate: ({ id }) => setBusyId(id),
    onSuccess: () => {
      setError(null);
      void refetch();
    },
    onError: (err) => setError(err.message),
    onSettled: () => setBusyId(null),
  });

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = (articles ?? [])
    .filter((a) => {
      if (filter === "published") return a.published;
      if (filter === "draft") return !a.published;
      return true;
    })
    .filter((a) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    });

  const counts = {
    all: articles?.length ?? 0,
    published: (articles ?? []).filter((a) => a.published).length ?? 0,
    draft: (articles ?? []).filter((a) => !a.published).length ?? 0,
  };

  return (
    <div>
      <div
        className="mb-8 flex items-end justify-between gap-6"
        style={{ marginBottom: "32px" }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              color: "var(--fg)",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              margin: "0 0 6px",
            }}
          >
            Writing
          </h1>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.1em",
            }}
          >
            {counts.all} articles · {counts.published} published ·{" "}
            {counts.draft} draft
          </div>
        </div>
        <Link
          href="/dashboard/writing/new"
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
          + New article
        </Link>
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-3"
        style={{ marginBottom: "20px" }}
      >
        <div className="flex flex-wrap gap-2">
          {(["all", "published", "draft"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="transition-colors"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "5px 10px",
                border:
                  filter === f
                    ? "1px solid rgba(255,255,255,0.15)"
                    : "1px solid rgba(255,255,255,0.05)",
                background:
                  filter === f ? "rgba(255,255,255,0.06)" : "transparent",
                color: filter === f ? "var(--fg)" : "var(--muted)",
                cursor: "pointer",
              }}
            >
              {f === "all" ? "All" : f === "published" ? "Published" : "Drafts"}{" "}
              <span style={{ color: "var(--dim)", marginLeft: "4px" }}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
        <div
          className="flex items-center gap-2"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background: "var(--bg)",
            padding: "7px 10px",
          }}
        >
          <span
            style={{
              color: "var(--dim)",
              fontFamily: "var(--mono)",
              fontSize: "11px",
            }}
          >
            ⌕
          </span>
          <input
            type="text"
            placeholder="Search articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "transparent",
              border: "0",
              outline: "none",
              color: "var(--fg)",
              fontSize: "13px",
              width: "160px",
              fontFamily: "var(--sans)",
            }}
          />
        </div>
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
                  width: "50px",
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
                Title
              </th>
              <th
                style={{
                  width: "130px",
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
                Date
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
                  width: "90px",
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
                Read
              </th>
              <th
                style={{
                  width: "120px",
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
                  width: "140px",
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
                  colSpan={7}
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
              filtered?.map((article, i) => (
                <tr
                  key={article.id}
                  className="transition-colors hover:bg-[var(--bg-2)]"
                  style={{
                    opacity: busyId === article.id ? 0.55 : 1,
                    transition: "opacity 0.15s",
                  }}
                >
                  <td
                    style={{
                      padding: "13px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--dim)",
                      letterSpacing: "0.06em",
                      verticalAlign: "middle",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </td>
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
                    {article.title}
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "11px",
                      color: "var(--fg-2)",
                      letterSpacing: "0.06em",
                      verticalAlign: "middle",
                    }}
                  >
                    {article.date}
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
                    {article.category}
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "11px",
                      color: "var(--fg-2)",
                      letterSpacing: "0.06em",
                      verticalAlign: "middle",
                    }}
                  >
                    {article.readTime.replace(" read", "")}
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      verticalAlign: "middle",
                    }}
                  >
                    <button
                      type="button"
                      title="Click to toggle publish state"
                      disabled={busyId === article.id}
                      onClick={() =>
                        updateArticle.mutate({
                          id: article.id,
                          published: !article.published,
                        })
                      }
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        border: article.published
                          ? "1px solid rgba(125,211,168,0.35)"
                          : "1px solid rgba(255,255,255,0.08)",
                        background: "transparent",
                        color: article.published
                          ? "var(--accent)"
                          : "var(--muted)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor:
                          busyId === article.id ? "wait" : "pointer",
                        opacity: busyId === article.id ? 0.5 : 1,
                      }}
                    >
                      {article.published && (
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ background: "var(--accent)" }}
                        />
                      )}
                      {article.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      verticalAlign: "middle",
                    }}
                  >
                    <div className="flex gap-3">
                      <Link
                        href={`/dashboard/writing/edit/${article.id}`}
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
                      <a
                        href={`/writing/${article.slug}`}
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
                      </a>
                      {confirmId === article.id ? (
                        <>
                          <button
                            type="button"
                            disabled={busyId === article.id}
                            onClick={() =>
                              deleteArticle.mutate({ id: article.id })
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
                                busyId === article.id ? "wait" : "pointer",
                              opacity: busyId === article.id ? 0.5 : 1,
                            }}
                          >
                            {busyId === article.id ? "…" : "Confirm"}
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
                          onClick={() => setConfirmId(article.id)}
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
            {!isLoading && !filtered?.length && (
              <tr>
                <td
                  colSpan={7}
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
                    No articles
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--muted)",
                      margin: "0",
                      maxWidth: "42ch",
                    }}
                  >
                    {search
                      ? "No articles match your search."
                      : "Add your first article to get started."}
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
