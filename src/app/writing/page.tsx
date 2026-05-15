import Link from "next/link";
import { Nav } from "~/app/_components/nav";
import { Contact } from "~/app/_components/contact";
import { Footer } from "~/app/_components/footer";
import { articles } from "~/app/_data/public-content";

export const metadata = {
  title: "Writing — Ali Abdullah",
};

export default function WritingPage() {
  // Group by year from date string
  const grouped = articles.reduce(
    (acc, article) => {
      const year = article.date.split(" · ")[0] ?? "Unknown";
      acc[year] ??= [];
      acc[year].push(article);
      return acc;
    },
    {} as Record<string, typeof articles>,
  );

  const sortedYears = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  const totalArticles = articles.length;

  return (
    <>
      <Nav />

      <section className="page-head">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <span>Writing</span>
          </div>
          <h1>Notes from a working engineer.</h1>
          <p>
            Mostly post-mortems, hard-won lessons, and reading notes. Newest
            first.
          </p>
          <div className="stats">
            <span>
              Total<b>{totalArticles} posts</b>
            </span>
            <span>
              Active since<b>{sortedYears[sortedYears.length - 1] ?? "2024"}</b>
            </span>
            <span>
              This year
              <b>{grouped[new Date().getFullYear().toString()]?.length ?? 0}</b>
            </span>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="wrap">
          {sortedYears.map((year) => (
            <div key={year}>
              <div className="year-divider">
                <span className="y">{year}</span>
                <span className="c">
                  {String(grouped[year]!.length).padStart(2, "0")} /{" "}
                  {String(totalArticles).padStart(2, "0")}
                </span>
              </div>
              <div className="posts full">
                {grouped[year]!.map((p) => (
                  <Link
                    className="post"
                    href={`/writing/${p.slug}`}
                    key={p.slug}
                  >
                    <div className="post-date">{p.date}</div>
                    <h3 className="post-title">{p.title}</h3>
                    <div className="post-cat">{p.category}</div>
                    <span className="post-arr">→</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {articles.length === 0 && (
            <p className="text-muted-foreground">No articles yet.</p>
          )}
        </div>
      </section>

      <Contact />
      <Footer />
    </>
  );
}
