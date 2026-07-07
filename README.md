<div align="center">

# socratic.dev

**The AI never gives you the answer. It leads you to it.**

A Socratic programming tutor: you solve real code and architecture challenges,
and the AI answers questions with questions — like a good tech lead in a pair programming session.

[Stack](#stack) · [How it works](#how-it-works) · [Running locally](#running-locally) · [Architecture](#architecture) · [Deploy](#deploy)

</div>

---

## The problem

AI tools today hand you the finished answer. You paste it, it works, and you learned nothing.
In the interview — or in real work — the cheat sheet isn't there.

**socratic.dev flips that.** The AI has a single unbreakable rule: **never reveal the solution.**
It asks, probes, points to the next step — and forces you to think. Learning happens
in the effort, not in the answer.

## Two tracks

| Track | What you do | How the AI evaluates |
|---|---|---|
| **Code** | Solve challenges in a real Monaco editor, with hidden tests running in the browser | Socratic tutor via text + real tests executed in a sandbox |
| **System Design** *(architecture)* | Draw the architecture on an Excalidraw canvas — services, databases, queues, data flow | The AI **sees the diagram** (vision) and interrogates every distribution/scaling decision |

From beginner to big-tech level — difficulty scales with your profile.

## How it works

```
Onboarding  →  pick a track + stack + level
            →  the AI GENERATES (or reuses) a tailor-made challenge

Workspace   →  you solve it (code in Monaco / architecture in Excalidraw)
            →  talk to the tutor: it only asks questions
            →  ask for a hint when stuck (costs from your balance)

Submit      →  Code:    runs the hidden tests → real pass/fail
            →  Design:  exports the PNG → Claude analyzes the image → feedback
            →  metrics: independence, hints used, time
```

### The AI is indispensable by design

Remove the AI and the product ceases to exist. It is not a garnish — it **generates the challenges**,
**drives the Socratic dialogue**, **analyzes the architecture diagram through vision** and **measures your
independence**. There is no static fallback: without AI there is no challenge, no tutor, no evaluation.

## Features

- **Socratic tutor** — `claude-sonnet-5` with prompts that forbid revealing the solution; separate modes for code and design.
- **Monaco editor + real runner** — JS/TS tests run in an isolated **Web Worker** (transpiled via `sucrase`), with a timeout. Nothing is hardcoded; the green only shows up if the tests pass.
- **Excalidraw canvas + Claude Vision** — the diagram becomes a PNG and is analyzed by vision; the chat uses a *text summary* of the elements to save tokens, and vision is only called on submit.
- **Smart challenge generation** — difficulty depends heavily on the level; advanced targets FAANG-style tests.
- **Reusable library** — every generated challenge becomes a shared pool: the next person gets it instantly, without regenerating (less waiting, lower cost). Deduplication so nothing repeats.
- **Hint economy (SaaS)** — free weekly balance + purchasable extra hints + "Solve it for me" as an expensive last resort that **applies** the solution straight into the editor / canvas.
- **Solve it for me** — doesn't return text: it writes the code into Monaco, or builds the diagram in Excalidraw (layered, didactic layout with labeled arrows).
- **Dashboard** — GitHub-style activity heatmap, independence ring, paginated history with resume-where-you-left-off.
- **Persistent drafts** — code + chat survive an F5 (localStorage).

## Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack, React Compiler) |
| UI | **React 19**, **Tailwind v4**, Base UI, Motion, Recharts, Lucide |
| Editor / Canvas | **Monaco** (code) · **Excalidraw** (architecture) |
| AI | **Claude** via `@anthropic-ai/sdk` (text + vision, adaptive thinking + effort, prompt caching, streaming) |
| Backend | **Supabase** — Postgres, Auth, RLS |
| Code execution | **Web Worker** + `sucrase` (in-browser sandbox) |
| Language | **TypeScript** (strict) |

## Running locally

**Prerequisites:** Node 20+, a [Supabase](https://supabase.com) account and an [Anthropic](https://console.anthropic.com) API key.

```bash
# 1. Install dependencies (Excalidraw's peer deps require the flag)
npm install --legacy-peer-deps

# 2. Configure environment variables
cp .env.example .env.local   # then fill in the values

# 3. Apply the migrations to your Supabase project
supabase link --project-ref <your-ref>
supabase db push

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # anon key (public)
SUPABASE_SERVICE_ROLE_KEY=       # service-role key (server only — never expose to the client)
ANTHROPIC_API_KEY=               # Anthropic API key
```

> `.env.local` is in `.gitignore`. **Never** commit keys. In production, set them in the Vercel dashboard.

## Architecture

The project is organized in a feature-based structure, separating UI, domain, integrations and application logic.

```
src/
├─ app/                 App Router routes and minimal entrypoints
│  ├─ api/              Only the HTTP routes still exposed
│  ├─ challenge/
│  ├─ challenges/
│  ├─ dashboard/
│  ├─ design/
│  ├─ login/
│  ├─ onboarding/
│  ├─ profile/
│  └─ page.tsx
├─ components/          Shared components
│  └─ ui/
├─ domain/              Domain constants and rules
├─ features/            Per-feature modules
│  ├─ auth/
│  ├─ challenges/
│  ├─ dashboard/
│  ├─ design/
│  ├─ hints/
│  ├─ landing/
│  ├─ onboarding/
│  ├─ profile/
│  └─ runner/
├─ hooks/               Shared hooks
└─ lib/                 Integrations and infrastructure
   ├─ ai/
   ├─ api/
   └─ supabase/
```


## Deploy

The target is **Vercel + Supabase** (Supabase is managed — no deploy of your own).

1. Import the repository on **Vercel** (it detects Next.js automatically).
2. Set the **4 environment variables** above.
3. After deploying, in **Supabase → Authentication → URL Configuration**, set **Site URL** and **Redirect URLs** (`https://your-domain/**`) so login works in production.

```bash
npm run build   # validate the production build before shipping
```

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the build |
| `npm run format` | Prettier |

---

<div align="center">
© 2026 Socratic.dev
</div>
