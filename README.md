# BulkApply

Bulk Job Application Tool — send personalised AI-generated emails and WhatsApp messages to multiple companies in one click.

## Stack
- **Backend:** Express.js (JS) + SQL Server (mssql + stored procedures)
- **Frontend:** React + TypeScript + TanStack Query
- **AI:** Claude API (Anthropic)
- **Email:** Nodemailer (Gmail SMTP)
- **WhatsApp:** Twilio WhatsApp Business API

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## API Base URL
`http://localhost:5000/api`

## Folder Structure
```
bulkapply/
├── backend/
│   ├── src/
│   │   ├── routes/         # Express route definitions
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic (AI, Email, WA, Queue)
│   │   ├── middleware/     # Auth, error, upload, validation
│   │   ├── db/
│   │   │   └── repositories/  # SQL Server queries via SPs
│   │   ├── config/         # DB, env, mailer, twilio setup
│   │   ├── utils/          # logger, response helpers, asyncHandler
│   │   └── validators/     # express-validator rules
│   ├── uploads/            # Resume files (gitignored)
│   ├── app.js              # Express app setup
│   └── server.js           # Entry point
├── frontend/               # React + TypeScript (Phase 1 TBD)
└── sql/
    ├── tables/             # CREATE TABLE scripts
    ├── procedures/         # Stored procedures
    └── seeds/              # Sample data
```
