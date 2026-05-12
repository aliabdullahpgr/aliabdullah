"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

type Filter = "all" | "verified" | "pending";

export default function UsersTable() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(0);
  const limit = 10;

  const { data, isLoading, refetch } = api.dashboard.getUsers.useQuery({
    limit,
    offset: page * limit,
    search: search || undefined,
  });

  const deleteUser = api.dashboard.deleteUser.useMutation({
    onSuccess: () => refetch(),
  });

  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  const filteredUsers = data?.users.filter((user) => {
    if (filter === "verified") return user.emailVerified;
    if (filter === "pending") return !user.emailVerified;
    return true;
  });

  const counts = {
    all: data?.total ?? 0,
    verified: data?.users.filter((u) => u.emailVerified).length ?? 0,
    pending: data?.users.filter((u) => !u.emailVerified).length ?? 0,
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
            Users
          </h1>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.1em",
            }}
          >
            {counts.all} accounts · {counts.verified} verified ·{" "}
            {counts.pending} pending
          </div>
        </div>
        <button
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
          + Invite user
        </button>
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-3"
        style={{ marginBottom: "20px" }}
      >
        <div className="flex flex-wrap gap-2">
          {(["all", "verified", "pending"] as Filter[]).map((f) => (
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
              {f === "all" ? "All" : f === "verified" ? "Verified" : "Pending"}{" "}
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
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            style={{
              background: "transparent",
              border: "0",
              outline: "none",
              color: "var(--fg)",
              fontSize: "13px",
              width: "180px",
              fontFamily: "var(--sans)",
            }}
          />
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
                User
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
                Email
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
                Status
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
                Posts
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
                Joined
              </th>
              <th
                style={{
                  width: "80px",
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
                  colSpan={6}
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
              filteredUsers?.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-[var(--bg-2)]"
                >
                  <td
                    style={{
                      padding: "13px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      verticalAlign: "middle",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: user.image
                            ? "transparent"
                            : "var(--accent)",
                          color: "#0d1410",
                          fontFamily: "var(--mono)",
                          fontSize: "10px",
                          fontWeight: 500,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {user.image ? (
                          <img
                            src={user.image}
                            alt=""
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          (user.name?.charAt(0).toUpperCase() ?? "U")
                        )}
                      </span>
                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--fg)",
                            fontWeight: 500,
                          }}
                        >
                          {user.name}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "10px",
                            color: "var(--dim)",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {user.id === "owner" ? "Owner" : "Editor"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "11px",
                      color: "var(--fg-2)",
                      letterSpacing: "0.04em",
                      verticalAlign: "middle",
                    }}
                  >
                    {user.email}
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
                        border: user.emailVerified
                          ? "1px solid rgba(125,211,168,0.35)"
                          : "1px solid rgba(255,255,255,0.08)",
                        color: user.emailVerified
                          ? "var(--accent)"
                          : "var(--muted)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {user.emailVerified && (
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ background: "var(--accent)" }}
                        />
                      )}
                      {user.emailVerified ? "Verified" : "Pending"}
                    </span>
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
                    {user._count.posts}
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
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
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
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(user.email)
                        }
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
                        Copy
                      </button>
                      <button
                        onClick={() => deleteUser.mutate({ id: user.id })}
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
            {!isLoading && !filteredUsers?.length && (
              <tr>
                <td
                  colSpan={6}
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
                    — no results —
                  </div>
                  <h3
                    style={{
                      fontSize: "16px",
                      color: "var(--fg)",
                      fontWeight: 500,
                      margin: "0 0 8px",
                    }}
                  >
                    No users found
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--muted)",
                      margin: "0",
                      maxWidth: "42ch",
                    }}
                  >
                    {search || filter !== "all"
                      ? "Try a different search term, or clear the filter to see everyone."
                      : "No users yet."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div
            className="flex items-center justify-between"
            style={{
              padding: "14px 18px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11px",
                color: "var(--muted)",
                letterSpacing: "0.06em",
              }}
            >
              Showing {page * limit + 1} –{" "}
              {Math.min((page + 1) * limit, data?.total ?? 0)} of{" "}
              {data?.total ?? 0}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  color: page === 0 ? "var(--dim)" : "var(--fg-2)",
                  letterSpacing: "0.06em",
                  padding: "5px 10px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent",
                  cursor: page === 0 ? "not-allowed" : "pointer",
                }}
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    color: page === i ? "var(--fg)" : "var(--fg-2)",
                    letterSpacing: "0.06em",
                    padding: "5px 10px",
                    border:
                      page === i
                        ? "1px solid rgba(255,255,255,0.15)"
                        : "1px solid rgba(255,255,255,0.08)",
                    background:
                      page === i ? "rgba(255,255,255,0.06)" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  color: page >= totalPages - 1 ? "var(--dim)" : "var(--fg-2)",
                  letterSpacing: "0.06em",
                  padding: "5px 10px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent",
                  cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
