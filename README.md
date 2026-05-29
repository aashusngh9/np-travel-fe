# Airfare App

A React-based flight fare comparison SPA that lets users search for flights across multiple origins and destinations, with autocomplete, date picking, stop filtering, and direct booking links.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Production Build](#production-build)
- [Docker Build & Run](#docker-build--run)
- [Deploying to EC2](#deploying-to-ec2)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18, Bootstrap 5, Tailwind CSS |
| Autocomplete | react-autosuggest |
| Date picking | react-datepicker + Moment.js |
| Build tool | Create React App (react-scripts 5) |
| Web server | NGINX (Alpine) with SSL termination |
| Container | Docker (multi-stage build) |

---

## Prerequisites

- **Node.js** 18+ (the Docker image uses `node:18-alpine`)
- **npm** 9+ (bundled with Node 18)
- **Docker** — for containerised builds and deployment
- **Access to the backend API** — set via `REACT_APP_API_BASE_URL`

To check your installed versions:

```bash
node -v && npm -v && docker -v
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `REACT_APP_API_BASE_URL` | Base URL of the backend API | `https://farecompare.site:8081` |

For local development, create a `.env.local` file in the project root (this file is git-ignored):

```
REACT_APP_API_BASE_URL=https://farecompare.site:8081
```

> **Note:** Variables must be prefixed with `REACT_APP_` to be exposed to the React build. The app reads `process.env.REACT_APP_API_BASE_URL` at runtime in `src/App.js` and `src/components/SearchForm.js`.

---

## Local Development

```bash
npm install
npm start
```

The dev server starts on [http://localhost:3000](http://localhost:3000) with hot reloading.

> The `start` script sets `NODE_OPTIONS=--openssl-legacy-provider` for compatibility with react-scripts 5 on newer Node versions.

To run tests:

```bash
npm test
```

---

## Production Build

```bash
npm run build
```

This creates an optimised static bundle in the `build/` directory. The output is suitable for serving from any static file host or NGINX.

The `build` script also sets `NODE_OPTIONS=--openssl-legacy-provider`.

---

## Docker Build & Run

The `Dockerfile` uses a two-stage build:

1. **Stage 1 (builder)** — installs dependencies and compiles the React app using `node:18-alpine`.
2. **Stage 2 (runtime)** — copies the compiled output into an `nginx:alpine` image that serves the SPA on ports 80 (HTTP → HTTPS redirect) and 443 (HTTPS).

### Build the image

```bash
docker build --build-arg REACT_APP_API_BASE_URL=https://farecompare.site:8081 -t airfare-fe .
```

### Run the container locally

Provide a directory containing `fullchain.pem` and `privkey.pem` (self-signed is fine for local testing):

```bash
docker run -p 80:80 -p 443:443 -v $(pwd)/certs:/etc/nginx/ssl:ro airfare-fe
```

---

## Deploying to EC2

The workflow is split: build on your Mac, deploy on EC2.

> For the full infrastructure setup (DNS, security groups, TLS, troubleshooting) see [docs/infrastructure.md](docs/infrastructure.md).

### Step 1 — Set up Let's Encrypt on EC2 (one-time)

After DNS is pointing to the server and port 80 is open:

```bash
bash ~/certbot-setup.sh you@example.com
```

Obtains a cert for `farecompare.site` and `www.farecompare.site`, wires up auto-renewal via a daily cron, and restarts the container.

### Step 2 — Build and upload (run locally)

```bash
bash build.sh
```

Builds the image, SCPs the tar and `deploy.sh` to EC2, cleans up the local tar.

### Step 3 — Load and run (on EC2)

```bash
bash ~/deploy.sh
```

Loads the image, stops the old container, starts a fresh one with certs mounted from `/etc/letsencrypt/live/farecompare.site`.

---

## Project Structure

```
airfare-app/
├── public/              # Static HTML template and PWA assets
├── src/
│   ├── components/
│   │   ├── SearchForm.js    # Flight search inputs (origins, destinations, dates, stops)
│   │   ├── SearchForm.css   # Component styles
│   │   └── FlightResults.js # Expandable result cards with booking links
│   ├── App.js           # Root component; wires search → results
│   ├── index.js         # React DOM mount point
│   └── index.css        # Global base styles
├── certs/               # SSL certificate files (git-ignored, required for Docker)
├── Dockerfile           # Multi-stage build: Node builder + NGINX runtime
├── nginx.conf           # NGINX config with HTTPS redirect and SPA fallback
├── build.sh             # Local: build image, SCP tar + deploy.sh to EC2
├── deploy.sh            # EC2: load image and restart container
├── certbot-setup.sh     # EC2 one-time: install certbot, get cert, set up auto-renewal
├── postcss.config.js    # Tailwind CSS + autoprefixer config
└── package.json         # Scripts, dependencies, browser targets
```

---

## API Endpoints

The frontend calls the backend at `REACT_APP_API_BASE_URL`:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/airports/autosuggest?search_text=<q>` | Origin airport suggestions |
| `GET` | `/autosuggest?search_text=<q>` | Destination city/airport suggestions |
| `POST` | `/search` | Submit search; returns array of flight results |

Search request body:

```json
{
  "origins": ["LHR", "LGW"],
  "destinations": ["JFK"],
  "dateFrom": "2026-06-01",
  "dateTo": "2026-06-15",
  "isReturnFlight": true,
  "nights": 7,
  "maxStops": 1
}
```
