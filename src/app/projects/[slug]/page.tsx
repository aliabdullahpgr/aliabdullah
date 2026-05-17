import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "~/app/_components/nav";
import { Contact } from "~/app/_components/contact";
import { Footer } from "~/app/_components/footer";
import { Markdown } from "~/app/_components/markdown";
import {
  getPublicProjectBySlug,
  getPublicProjects,
} from "~/server/public-cms";

export async function generateStaticParams() {
  const projects = await getPublicProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  if (!project) return { title: "Not Found" };
  return { title: `${project.title} — Ali Abdullah` };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <Nav />

      <section className="detail-head">
        <div className="wrap">
          <div className="crumb">
            <Link href="/projects">← Work</Link>
            <span className="sep">/</span>
            <span>{project.title}</span>
          </div>
          <h1>{project.title}</h1>
          <p className="lede">{project.lede}</p>
        </div>
      </section>

      {project.image && (
        <section>
          <div className="wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.image}
              alt={`${project.title} cover`}
              style={{
                width: "100%",
                maxHeight: 480,
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </section>
      )}

      <div className="wrap">
        <div className="detail-meta">
          <div className="row">
            <span className="k">Year</span>
            <span className="v">{project.year}</span>
          </div>
          <div className="row">
            <span className="k">Status</span>
            <span className="v accent">{project.status}</span>
          </div>
          <div className="row">
            <span className="k">Role</span>
            <span className="v">{project.role}</span>
          </div>
          <div className="row">
            <span className="k">Stack</span>
            <span className="stack">
              {project.stack.map((t: string) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </span>
          </div>
          {(project.liveUrl ?? project.githubUrl) && (
            <div className="row">
              <span className="k">Links</span>
              <span className="stack project-links">
                {project.liveUrl && (
                  <a
                    className="tag link"
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live ↗
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    className="tag link"
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub repository"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      style={{ marginRight: 6, verticalAlign: "-2px" }}
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Source
                  </a>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      <section>
        <div className="wrap detail-body">
          {(project.sections ?? []).map((section) => (
            <div key={section.id}>
              <h2>{section.heading}</h2>
              <Markdown>{section.content}</Markdown>
            </div>
          ))}
          {(project.sections ?? []).length === 0 && (
            <p className="text-muted-foreground">No detailed sections yet.</p>
          )}
        </div>
      </section>

      <nav className="detail-nav" aria-label="Project pagination">
        <Link className="prev" href="/projects">
          <span className="dir">← All Projects</span>
        </Link>
      </nav>

      <Contact />
      <Footer />
    </>
  );
}
