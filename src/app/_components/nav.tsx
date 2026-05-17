"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname();

  const linkClass = (href: string) => {
    const isActive = pathname === href || pathname?.startsWith(href + "/");
    return isActive ? "active" : "";
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          <span className="dot"></span>
          <b>ali abdullah</b>
          <span>&nbsp;/ swe</span>
        </Link>
        <div className="nav-links">
          <Link href="/projects" className={linkClass("/projects")}>
            Work
          </Link>
          <Link href="/writing" className={linkClass("/writing")}>
            Writing
          </Link>
          <Link href="/chat" className={linkClass("/chat")}>
            Chat
          </Link>
        </div>
      </div>
    </nav>
  );
}
