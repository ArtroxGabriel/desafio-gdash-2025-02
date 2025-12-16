# GDASH Challenge 2025/02 - Technical Organization

## 🎯 Project Overview
Full-stack weather data system: Python collector → RabbitMQ → Go worker → NestJS API → React Dashboard with AI insights.

---

## 📋 Epic 1: Infrastructure & Docker

### Issue 1.1: Docker Compose Configuration
**Priority:** High  
**Labels:** infrastructure, docker

**Tasks:**
- [ ] Create `docker-compose.yml` with all services
- [ ] Add RabbitMQ service with management UI
- [ ] Add MongoDB service (or configure Atlas)
- [ ] Configure networks between services
- [ ] Set up volumes for data persistence
- [ ] Create `.env.example` file

**Acceptance Criteria:**
- `docker-compose up` starts all services
- Services can communicate
- Environment variables are documented

---

### Issue 1.2: Project Structure Setup
**Priority:** High  
**Labels:** setup

**Tasks:**
- [ ] Create `/backend` - NestJS API
- [ ] Create `/frontend` - React + Vite
- [ ] Create `/python-collector` - Weather data collector
- [ ] Create `/go-worker` - Queue consumer
- [ ] Create root `.gitignore`

---

## 📋 Epic 2: Python Weather Collector

### Issue 2.1: Weather API Client
**Priority:** High  
**Labels:** python, api

**Tasks:**
- [ ] Choose API (Open-Meteo or OpenWeather)
- [ ] Set up Python project (requirements.txt)
- [ ] Install dependencies: requests/httpx, schedule/apscheduler
- [ ] Create weather API client
- [ ] Extract: temperature, humidity, wind, sky condition, rain probability
- [ ] Add error handling and logging
- [ ] Create Dockerfile

**Acceptance Criteria:**
- Fetches weather data successfully
- Data is structured as JSON
- Handles API errors gracefully

---

### Issue 2.2: RabbitMQ Producer
**Priority:** High  
**Labels:** python, rabbitmq

**Tasks:**
- [ ] Install pika library
- [ ] Create RabbitMQ connection module
- [ ] Implement message publishing (JSON format)
- [ ] Add periodic scheduler (e.g., every hour)
- [ ] Implement retry logic
- [ ] Add configuration via environment variables

**Acceptance Criteria:**
- Publishes messages to RabbitMQ queue
- Runs on schedule
- Handles connection failures

---

## 📋 Epic 3: Go Worker

### Issue 3.1: RabbitMQ Consumer
**Priority:** High  
**Labels:** go, rabbitmq

**Tasks:**
- [ ] Initialize Go module
- [ ] Install RabbitMQ client (rabbitmq/amqp091-go)
- [ ] Create queue consumer
- [ ] Validate message format
- [ ] Implement ack/nack logic
- [ ] Add retry mechanism
- [ ] Add structured logging

**Acceptance Criteria:**
- Consumes messages from queue
- Validates JSON structure
- Properly acknowledges messages

---

### Issue 3.2: API Client Integration
**Priority:** High  
**Labels:** go, http

**Tasks:**
- [ ] Create HTTP client
- [ ] POST data to NestJS endpoint
- [ ] Handle API errors
- [ ] Implement retry with backoff
- [ ] Add timeout configuration
- [ ] Create Dockerfile

**Acceptance Criteria:**
- Sends data to API successfully
- Handles errors and retries
- Logs all operations

---

## 📋 Epic 4: NestJS Backend

### Issue 4.1: Project Setup
**Priority:** High  
**Labels:** backend, nestjs

**Tasks:**
- [ ] Initialize NestJS project
- [ ] Configure TypeScript (strict mode)
- [ ] Set up ESLint + Prettier
- [ ] Install Mongoose for MongoDB
- [ ] Configure environment variables
- [ ] Set up Swagger/OpenAPI
- [ ] Create Dockerfile + nginx config

**Acceptance Criteria:**
- App runs successfully
- MongoDB connects
- Swagger UI accessible at `/api`

---

### Issue 4.2: Weather Data Module
**Priority:** High  
**Labels:** backend, database

**Tasks:**
- [ ] Create Weather schema (Mongoose)
- [ ] Create Weather DTO with validation
- [ ] POST `/api/weather` - receive from Go worker
- [ ] GET `/api/weather` - list with pagination
- [ ] Add date range filtering
- [ ] Add error handling

**Acceptance Criteria:**
- Weather data persists to MongoDB
- Endpoints return correct responses
- Pagination works
- Input validation active

---

### Issue 4.3: AI Insights Module
**Priority:** High  
**Labels:** backend, ai

**Tasks:**
- [ ] Choose AI service (OpenAI, Gemini, Claude, etc.)
- [ ] Install AI SDK
- [ ] Create AI service module
- [ ] Design prompt for weather insights
- [ ] POST `/api/insights/generate` - create insight
- [ ] GET `/api/insights` - list insights
- [ ] Store insights in database
- [ ] Add rate limiting

**Acceptance Criteria:**
- Generates meaningful weather insights
- Insights stored and retrievable
- Error handling for AI failures

---

### Issue 4.4: Authentication Module
**Priority:** High  
**Labels:** backend, auth

**Tasks:**
- [ ] Create User schema
- [ ] Install passport-jwt + bcrypt
- [ ] POST `/api/auth/register` - user registration
- [ ] POST `/api/auth/login` - JWT authentication
- [ ] Create AuthGuard for protected routes
- [ ] Hash passwords with bcrypt
- [ ] Create default user seed script

**Acceptance Criteria:**
- Users can register and login
- JWT tokens work
- Default user: `admin@gdash.io` / `admin123`
- Passwords securely hashed

---

### Issue 4.5: User CRUD Module
**Priority:** High  
**Labels:** backend, crud

**Tasks:**
- [ ] GET `/api/users` - list users (protected)
- [ ] GET `/api/users/:id` - get user
- [ ] PUT `/api/users/:id` - update user
- [ ] DELETE `/api/users/:id` - delete user
- [ ] Add role validation (optional)

**Acceptance Criteria:**
- Full CRUD operations work
- Endpoints require authentication
- Validation on all inputs

---

### Issue 4.6: Export Module
**Priority:** Medium  
**Labels:** backend, export

**Tasks:**
- [ ] Install xlsx or csv-writer library
- [ ] GET `/api/weather/export/csv` - export CSV
- [ ] GET `/api/weather/export/xlsx` - export XLSX
- [ ] Add date range query params
- [ ] Set correct Content-Type headers
- [ ] Add filename with timestamp

**Acceptance Criteria:**
- CSV export works
- XLSX export works
- Files download correctly
- Supports filtering

---

### Issue 4.7: Public API Integration (Optional)
**Priority:** Low  
**Labels:** backend, optional

**Tasks:**
- [ ] Choose API (PokéAPI, SWAPI, etc.)
- [ ] Create dedicated module
- [ ] GET `/api/public/:resource` - proxy endpoint
- [ ] Implement pagination
- [ ] Add caching (optional)

**Acceptance Criteria:**
- Proxies external API
- Pagination works

---

## 📋 Epic 5: React Frontend

### Issue 5.1: Project Setup
**Priority:** High  
**Labels:** frontend, react

**Tasks:**
- [ ] Create Vite + React + TypeScript project
- [ ] Install and configure Tailwind CSS
- [ ] Install shadcn/ui CLI
- [ ] Add shadcn components: Button, Card, Table, Form, Dialog
- [ ] Install react-router-dom
- [ ] Install axios
- [ ] Configure environment variables
- [ ] Create Dockerfile with nginx

**Acceptance Criteria:**
- Vite dev server runs
- Tailwind styling works
- shadcn/ui components available
- TypeScript strict mode

---

### Issue 5.2: Authentication Flow
**Priority:** High  
**Labels:** frontend, auth

**Tasks:**
- [ ] Create `/login` page
- [ ] Create `/register` page
- [ ] Use shadcn Form components
- [ ] Implement AuthContext/hook
- [ ] Store JWT in localStorage
- [ ] Create PrivateRoute wrapper
- [ ] Add axios interceptor for auth header
- [ ] Add form validation

**Acceptance Criteria:**
- Login/register functional
- Token stored and used
- Protected routes redirect
- Forms validated

---

### Issue 5.3: Weather Dashboard
**Priority:** High  
**Labels:** frontend, dashboard

**Tasks:**
- [ ] Create `/dashboard` route
- [ ] Fetch weather data from API
- [ ] Display current weather cards
- [ ] Install chart library (recharts/chart.js)
- [ ] Create temperature/humidity charts
- [ ] Add date range filter
- [ ] Add auto-refresh option
- [ ] Use shadcn Card, Table components
- [ ] Make responsive

**Acceptance Criteria:**
- Displays weather data
- Charts are clear
- Filters work
- Mobile responsive

---

### Issue 5.4: AI Insights Section
**Priority:** High  
**Labels:** frontend, ai

**Tasks:**
- [ ] Create Insights component
- [ ] Fetch insights from API
- [ ] Display insights in cards
- [ ] Add "Generate Insight" button
- [ ] Show loading spinner
- [ ] Handle errors gracefully
- [ ] Use shadcn Card, Button

**Acceptance Criteria:**
- Shows AI insights
- Can trigger generation
- Loading states work

---

### Issue 5.5: User Management
**Priority:** Medium  
**Labels:** frontend, crud

**Tasks:**
- [ ] Create `/users` route
- [ ] Display user table (shadcn Table)
- [ ] Add create user dialog (shadcn Dialog)
- [ ] Add edit user dialog
- [ ] Add delete confirmation
- [ ] Implement CRUD operations

**Acceptance Criteria:**
- View all users
- Create/edit/delete users
- Confirmations for destructive actions

---

### Issue 5.6: Export Feature
**Priority:** Medium  
**Labels:** frontend, export

**Tasks:**
- [ ] Add export buttons to dashboard
- [ ] Implement CSV download
- [ ] Implement XLSX download
- [ ] Add date range selector
- [ ] Show success toast notification

**Acceptance Criteria:**
- CSV export downloads
- XLSX export downloads
- Filters apply to export

---

### Issue 5.7: Public API Page (Optional)
**Priority:** Low  
**Labels:** frontend, optional

**Tasks:**
- [ ] Create `/explore` route
- [ ] Fetch data from backend proxy
- [ ] Display in grid/table
- [ ] Implement pagination
- [ ] Add search/filter
- [ ] Use shadcn components

**Acceptance Criteria:**
- Shows external API data
- Pagination functional

---

## 📋 Epic 6: Integration & Testing

### Issue 6.1: End-to-End Integration Test
**Priority:** High  
**Labels:** testing, integration

**Tasks:**
- [ ] Test full pipeline: Python → RabbitMQ → Go → NestJS
- [ ] Verify data appears in MongoDB
- [ ] Verify data appears in frontend
- [ ] Test AI insight generation
- [ ] Test authentication flow
- [ ] Test export functionality

**Acceptance Criteria:**
- Full pipeline works end-to-end
- All features functional

---

### Issue 6.2: Code Quality
**Priority:** Medium  
**Labels:** quality

**Tasks:**
- [ ] Run ESLint on backend
- [ ] Run ESLint on frontend
- [ ] Format with Prettier
- [ ] Run golangci-lint on Go
- [ ] Run pylint/black on Python
- [ ] Fix linting errors

**Acceptance Criteria:**
- No linting errors
- Code properly formatted

---

### Issue 6.3: Unit Tests (Optional)
**Priority:** Low  
**Labels:** testing, optional

**Tasks:**
- [ ] Write backend service tests (Jest)
- [ ] Write Go worker tests
- [ ] Write frontend component tests (Vitest)

---

## 📋 Epic 7: Documentation

### Issue 7.1: Main README
**Priority:** High  
**Labels:** documentation

**Tasks:**
- [ ] Add project description
- [ ] Document architecture with diagram
- [ ] Add "How to Run" section with Docker Compose
- [ ] List all environment variables
- [ ] Document default credentials
- [ ] Add service URLs (API, Swagger, RabbitMQ UI)
- [ ] Add troubleshooting section

**Acceptance Criteria:**
- Anyone can run project from README
- All setup steps documented

---

### Issue 7.2: Service Documentation
**Priority:** Medium  
**Labels:** documentation

**Tasks:**
- [ ] Create backend/README.md
- [ ] Create frontend/README.md
- [ ] Create python-collector/README.md
- [ ] Create go-worker/README.md
- [ ] Complete Swagger documentation

**Acceptance Criteria:**
- Each service has README
- API fully documented in Swagger

---

## 📋 Epic 8: Bonus Features (Optional)

### Issue 8.1: CI/CD Pipeline
**Priority:** Low  
**Labels:** bonus

**Tasks:**
- [ ] GitHub Actions workflow
- [ ] Lint checks
- [ ] Test execution
- [ ] Build verification

---

### Issue 8.2: Advanced Dashboard Features
**Priority:** Low  
**Labels:** bonus

**Tasks:**
- [ ] Multiple chart types
- [ ] Real-time updates (WebSocket)
- [ ] Dark mode
- [ ] Advanced filters

---

### Issue 8.3: Deployment
**Priority:** Low  
**Labels:** bonus

**Tasks:**
- [ ] Deploy to Railway/Render
- [ ] Configure production env
- [ ] Update docs with live URL

---

### Issue 8.4: Monitoring & Logging
**Priority:** Low  
**Labels:** bonus

**Tasks:**
- [ ] Centralized logging
- [ ] Health check endpoints
- [ ] Metrics collection

---

## 📊 Execution Order

**Week 1 - Foundation:**
1. 1.1, 1.2 → Infrastructure
2. 2.1, 2.2 → Python collector
3. 3.1, 3.2 → Go worker

**Week 2 - Backend:**
4. 4.1, 4.2 → NestJS setup + Weather
5. 4.4, 4.5 → Auth + User CRUD
6. 4.3 → AI Insights

**Week 3 - Frontend:**
7. 5.1, 5.2 → React setup + Auth
8. 5.3, 5.4 → Dashboard + AI display
9. 5.5, 5.6 → Users + Export

**Week 4 - Polish:**
10. 6.1, 6.2 → Integration + Quality
11. 7.1, 7.2 → Documentation
12. Test everything

**Optional:** 4.7, 5.7, Epic 8

---

## 🔧 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind + shadcn/ui |
| Backend API | NestJS + TypeScript + MongoDB (Mongoose) |
| Queue Worker | Go + RabbitMQ |
| Data Collector | Python + Weather API |
| Message Broker | RabbitMQ |
| Database | MongoDB |
| AI | OpenAI/Gemini/Claude API |
| Containers | Docker + Docker Compose |

---

## 📝 Default Credentials

```
Email: admin@gdash.io
Password: admin123
```

---

## 🎯 Success Criteria

- [ ] All services run via `docker-compose up`
- [ ] Weather data flows through entire pipeline
- [ ] Dashboard displays real weather data
- [ ] AI generates insights
- [ ] Authentication works
- [ ] Export generates files
- [ ] Code is clean and well-documented
- [ ] No major bugs

---

**Total Issues: 33** (26 core + 7 optional/bonus)
