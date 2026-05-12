import Link from "next/link";

interface Article {
  slug: string;
  date: string;
  title: string;
}

interface WritingProps {
  posts?: Article[];
}

export function Writing({ posts }: WritingProps) {
  const defaultPosts: Article[] = [
    {
      date: "2026 · 04 · 22",
      title: "Migrating a blog system to Sanity without breaking SEO",
      slug: "migrating-blog-to-sanity",
    },
    {
      date: "2026 · 03 · 09",
      title: "Function calling, in plain English",
      slug: "function-calling",
    },
    {
      date: "2026 · 02 · 14",
      title: "300 LeetCode problems later, here's what stuck",
      slug: "leetcode-lessons",
    },
    {
      date: "2026 · 01 · 28",
      title:
        "A folder structure for Next.js apps that doesn't fight you at month six",
      slug: "nextjs-folder-structure",
    },
  ];

  const displayPosts = posts ?? defaultPosts;

  return (
    <section className="section" id="writing">
      <div className="wrap">
        <div className="section-head">
          <div className="section-label">Writing</div>
          <div className="meta">
            <Link href="/writing">All posts&nbsp;→</Link>
          </div>
        </div>
        <div className="posts">
          {displayPosts.map((p) => (
            <Link className="post" href={`/writing/${p.slug}`} key={p.slug}>
              <div className="post-date">{p.date}</div>
              <h3 className="post-title">{p.title}</h3>
              <span className="post-arr">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
