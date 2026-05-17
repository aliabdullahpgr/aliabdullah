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

const SITE_CONFIG_KEYS = [
  "hero.tagline",
  "hero.taglineEmphasis",
  "about.name",
  "about.role",
  "about.location",
  "about.bio2",
  "about.skills",
  "contact.email",
  "contact.github",
  "contact.linkedin",
  "contact.location",
  "footer.availability",
  "footer.copyright",
];

export default async function Home() {
  const [configs, projects, articles] = await Promise.all([
    getPublicSiteConfigs(SITE_CONFIG_KEYS),
    getPublicProjects(),
    getPublicArticles(),
  ]);

  const cfg = Object.fromEntries(configs.map((c) => [c.key, c.value]));

  const homeProjects = projects.slice(0, 3).map((p) => ({
    slug: p.slug,
    label: p.label,
    year: p.year,
    category: p.category,
    title: p.title,
    desc: p.desc,
    tags: p.stack,
    image: p.image,
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
        tagline={cfg["hero.tagline"]}
        emphasis={cfg["hero.taglineEmphasis"]}
      />
      <About
        name={cfg["about.name"]}
        role={cfg["about.role"]}
        location={cfg["about.location"]}
        bio2={cfg["about.bio2"]}
        skills={cfg["about.skills"]}
      />
      <Work projects={homeProjects} />
      <Writing posts={homeArticles} />
      <Contact
        email={cfg["contact.email"]}
        github={cfg["contact.github"]}
        linkedin={cfg["contact.linkedin"]}
        location={cfg["contact.location"]}
      />
      <Footer
        availability={cfg["footer.availability"]}
        copyright={cfg["footer.copyright"]}
      />
    </>
  );
}
