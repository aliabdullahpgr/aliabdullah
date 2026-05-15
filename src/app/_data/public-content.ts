export const siteConfig = {
  hero: {
    tagline: "I build systems with design and",
    emphasis: "purpose.",
  },
  about: {
    name: "Ali Abdullah",
    role: "Software Engineer",
    location: "Multan, Pakistan",
    bio2: "I work across the full stack and care about clean interfaces, honest backend APIs, and AI-powered tools that solve real problems.",
    skills: "ts · react · next · node · mongo · python · docker",
  },
  contact: {
    email: "aliabdullah3676@gmail.com",
    github: "https://github.com/aliabdullah",
    linkedin: "https://linkedin.com/in/aliabdullah",
    location: "Multan, Pakistan",
  },
  footer: {
    availability: "Available for collaboration",
    copyright: "© 2026 — built lean",
  },
} as const;

export interface PublicProject {
  slug: string;
  label: string;
  year: string;
  category: string;
  title: string;
  desc: string;
  lede: string;
  meta: string;
  status: string;
  role: string;
  stack: string[];
  sections: Array<{
    id: string;
    heading: string;
    content: string;
  }>;
}

export const projects: PublicProject[] = [
  {
    slug: "raf-sp",
    label: "screenshot — dashboard",
    year: "2025",
    category: "Government",
    title: "RAF-SP",
    desc: "Agriculture platform consolidating data from 15+ departments across South Punjab into one dashboard.",
    lede: "A government-facing agriculture platform built to turn fragmented departmental data into a clearer operational picture.",
    meta: "2025 · Government",
    status: "In production",
    role: "Full-stack engineer",
    stack: ["React", "Node", "MongoDB", "SQL"],
    sections: [
      {
        id: "overview",
        heading: "Overview",
        content:
          "<p>RAF-SP brought reporting, dashboards, and departmental views into one system so teams could inspect agriculture data without chasing spreadsheets.</p>",
      },
      {
        id: "work",
        heading: "Work",
        content:
          "<p>I worked across the interface and backend data flows, focusing on dependable screens, clean query paths, and dashboard views that could be scanned quickly.</p>",
      },
    ],
  },
  {
    slug: "hisaabscore",
    label: "screenshot — credit profile",
    year: "2025",
    category: "Fintech",
    title: "HisaabScore",
    desc: "AI-powered alternative credit scoring for the underbanked, built end-to-end on the MERN stack.",
    lede: "A credit profile product exploring alternative signals for people outside traditional banking data.",
    meta: "2025 · Fintech",
    status: "Prototype",
    role: "Full-stack engineer",
    stack: ["MERN", "Redux", "MUI v5"],
    sections: [
      {
        id: "overview",
        heading: "Overview",
        content:
          "<p>HisaabScore focused on making creditworthiness easier to understand through structured profiles, explainable signals, and a practical operator dashboard.</p>",
      },
      {
        id: "work",
        heading: "Work",
        content:
          "<p>I built the application flow, state management, and scoring UI so profile data could be reviewed without burying important signals.</p>",
      },
    ],
  },
  {
    slug: "function-calling-agent",
    label: "terminal — agent loop",
    year: "2025",
    category: "AI",
    title: "Function-Calling Agent",
    desc: "Python agent on Gemini with persistent memory, sandboxed code execution, and strict path validation.",
    lede: "An agent runtime experiment focused on tool use, memory, and safer local execution boundaries.",
    meta: "2025 · AI",
    status: "Open source",
    role: "Builder",
    stack: ["Python", "Gemini", "Agents"],
    sections: [
      {
        id: "overview",
        heading: "Overview",
        content:
          "<p>The agent explored how function calling can be made more predictable with explicit tool contracts, persistent memory, and controlled filesystem access.</p>",
      },
      {
        id: "work",
        heading: "Work",
        content:
          "<p>I designed the execution loop, validation boundaries, and memory layer to keep tool calls understandable and easier to debug.</p>",
      },
    ],
  },
];

export interface PublicArticle {
  slug: string;
  date: string;
  title: string;
  lede: string;
  readTime: string;
  category: string;
  tags: string[];
  content: string;
}

export const articles: PublicArticle[] = [
  {
    date: "2026 · 04 · 22",
    title: "Migrating a blog system to Sanity without breaking SEO",
    slug: "migrating-blog-to-sanity",
    lede: "A practical migration note on keeping content moves boring for users and search engines.",
    readTime: "5 min read",
    category: "Engineering",
    tags: ["CMS", "SEO", "Next.js"],
    content:
      "<p>The safest CMS migration starts with preserving URLs, metadata, redirects, and canonical behavior before touching the editor experience.</p><p>Once those contracts are stable, the rest of the migration becomes a content modeling and publishing workflow problem.</p>",
  },
  {
    date: "2026 · 03 · 09",
    title: "Function calling, in plain English",
    slug: "function-calling",
    lede: "A short explanation of how tool-calling agents decide what to do next.",
    readTime: "4 min read",
    category: "AI",
    tags: ["Agents", "LLMs", "Tools"],
    content:
      "<p>Function calling is a way to give a model named actions with strict inputs instead of asking it to freestyle side effects.</p><p>The useful part is not magic. It is the contract: clear tools, clear arguments, and code that decides how to execute them.</p>",
  },
  {
    date: "2026 · 02 · 14",
    title: "300 LeetCode problems later, here's what stuck",
    slug: "leetcode-lessons",
    lede: "What repeated algorithm practice actually improved and what it did not.",
    readTime: "6 min read",
    category: "Learning",
    tags: ["Algorithms", "Practice", "Career"],
    content:
      "<p>The biggest improvement was pattern recognition: knowing when a problem smells like two pointers, dynamic programming, graph traversal, or binary search.</p><p>The second improvement was restraint. A clean brute force explanation often leads to the right optimized version faster than guessing tricks.</p>",
  },
  {
    date: "2026 · 01 · 28",
    title:
      "A folder structure for Next.js apps that doesn't fight you at month six",
    slug: "nextjs-folder-structure",
    lede: "A small note on keeping App Router projects understandable as they grow.",
    readTime: "5 min read",
    category: "Next.js",
    tags: ["Next.js", "Architecture", "TypeScript"],
    content:
      "<p>Folders should explain ownership. Route code belongs near routes, shared primitives belong in components, and server-only behavior should be obvious from imports.</p><p>The goal is not a perfect taxonomy. The goal is making the next change easier to place.</p>",
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}
