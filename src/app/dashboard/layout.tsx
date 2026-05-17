"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { authClient } from "~/server/better-auth/client";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { TRPCReactProvider } from "~/trpc/react";

const navSections = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview" },
      { href: "/dashboard/site", label: "Site content" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/dashboard/projects", label: "Projects" },
      { href: "/dashboard/writing", label: "Writing" },
      { href: "/dashboard/chat", label: "Chat" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/users", label: "Users" },
      { href: "/dashboard/settings", label: "Settings" },
    ],
  },
];

function UserMenu() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = session?.user?.name?.slice(0, 2).toUpperCase() ?? "AA";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="flex items-center gap-2.5 border px-2.5 py-1.5 text-[13px] text-[var(--fg-2)] transition-colors hover:border-[var(--fg-2)]"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <span
          className="grid h-6 w-6 place-items-center rounded-full text-[11px] font-medium"
          style={{
            background: "var(--accent)",
            color: "#0d1410",
            fontFamily: "var(--mono)",
          }}
        >
          {initials}
        </span>
        <span className="hidden sm:inline">
          {session?.user?.name ?? "Admin"}
        </span>
        <span
          className="text-[9px] text-[var(--dim)]"
          style={{ fontFamily: "var(--mono)" }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+6px)] right-0 z-20 flex min-w-[200px] flex-col border shadow-xl"
          style={{
            background: "var(--bg-2)",
            borderColor: "rgba(255,255,255,0.08)",
            boxShadow: "0 12px 28px rgba(0,0,0,.4)",
          }}
        >
          <div
            className="border-b px-3.5 py-2.5 text-[10px] tracking-wide"
            style={{
              borderColor: "rgba(255,255,255,0.05)",
              color: "var(--dim)",
              fontFamily: "var(--mono)",
            }}
          >
            <b
              className="mb-0.5 block text-xs font-normal tracking-normal"
              style={{ color: "var(--fg-2)", fontFamily: "var(--sans)" }}
            >
              {session?.user?.name}
            </b>
            {session?.user?.email}
          </div>
          <Link
            href="/dashboard/settings"
            className="px-3.5 py-2.5 text-[13px] transition-colors hover:bg-[var(--bg)]"
            style={{ color: "var(--fg-2)" }}
            onClick={() => setOpen(false)}
          >
            Profile & settings
          </Link>
          <div
            className="h-px"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
          <button
            onClick={handleSignOut}
            className="px-3.5 py-2.5 text-left text-[13px] transition-colors hover:bg-[var(--bg)]"
            style={{ color: "var(--fg-2)" }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--bg)" }}>
      <div
        className="flex items-center gap-2.5 px-6 pt-1.5 pb-7"
        style={{
          fontFamily: "var(--mono)",
          fontSize: "12px",
          color: "var(--fg)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--accent)" }}
        />
        Portfolio CMS
      </div>

      {navSections.map((section) => (
        <div key={section.label}>
          <div
            className="px-6 pt-4.5 pb-2"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "9px",
              color: "var(--dim)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            {section.label}
          </div>
          <nav className="flex flex-col">
            {section.items.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className="flex items-center justify-between gap-3 px-6 py-2 text-[13px] transition-colors"
                  style={{
                    color: isActive ? "var(--fg)" : "var(--muted)",
                    background: isActive ? "var(--bg-2)" : "transparent",
                    borderLeft: isActive
                      ? "2px solid var(--accent)"
                      : "2px solid transparent",
                    textDecoration: "none",
                  }}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ))}

      <div
        className="mt-auto flex justify-between px-6 py-3.5"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          fontFamily: "var(--mono)",
          fontSize: "10px",
          color: "var(--dim)",
          letterSpacing: "0.1em",
        }}
      >
        <span>v 1.0</span>
        <Link
          href="/"
          target="_blank"
          rel="noopener"
          className="transition-colors hover:text-[var(--accent)]"
        >
          View site ↗
        </Link>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle =
    navSections.flatMap((s) => s.items).find((i) => i.href === pathname)
      ?.label ?? "Overview";

  return (
    <div
      className="min-h-screen"
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        background: "var(--bg)",
        color: "var(--fg-2)",
        fontFamily: "var(--sans)",
        fontSize: "15px",
        lineHeight: "1.55",
      }}
    >
      {/* Desktop sidebar */}
      <aside
        className="sticky top-0 hidden h-screen flex-col border-r lg:flex"
        style={{ borderColor: "rgba(255,255,255,0.05)", alignSelf: "start" }}
      >
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 left-4 z-50 text-[var(--muted)] hover:text-[var(--fg)]"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[240px] p-0"
          style={{
            background: "var(--bg)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="flex min-w-0 flex-col">
        {/* Topbar */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between border-b px-8"
          style={{
            padding: "14px 32px",
            borderColor: "rgba(255,255,255,0.05)",
            background: "var(--bg)",
          }}
        >
          <div
            className="flex items-center gap-2.5"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            <span>Dashboard</span>
            <span style={{ color: "var(--dim)" }}>/</span>
            <b className="font-medium" style={{ color: "var(--fg)" }}>
              {pageTitle}
            </b>
          </div>
          <div className="flex items-center gap-3.5">
            <span
              className="hidden items-center gap-1.5 border px-2 py-1 text-[10px] tracking-widest sm:inline-flex"
              style={{
                fontFamily: "var(--mono)",
                color: "var(--muted)",
                borderColor: "rgba(255,255,255,0.05)",
                textTransform: "uppercase",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: "var(--accent)",
                  boxShadow:
                    "0 0 6px color-mix(in oklab, var(--accent) 60%, transparent)",
                }}
              />
              <Link
                href="/"
                target="_blank"
                rel="noopener"
                className="transition-colors hover:text-[var(--fg)]"
              >
                View live site ↗
              </Link>
            </span>
            <UserMenu />
          </div>
        </header>

        {/* Page content */}
        <TRPCReactProvider>
          <div style={{ padding: "36px 32px 56px", flex: 1 }}>{children}</div>
        </TRPCReactProvider>
      </main>
    </div>
  );
}
