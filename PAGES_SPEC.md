# Portfolio CMS - Page Inventory & Build Spec

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (dark theme)
- **Backend**: tRPC with React Query
- **Auth**: Better Auth (email/password + GitHub OAuth)
- **Database**: PostgreSQL + Prisma

---

## Public Pages (Portfolio Site)

### 1. Homepage (`/`)

**Purpose**: Portfolio landing page
**Data**: Fetches from `siteConfig`, `project`, `article` tRPC routers
**Sections**:

- Nav bar (logo + links)
- Hero section (tagline from siteConfig)
- About section (bio, skills from siteConfig)
- Work/Projects section (top 3 projects from DB)
- Writing section (latest 4 articles from DB)
- Contact section (email, socials from siteConfig)
- Footer

**tRPC Queries**:

- `siteConfig.getManyByKeys` - hero, about, contact, footer configs
- `project.getAll` - fetch projects
- `article.getAll` - fetch articles

### 2. Projects List (`/projects`)

**Purpose**: Display all portfolio projects grouped by year
**Data**: All projects from DB
**Features**:

- Group projects by year
- Show count stats
- Link to individual project pages

**tRPC Query**: `project.getAll`

### 3. Project Detail (`/projects/[slug]`)

**Purpose**: Individual project page with sections
**Data**: Single project + sections
**Features**:

- Project metadata (year, status, role, stack)
- HTML content sections
- Navigation back to projects

**tRPC Query**: `project.getBySlug`

### 4. Writing List (`/writing`)

**Purpose**: Blog post listing grouped by year
**Data**: All articles from DB
**Features**:

- Group by year from date string
- Show category badges

**tRPC Query**: `article.getAll`

### 5. Article Detail (`/writing/[slug]`)

**Purpose**: Individual blog post
**Data**: Single article with HTML content
**Features**:

- Article metadata (date, readTime, category, tags)
- Render HTML content
- Navigation

**tRPC Query**: `article.getBySlug`

### 6. Chat Page (`/chat`)

**Purpose**: Interactive chat interface
**Data**: Chat suggestions, responses, config from DB
**Features**:

- Dynamic suggestions from DB
- Bot responses based on keyword triggers
- Tool cards (message, meeting) with mailto links
- Chat config (title, model name) from DB

**tRPC Queries**:

- `chat.getSuggestions`
- `chat.getResponses`
- `chat.getConfig`

---

## Auth Pages

### 7. Login (`/login`)

**Purpose**: Authentication page
**Features**:

- Email/password login
- Email/password registration (toggle)
- GitHub OAuth
- Dark theme matching dashboard
- Redirect to `/dashboard` on success

**Client**: `authClient` from better-auth/react

---

## Dashboard Pages (Protected)

All dashboard pages require authentication. Unauthenticated users redirect to `/login`.

### 8. Dashboard Layout (`/dashboard/layout.tsx`)

**Purpose**: Shared layout for all dashboard pages
**Features**:

- Fixed sidebar navigation (desktop)
- Mobile sheet/drawer navigation
- User avatar dropdown (sign out, settings)
- Dark theme (slate-900 backgrounds)
- Active nav highlighting

**Navigation Items**:

- Overview
- Site Content
- Projects
- Writing
- Chat
- Users
- Settings

### 9. Dashboard Overview (`/dashboard`)

**Purpose**: Admin dashboard home
**Features**:

- 4 stat cards (Users, Projects, Articles, Legacy Posts)
- Recent activity table (legacy posts)
- Quick action links

**tRPC Query**: `dashboard.getStats`

### 10. Site Content Editor (`/dashboard/site`)

**Purpose**: Edit all site-wide content
**Features**:

- Tabbed interface (Hero, About, Contact, Footer, Nav, Meta)
- Form fields per section
- Save buttons per field
- Custom config keys section
- All values stored in `SiteConfig` table

**tRPC Queries**:

- `siteConfig.getAll`
- `siteConfig.set` (mutation)
- `siteConfig.delete` (mutation)

### 11. Projects Manager (`/dashboard/projects`)

**Purpose**: CRUD for portfolio projects
**Features**:

- Data table listing all projects
- Create/Edit dialog with form
- Fields: slug, title, lede, label, meta, desc, year, status, role, stack, category, tags, published, order
- Delete with dropdown menu
- View link to public page
- Stack/tags as comma-separated strings

**tRPC Queries**:

- `project.getAllAdmin`
- `project.create`
- `project.update`
- `project.delete`

### 12. Writing Manager (`/dashboard/writing`)

**Purpose**: CRUD for blog articles
**Features**:

- Data table listing all articles
- Create/Edit dialog with form
- Fields: slug, title, lede, date, readTime, category, tags, content (HTML), published
- Large HTML content textarea (monospace)
- Delete with dropdown menu

**tRPC Queries**:

- `article.getAllAdmin`
- `article.create`
- `article.update`
- `article.delete`

### 13. Chat Manager (`/dashboard/chat`)

**Purpose**: Manage chat suggestions and bot responses
**Features**:

- Tabs: Suggestions, Responses, Config
- Suggestions table (question, kind, tool, order, active)
- Responses table (trigger, response, order, active)
- Config section (pageTitle, modelName, systemPrompt)
- Create/Edit dialogs for each

**tRPC Queries**:

- `chat.getAllSuggestions`
- `chat.getAllResponses`
- `chat.getConfig`
- `chat.createSuggestion`, `chat.updateSuggestion`, `chat.deleteSuggestion`
- `chat.createResponse`, `chat.updateResponse`, `chat.deleteResponse`
- `chat.updateConfig`

### 14. Users Manager (`/dashboard/users`)

**Purpose**: User management
**Features**:

- Searchable data table
- Pagination
- User avatar, name, email
- Email verified badge
- Post count
- Join date
- Actions: Copy email, Delete

**tRPC Queries**:

- `dashboard.getUsers`
- `dashboard.deleteUser`

### 15. Settings (`/dashboard/settings`)

**Purpose**: User profile settings
**Features**:

- Display current user info
- Edit name/email form (UI only, not wired)
- Avatar display

**Data**: From auth session

---

## Backend API (tRPC Routers)

### `dashboard` Router

- `getStats` - Returns total counts (users, posts, projects, articles)
- `getRecentPosts` - Latest posts with author
- `getUsers` - Paginated, searchable user list
- `deleteUser` - Remove user
- `updateUser` - Update user info

### `siteConfig` Router

- `getAll` - All config entries
- `getByKey` - Single config by key
- `getManyByKeys` - Multiple configs by keys array
- `set` - Upsert config (key, value, type, description)
- `delete` - Remove config

### `project` Router

- `getAll` - Public: all published projects
- `getAllAdmin` - Protected: all projects with sections
- `getBySlug` - Public: single project with sections
- `create` - Protected: create project
- `update` - Protected: update project
- `delete` - Protected: delete project
- `createSection`, `updateSection`, `deleteSection` - Protected: manage sections

### `article` Router

- `getAll` - Public: all published articles
- `getAllAdmin` - Protected: all articles
- `getBySlug` - Public: single article
- `create` - Protected: create article
- `update` - Protected: update article
- `delete` - Protected: delete article

### `chat` Router

- `getSuggestions` - Public: active suggestions
- `getAllSuggestions` - Protected: all suggestions
- `createSuggestion`, `updateSuggestion`, `deleteSuggestion`
- `getResponses` - Public: active responses
- `getAllResponses` - Protected: all responses
- `createResponse`, `updateResponse`, `deleteResponse`
- `getConfig` - Public: chat config
- `updateConfig` - Protected: update config

---

## Database Schema (Prisma)

### Existing Models

- `User` - Better Auth user
- `Session` - Better Auth session
- `Account` - Better Auth account
- `Verification` - Better Auth verification
- `Post` - Legacy post model

### CMS Models

- `SiteConfig` - id, key (unique), value (text), type, description
- `Project` - id, slug (unique), title, lede, label, meta, desc, year, status, role, stack (string[]), category, tags (string[]), published, order
- `ProjectSection` - id, projectId, order, heading, content (text)
- `Article` - id, slug (unique), title, lede, date, readTime, category, tags (string[]), content (text), published
- `ChatSuggestion` - id, question, kind, tool, order, active
- `ChatResponse` - id, trigger, response (text), order, active
- `ChatConfig` - id, key (unique), pageTitle, modelName, systemPrompt (text)

---

## shadcn/ui Components Used

**Layout**: Card, Dialog, Sheet, Tabs, Separator, DropdownMenu, Avatar, Badge

**Forms**: Button, Input, Textarea, Label, Select (native)

**Data**: Table

**Icons**: lucide-react

---

## Environment Variables

```
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_GITHUB_CLIENT_ID="..."
BETTER_AUTH_GITHUB_CLIENT_SECRET="..."
```

---

## Key Features to Maintain

1. **Dark Theme**: All dashboard pages use slate-900 backgrounds with slate-800 borders
2. **shadcn Styling**: Components should look like shadcn defaults (proper borders, shadows, focus rings)
3. **Responsive**: Sidebar collapses on mobile with sheet navigation
4. **Auth Guard**: Dashboard pages redirect to `/login` if not authenticated
5. **Data Fetching**: All data comes from tRPC, no hardcoded content
6. **Seed Data**: Run `pnpm db:seed` to populate existing content

## Pages That Need the Most Work

1. `/dashboard/chat` - Chat manager UI (suggestions/responses/config)
2. `/dashboard/users` - Users table with search/pagination
3. `/dashboard/settings` - Profile settings form
4. `/login` - Auth page styling
5. All dashboard sub-pages need consistent shadcn styling
