# Dengue Monitoring System

This repository contains the Node.js API and React web application in one npm
workspace.

## Projects

- `dengue-backend/` - Express, PostgreSQL, and MQTT API
- `dengue-frountend/` - React and Vite frontend

The frontend directory keeps its existing spelling to avoid changing paths in
the imported project.

## Setup

Requirements: Node.js 20 or newer, npm, PostgreSQL, and an MQTT broker when
MQTT features are used.

```sh
npm install
cp dengue-backend/.env.example dengue-backend/.env
```

Update `dengue-backend/.env` with your database, JWT, and MQTT settings. The
environment file is ignored by Git.

## Development

Run both applications from the repository root:

```sh
npm run dev
```

The backend uses port `5001` with the example configuration. Vite prints the
frontend URL when it starts.

You can also run either application separately:

```sh
npm run dev:backend
npm run dev:frontend
```

## Other commands

```sh
npm run build
npm run lint
npm run start:backend
```
