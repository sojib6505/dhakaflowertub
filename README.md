# Dhaka Flower Tub

Dhaka Flower Tub is a product catalogue website with a WhatsApp-first enquiry flow and a protected product-management dashboard.

## Structure

```text
client/   React + Vite public website and admin UI
server/   Express + MongoDB API
```

## Local development

Install dependencies independently:

```bash
npm --prefix client install
npm --prefix server install
```

Create `server/.env` from `server/.env.example` and set a strong admin password and JWT secret. Create `client/.env` from `client/.env.example` if the API is not running at the default local URL.

Run the API from `server/`:

```bash
npm run dev
```

Run the frontend from `client/` in a second terminal:

```bash
npm run dev
```

The public site is available at `http://localhost:5173/`. The admin login is at `http://localhost:5173/admin/login`.

## Environment variables

### Client

Only browser-safe values belong in `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_WHATSAPP_NUMBER=8801700000000
```

For Vercel, set `VITE_API_URL` to the deployed Render API URL, including `/api`.

### Server

Keep these values in `server/.env` or Render environment settings. Never put them in a `VITE_*` variable:

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-long-random-password
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=8h
```

## Commands

From `client/`:

```bash
npm run dev
npm run build
npm run lint
```

From `server/`:

```bash
npm run dev
npm start
npm run seed
```

## Deployment

### Vercel

Create a Vercel project with root directory `client`. Use the Vite defaults: build command `npm run build`, output directory `dist`, and install command `npm install`. Set the public `VITE_API_URL` and `VITE_WHATSAPP_NUMBER` environment variables. `client/vercel.json` rewrites admin/browser routes to the SPA entry point.

### Render

Create a Web Service with root directory `server`, build command `npm install`, and start command `npm start`. Add `MONGODB_URI`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_EXPIRES_IN`, `CLIENT_URL`, and `NODE_ENV` in the Render environment settings. Use the MongoDB Atlas connection string for `MONGODB_URI`.
