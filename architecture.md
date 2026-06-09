# Railway Tracker - System Architecture

## Project Overview
A comprehensive web-based railway tracking and intelligence platform providing real-time train tracking, predictive delay analysis, and smart travel assistance. Built for modern commuters who demand accuracy, speed, and actionable insights.

---

## Core Features

### 1. Real-Time Train Tracking
- Live GPS-based train positioning on interactive maps
- Multi-network support (Indian Railways, Metro systems, International partners)
- Platform-level accuracy with station arrival/departure predictions
- Offline mode with cached data sync

### 2. AI-Powered Delay Prediction
- Historical pattern analysis using time-series forecasting
- Weather integration (rain, fog, extreme temperatures)
- Signal and track congestion modeling
- Real-time incident detection (accidents, protests, maintenance)
- Confidence intervals and prediction accuracy metrics

### 3. Smart Route Optimization
- Multi-criteria routing (fastest, cheapest, least crowded, scenic)
- Platform change minimization
- Seat availability forecasting
- Intermodal connections (metro, bus, taxi)

### 4. Unique Differentiators
- **Crowdsourced Incident Reporting**: Users report delays, cleanliness, and safety issues with photo verification
- **AR Platform Navigation**: Point phone camera to see platform numbers and coach positions overlaid
- **Travel Buddy System**: Match with co-passengers for shared cabs or seat swapping
- **Carbon Footprint Tracker**: Compare train vs flight emissions with tree-equivalent savings
- **Predictive Maintenance Alerts**: Notify users of upcoming track work affecting their route
- **Coach Occupancy Heatmap**: Real-time crowd density visualization per coach
- **Voice-First Commands**: "When is my train?" "Book me a cab when I arrive"
- **Emergency SOS**: Quick access to helpline, station master, and live location sharing

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router) with React Server Components
- **Styling**: Tailwind CSS + shadcn/ui components
- **Maps**: Mapbox GL JS (custom railway layer) + Leaflet fallback
- **State**: Zustand + React Query for server state
- **Real-time**: Socket.io client + WebRTC for peer features
- **AR**: AR.js / 8th Wall for platform navigation
- **PWA**: Workbox for offline caching and push notifications

### Backend
- **Runtime**: Node.js with Fastify (high performance, low overhead)
- **API**: tRPC for end-to-end type safety
- **Real-time**: Socket.io server + Redis pub/sub
- **Queue**: BullMQ for background jobs (predictions, notifications)
- **Cache**: Redis (hot data: train positions, predictions)
- **Search**: Meilisearch for station/train name search

### Data & ML
- **Database**: PostgreSQL (primary) + TimescaleDB (time-series for tracking)
- **ORM**: Prisma with multi-schema support
- **ML Pipeline**: Python (scikit-learn, Prophet, XGBoost) via FastAPI microservice
- **Feature Store**: Feast for ML features
- **Data Lake**: S3-compatible storage for raw historical data

### Infrastructure
- **Container**: Docker + Docker Compose (dev) / Kubernetes (prod)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana + Sentry
- **CDN**: Cloudflare (static assets + edge functions)
- **Auth**: OAuth 2.0 + JWT + Magic Links

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Web App   │  │  PWA (Mobile)│  │   AR Companion App  │  │
│  │  (Next.js)  │  │  (Capacitor) │  │   (React Native)    │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │              │
│         └────────────────┴─────────────────────┘              │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │ HTTPS / WSS
┌──────────────────────────┼───────────────────────────────────┐
│                    Edge Layer (Cloudflare)                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  CDN  │  DDoS Protection  │  Edge Functions (Auth)     │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                    Application Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   API GW    │  │  WebSocket  │  │   ML Inference API   │  │
│  │  (Fastify)  │  │   Server    │  │     (FastAPI)       │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │              │
│         └────────────────┴─────────────────────┘              │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                    Service Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Tracking  │  │ Prediction  │  │   Notification      │  │
│  │   Service   │  │   Service   │  │      Service        │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │              │
│         └────────────────┴─────────────────────┘              │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                    Data Layer                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ PostgreSQL  │  │  TimescaleDB│  │   Redis Cluster     │  │
│  │  (Primary)  │  │  (TimeSeries)│  │   (Cache/Session)   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │              │
│         └────────────────┴─────────────────────┘              │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              S3 Data Lake (Historical Data)             │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Real-Time Tracking Pipeline
```
Railway API / GPS Devices
         │
         ▼
   Ingestion Service (Fastify)
         │
         ▼
   Message Queue (Redis Streams)
         │
         ▼
   Processing Workers (BullMQ)
   - Data validation
   - Geospatial indexing
   - Anomaly detection
         │
         ▼
   TimescaleDB (hypertable)
         │
         ▼
   WebSocket Broadcast → Connected Clients
```

### Delay Prediction Pipeline
```
Historical Data (S3)
         │
         ▼
   Feature Engineering (Feast)
   - Time features (hour, day, festival)
   - Weather features
   - Historical delay patterns
   - Track congestion
         │
         ▼
   ML Model Training (Python)
   - Prophet (baseline)
   - XGBoost (feature importance)
   - LSTM (sequence modeling)
         │
         ▼
   Model Registry (MLflow)
         │
         ▼
   Inference API (FastAPI)
   - Real-time predictions
   - Batch predictions (nightly)
         │
         ▼
   Redis Cache (TTL: 5 min)
         │
         ▼
   API Response → Client
```

---

## Database Schema (Core Tables)

### Trains
```sql
train_number (PK)
train_name
source_station_id (FK)
destination_station_id (FK)
railway_zone
train_type (Express, Mail, Local, Metro)
average_speed
is_active
```

### Stations
```sql
station_id (PK)
station_name
station_code
latitude
longitude
zone
has_wifi
has_food_plaza
platforms_count
```

### Live Tracking
```sql
id (PK)
train_number (FK)
timestamp
latitude
longitude
speed
next_station_id (FK)
delay_minutes (predicted)
last_updated
```

### Predictions
```sql
id (PK)
train_number (FK)
station_id (FK)
scheduled_arrival
predicted_arrival
confidence_score
model_version
features_json
created_at
```

### User Reports (Crowdsourced)
```sql
id (PK)
user_id (FK)
train_number (FK)
station_id (FK)
report_type (delay, cleanliness, safety, food)
description
photo_url
upvotes
verified
created_at
```

### User Preferences
```sql
user_id (PK)
home_station_id (FK)
work_station_id (FK)
notification_channels (push, email, sms)
preferred_train_types
dark_mode
language
```

---

## API Design

### REST Endpoints
```
GET    /api/v1/trains/search?q=12301
GET    /api/v1/trains/:number/schedule
GET    /api/v1/trains/:number/live
GET    /api/v1/stations/:code/trains
GET    /api/v1/routes/plan?from=NDLS&to=BCT&date=2024-06-10
GET    /api/v1/predictions/:train/:station
POST   /api/v1/reports
GET    /api/v1/reports?train=12301
```

### WebSocket Events
```
client → server:
  - subscribe:train (train_number)
  - unsubscribe:train
  - subscribe:route (from, to)
  - report:incident

server → client:
  - train:position_update
  - train:delay_update
  - station:announcement
  - prediction:updated
```

---

## ML Model Architecture

### Delay Prediction Model Stack

1. **Baseline Model**: Prophet (Facebook)
   - Captures weekly seasonality
   - Holiday/festival effects
   - Trend components

2. **Tree-Based Model**: XGBoost
   - Features: time, weather, historical delays, track section
   - Handles non-linear relationships
   - Feature importance for explainability

3. **Sequence Model**: LSTM/Transformer
   - Input: Last 24h position/delay sequence
   - Output: Next 6h delay forecast
   - Attention mechanism for critical stations

4. **Ensemble**: Weighted average with dynamic weights based on:
   - Model confidence
   - Data availability
   - Time of day

### Feature Engineering
- **Temporal**: Hour, day_of_week, month, is_holiday, is_festival
- **Weather**: Rainfall, visibility, temperature, wind_speed
- **Operational**: Track congestion, signal failures, Rake sharing
- **Historical**: Avg delay last 7 days, same train last week
- **Real-time**: Current speed, next station delay, platform availability

---

## Security & Privacy

- **Authentication**: OAuth 2.0 (Google, Apple) + Magic Link fallback
- **Authorization**: Role-based (User, Moderator, Admin)
- **Data Privacy**: GDPR compliant, user data encrypted at rest
- **Rate Limiting**: Token bucket per IP/user
- **Input Validation**: Zod schemas for all inputs
- **CORS**: Strict origin policy with Cloudflare

---

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers (auto-scale based on CPU)
- Redis Cluster for session/cache
- Database read replicas for reporting queries

### Performance Targets
- API Response: < 200ms (p95)
- WebSocket latency: < 100ms
- Prediction generation: < 2s
- Map render: < 500ms with 1000+ trains

### Cost Optimization
- Edge caching for static data (train schedules)
- Serverless functions for ML inference (pay-per-use)
- Data archival to cold storage after 90 days

---

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [x] Project initialization
- [ ] Database schema setup
- [ ] Basic API scaffolding
- [ ] Map integration (static)
- [ ] User authentication

### Phase 2: Core Tracking (Weeks 3-4)
- [ ] Real-time WebSocket infrastructure
- [ ] Train position ingestion
- [ ] Basic map visualization
- [ ] Schedule display

### Phase 3: Intelligence (Weeks 5-6)
- [ ] ML pipeline setup
- [ ] Delay prediction model (baseline)
- [ ] Historical data ingestion
- [ ] Prediction API

### Phase 4: Polish (Weeks 7-8)
- [ ] PWA features
- [ ] Push notifications
- [ ] Crowdsourced reporting
- [ ] Performance optimization

### Phase 5: Innovation (Weeks 9-10)
- [ ] AR navigation
- [ ] Travel buddy matching
- [ ] Carbon footprint tracker
- [ ] Advanced analytics dashboard

---

## Monitoring & Observability

- **Metrics**: Prometheus (request latency, error rates, ML prediction accuracy)
- **Logging**: Structured JSON logs → Loki
- **Tracing**: OpenTelemetry for distributed tracing
- **Alerting**: PagerDuty integration for critical failures
- **Uptime**: UptimeRobot + Cloudflare Analytics

---

## Contributing Guidelines

1. Fork and clone the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- ESLint + Prettier for JavaScript/TypeScript
- Black + isort for Python
- Conventional Commits
- 80%+ test coverage required

---

## License
MIT License - See LICENSE file for details

---

## Contact
Built with ❤️ by Symphonist. For issues and feature requests, use GitHub Issues.
