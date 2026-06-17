# TeamSync

TeamSync is a collaborative workspace management app for organizing teams, projects, and tasks in one place. It gives every user a personal workspace on signup, supports team membership, and provides a project/task workflow for tracking work across a shared organization.

The app is built as a full-stack TypeScript project with a React client and an Express/MongoDB API.

## Features

- Email authentication with JWT
- Google OAuth login
- Automatic workspace creation on signup
- Workspace member management
- Role-based permissions for owners, admins, and members
- Project creation and management
- Task creation, editing, filtering, and assignment
- Workspace and project analytics
- Invite-based workspace joining
- Responsive React UI with reusable components

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- Radix UI
- Axios

### Backend

- Node.js
- Express
- TypeScript
- MongoDB Atlas
- Mongoose
- Passport
- JWT
- Zod

## Project Structure

```txt
TeamSync/
  backend/   Express API, auth, database models, services, seeders
  client/    React/Vite frontend
```

## Local Setup

### Backend

```powershell
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=8000
NODE_ENV=development
BASE_PATH=/api
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/teamsync?retryWrites=true&w=majority
SESSION_SECRET=your_secret_key
SESSION_EXPIRES_IN=1d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback
FRONTEND_ORIGIN=http://localhost:5173
FRONTEND_GOOGLE_CALLBACK_URL=http://localhost:5173/google/callback
```

Seed roles and start the API:

```powershell
npx ts-node -T src/seeders/role.seeder.ts
npm run dev
```

Health check:

```txt
http://localhost:8000/api/health
```

### Frontend

```powershell
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Start the app:

```powershell
npm run dev
```

Open:

```txt
http://localhost:5173
```

## Deployment

Deploy the backend first, then the frontend.

### Backend Vercel Settings

```txt
Root Directory: backend
Install Command: npm install --include=dev
Build Command: npm run build
Output Directory: dist
```

Backend environment variables:

```env
NODE_ENV=production
BASE_PATH=/api
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/teamsync?retryWrites=true&w=majority
SESSION_SECRET=your_strong_secret_key
SESSION_EXPIRES_IN=1d
FRONTEND_ORIGIN=https://your-client.vercel.app
FRONTEND_GOOGLE_CALLBACK_URL=https://your-client.vercel.app/google/callback
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend.vercel.app/api/auth/google/callback
```

In MongoDB Atlas, allow Vercel to connect:

```txt
Network Access: 0.0.0.0/0
```

Seed production roles once using the production `MONGO_URI`:

```powershell
cd backend
npx ts-node -T src/seeders/role.seeder.ts
```

### Frontend Vercel Settings

```txt
Root Directory: client
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Frontend environment variable:

```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

The value must include both `https://` and `/api`.

## Useful Scripts

### Backend

```powershell
npm run dev
npm run build
npm start
npm run seed
```

### Frontend

```powershell
npm run dev
npm run build
npm run preview
```

## Troubleshooting

- `tsc: command not found`: use `npm install --include=dev` for backend deployment.
- `Owner role not found`: run the role seeder against the same MongoDB used by the app.
- `accounts.findOne() buffering timed out`: check `MONGO_URI`, Atlas Network Access, and database credentials.
- `405 Method Not Allowed`: check that `VITE_API_BASE_URL` includes `https://` and `/api`.
- CORS error: set backend `FRONTEND_ORIGIN` to the deployed frontend URL and redeploy backend.
