# Portfolio CMS - Design Brief

## Overview

A portfolio website with a content management dashboard. The public site showcases projects and writing. The dashboard lets the owner edit everything without touching code.

---

## Public Site Pages

### 1. Homepage

Single-page portfolio with sections:

- **Navigation** - Logo + links (Chat, Work, Writing)
- **Hero** - Large tagline with emphasis word
- **About** - Bio, location, company, university, skills list
- **Selected Work** - 3 featured project cards (image placeholder, year, category, title, description, tech tags)
- **Writing** - 4 latest article links (date, title)
- **Contact** - Email, GitHub, LinkedIn, location
- **Footer** - Availability status + copyright

### 2. Projects Page

Archive of all projects:

- Grouped by year with count indicators
- Each project card: label, meta info, title, description, tech tags
- Stats bar at top (total, active since, in production, open source)

### 3. Project Detail Page

Individual project showcase:

- Breadcrumb navigation
- Large title + short description (lede)
- Metadata sidebar (year, status, role, tech stack tags)
- Content sections with headings and paragraphs
- Previous/next project navigation

### 4. Writing Page

Blog post listing:

- Grouped by year with count indicators
- Each post: date, title, category
- Stats bar (total, active since, this year)

### 5. Article Detail Page

Individual blog post:

- Breadcrumb navigation
- Title + lede paragraph
- Date / read time / category
- Full article content (rich text)
- Tags at bottom
- Share links

### 6. Chat Page

Interactive chat interface:

- Header with title and model info
- Suggestion buttons (6 preset questions)
- Chat thread (user messages + agent responses)
- Tool cards for "send message" and "schedule meeting"
- Text input with send button

---

## Auth Page

### 7. Login Page

Simple centered login form:

- Portfolio CMS logo/branding
- Email input
- Password input
- Sign In button
- "Continue with GitHub" button
- Toggle between Sign In / Create Account
- Link back to portfolio

---

## Dashboard (Admin Panel)

All pages share a consistent layout:

- **Left sidebar** - Navigation menu (collapsible on mobile)
- **Top bar** - User avatar dropdown (settings, sign out)
- **Dark theme** - Deep dark background throughout
- All pages require login

### 8. Dashboard Overview

Home screen showing site stats:

- 4 stat cards: Total Users, Projects, Articles, Legacy Posts
- Recent Activity table (legacy posts list)
- Quick Actions panel (shortcut links to other dashboard sections)

### 9. Site Content Editor

Edit all homepage content without code:

- **Tabs**: Hero, About, Contact, Footer, Navigation, Meta
- Each tab has labeled form fields (text inputs and textareas)
- Save button per field
- Custom section for additional config keys

### 10. Projects Manager

Manage portfolio projects:

- Table listing all projects (title, year, category, status)
- Status badges (Published/Draft)
- Actions: Edit, View, Delete
- "Add Project" button opens form dialog:
  - Fields: slug, title, lede, label, meta, description, year, status, role, stack, category, tags, order, published toggle
- Stack and tags entered as comma-separated values

### 11. Writing Manager

Manage blog articles:

- Table listing all articles (title, date, category, status)
- Status badges (Published/Draft)
- Actions: Edit, View, Delete
- "New Article" button opens form dialog:
  - Fields: slug, title, lede, date, read time, category, tags, content (large HTML textarea), published toggle

### 12. Chat Manager

Manage chat bot behavior:

- **Tab 1 - Suggestions**: Table of question suggestions
  - Columns: question text, kind (ask/tool), tool type, order, active status
  - Actions: Edit, Delete
  - "New Suggestion" button
  - Form: question, kind dropdown, tool dropdown, order, active toggle

- **Tab 2 - Bot Responses**: Table of keyword responses
  - Columns: trigger keyword, response text, order, active status
  - Actions: Edit, Delete
  - "New Response" button
  - Form: trigger, response textarea, order, active toggle

- **Tab 3 - Page Config**: Chat page settings
  - Fields: page title, model name display, system prompt textarea
  - Save button

### 13. Users Manager

Manage user accounts:

- Searchable table
- Columns: user (avatar + name), email, status (verified/unverified), posts count, joined date
- Pagination controls
- Actions dropdown: Copy email, Delete user

### 14. Settings

User profile page:

- User avatar display
- Name field (editable)
- Email field (editable)
- Save Changes button

---

## User Flow

1. **Visitor** → browses public site (homepage, projects, writing, chat)
2. **Owner** → goes to `/login` → signs in (email or GitHub)
3. **Redirect** → dashboard overview
4. **Navigation** → uses sidebar to access different management sections
5. **Editing** → makes changes in forms, clicks save
6. **Public site** → updates immediately reflect on frontend
7. **Sign out** → avatar dropdown → sign out → back to login

---

## Design Notes

- **Dashboard aesthetic**: Dark mode, clean data tables, card-based layouts, subtle borders
- **shadcn/ui components**: Tables, cards, dialogs, tabs, buttons, inputs, badges, dropdowns
- **Public site aesthetic**: Minimal, typographic, content-focused (existing design)
- **Responsive**: Dashboard sidebar collapses to hamburger menu on mobile
