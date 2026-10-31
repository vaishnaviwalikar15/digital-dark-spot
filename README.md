# Digital Dark Spot

**Find what's missing. Verify what matters.**

An information-gap detection platform. You collect sources about a topic (a scholarship, a government scheme, a job).
It shows what no source mentions, where sources conflict, what may be outdated, and what to verify next.
It is not a chatbot, search engine or summarizer.

## How it works

```
React + TypeScript (Vite, Tailwind, Recharts)  ──/api──▶  FastAPI
                                                          ├─ extract.py   URL / PDF / DOCX / TXT / paste → Source
                                                          ├─ engine.py    deterministic verification engine (always runs)
                                                          ├─ ai.py        optional Gemini layer, validated and quote-checked
                                                          └─ sessions.py  Supabase (or a local JSON file)
```

**Rule-based engine (`backend/app/engine.py`)** needs no API key and no dependencies. It extracts deadlines, income and age
limits, minimum marks, document lists and mentions of renewal, contact and official sources. It normalizes dates and amounts
(`₹3 lakh` equals `Rs. 3,00,000`), compares sources, and produces findings, a comparison table, freshness warnings, unanswered
questions and a prioritized checklist. Every finding carries the source and the exact quoted line.

**AI layer (`backend/app/ai.py`)** is optional. Gemini is asked for semantic findings and questions as JSON. The server then:
validates the JSON against Pydantic models, drops invalid items, and **discards any quote that does not appear verbatim in the
cited source**. A "conflict" needs two verified quotes or it is downgraded to "AI-generated suggestion". If Gemini fails (no key,
rate limit, bad JSON), the UI says so and shows the rule-based results. It never pretends AI succeeded.

**Completeness score** = average of 6 category scores computed from actual source coverage (see the Radar page). No AI
confidence is used.

## Run locally

Requirements: Python 3.10+, Node 18+.

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                   # optional: add GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev                                            # http://localhost:5173
```

Open the site and click **Try the fictional demo**. It works without any API key.

## Tests

```bash
cd backend && python -m unittest discover -s tests -v   # 18 tests, no installs needed
cd frontend && npm run typecheck
```

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | backend | Enables the AI layer. Never sent to the browser. |
| `GEMINI_MODEL` | backend | Model name. Check Google AI Studio for current names. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | backend | Persistent sessions. Run `supabase/schema.sql` first. Without them sessions go to `backend/data/sessions.json`. |
| `CORS_ORIGINS` | backend | Comma-separated allowed frontend origins. |
| `VITE_API_BASE` | frontend | API URL in production, e.g. `https://dds-api.onrender.com`. |

## Deploy

**Backend (Render, Railway or Fly):** root `backend`, build `pip install -r requirements.txt`, start
`uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Set the environment variables above, including `CORS_ORIGINS` with your
frontend URL. On hosts with an ephemeral disk, configure Supabase so sessions persist.

**Frontend (Vercel or Netlify):** root `frontend`, build `npm run build`, output `dist`, set `VITE_API_BASE`.
The app uses hash routing, so no rewrite rules are needed.

## Source handling

- Retrieved (website), user-provided (upload/paste) and fictional demo sources are labelled differently everywhere.
- A URL that fails to load is reported with the reason and is **not** added as a source.
- Pasted text with a URL stores the URL as a reference only; it is not fetched.
- The URL fetcher blocks private and loopback addresses and limits redirects and page size. For a public deployment, also put
  the API behind rate limiting, because it fetches pages on behalf of visitors.

## Known limitations

- Extraction is pattern-based and tuned for scholarship-style notices (deadline, income, age, marks, documents). Other topics
  get the generic checks (documents, renewal, contact, official source, freshness) and the optional AI layer.
- Document names are compared as written, so "marks card" and "marksheet" count as different items.
- Scanned PDFs have no text layer and are rejected (no OCR). Pages that need JavaScript to render are rejected.
- PDF export uses the browser's print dialog ("Save as PDF").
- UI components are plain Tailwind. To use shadcn/ui, run `npx shadcn@latest init` in `frontend` and swap the `.btn` and `.card`
  styles in `src/index.css`.
- A possible gap is not proof that information is absent elsewhere. The report states this limitation.

## Project layout

```
backend/app/{engine,extract,ai,sessions,models,demo,main,config}.py
backend/tests/test_engine.py
frontend/src/{pages,components,store.tsx,api.ts,types.ts}
supabase/schema.sql
```
