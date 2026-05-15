import { About } from "~/app/_components/about";
import { Contact } from "~/app/_components/contact";
import { Footer } from "~/app/_components/footer";
import { Hero } from "~/app/_components/hero";
import { Nav } from "~/app/_components/nav";
import { Work } from "~/app/_components/work";
import { Writing } from "~/app/_components/writing";
import { articles, projects, siteConfig } from "~/app/_data/public-content";

export default function Home() {
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
        tagline={siteConfig.hero.tagline}
        emphasis={siteConfig.hero.emphasis}
      />
      <About
        name={siteConfig.about.name}
        role={siteConfig.about.role}
        location={siteConfig.about.location}
        bio2={siteConfig.about.bio2}
        skills={siteConfig.about.skills}
      />
      <Work projects={homeProjects} />
      <Writing posts={homeArticles} />
      <Contact
        email={siteConfig.contact.email}
        github={siteConfig.contact.github}
        linkedin={siteConfig.contact.linkedin}
        location={siteConfig.contact.location}
      />
      <Footer
        availability={siteConfig.footer.availability}
        copyright={siteConfig.footer.copyright}
      />
    </>
  );
}
