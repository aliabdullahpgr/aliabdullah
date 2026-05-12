import { HeroIcons } from "./hero-icons";

interface HeroProps {
  tagline?: string;
  emphasis?: string;
}

export function Hero({ tagline, emphasis }: HeroProps) {
  const defaultTagline = "I build systems with design and";
  const defaultEmphasis = "purpose.";

  const parts = (tagline ?? defaultTagline).split(emphasis ?? defaultEmphasis);

  return (
    <section className="hero">
      <HeroIcons />
      <div className="hero-content">
        <h1 className="tagline">
          {parts[0]}
          <em>{emphasis ?? defaultEmphasis}</em>
          {parts[1]}
        </h1>
      </div>
    </section>
  );
}
