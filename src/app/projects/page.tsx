import Link from "next/link";
import { Nav } from "~/app/_components/nav";
import { Contact } from "~/app/_components/contact";
import { Footer } from "~/app/_components/footer";
import { getPublicProjects } from "~/server/public-cms";

export const metadata = {
  title: "Projects — Ali Abdullah",
};

export default async function ProjectsPage() {
  const projects = await getPublicProjects();

  // Group projects by year
  const grouped = projects.reduce(
    (acc, project) => {
      const year = project.year;
      acc[year] ??= [];
      acc[year].push(project);
      return acc;
    },
    {} as Record<string, typeof projects>,
  );

  const sortedYears = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  const totalProjects = projects.length;

  return (
    <>
      <Nav />

      <section className="page-head">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <span>Work</span>
          </div>
          <h1>Things I&apos;ve built, broken, and shipped.</h1>
          <p>
            An archive of projects — client work, side experiments, and things
            made just to learn. Newest first.
          </p>
          <div className="stats">
            <span>
              Total<b>{totalProjects} projects</b>
            </span>
            <span>
              Active since<b>{sortedYears[sortedYears.length - 1] ?? "2023"}</b>
            </span>
            <span>
              In production
              <b>
                {projects.filter((p) => p.status === "In production").length}
              </b>
            </span>
            <span>
              Open source
              <b>
                {projects.filter((p) => p.category === "Open source").length}
              </b>
            </span>
          </div>
        </div>
      </section>

      {sortedYears.map((year) => (
        <section className="year-group" key={year}>
          <div className="wrap">
            <div className="year-head">
              <div className="year">{year}</div>
              <div className="count">
                {String(grouped[year]!.length).padStart(2, "0")} /{" "}
                {String(totalProjects).padStart(2, "0")}
              </div>
            </div>
            <div className="cards">
              {grouped[year]!.map((p) => (
                <Link
                  className="card"
                  href={`/projects/${p.slug}`}
                  key={p.slug}
                >
                  {p.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      className="card-thumb"
                      src={p.image}
                      alt={p.label}
                      style={{ objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div className="card-thumb" data-label={p.label}></div>
                  )}
                  <div className="card-body">
                    <div className="card-meta">
                      <span>{p.meta}</span>
                      <span className="arrow">↗</span>
                    </div>
                    <h3 className="card-title">{p.title}</h3>
                    <p className="card-desc">{p.desc}</p>
                    <div className="card-tags">
                      {p.stack.map((t) => (
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
      ))}

      {projects.length === 0 && (
        <section className="year-group">
          <div className="wrap">
            <p className="text-muted-foreground">No projects yet.</p>
          </div>
        </section>
      )}

      <Contact />
      <Footer />
    </>
  );
}
