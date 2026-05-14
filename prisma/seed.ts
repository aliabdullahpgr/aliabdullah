import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ─── Site Config ───
  const siteConfigs = [
    {
      key: "hero.tagline",
      value: "I build systems with design and",
      type: "text",
    },
    { key: "hero.taglineEmphasis", value: "purpose.", type: "text" },
    { key: "about.name", value: "Ali Abdullah", type: "text" },
    { key: "about.role", value: "Software Engineer", type: "text" },
    { key: "about.location", value: "Multan, Pakistan", type: "text" },
    {
      key: "about.bio2",
      value:
        "I work across the full stack and care about clean interfaces, honest backend APIs, and AI-powered tools that solve real problems.",
      type: "text",
    },
    {
      key: "about.skills",
      value: "ts · react · next · node · mongo · python · docker",
      type: "text",
    },
    { key: "about.company", value: "VieroMind", type: "text" },
    {
      key: "about.university",
      value: "MNS-University of Agriculture",
      type: "text",
    },
    { key: "contact.email", value: "aliabdullah3676@gmail.com", type: "text" },
    { key: "contact.github", value: "#", type: "text" },
    { key: "contact.linkedin", value: "#", type: "text" },
    { key: "contact.location", value: "Multan, Pakistan", type: "text" },
    {
      key: "footer.availability",
      value: "Available for collaboration",
      type: "text",
    },
    { key: "footer.copyright", value: "© 2026 — built lean", type: "text" },
    { key: "nav.brand", value: "ali abdullah", type: "text" },
    { key: "nav.subtitle", value: "swe", type: "text" },
    {
      key: "meta.title",
      value: "Ali Abdullah — Software Engineer",
      type: "text",
    },
    {
      key: "meta.description",
      value:
        "Software Engineer in Multan, Pakistan. Building systems with design and purpose.",
      type: "text",
    },
  ];

  for (const config of siteConfigs) {
    await db.siteConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }
  console.log("✓ Site config seeded");

  // ─── Projects ───
  const projects = [
    {
      slug: "vieromind-blog",
      title: "VieroMind Blog",
      lede: "Scalable blogging platform with Sanity CMS, ISR, and a custom MDX pipeline. Currently in production.",
      label: "screenshot — editor",
      meta: "2026 · VieroMind",
      desc: "Scalable blogging platform with Sanity CMS, ISR, and a custom MDX pipeline. Currently in production.",
      year: "2026",
      status: "In production",
      role: "Full-stack lead",
      stack: ["Next.js", "Sanity", "TypeScript", "MDX"],
      category: "SaaS",
      tags: ["blog", "cms", "nextjs"],
      published: true,
      order: 0,
    },
    {
      slug: "pulse",
      title: "Pulse",
      lede: "Lightweight analytics dashboard built for a small team — server-side aggregation, no third-party trackers.",
      label: "dashboard — analytics",
      meta: "2026 · Internal tool",
      desc: "Lightweight analytics dashboard built for a small team — server-side aggregation, no third-party trackers.",
      year: "2026",
      status: "In production",
      role: "Solo",
      stack: ["Next.js", "Postgres", "Charts"],
      category: "Internal tool",
      tags: ["analytics", "dashboard"],
      published: true,
      order: 1,
    },
    {
      slug: "raf-sp",
      title: "RAF-SP",
      lede: "Agriculture platform consolidating data from 15+ departments across South Punjab into one dashboard.",
      label: "screenshot — dashboard",
      meta: "2025 · Government",
      desc: "Agriculture platform consolidating data from 15+ departments across South Punjab into one dashboard.",
      year: "2025",
      status: "In production",
      role: "Full-stack lead",
      stack: ["React", "Node", "MongoDB", "SQL"],
      category: "Government",
      tags: ["agriculture", "dashboard", "government"],
      published: true,
      order: 2,
    },
    {
      slug: "hisaabscore",
      title: "HisaabScore",
      lede: "AI-powered alternative credit scoring for the underbanked, built end-to-end on the MERN stack.",
      label: "screenshot — credit profile",
      meta: "2025 · Fintech",
      desc: "AI-powered alternative credit scoring for the underbanked, built end-to-end on the MERN stack.",
      year: "2025",
      status: "In production",
      role: "Full-stack",
      stack: ["MERN", "Redux", "MUI v5"],
      category: "Fintech",
      tags: ["ai", "credit", "fintech"],
      published: true,
      order: 3,
    },
    {
      slug: "function-calling-agent",
      title: "Function-Calling Agent",
      lede: "Python agent on Gemini with persistent memory, sandboxed code execution, and strict path validation.",
      label: "terminal — agent loop",
      meta: "2025 · AI",
      desc: "Python agent on Gemini with persistent memory, sandboxed code execution, and strict path validation.",
      year: "2025",
      status: "Prototype",
      role: "Solo",
      stack: ["Python", "Gemini", "Agents"],
      category: "AI",
      tags: ["ai", "agents", "python"],
      published: true,
      order: 4,
    },
    {
      slug: "tasq",
      title: "Tasq",
      lede: "A task tracker that finally clicked for me — keyboard-first, single-file local DB, no accounts.",
      label: "ui — task board",
      meta: "2025 · Side project",
      desc: "A task tracker that finally clicked for me — keyboard-first, single-file local DB, no accounts.",
      year: "2025",
      status: "In production",
      role: "Solo",
      stack: ["SvelteKit", "SQLite", "PWA"],
      category: "Side project",
      tags: ["productivity", "pwa"],
      published: true,
      order: 5,
    },
    {
      slug: "md-vec",
      title: "md-vec",
      lede: "A tiny CLI that turns a folder of markdown into a queryable vector index. Used in three of my own tools.",
      label: "diagram — pipeline",
      meta: "2025 · Open source",
      desc: "A tiny CLI that turns a folder of markdown into a queryable vector index. Used in three of my own tools.",
      year: "2025",
      status: "Open source",
      role: "Solo",
      stack: ["Python", "CLI", "Embeddings"],
      category: "Open source",
      tags: ["cli", "python", "open-source"],
      published: true,
      order: 6,
    },
    {
      slug: "khaata",
      title: "Khaata",
      lede: "Lightweight bookkeeping app for a local shop. Built fast, shipped faster, still in daily use.",
      label: "screenshot — store",
      meta: "2024 · Client",
      desc: "Lightweight bookkeeping app for a local shop. Built fast, shipped faster, still in daily use.",
      year: "2024",
      status: "In production",
      role: "Solo",
      stack: ["React Native", "Express", "SQLite"],
      category: "Client",
      tags: ["mobile", "bookkeeping"],
      published: true,
      order: 7,
    },
    {
      slug: "rag-notebook",
      title: "RAG Notebook",
      lede: "Won 1st place — a chat-with-your-PDFs interface with citation overlays and per-document memory.",
      label: "ui — chat thread",
      meta: "2024 · Hackathon",
      desc: "Won 1st place — a chat-with-your-PDFs interface with citation overlays and per-document memory.",
      year: "2024",
      status: "Hackathon",
      role: "Team",
      stack: ["LangChain", "FastAPI", "Pinecone"],
      category: "Hackathon",
      tags: ["ai", "rag", "hackathon"],
      published: true,
      order: 8,
    },
    {
      slug: "slate-ui",
      title: "slate-ui",
      lede: "A small headless React component library I made for myself, then ended up using everywhere.",
      label: "component library",
      meta: "2024 · Open source",
      desc: "A small headless React component library I made for myself, then ended up using everywhere.",
      year: "2024",
      status: "Open source",
      role: "Solo",
      stack: ["React", "TypeScript", "Radix"],
      category: "Open source",
      tags: ["ui", "react", "open-source"],
      published: true,
      order: 9,
    },
    {
      slug: "hostel-portal",
      title: "Hostel Portal",
      lede: "My first real full-stack project — room allocation, mess accounts, complaint tickets. Taught me a lot.",
      label: "ui — dorm portal",
      meta: "2023 · University",
      desc: "My first real full-stack project — room allocation, mess accounts, complaint tickets. Taught me a lot.",
      year: "2023",
      status: "Archived",
      role: "Solo",
      stack: ["PHP", "MySQL", "jQuery"],
      category: "University",
      tags: ["university", "php"],
      published: true,
      order: 10,
    },
  ];

  for (const project of projects) {
    await db.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
  }
  console.log("✓ Projects seeded");

  // ─── RAF-SP Detail Sections ───
  const rafSp = await db.project.findUnique({ where: { slug: "raf-sp" } });
  if (rafSp) {
    await db.projectSection.deleteMany({ where: { projectId: rafSp.id } });
    await db.projectSection.createMany({
      data: [
        {
          projectId: rafSp.id,
          order: 0,
          heading: "Context",
          content:
            "<p>Asset records lived across spreadsheets, paper logs, and one Access database nobody wanted to touch. Reconciling a single number took a week of phone calls.</p>",
        },
        {
          projectId: rafSp.id,
          order: 1,
          heading: "What it does",
          content:
            "<ul><li>Tracks 40+ asset categories with full audit history.</li><li>Real-time dashboards per department, role-scoped.</li><li>Cross-department reports — week to one click.</li><li>Bulk import that absorbs the legacy spreadsheets.</li></ul>",
        },
        {
          projectId: rafSp.id,
          order: 2,
          heading: "My role",
          content:
            "<p>Led a team of three. Designed the data model, the role-based permission layer, and the audit log. Built a custom D3 chart layer for densities the off-the-shelf options choked on.</p>",
        },
      ],
    });
    console.log("✓ RAF-SP sections seeded");
  }

  // ─── Articles ───
  const articles = [
    {
      slug: "migrating-blog-to-sanity",
      title: "Migrating a blog system to Sanity without breaking SEO",
      lede: "Two years of posts, three CMSes, one rewrite. Here's how I moved everything to Sanity in a weekend without dropping a single ranking.",
      date: "2026 · 04 · 22",
      readTime: "9 min read",
      category: "Engineering",
      tags: ["Sanity", "SEO", "CMS", "Migration"],
      content: `
        <div class="aside-box"><div class="tag-line">TL;DR</div><p>Pre-build a complete URL inventory, mirror it 1:1 in the new CMS, swap DNS only after verifying every redirect with a script. Don't trust your sitemap — trust your access logs.</p></div>
        <p>The first time I migrated a blog, I lost half the traffic for a month. I wrote about it as a public failure on day three of the dip — and then quietly fixed it on day twelve. That post is still up. This one is the version I wish I'd had then.</p>
        <p>I was moving <b>VieroMind's</b> blog from a hand-rolled MDX setup to Sanity. The brief from the team was unromantic: "Don't break anything, and let editors stop opening pull requests." Two-line briefs are usually the hardest ones.</p>
        <h2>The actual problem</h2>
        <p>SEO migrations fail in three places, and they're all boring:</p>
        <ol><li>URLs change shape, even slightly, and old ones 404.</li><li>Metadata gets re-rendered with subtle differences — title length, OG image dimensions, missing canonical tags.</li><li>Internal links still point at the old URLs because nobody updated them.</li></ol>
        <p>Each one is fixable in isolation. Together, they're a slow-motion ranking drop you only notice in week three when the marketing person walks over.</p>
        <h2>Step one: inventory before you migrate</h2>
        <p>Before touching the CMS, I pulled three lists:</p>
        <ul><li>Every URL the search console had impressions for in the last 12 months.</li><li>Every URL the access logs had a non-bot 2xx for, ditto.</li><li>Every URL the sitemap claimed existed.</li></ul>
        <p>The union of those three is your real surface area. The sitemap alone always lies — old posts get unpublished, drafts leak in, redirect chains hide entire sections.</p>
        <h2>Step two: mirror, don't redesign</h2>
        <blockquote>A migration is not a redesign. A migration is not a redesign. A migration is not a redesign.</blockquote>
        <p>I wrote that on a sticky note and put it on my monitor. Every time I caught myself thinking "while we're in here, we could just…" I'd look at it.</p>
        <p>The rule: <b>v1 is a 1:1 mirror.</b> Same URLs, same titles, same meta. Improvements ship in v1.1 — after the dust settles.</p>
        <h2>Step three: redirects as code</h2>
        <p>Even with a 1:1 mirror, you'll have a few changes. I wrote a flat <code>redirects.json</code>, generated from a diff of the old and new URL sets.</p>
        <h2>Step four: verify, don't trust</h2>
        <p>Before swapping DNS I ran the full URL list through a checker that compared status code, title, canonical URL, and OG image.</p>
        <h2>What I'd do differently</h2>
        <p>The migration itself was clean. The thing I'd change: I waited too long to involve the editorial team. They had small process needs that were trivial to add up front and a real pain to retrofit.</p>
        <hr />
        <p>If you've done a similar migration and have war stories, I'd genuinely love to hear them.</p>
      `,
      published: true,
    },
    {
      slug: "function-calling",
      title: "Function calling, in plain English",
      lede: "The most useful LLM feature nobody explains well.",
      date: "2026 · 03 · 09",
      readTime: "6 min read",
      category: "AI",
      tags: ["AI", "LLM", "Function Calling"],
      content: `<p>Function calling is the bridge between a language model and the real world. Instead of just generating text, the model can decide to call a function you provide.</p><h2>How it works</h2><p>You give the model a schema — a list of functions with names, descriptions, and parameters. The model decides which function to call based on the conversation.</p><h2>Why it matters</h2><p>Without function calling, you're limited to text generation. With it, the model can book flights, query databases, send emails, and more.</p>`,
      published: true,
    },
    {
      slug: "leetcode-lessons",
      title: "300 LeetCode problems later, here's what stuck",
      lede: "The patterns that actually show up in real code.",
      date: "2026 · 02 · 14",
      readTime: "7 min read",
      category: "Notes",
      tags: ["Algorithms", "Career"],
      content: `<p>I spent six months doing LeetCode daily. Here's what actually mattered.</p><h2>The 80/20</h2><p>Most interviews test the same 10 patterns: two pointers, sliding window, BFS/DFS, binary search, topological sort, union-find, dynamic programming, backtracking, greedy, and bit manipulation.</p><h2>What I got wrong</h2><p>I spent too long on hard dynamic programming problems. In practice, medium-level DP is enough for 90% of cases.</p>`,
      published: true,
    },
    {
      slug: "nextjs-folder-structure",
      title:
        "A folder structure for Next.js apps that doesn't fight you at month six",
      lede: "The one that survived three rewrites.",
      date: "2026 · 01 · 28",
      readTime: "5 min read",
      category: "Engineering",
      tags: ["Next.js", "Architecture"],
      content: `<p>Folder structure is the first technical decision you make and the hardest to change. Here's what I've settled on after three years of Next.js.</p><h2>The structure</h2><p>Keep features co-located. Group by domain, not by type. A <code>features/auth</code> folder contains everything auth-related: components, hooks, types, and API calls.</p>`,
      published: true,
    },
    {
      slug: "reading-codebase",
      title: "Reading a codebase for the first time, on purpose",
      lede: "A system for understanding code you didn't write.",
      date: "2026 · 01 · 11",
      readTime: "4 min read",
      category: "Craft",
      tags: ["Code Review", "Learning"],
      content: `<p>The first hour in a new codebase is the most important. Here's how I approach it.</p><h2>Start with the data</h2><p>Find the database schema or API types first. Data structures reveal intent better than any README.</p>`,
      published: true,
    },
    {
      slug: "writing-tests",
      title: "Writing tests I'll actually keep",
      lede: "The test pyramid is a lie. Here's what works.",
      date: "2026 · 01 · 03",
      readTime: "6 min read",
      category: "Engineering",
      tags: ["Testing", "TDD"],
      content: `<p>I've deleted more tests than I've kept. Here's what survives.</p><h2>The rules</h2><p>Test behavior, not implementation. One assertion per test. Use factories, not fixtures. Never mock what you don't own.</p>`,
      published: true,
    },
    {
      slug: "stop-chasing-coverage",
      title: "Why I stopped chasing 100% coverage",
      lede: "Coverage is a vanity metric.",
      date: "2025 · 12 · 14",
      readTime: "4 min read",
      category: "Engineering",
      tags: ["Testing", "Metrics"],
      content: `<p>100% coverage means nothing if your tests don't catch real bugs. Focus on confidence, not percentages.</p>`,
      published: true,
    },
    {
      slug: "boring-databases",
      title: "A small case for boring databases",
      lede: "Postgres is enough.",
      date: "2025 · 10 · 30",
      readTime: "5 min read",
      category: "Backend",
      tags: ["Postgres", "Databases"],
      content: `<p>I've used Mongo, Cassandra, Redis, and every flavor of NoSQL. I keep coming back to Postgres.</p>`,
      published: true,
    },
    {
      slug: "rag-when-it-helps",
      title: "RAG, but only when it actually helps",
      lede: "Not every problem needs retrieval.",
      date: "2025 · 09 · 22",
      readTime: "6 min read",
      category: "AI",
      tags: ["RAG", "LLM", "AI"],
      content: `<p>RAG is powerful but expensive. Use it when context exceeds the model's window or when facts change frequently.</p>`,
      published: true,
    },
    {
      slug: "shipping-for-governments",
      title: "Notes on shipping for governments",
      lede: "Slow is smooth, smooth is fast.",
      date: "2025 · 07 · 06",
      readTime: "5 min read",
      category: "Career",
      tags: ["Government", "Shipping"],
      content: `<p>Government projects move slowly for good reasons. Learn the process, then find the fast paths within it.</p>`,
      published: true,
    },
    {
      slug: "smaller-monorepo",
      title: "My monorepo got smaller, on purpose",
      lede: "The best code is no code.",
      date: "2025 · 05 · 17",
      readTime: "4 min read",
      category: "Engineering",
      tags: ["Monorepo", "Architecture"],
      content: `<p>I deleted half my packages and the build got faster, the tests got clearer, and onboarding got easier.</p>`,
      published: true,
    },
    {
      slug: "pair-programming-llm",
      title: "A year of pair-programming with an LLM",
      lede: "What works, what doesn't, and what's next.",
      date: "2025 · 03 · 02",
      readTime: "8 min read",
      category: "AI",
      tags: ["AI", "Productivity"],
      content: `<p>I've been using LLMs as a pair programmer for a year. Here's my honest assessment.</p>`,
      published: true,
    },
    {
      slug: "stop-state-libraries",
      title: "Stop reaching for state libraries",
      lede: "React is enough.",
      date: "2025 · 01 · 19",
      readTime: "5 min read",
      category: "Frontend",
      tags: ["React", "State Management"],
      content: `<p>Before you npm install zustand, jotai, or redux, ask if useState and useContext are enough. They usually are.</p>`,
      published: true,
    },
    {
      slug: "first-post",
      title: "First post — why I started writing",
      lede: "Writing is thinking.",
      date: "2024 · 11 · 08",
      readTime: "3 min read",
      category: "Notes",
      tags: ["Writing", "Career"],
      content: `<p>I started writing to think better. The side effect was a portfolio of ideas I can reference and refine.</p>`,
      published: true,
    },
  ];

  for (const article of articles) {
    await db.article.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
  }
  console.log("✓ Articles seeded");

  // ─── Chat Suggestions ───
  const suggestions = [
    {
      question: "What is Ali working on right now?",
      kind: "ask",
      tool: null,
      order: 0,
      active: true,
    },
    {
      question: "Walk me through RAF-SP — what was hard about it?",
      kind: "ask",
      tool: null,
      order: 1,
      active: true,
    },
    {
      question: "What's his stack and how does he pick tools?",
      kind: "ask",
      tool: null,
      order: 2,
      active: true,
    },
    {
      question: "Is he open to new work?",
      kind: "ask",
      tool: null,
      order: 3,
      active: true,
    },
    {
      question: "I want to send Ali a message.",
      kind: "tool",
      tool: "message",
      order: 4,
      active: true,
    },
    {
      question: "I want to schedule a 30-minute call.",
      kind: "tool",
      tool: "meeting",
      order: 5,
      active: true,
    },
  ];

  await db.chatSuggestion.deleteMany({});
  await db.chatSuggestion.createMany({ data: suggestions });
  console.log("✓ Chat suggestions seeded");

  // ─── Chat Responses ───
  const responses = [
    {
      trigger: "working on",
      response:
        "Ali is currently building a scalable blogging platform at VieroMind using Next.js, Sanity CMS, and TypeScript.",
      order: 0,
      active: true,
    },
    {
      trigger: "raf-sp",
      response:
        "RAF-SP was a government agriculture platform that consolidated data from 15+ departments across South Punjab. The hard part was designing a data model that could handle 40+ asset categories while keeping the audit trail intact.",
      order: 1,
      active: true,
    },
    {
      trigger: "stack",
      response:
        "Ali's current stack is TypeScript, React, Next.js, Node, Express, MongoDB, Postgres, Python, and Docker. He picks tools based on team size and how long the project needs to live.",
      order: 2,
      active: true,
    },
    {
      trigger: "open to new work",
      response:
        "Yes, Ali is open to interesting collaboration — especially on developer tools, AI products, and civic-tech projects.",
      order: 3,
      active: true,
    },
  ];

  await db.chatResponse.deleteMany({});
  await db.chatResponse.createMany({ data: responses });
  console.log("✓ Chat responses seeded");

  // ─── Chat Config ───
  await db.chatConfig.upsert({
    where: { key: "default" },
    update: {},
    create: {
      key: "default",
      pageTitle: "Ask Ali anything",
      modelName: "claude-3-5-sonnet",
      systemPrompt: "",
    },
  });
  console.log("✓ Chat config seeded");

  console.log("\n🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
