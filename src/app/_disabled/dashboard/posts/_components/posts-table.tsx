"use client";

import { api } from "~/trpc/react";

export default function PostsTable() {
  const { data: posts, isLoading } = api.dashboard.getRecentPosts.useQuery({
    limit: 50,
  });

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
            Posts
          </h1>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.1em",
            }}
          >
            {posts?.length ?? 0} posts
          </div>
        </div>
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
                Title
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
                Author
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
              >
                Created
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
              >
                Updated
              </th>
              <th
                style={{
                  width: "110px",
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
              posts?.map((post) => (
                <tr
                  key={post.id}
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
                    {post.name}
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
                    {post.createdBy.name}
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
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
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
                    {new Date(post.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
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
                        border: "1px solid rgba(125,211,168,0.35)",
                        color: "var(--accent)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: "var(--accent)" }}
                      />
                      Published
                    </span>
                  </td>
                </tr>
              ))
            )}
            {!isLoading && !posts?.length && (
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
                    No posts
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--muted)",
                      margin: "0",
                      maxWidth: "42ch",
                    }}
                  >
                    No posts yet.
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
