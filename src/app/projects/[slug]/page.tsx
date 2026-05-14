import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "~/app/_components/nav";
import { Contact } from "~/app/_components/contact";
import { Footer } from "~/app/_components/footer";
import { getPublicProjectBySlug } from "~/server/public-cms";

export const dynamic = "force-dynamic";

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
        </div>
      </div>

      <section>
        <div className="wrap detail-body">
          {(project.sections ?? []).map((section) => (
            <div key={section.id}>
              <h2>{section.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
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
