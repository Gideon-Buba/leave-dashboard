# FIRS Leave Report Dashboard

A full-stack leave management web application for the Federal Inland Revenue Service (FIRS).

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: NestJS + TypeScript
- **Database**: SQLite via `better-sqlite3` + TypeORM
- **File Handling**: SheetJS (xlsx) for import/export

## Prerequisites

- Node.js 18+
- npm 8+

> **Note**: `better-sqlite3` requires native compilation. If you encounter errors after installing, run:
> ```bash
> npm rebuild better-sqlite3 --workspace=backend
> ```

## Getting Started

```bash
# Install all dependencies
npm install

# Start both frontend and backend in development mode
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

## Project Structure

```
/
├── backend/           # NestJS application
│   ├── src/
│   │   ├── records/   # CRUD endpoints + seeding
│   │   ├── import-export/  # xlsx import/export
│   │   └── stats/     # aggregated statistics
│   └── data/          # leave.db (auto-created)
├── client/            # Vite + React SPA
│   └── src/
├── package.json       # root workspace config
└── README.md
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/records | List records (filterable/sortable) |
| GET | /api/records/:id | Get single record |
| POST | /api/records | Create record |
| PUT | /api/records/:id | Update record |
| DELETE | /api/records/:id | Delete record |
| POST | /api/import | Import .xlsx/.csv |
| GET | /api/export | Download .xlsx |
| GET | /api/stats | Get summary statistics |

## Production Notes

- Set `synchronize: false` in `TypeOrmModule.forRoot()` and use TypeORM migrations
- Set `CORS` origin to your actual domain
- Build with `npm run build`
