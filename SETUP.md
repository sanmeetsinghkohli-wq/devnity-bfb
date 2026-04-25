# SarkarSathi — Setup

## Install
```bash
npm install
cp .env.local.example .env.local   # add your GROK_API_KEY
npm run dev
```

Open http://localhost:3000

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind
- shadcn-style folder layout: `components/ui/`, `lib/utils.ts`, `components.json`
- Grok API via `/app/api/chat/route.ts` (works without key in demo mode)
- Web Speech API for voice (Chrome recommended)

## Pages
- `/` Language select
- `/profile` Voice profile collection
- `/state` State select
- `/mode` Schemes vs Services
- `/chat/schemes` AI scheme matcher
- `/chat/services` AI services guide
- `/report` Eligibility PDF/QR report

## Notes on the integrated component
`components/ui/animated-ai-chat.tsx` is the shadcn-style component you provided.
It accepts an optional `onSubmit(text)` prop. The default path for shadcn UI components
is `/components/ui` — kept as required so future shadcn CLI installs (`npx shadcn add ...`)
drop files in the same place.
