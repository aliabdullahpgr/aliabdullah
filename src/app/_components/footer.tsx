interface FooterProps {
  availability?: string;
  copyright?: string;
}

export function Footer({ availability, copyright }: FooterProps) {
  return (
    <footer className="footer">
      <span>
        <span className="available">●</span>{" "}
        {availability ?? "Available for collaboration"}
      </span>
      <span>{copyright ?? "© 2026 — built lean"}</span>
    </footer>
  );
}
