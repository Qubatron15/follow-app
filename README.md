# FollowApp

> Lightweight web application that automates tracking of meeting Action Points (AP) for busy corporate managers.

## Table of Contents
1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Getting Started Locally](#getting-started-locally)
4. [Available Scripts](#available-scripts)
5. [Project Scope](#project-scope)
6. [Project Status](#project-status)
7. [License](#license)

## Project Description
FollowApp lets you:
* Create topic threads as tabs for each project or initiative.
* Paste meeting transcripts (≤ 30 000 characters per thread).
* With a single click, generate or re-generate an Action Point list using the OpenAI API (supports Polish & English).
* Manually edit, complete or delete APs while the app keeps everything in sync with the database.

The result is one central, always up-to-date source of truth for all of your ongoing tasks, helping you cut down on manual note-taking and follow-up overhead.

---

## Tech Stack
| Layer     | Technology | Notes |
|-----------|------------|-------|
| Front-end | **Astro 5** | Static-first; Islands architecture |
|           | **React 19** | Interactive components where needed |
|           | **TypeScript 5** | Type-safe development |
|           | **Tailwind CSS 4** | Utility-first styling |
|           | **shadcn/ui** | Accessible pre-styled React UI components |
| Back-end  | **Supabase** | PostgreSQL, Auth, Storage |
| AI        | **OpenAI API** | LLM-powered AP extraction |
| Dev Ops   | **GitHub Actions** | CI/CD pipelines |

> Runtime packages (excerpt) are declared in `package.json`; major ones include `astro@^5.13`, `react@^19.1`, `tailwindcss@^4.1`.

---

## Getting Started Locally
```bash
# 1. Clone the repo
$ git clone https://github.com/<your-org>/follow-app.git && cd follow-app

# 2. Install dependencies (Node 22.14+ required)
$ npm install    # or pnpm install / yarn install

# 3. Start the dev server
$ npm run dev

# 4. Build for production
$ npm run build

# 5. Preview the production build locally
$ npm run preview
```

### Prerequisites
* **Node 22.14.0** (see `.nvmrc`)
* npm 10 or pnpm 9 / yarn 4
* An **OpenAI API key** exported as `OPENAI_API_KEY` for local AI calls
* A **Supabase** project (or local instance) with environment variables set in `.env` (not committed)

---

## Available Scripts
| Script            | Purpose                                        |
|-------------------|------------------------------------------------|
| `npm run dev`     | Starts Astro in dev mode with HMR               |
| `npm run build`   | Generates the production build                  |
| `npm run preview` | Serves the built site locally                   |
| `npm run astro`   | Runs arbitrary Astro CLI commands               |
| `npm run lint`    | Lints all files with ESLint                     |
| `npm run lint:fix`| Lints & automatically fixes issues              |
| `npm run format`  | Formats codebase with Prettier                  |

---

## Project Scope
### In Scope (MVP)
* Thread (tab) creation with unique names (≤ 20 chars).
* Transcript upload per thread.
* AI-powered generation & regeneration of Action Points within ≤ 10 min.
* Manual CRUD & status toggling for APs.
* Persistent storage of threads, transcripts & APs in Supabase.
* Email/password authentication for single-user access.

### Out of Scope
* Calendar integrations (Outlook, Google Calendar)
* Chat/IM integrations (Teams, Slack)
* Task-management tool sync (Jira, Asana)
* Emotion or tone analysis
* Push/e-mail notifications
* Mobile or native clients
* Role-based access & sharing
* AP recovery / version history

---

## Project Status
MVP features are under **active development**. Success metrics for the first public release:
1. ≥ 80 % of AI-generated APs remain after manual review.
2. Stable performance for ≥ 10 concurrent threads; AI operations ≤ 10 min.
3. Post end-to-end test feedback limited to minor UI polish (≤ 3 issues).

Roadmap items such as notifications and third-party integrations will be revisited after the MVP milestone.

---

## License
This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.
