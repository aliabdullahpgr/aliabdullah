import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "~/app/_components/nav";
import { Contact } from "~/app/_components/contact";
import { Footer } from "~/app/_components/footer";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await api.article.getBySlug({ slug });
  if (!article) return { title: "Not Found" };
  return { title: `${article.title} — Ali Abdullah` };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await api.article.getBySlug({ slug });
  if (!article) notFound();

  return (
    <>
      <Nav />

      <section className="article-head">
        <div className="wrap">
          <div className="crumb">
            <Link href="/writing">← Writing</Link>
            <span className="sep">/</span>
            <span>{article.category}</span>
          </div>
          <h1>{article.title}</h1>
          <p className="lede">{article.lede}</p>
          <div className="article-meta">
            <span>{article.date}</span>
            <span className="sep">/</span>
            <span>{article.readTime}</span>
            <span className="sep">/</span>
            <span className="accent">{article.category}</span>
          </div>
        </div>
      </section>

      <section>
        <div
          className="wrap article"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </section>

      <div className="wrap">
        <div className="article-foot">
          <div className="tags">
            {article.tags.map((t: string) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>
          <div className="share">
            <Link href="#">Share ↗</Link>
            <Link href="#">Copy link</Link>
            <Link href="/writing">All posts →</Link>
          </div>
        </div>
      </div>

      <nav className="detail-nav" aria-label="Article pagination">
        <Link className="prev" href="/writing">
          <span className="dir">← All Posts</span>
        </Link>
      </nav>

      <Contact />
      <Footer />
    </>
  );
}
