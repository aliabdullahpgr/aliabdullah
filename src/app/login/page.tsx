"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "~/server/better-auth/client";
import { Nav } from "~/app/_components/nav";
import { Footer } from "~/app/_components/footer";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Invalid credentials");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubAuth = async () => {
    setLoading(true);
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "var(--bg)",
    color: "var(--fg)",
    border: "1px solid var(--line)",
    fontSize: "14px",
    fontFamily: "var(--sans)",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--mono)",
    fontSize: "10px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--muted)",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <>
      <Nav />

      <main
        style={{
          minHeight: "calc(100vh - 120px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--accent)",
                }}
              />
              Portfolio CMS
            </div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "var(--fg)",
                margin: "0 0 6px",
              }}
            >
              Welcome back.
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "var(--muted)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Sign in to manage projects, writing, and chat.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleEmailAuth}
            style={{
              border: "1px solid var(--line)",
              background: "var(--bg-2)",
              padding: "24px",
            }}
          >
            {error && (
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  letterSpacing: "0.04em",
                  color: "#ff8a8a",
                  border: "1px solid rgba(255,138,138,0.25)",
                  background: "rgba(255,138,138,0.06)",
                  padding: "10px 12px",
                  marginBottom: "16px",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="email" style={labelStyle}>
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="password" style={labelStyle}>
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px 14px",
                background: "var(--accent)",
                color: "#0d1410",
                border: 0,
                fontFamily: "var(--mono)",
                fontSize: "12px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 500,
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "…" : "Sign in →"}
            </button>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: "20px 0",
              }}
            >
              <span
                style={{
                  flex: 1,
                  height: 1,
                  background: "var(--line)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "9px",
                  letterSpacing: "0.16em",
                  color: "var(--dim)",
                  textTransform: "uppercase",
                }}
              >
                or
              </span>
              <span
                style={{
                  flex: 1,
                  height: 1,
                  background: "var(--line)",
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleGithubAuth}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "transparent",
                color: "var(--fg)",
                border: "1px solid var(--line)",
                fontFamily: "var(--sans)",
                fontSize: "13px",
                cursor: loading ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: loading ? 0.6 : 1,
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg)";
                e.currentTarget.style.borderColor = "var(--muted)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "var(--line)";
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>
          </form>

          {/* Footer link */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "flex-end",
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.04em",
            }}
          >
            <Link
              href="/"
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
            >
              ← Back to site
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
