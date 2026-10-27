# Enterprise AI-Assisted Quality Inspection System

An enterprise-grade, full-stack application designed for manufacturing quality control. The system enables Quality Engineers to photograph manufactured components, receive AI-driven defect predictions constrained to a fixed taxonomy, and confirm or override these predictions to build high-integrity quality audit trails.

---

## 🛠 Tech Stack

- **Frontend**: React (Vite, TypeScript, Tailwind CSS)
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Vision AI**: Google Gemini API (`gemini-3.8-flash` primary model, `gemini-3.6-flash` fallback)
- **Quality & Security**: Vitest, ESLint v9 (Flat Config), Prettier, Husky, `npm audit`

---

## 🏗️ Architecture & Key Engineering Decisions

1. **Decoupled AI Provider Pattern (`AIProvider` & Factory)**:
   - AI vision processing is decoupled from core domain logic via an abstract `AIProvider` interface and factory pattern.
   - Includes exponential backoff retries with jitter and automated fallback from `gemini-3.8-flash` to `gemini-3.6-flash` during transient API errors or rate limits.

2. **Strict Defect Taxonomy Validation & Output Shielding**:
   - AI model responses are enforced via system instructions, JSON schema definitions, and server-side Zod validation.
   - Raw model predictions are constrained strictly to a fixed 5-category taxonomy:
     - `Scratch`
     - `Dent`
     - `Paint Issue`
     - `Missing Component`
     - `No Defect`

3. **Human-in-the-Loop Override Tracking**:
   - The original AI prediction (`aiPredictedDefectType`, `aiConfidence`) and the final human call (`finalDefectType`) are recorded as separate, queryable fields.
   - Overrides are explicitly flagged (`wasOverridden: boolean`), providing actionable telemetry on human agreement with AI recommendations.

4. **Server-Side Role-Based Access Control (RBAC)**:
   - Authorization is enforced at the server middleware layer (`src/middleware/authorization.ts`).
   - `QUALITY_ENGINEER`: Full permissions to perform AI predictions, confirm inspections, view history, and inspect dashboard metrics.
   - `PRODUCTION_SUPERVISOR`: Read-only permissions (Inspection List and Dashboard KPIs). Inspection submission attempts via API return HTTP `403 Forbidden`.

5. **Server-Side File Synchronization**:
   - Image uploads are stored locally and bound to UUID-based prediction sessions (`predictionId`), ensuring strict consistency between the uploaded file and saved inspection record.

---

## 🤖 Vision AI Model Choice & Cost

- **Provider**: Google Gemini API
- **Primary Model**: `gemini-3.8-flash`
- **Fallback Model**: `gemini-3.6-flash`
- **Rationale**: Gemini offers native multimodal reasoning, response schema enforcement, ultra-low latency, high rate limits, and reliable zero-shot defect identification.
- **Cost**: **$0.00** (Developed and validated entirely using Google AI Studio's free tier allowance).

---

## 🚀 Environment Setup & Running Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database instance
- Google Gemini API Key (obtainable from Google AI Studio)

---

### 1. Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=4000
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/quality_inspection_db?schema=public"
AI_MODEL=AI_MODEL
AI_FALLBACK_MODEL=FALL_BACK_AI_MODEL
AI_PROVIDER=AI_PROVIDER
AI_API_KEY=ABCSSDDDDsamplekey
IMAGE_STORAGE_DIR=./storage/uploads
MAX_UPLOAD_BYTES=10485760
AI_TIMEOUT_MS=60000
```

---

### 2. Backend Setup & Run

Navigate to the backend directory and execute the following commands:

```bash
cd backend

# Install dependencies
npm install

# Run database migrations and generate Prisma client
npx prisma migrate dev --name init

# (Optional) Seed initial demo batches and users
npx prisma db seed

# Start development server
npm run dev
```

The backend server will run at `http://localhost:4000`.

---

### 3. Frontend Setup & Run

Navigate to the frontend directory:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend application will be accessible at `http://localhost:5173`.

---

## 🧪 Unit Test Suite Execution

Backend unit tests cover core business logic, including defect taxonomy constraints, accept/override calculation, and dashboard KPI aggregation.

To execute the test suite:

```bash
cd backend
npm test
```

To run tests in watch mode during development:

```bash
cd backend
npm run test:watch
```

---

## 🛡️ Pre-Commit Hooks & Automated Quality Gates

Pre-commit automated quality enforcement is powered by **Husky** located in the root/backend repository configuration. 

Before every commit, Git triggers `.husky/pre-commit`, running the following non-negotiable checks sequentially:

1. **Formatting**: `npm run format:check` (Prettier validation)
2. **Linting**: `npm run lint` (ESLint v9 Flat Config verification)
3. **Unit Tests**: `npm test` (Vitest suite execution)
4. **Security Audit**: `npm run security:audit` (`npm audit --audit-level=high`)

### Verification of Pre-Commit Checks

You can manually verify the quality gate pipeline by executing:

```bash
cd backend
npm run format:check
npm run lint
npm test
npm run security:audit
```

If any step fails (e.g. a failing test, lint error, or high-severity dependency security risk), Husky halts the commit operation.

---

## 📝 Known Limitations & Trade-Offs

1. **Image Storage**: Images are currently stored on the local server filesystem for simplicity. Production deployments would replace local storage with cloud object storage (AWS S3 or Google Cloud Storage).
2. **Authentication Flow**: Header-based authentication (`x-user-id`) is used for rapid demonstration and switching between `QUALITY_ENGINEER` and `PRODUCTION_SUPERVISOR` roles. Full JWT or OAuth sessions would be implemented for enterprise production deployments.