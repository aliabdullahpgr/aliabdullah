"use client";

import Image, { type ImageLoader } from "next/image";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt?: Date | string;
}

const avatarLoader: ImageLoader = ({ src }) => src;

export default function SettingsForm({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(true);

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div>
      <div className="mb-8" style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "28px",
            color: "var(--fg)",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            margin: "0 0 6px",
          }}
        >
          Settings
        </h1>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "11px",
            color: "var(--muted)",
            letterSpacing: "0.1em",
          }}
        >
          Your account.
        </div>
      </div>

      <div style={{ maxWidth: "780px" }}>
        <section
          style={{
            border: "1px solid rgba(255,255,255,0.05)",
            background: "var(--bg)",
            padding: "24px 28px",
            marginBottom: "20px",
          }}
        >
          <div
            className="mb-6 flex items-center gap-4"
            style={{ marginBottom: "24px" }}
          >
            <span
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "var(--accent)",
                color: "#0d1410",
                fontFamily: "var(--mono)",
                fontSize: "14px",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {user.image ? (
                <Image
                  loader={avatarLoader}
                  unoptimized
                  src={user.image}
                  alt=""
                  width={48}
                  height={48}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                initials
              )}
            </span>
            <div>
              <div
                style={{
                  fontSize: "14px",
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
                  color: "var(--muted)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginTop: "2px",
                }}
              >
                Owner · joined {joined}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px 24px",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "13px",
                  color: "var(--fg-2)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Display name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "var(--bg-2)",
                  color: "var(--fg)",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "var(--sans)",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "13px",
                  color: "var(--fg-2)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "var(--bg-2)",
                  color: "var(--fg)",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "var(--sans)",
                }}
              />
            </div>
          </div>
        </section>

        <section
          style={{
            border: "1px solid rgba(255,255,255,0.05)",
            background: "var(--bg)",
            padding: "24px 28px",
            marginBottom: "20px",
          }}
        >
          <div className="mb-6" style={{ marginBottom: "20px" }}>
            <h2
              style={{
                fontSize: "16px",
                color: "var(--fg)",
                fontWeight: 500,
                margin: "0 0 4px",
              }}
            >
              Password
            </h2>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11px",
                color: "var(--muted)",
                letterSpacing: "0.08em",
              }}
            >
              Last changed 4 months ago.
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px 24px",
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <label
                style={{
                  fontSize: "13px",
                  color: "var(--fg-2)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Current password
              </label>
              <input
                type="password"
                value="••••••••••"
                readOnly
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "var(--bg-2)",
                  color: "var(--fg)",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "var(--sans)",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "13px",
                  color: "var(--fg-2)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                New password
              </label>
              <input
                type="password"
                placeholder="At least 8 characters"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "var(--bg-2)",
                  color: "var(--fg)",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "var(--sans)",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "13px",
                  color: "var(--fg-2)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Confirm new password
              </label>
              <input
                type="password"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "var(--bg-2)",
                  color: "var(--fg)",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "var(--sans)",
                }}
              />
            </div>
          </div>
        </section>



        <div
          className="flex items-center justify-between"
          style={{
            maxWidth: "780px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 18px",
            border: "1px solid rgba(255,255,255,0.05)",
            background: "var(--bg)",
          }}
        >
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
                fontSize: "11px",
                color: "var(--muted)",
                letterSpacing: "0.06em",
              }}
            >
              {saved ? "All changes saved" : "Unsaved changes"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setName(user.name);
                setEmail(user.email);
                setSaved(true);
              }}
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
              Discard
            </button>
            <button
              onClick={() => setSaved(true)}
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
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
