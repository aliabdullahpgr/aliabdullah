export const dynamic = "force-dynamic";

import { api } from "~/trpc/server";
import { About } from "~/app/_components/about";
import { Contact } from "~/app/_components/contact";
import { Footer } from "~/app/_components/footer";
import { Hero } from "~/app/_components/hero";
import { Nav } from "~/app/_components/nav";
import { Work } from "~/app/_components/work";
import { Writing } from "~/app/_components/writing";

export default async function Home() {
  const [configsResult, projectsResult, articlesResult] =
    await Promise.allSettled([
      api.siteConfig.getManyByKeys({
        keys: [
          "hero.tagline",
          "hero.taglineEmphasis",
          "about.name",
          "about.role",
          "about.location",
          "about.bio2",
          "about.skills",
          "about.company",
          "about.university",
          "contact.email",
          "contact.github",
          "contact.linkedin",
          "contact.location",
          "footer.availability",
          "footer.copyright",
        ],
      }),
      api.project.getAll(),
      api.article.getAll(),
    ]);

  if (
    configsResult.status === "rejected" ||
    projectsResult.status === "rejected" ||
    articlesResult.status === "rejected"
  ) {
    console.error("[home] failed to load CMS data", {
      configs:
        configsResult.status === "rejected"
          ? String(configsResult.reason)
          : undefined,
      projects:
        projectsResult.status === "rejected"
          ? String(projectsResult.reason)
          : undefined,
      articles:
        articlesResult.status === "rejected"
          ? String(articlesResult.reason)
          : undefined,
    });
  }

  const configs = configsResult.status === "fulfilled" ? configsResult.value : [];
  const projects = projectsResult.status === "fulfilled" ? projectsResult.value : [];
  const articles = articlesResult.status === "fulfilled" ? articlesResult.value : [];

  const getConfig = (key: string) => configs.find((c) => c.key === key)?.value;

  const homeProjects = projects.slice(0, 3).map((p) => ({
    slug: p.slug,
    label: p.label,
    year: p.year,
    category: p.category,
    title: p.title,
    desc: p.desc,
    tags: p.stack,
  }));

  const homeArticles = articles.slice(0, 4).map((a) => ({
    slug: a.slug,
    date: a.date,
    title: a.title,
  }));

  return (
    <>
      <Nav />
      <Hero
        tagline={getConfig("hero.tagline")}
        emphasis={getConfig("hero.taglineEmphasis")}
      />
      <About
        name={getConfig("about.name")}
        role={getConfig("about.role")}
        location={getConfig("about.location")}
        bio2={getConfig("about.bio2")}
        skills={getConfig("about.skills")}
        company={getConfig("about.company")}
        university={getConfig("about.university")}
      />
      <Work projects={homeProjects.length > 0 ? homeProjects : undefined} />
      <Writing posts={homeArticles.length > 0 ? homeArticles : undefined} />
      <Contact
        email={getConfig("contact.email")}
        github={getConfig("contact.github")}
        linkedin={getConfig("contact.linkedin")}
        location={getConfig("contact.location")}
      />
      <Footer
        availability={getConfig("footer.availability")}
        copyright={getConfig("footer.copyright")}
      />
    </>
  );
}
