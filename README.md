# SQL Playground

Just a local playground to mess around with SQL queries and visualize tables.

## Usage

Run everything:
```bash
docker-compose up --build
```

- App: http://localhost:5173
- API: http://localhost:8000
- DB: `localhost:5432` (user: `azlankhawar`, pass: `azlan123`, db: `azlan-db`)

## Stack
- React + Vite + Shadcn (Frontend)
- FastAPI (Backend)
- PostgreSQL (DB)
