export const dynamic = "force-dynamic";

import { About } from "~/app/_components/about";
import { Contact } from "~/app/_components/contact";
import { Footer } from "~/app/_components/footer";
import { Hero } from "~/app/_components/hero";
import { Nav } from "~/app/_components/nav";
import { Work } from "~/app/_components/work";
import { Writing } from "~/app/_components/writing";
import {
  getPublicArticles,
  getPublicProjects,
  getPublicSiteConfigs,
} from "~/server/public-cms";

export default async function Home() {
  const [configs, projects, articles] = await Promise.all([
    getPublicSiteConfigs([
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
    ]),
    getPublicProjects(),
    getPublicArticles(),
  ]);

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
