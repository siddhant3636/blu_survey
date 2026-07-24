# Blu Smart Charge Survey - Backend API

This repository contains the backend service for the Blu Smart Charge Survey application.

## Tech Stack
- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL / SQLite (configured via DATABASE_URL)
- **Authentication**: JSON Web Token (JWT) with roles (Admin, Surveyor, Manager)
- **Logging**: Winston & Morgan
- **File Uploads**: Multer with image optimization (Sharp)

## Getting Started

### Prerequisites
- Node.js installed on your machine.
- PostgreSQL running (or use default SQLite for testing).

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Modify DATABASE_URL and JWT_SECRET as needed
   ```

3. Database migration & seeding:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Directory Structure
Refer to the `src/` directory for the modular structure grouped by features (auth, users, survey, chargers, panels, reports, settings, masters).
