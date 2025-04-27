# PrepPulse Development Tasks

## Project Overview
**PrepPulse** is a full-stack web application designed to empower job seekers, particularly students and early-career professionals, to prepare for interviews through peer-to-peer mock interviews. Users can register, upload resumes, schedule interviews, match with peers based on availability, share resumes during sessions, and receive AI-generated behavioral questions tailored to their partner’s resume. The app aims to scale for thousands of users, ensuring low-latency matching, reliable resume processing, and efficient AI question generation.

### Goals
- **User Experience**: Provide an intuitive platform for scheduling, practicing, and improving interview skills via peer-to-peer mock interviews.
- **Scalability**: Support thousands of concurrent users with low-latency matching and AI processing, leveraging Supabase’s managed features and AWS for compute-intensive tasks.
- **AI Integration**: Generate relevant behavioral questions (e.g., “Describe a leadership challenge”) from resume content using NLP, enhancing interview practice.
- **Portfolio Impact**: Showcase modern full-stack development (React, Supabase, Node.js, AWS) and system design skills for internship applications.
- **Community Feedback**: Collect user feedback on sessions and questions to improve AI recommendations and user experience.

### Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, React-Calendar (Vercel).
- **Backend**:
  - **Supabase**: Authentication, PostgreSQL (users, sessions, questions, feedback), Storage (resumes), Realtime (match notifications), Edge Functions (lightweight tasks).
  - **Node.js/Express**: Peer-matching, session management, API orchestration (Render).
  - **AWS Lambda**: AI tasks (Hugging Face DistilBERT for resume parsing, LangChain.js for question generation).
- **Database**: PostgreSQL with pgvector for semantic search.
- **Scalability**: Supavisor (connection pooling), Redis (caching), RabbitMQ (async tasks via AWS MQ), AWS ELB.
- **Monitoring**: Supabase Observability, AWS CloudWatch.

## Task Breakdown
Below are the development tasks for PrepPulse, organized by component and prioritized for an MVP (Minimum Viable Product) that supports 1,000-10,000 users. Each task includes a description, priority, dependencies, and estimated effort (in hours).

### 1. Project Setup
**Goal**: Initialize the project structure and tools for collaborative development.

- **Task 1.1: Set Up GitHub Repository**
  - Description: Create a GitHub repo (`preppulse`) with `.gitignore`, `LICENSE` (MIT), and initial `README.md` describing the project.
  - Priority: High
  - Dependencies: None
  - Effort: 2 hours
  - Steps:
    1. Initialize repo with `main` branch.
    2. Add `.gitignore` for Node.js and React (e.g., `node_modules`, `.env`).
    3. Write `README.md` with project overview, setup instructions, and contribution guidelines.
    4. Set up branch protection for `main` (require PR reviews).

- **Task 1.2: Configure Development Environment**
  - Description: Set up local and cloud environments with ESLint, Prettier, and CI/CD.
  - Priority: High
  - Dependencies: Task 1.1
  - Effort: 4 hours
  - Steps:
    1. Initialize Node.js project (`npm init`) for backend.
    2. Create React app (`create-react-app` or Vite) with TypeScript.
    3. Install ESLint and Prettier for code consistency.
    4. Set up GitHub Actions for linting and testing.
    5. Create `.env.example` for Supabase and AWS credentials.

### 2. Frontend (React)
**Goal**: Build a responsive, user-friendly UI for authentication, profile management, scheduling, and mock interviews.

- **Task 2.1: Set Up React Project Structure**
  - Description: Configure React with TypeScript, Tailwind CSS, and React Router for navigation.
  - Priority: High
  - Dependencies: Task 1.2
  - Effort: 6 hours
  - Steps:
    1. Install dependencies (`react-router-dom`, `tailwindcss`, `@supabase/supabase-js`).
    2. Create folder structure: `src/components`, `src/pages`, `src/services`.
    3. Set up Tailwind CSS with custom theme (e.g., PrepPulse branding).
    4. Configure routes for `/login`, `/signup`, `/profile`, `/schedule`, `/session`.

- **Task 2.2: Implement Authentication UI**
  - Description: Create login and signup pages integrated with Supabase auth.
  - Priority: High
  - Dependencies: Task 2.1, Task 3.1
  - Effort: 8 hours
  - Steps:
    1. Design login/signup forms with Tailwind CSS (email, password fields).
    2. Integrate Supabase auth SDK for signup (`auth.signUp`) and login (`auth.signInWithPassword`).
    3. Store JWT in local storage and redirect to `/profile` on success.
    4. Add error handling (e.g., invalid credentials).
    5. Write unit tests with Jest/React Testing Library.

- **Task 2.3: Build Profile Page**
  - Description: Create a page for users to upload resumes and set preferences.
  - Priority: Medium
  - Dependencies: Task 2.2, Task 3.2
  - Effort: 10 hours
  - Steps:
    1. Design form for resume upload (PDF/text, max 5MB) and preferences (job roles, industries).
    2. Use Supabase Storage SDK to upload resumes to `resumes` bucket.
    3. Update `users` table with `resume_url` and `preferences` via Supabase API.
    4. Display uploaded resume preview (iframe or text).
    5. Add validation (e.g., file type, size) and error messages.

- **Task 2.4: Implement Scheduling UI**
  - Description: Add a calendar-based interface for selecting interview time slots.
  - Priority: Medium
  - Dependencies: Task 2.2, Task 3.3
  - Effort: 12 hours
  - Steps:
    1. Install `react-calendar` and style with Tailwind CSS.
    2. Create form for selecting date and time (e.g., 30-minute slots).
    3. Call Supabase API to store time slots in `users.time_slots` (JSONB).
    4. Display user’s scheduled slots with edit/delete options.
    5. Write tests for calendar interactions.

- **Task 2.5: Build Session UI**
  - Description: Create a page for mock interviews, displaying partner’s resume and AI questions.
  - Priority: Medium
  - Dependencies: Task 2.3, Task 3.5, Task 4.2
  - Effort: 15 hours
  - Steps:
    1. Design session layout: resume viewer (iframe), question list, feedback form.
    2. Fetch session details (`user2_id`, `questions`) and resume (`resume_url`) via Node.js API.
    3. Display questions for interviewer role; toggle between interviewer/interviewee views.
    4. Add feedback form (rating, comment) to submit to `/api/feedback`.
    5. Use Supabase Realtime to show match notifications.
    6. Write tests for session rendering and feedback submission.

### 3. Supabase Backend
**Goal**: Implement authentication, storage, and database operations using Supabase for scalability.

- **Task 3.1: Set Up Supabase Project**
  - Description: Configure Supabase with auth, database, and storage.
  - Priority: High
  - Dependencies: Task 1.2
  - Effort: 4 hours
  - Steps:
    1. Create a Supabase project (free tier) and note API keys/URL.
    2. Enable auth with email/password provider.
    3. Create `resumes` bucket in Storage with public read access.
    4. Set up `.env` with Supabase credentials in frontend and backend.
    5. Test auth and storage connectivity locally.

- **Task 3.2: Create Database Schema**
  - Description: Define PostgreSQL tables with indexes for scalability.
  - Priority: High
  - Dependencies: Task 3.1
  - Effort: 6 hours
  - Steps:
    1. Create tables via Supabase Dashboard or SQL:
       - `users`: `{ id: UUID, email: TEXT (unique, indexed), password: TEXT, resume_url: TEXT, resume_text: TEXT, time_slots: JSONB (GIN index), preferences: JSONB }`.
       - `sessions`: `{ id: UUID, user1_id: UUID, user2_id: UUID, date: TEXT (indexed), time: TEXT (indexed), questions: JSONB }`.
       - `questions`: `{ id: UUID, text: TEXT, embedding: VECTOR(768, IVFFlat index), tags: TEXT[] (GIN index) }`.
       - `feedback`: `{ id: UUID, user_id: UUID, question_id: UUID, session_id: UUID, rating: INTEGER, comment: TEXT } (indexes: user_id, session_id)`.
    2. Enable pgvector extension for `questions.embedding`.
    3. Add foreign keys and partition `sessions` by `date`.
    4. Test schema with sample data.

- **Task 3.3: Implement Supabase APIs**
  - Description: Create REST endpoints for auth, resume uploads, and scheduling.
  - Priority: High
  - Dependencies: Task 3.2
  - Effort: 10 hours
  - Steps:
    1. Use Supabase auth for `/api/auth/signup` and `/api/auth/login`.
    2. Create `/api/upload-resume` to upload to Storage and update `users.resume_url`.
    3. Create `/api/schedule` to add time slots to `users.time_slots`.
    4. Add error handling (e.g., file size limits, duplicate slots).
    5. Test endpoints with Postman.

- **Task 3.4: Set Up Realtime Notifications**
  - Description: Enable real-time match notifications using Supabase Realtime.
  - Priority: Medium
  - Dependencies: Task 3.3
  - Effort: 8 hours
  - Steps:
    1. Configure Realtime on `sessions` table for insert events.
    2. Subscribe to session creation events in React using Supabase SDK.
    3. Display toast notifications when a match is found.
    4. Test with two users scheduling overlapping slots.
    5. Optimize for 2,000+ concurrent users (per Supabase benchmarks).

### 4. Node.js Backend
**Goal**: Handle complex logic for peer-matching and session management, ensuring scalability.

- **Task 4.1: Set Up Node.js/Express Server**
  - Description: Configure Node.js with Express, Redis, and RabbitMQ for scalability.
  - Priority: High
  - Dependencies: Task 1.2
  - Effort: 6 hours
  - Steps:
    1. Initialize Express project with TypeScript.
    2. Install dependencies (`express`, `@supabase/supabase-js`, `redis`, `amqplib`).
    3. Set up AWS ELB on Render for auto-scaling.
    4. Configure Redis and RabbitMQ (AWS MQ) connections.
    5. Add middleware for JWT verification (Supabase auth).

- **Task 4.2: Implement Peer-Matching API**
  - Description: Create `/api/match` to pair users based on time slots and preferences.
  - Priority: High
  - Dependencies: Task 3.2, Task 4.1
  - Effort: 12 hours
  - Steps:
    1. Query `users.time_slots` for overlapping slots using Supabase SDK.
    2. Rank matches by preferences (cosine similarity on `job_roles` with pgvector).
    3. Cache matches in Redis (TTL 24h).
    4. Queue unmatched users in RabbitMQ for async retry.
    5. Create `sessions` entry with matched users.
    6. Test with 100 simulated users.

- **Task 4.3: Implement Session APIs**
  - Description: Create endpoints for session details, resumes, and feedback.
  - Priority: Medium
  - Dependencies: Task 4.2
  - Effort: 10 hours
  - Steps:
    1. Create `/api/session/:id` to fetch session data (`user1_id`, `user2_id`, `questions`).
    2. Create `/api/session/:id/resume` to fetch partner’s `resume_url` and trigger AI questions.
    3. Create `/api/feedback` to store feedback in `feedback` table.
    4. Cache session data in Redis.
    5. Test endpoints with Postman.

### 5. AI Pipeline
**Goal**: Implement resume parsing and question generation using AWS Lambda for scalability.

- **Task 5.1: Set Up AWS Lambda for AI**
  - Description: Configure Lambda for Hugging Face and LangChain.js.
  - Priority: High
  - Dependencies: Task 3.2
  - Effort: 8 hours
  - Steps:
    1. Create Lambda functions with Node.js runtime.
    2. Install `huggingface_hub` and `langchain` in a Lambda layer.
    3. Configure IAM roles for Supabase Storage and PostgreSQL access.
    4. Test Lambda connectivity with Supabase.
    5. Set up CloudWatch for monitoring.

- **Task 5.2: Implement Resume Parsing**
  - Description: Parse resumes using DistilBERT and store results.
  - Priority: Medium
  - Dependencies: Task 5.1, Task 3.3
  - Effort: 12 hours
  - Steps:
    1. Create Lambda function to fetch resume from Supabase Storage (`resume_url`).
    2. Use DistilBERT to extract skills/roles, save to `users.resume_text`.
    3. Generate embeddings (sentence transformers) for semantic search.
    4. Store embeddings in `questions.embedding` (pgvector).
    5. Trigger parsing via Edge Function on upload.
    6. Test with sample resumes.

- **Task 5.3: Implement Question Generation**
  - Description: Generate behavioral questions using LangChain.js and pgvector.
  - Priority: Medium
  - Dependencies: Task 5.2
  - Effort: 10 hours
  - Steps:
    1. Create Lambda function to query `questions` using resume embeddings (cosine similarity).
    2. Use LangChain.js to select 3-5 relevant questions.
    3. Store questions in `sessions.questions` via Node.js API.
    4. Cache results in Redis for 24h.
    5. Test with simulated session data.

### 6. Testing and Optimization
**Goal**: Ensure reliability, performance, and scalability.

- **Task 6.1: Write Unit and Integration Tests**
  - Description: Test frontend and backend components.
  - Priority: Medium
  - Dependencies: Task 2.5, Task 4.3
  - Effort: 15 hours
  - Steps:
    1. Write Jest tests for React components (login, session UI).
    2. Write Supertest tests for Supabase and Node.js APIs.
    3. Mock Supabase and Lambda dependencies.
    4. Achieve 80% test coverage.
    5. Run tests in GitHub Actions.

- **Task 6.2: Optimize Performance**
  - Description: Tune database and APIs for low latency.
  - Priority: Medium
  - Dependencies: Task 6.1
  - Effort: 10 hours
  - Steps:
    1. Analyze query performance in Supabase Observability.
    2. Add composite indexes (e.g., `sessions.date`, `time`).
    3. Optimize Redis cache hit rate (aim for 90%).
    4. Test API latency with 100 concurrent users (k6 or Artillery).
    5. Document optimizations in `README.md`.

### 7. Deployment
**Goal**: Deploy PrepPulse to production for public use.

- **Task 7.1: Deploy Frontend to Vercel**
  - Description: Host React app on Vercel for scalability.
  - Priority: High
  - Dependencies: Task 2.5
  - Effort: 4 hours
  - Steps:
    1. Connect GitHub repo to Vercel.
    2. Configure environment variables (Supabase URL, API keys).
    3. Set up custom domain (optional).
    4. Enable auto-scaling and CDN.
    5. Test deployment with login flow.

- **Task 7.2: Deploy Backend**
  - Description: Host Node.js on Render and configure Supabase/Lambda.
  - Priority: High
  - Dependencies: Task 4.3, Task 5.3
  - Effort: 6 hours
  - Steps:
    1. Deploy Node.js to Render with AWS ELB.
    2. Configure Supabase project for production (2XL instance, high-performance disks).
    3. Deploy Lambda functions with API Gateway.
    4. Set up RabbitMQ (AWS MQ) and Redis.
    5. Test end-to-end flow (signup to session).

### 8. Documentation and Portfolio
**Goal**: Document the project and showcase for internships.

- **Task 8.1: Write Comprehensive Documentation**
  - Description: Document setup, APIs, and architecture.
  - Priority: Medium
  - Dependencies: Task 7.2
  - Effort: 8 hours
  - Steps:
    1. Update `README.md` with installation, usage, and architecture overview.
    2. Add API docs (Swagger/Postman) for Supabase and Node.js endpoints.
    3. Include Lucidchart diagrams (architecture, ERD, data flow).
    4. Document scalability features (Supavisor, Redis, Lambda).

- **Task 8.2: Create Portfolio Entry**
  - Description: Showcase PrepPulse in your portfolio.
  - Priority: Low
  - Dependencies: Task 8.1
  - Effort: 6 hours
  - Steps:
    1. Write a blog post on PrepPulse’s development (Medium, personal site).
    2. Highlight Supabase, Node.js, and AWS skills.
    3. Include screenshots, diagrams, and GitHub link.
    4. Reference in internship applications: “Built PrepPulse for 1M users.”

## Task Prioritization
- **High Priority (Weeks 1-2)**: Tasks 1.1-1.2, 2.1-2.2, 3.1-3.3, 4.1-4.2, 5.1, 7.1-7.2 (MVP core: auth, scheduling, matching).
- **Medium Priority (Weeks 3-4)**: Tasks 2.3-2.5, 3.4, 4.3, 5.2-5.3, 6.1-6.2, 8.1 (session UI, AI, testing, docs).
- **Low Priority (Week 5)**: Task 8.2 (portfolio polish).

## Dependencies and Workflow
- **Dependencies**: Start with project setup (Tasks 1.1-1.2), then parallelize frontend (Tasks 2.1-2.2) and Supabase backend (Tasks 3.1-3.3). Node.js (Task 4.1) and AI (Task 5.1) can begin after Supabase schema is ready. Testing and deployment follow core implementation.
- **Workflow**: Use GitHub Issues to track tasks. Create one issue per task with labels (e.g., `frontend`, `backend`, `priority-high`). Use PRs for code reviews, merging to `main` after tests pass.

## Scalability Considerations
- **Supavisor**: Scales PostgreSQL connections (1M+).
- **Redis**: Caches time slots and questions for low latency.
- **RabbitMQ**: Async matching and AI tasks for spikes.
- **AWS ELB**: Distributes Node.js API traffic.
- **Lambda**: Scales AI compute automatically.
- **Partitioning**: Partition `sessions` by `date` for high writes.
- **pgvector**: IVFFlat index for AI semantic search.
