"use client";

import Link from "next/link";
import { api } from "~/trpc/react";

export default function DashboardOverview() {
  const { data: stats } = api.dashboard.getStats.useQuery();
  const { data: recentArticles } = api.dashboard.getRecentArticles.useQuery({
    limit: 6,
  });

  return (
    <div>
      {/* Page header */}
      <div
        className="mb-8 flex items-start justify-between gap-6"
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
            Welcome back.
          </h1>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.1em",
            }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        className="mb-8 grid grid-cols-4 border"
        style={{
          borderColor: "rgba(255,255,255,0.05)",
          marginBottom: "32px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        {[
          {
            label: "Total users",
            value: stats?.totalUsers ?? 0,
            delta: "Registered accounts",
          },
          {
            label: "Projects",
            value: stats?.totalProjects ?? 0,
            delta: "In the work archive",
          },
          {
            label: "Articles",
            value: stats?.totalArticles ?? 0,
            delta: "All posts (published + drafts)",
          },
        ].map((stat, i, arr) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1.5"
            style={{
              padding: "20px 22px",
              borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "0",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                color: "var(--muted)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {stat.label}
            </span>
            <span
              style={{
                fontSize: "30px",
                color: "var(--fg)",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                fontFeatureSettings: '"tnum"',
                lineHeight: 1,
              }}
            >
              {stat.value}
            </span>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                letterSpacing: "0.06em",
                color: "var(--accent)",
              }}
            >
              {stat.delta}
            </span>
          </div>
        ))}
      </div>

      {/* Activity + Quick actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Recent activity */}
        <div
          className="panel"
          style={{
            border: "1px solid rgba(255,255,255,0.05)",
            background: "var(--bg)",
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Recent activity</span>
            <div className="flex items-center gap-3">
              <a
                href="#"
                style={{ color: "var(--muted)" }}
                className="transition-colors hover:text-[var(--accent)]"
              >
                Filter
              </a>
              <Link
                href="/dashboard/writing"
                style={{ color: "var(--muted)" }}
                className="transition-colors hover:text-[var(--accent)]"
              >
                View all →
              </Link>
            </div>
          </div>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
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
                  Item
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
                  Action
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
                ></th>
              </tr>
            </thead>
            <tbody>
              {recentArticles?.map((post) => (
                <tr
                  key={post.id}
                  className="transition-colors hover:bg-[var(--bg-2)]"
                >
                  <td
                    style={{
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "12px",
                      color: "var(--muted)",
                      verticalAlign: "middle",
                    }}
                  >
                    {new Date(post.createdAt)
                      .toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                      .replace(/, /g, " · ")}
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontSize: "13px",
                      color: "var(--fg)",
                      fontWeight: 500,
                      verticalAlign: "middle",
                    }}
                  >
                    {post.title}
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontSize: "13px",
                      color: "var(--fg-2)",
                      verticalAlign: "middle",
                    }}
                  >
                    Published
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      textAlign: "left",
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
                        border: post.published
                          ? "1px solid rgba(125,211,168,0.35)"
                          : "1px solid rgba(255,255,255,0.08)",
                        color: post.published ? "var(--accent)" : "var(--muted)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {post.published && (
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ background: "var(--accent)" }}
                        />
                      )}
                      {post.published ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontSize: "13px",
                      color: "var(--fg-2)",
                      verticalAlign: "middle",
                    }}
                  >
                    <div className="flex gap-2.5">
                      <a
                        href={`/writing/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "10px",
                          color: "var(--muted)",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          textDecoration: "none",
                        }}
                        className="transition-colors hover:text-[var(--fg)]"
                      >
                        View
                      </a>
                      <Link
                        href={`/dashboard/writing/edit/${post.id}`}
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "10px",
                          color: "var(--muted)",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          textDecoration: "none",
                        }}
                        className="transition-colors hover:text-[var(--fg)]"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {!recentArticles?.length && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "48px 24px",
                      textAlign: "center",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontSize: "13px",
                      color: "var(--muted)",
                    }}
                  >
                    No recent activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Quick actions */}
        <div
          className="panel"
          style={{
            border: "1px solid rgba(255,255,255,0.05)",
            background: "var(--bg)",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Quick actions
          </div>
          <div className="flex flex-col">
            {[
              {
                label: "New article",
                desc: "Draft a post in writing",
                href: "/dashboard/writing",
              },
              {
                label: "New project",
                desc: "Add to the work archive",
                href: "/dashboard/projects",
              },
              {
                label: "Edit hero",
                desc: "Change tagline & eyebrow",
                href: "/dashboard/site",
              },
              {
                label: "Tune chat agent",
                desc: "System prompt & suggestions",
                href: "/dashboard/chat",
              },
              {
                label: "Account settings",
                desc: "Profile, password & sign-out",
                href: "/dashboard/settings",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between gap-3.5 transition-all"
                style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  textDecoration: "none",
                  color: "var(--fg-2)",
                  transition: "padding 0.12s, background 0.12s",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "var(--fg)",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--muted)",
                      letterSpacing: "0.06em",
                      marginTop: "2px",
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
                <span
                  className="transition-all group-hover:translate-x-0.5"
                  style={{
                    fontFamily: "var(--mono)",
                    color: "var(--dim)",
                    transition: "color 0.12s, transform 0.12s",
                  }}
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
