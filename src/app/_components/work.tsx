import Link from "next/link";

interface Project {
  slug: string;
  label: string;
  year: string;
  category: string;
  title: string;
  desc: string;
  tags: string[];
}

interface WorkProps {
  projects?: Project[];
}

export function Work({ projects }: WorkProps) {
  const defaultProjects: Project[] = [
    {
      slug: "raf-sp",
      label: "screenshot — dashboard",
      year: "2025",
      category: "Government",
      title: "RAF-SP",
      desc: "Agriculture platform consolidating data from 15+ departments across South Punjab into one dashboard.",
      tags: ["React", "Node", "MongoDB", "SQL"],
    },
    {
      slug: "hisaabscore",
      label: "screenshot — credit profile",
      year: "2025",
      category: "Fintech",
      title: "HisaabScore",
      desc: "AI-powered alternative credit scoring for the underbanked, built end-to-end on the MERN stack.",
      tags: ["MERN", "Redux", "MUI v5"],
    },
    {
      slug: "function-calling-agent",
      label: "terminal — agent loop",
      year: "2025",
      category: "AI",
      title: "Function-Calling Agent",
      desc: "Python agent on Gemini with persistent memory, sandboxed code execution, and strict path validation.",
      tags: ["Python", "Gemini", "Agents"],
    },
  ];

  const displayProjects = projects ?? defaultProjects;

  return (
    <section className="section" id="work">
      <div className="wrap">
        <div className="section-head">
          <div className="section-label">Selected Work</div>
          <div className="meta">
            <Link href="/projects">All projects&nbsp;→</Link>
          </div>
        </div>
        <div className="cards">
          {displayProjects.map((p) => (
            <Link className="card" href={`/projects/${p.slug}`} key={p.slug}>
              <div className="card-thumb" data-label={p.label}></div>
              <div className="card-body">
                <div className="card-meta">
                  <span>
                    {p.year} · {p.category}
                  </span>
                  <span className="arrow">↗</span>
                </div>
                <h3 className="card-title">{p.title}</h3>
                <p className="card-desc">{p.desc}</p>
                <div className="card-tags">
                  {p.tags.map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
