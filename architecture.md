# Railway Tracker - System Architecture (1-Week Sprint)

## Project Overview
A comprehensive web-based railway tracking and intelligence platform providing real-time train tracking, predictive delay analysis, and smart travel assistance. Built for modern commuters who demand accuracy, speed, and actionable insights.

**Sprint Goal**: Functional MVP in 7 days with core tracking, delay prediction, and agentic booking.

---

## Core Features (MVP - Week 1)

### 1. Real-Time Train Tracking
- Live GPS-based train positioning on interactive maps
- Station arrival/departure predictions
- Offline mode with cached data sync
- Train schedule lookup

### 2. AI-Powered Delay Prediction
- Historical pattern analysis
- Weather integration
- Real-time incident detection
- Confidence intervals

### 3. Smart Route Optimization
- Multi-criteria routing (fastest, least crowded)
- Platform change minimization
- Seat availability forecasting

### 4. Agentic Ticket Booking System
- AI-powered booking assistant
- Natural language search: "Book Delhi to Mumbai tomorrow morning"
- Auto-fill passenger details from profile
- Smart seat selection (side lower, near door, etc.)
- Waitlist monitoring with auto-booking
- Price comparison across classes
- Cancellation/refund automation
- Group booking coordination

---

## Unique Differentiators (All Planned)

### Phase 1 Features (MVP)
- Crowdsourced incident reporting
- Coach occupancy heatmap
- Voice-first commands

### Phase 2 Features (Post-Launch)
- AR Platform Navigation
- Travel Buddy System
- Carbon Footprint Tracker
- Predictive Maintenance Alerts
- Emergency SOS

---

## Tech Stack (Simplified for 1-Week Build)

### Frontend
- **Framework**: Next.js 14 (App Router) with React Server Components
- **Styling**: Tailwind CSS + shadcn/ui
- **Maps**: Mapbox GL JS (primary) + Leaflet fallback
- **State**: Zustand + React Query
- **Real-time**: Socket.io client
- **PWA**: Minimal Workbox setup

### Backend
- **Runtime**: Node.js with Fastify
- **API**: tRPC for type safety
- **Real-time**: Socket.io server
- **Cache**: Redis (hot data)
- **Queue**: BullMQ (background jobs)

### Data & ML
- **Database**: PostgreSQL + TimescaleDB
- **ORM**: Prisma
- **ML**: Python FastAPI microservice (Prophet + XGBoost)
- **Storage**: Local filesystem (S3 later)

### Infrastructure
- **Container**: Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Basic Sentry + health checks

---

## Simplified System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Next.js Web App + PWA                      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                           │ HTTPS / WSS
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   API GW    │  │  WebSocket  │  │   ML Inference API   │  │
│  │  (Fastify)  │  │   Server    │  │     (FastAPI)       │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │              │
│         └────────────────┴─────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ PostgreSQL  │  │  TimescaleDB│  │   Redis             │  │
│  │  (Primary)  │  │  (TimeSeries)│  │   (Cache)           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Real-Time Tracking
```
Railway API / GPS → Ingestion → Redis Streams → Workers → TimescaleDB → WebSocket → Client
```

### Delay Prediction
```
Historical Data → Feature Engineering → ML Model → Redis Cache → API → Client
```

### Agentic Booking
```
User Query → NLP Intent Recognition → Search Trains → Check Availability → 
Auto-fill Details → Payment Gateway → Ticket Confirmation → Notification
```

---

## Database Schema (Core)

### Trains
```sql
train_number (PK)
train_name
source_station_id (FK)
destination_station_id (FK)
railway_zone
train_type
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
delay_minutes
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
created_at
```

### User Reports
```sql
id (PK)
user_id (FK)
train_number (FK)
station_id (FK)
report_type
description
photo_url
upvotes
verified
created_at
```

### Bookings (Agentic System)
```sql
id (PK)
user_id (FK)
train_number (FK)
journey_date
from_station_id (FK)
to_station_id (FK)
class (SL, 3A, 2A, 1A)
passenger_details_json
pnr_number
booking_status
payment_status
agentic_booking (boolean)
created_at
```

### User Profiles
```sql
user_id (PK)
name
email
phone
home_station_id (FK)
frequent_stations_json
preferred_class
seat_preference (lower, upper, side, etc.)
notification_channels
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

# Agentic Booking
POST   /api/v1/booking/agentic-query
POST   /api/v1/booking/initiate
GET    /api/v1/booking/:id/status
POST   /api/v1/booking/:id/cancel
GET    /api/v1/booking/waitlist-alerts
```

### WebSocket Events
```
client → server:
  - subscribe:train (train_number)
  - unsubscribe:train
  - subscribe:route (from, to)
  - report:incident
  - booking:status-update

server → client:
  - train:position_update
  - train:delay_update
  - prediction:updated
  - booking:confirmed
  - booking:waitlist-alert
```

---

## ML Model Architecture (Simplified)

### Delay Prediction
1. **Baseline**: Prophet (seasonality + holidays)
2. **Primary**: XGBoost (weather, historical, time features)
3. **Ensemble**: Weighted average

### Feature Set
- Temporal: hour, day, month, holiday
- Weather: rainfall, visibility, temperature
- Operational: track congestion, signal failures
- Historical: avg delay last 7 days

---

## Agentic Ticket Booking System

### Architecture
```
User Input (Text/Voice)
         │
         ▼
   NLP Intent Parser (LLM-based)
   - Extract: from, to, date, time, class, passengers
   - Handle ambiguity: "tomorrow morning" → date + time range
         │
         ▼
   Context Manager
   - User preferences (home station, frequent routes)
   - Past bookings (class, seat preference)
   - Budget constraints
         │
         ▼
   Search & Rank Engine
   - Trains matching criteria
   - Sort by: price, duration, availability, delay probability
   - Apply user preferences
         │
         ▼
   Auto-Fill & Smart Selection
   - Auto-fill passenger details
   - Smart seat selection (side lower if available)
   - Suggest alternatives if waitlisted
         │
         ▼
   Booking Orchestrator
   - Check seat availability
   - Initiate payment
   - Handle waitlist monitoring
   - Auto-cancel if better option found
         │
         ▼
   Notification System
   - Confirm booking
   - Waitlist alerts
   - Platform changes
   - Delay updates
```

### Key Features
- Natural language booking: "Book me a ticket from Delhi to Mumbai tomorrow in 3AC"
- Context-aware: remembers frequent routes and preferences
- Waitlist monitoring with auto-booking when seats available
- Smart cancellation: auto-cancel if delay > 2 hours and refund available
- Group booking: coordinate multiple passengers
- Price tracking: notify when fare drops
- Alternative suggestions: "Your preferred train is waitlisted, similar train has 12 seats available"

---

## Optional / Planned Features (Post-Launch)

### Phase 2 (Month 2)
- [ ] AR Platform Navigation
- [ ] Travel Buddy Matching
- [ ] Carbon Footprint Tracker
- [ ] Predictive Maintenance Alerts

### Phase 3 (Month 3)
- [ ] Emergency SOS with live location
- [ ] Coach Occupancy Heatmap (crowdsourced)
- [ ] Multi-language support (Hindi, Tamil, Telugu, etc.)
- [ ] Offline-first PWA with full functionality

### Phase 4 (Month 4+)
- [ ] Metro integration (Delhi, Mumbai, Bangalore, etc.)
- [ ] Bus/Taxi integration for last-mile
- [ ] Loyalty points system
- [ ] Social features (share journey, travel stories)
- [ ] Advanced analytics dashboard for frequent travelers
- [ ] Integration with IRCTC API (official)
- [ ] Group travel planning
- [ ] Pet-friendly train finder
- [ ] Luggage tracking (IoT integration)

---

## Development Phases (1-Week Sprint)

### Day 1: Foundation
- [x] Project initialization
- [ ] Database schema setup
- [ ] Basic API scaffolding
- [ ] Map integration (static)
- [ ] User authentication (basic)

### Day 2: Core Tracking
- [ ] Real-time WebSocket infrastructure
- [ ] Train position ingestion
- [ ] Basic map visualization
- [ ] Schedule display

### Day 3: Intelligence
- [ ] ML pipeline setup (simplified)
- [ ] Delay prediction model (baseline)
- [ ] Historical data ingestion
- [ ] Prediction API

### Day 4: Agentic Booking
- [ ] NLP intent parser
- [ ] Booking API
- [ ] Payment integration (mock)
- [ ] Booking confirmation flow

### Day 5: Polish
- [ ] PWA features
- [ ] Push notifications
- [ ] Crowdsourced reporting
- [ ] Performance optimization

### Day 6: Testing & Bug Fixes
- [ ] End-to-end testing
- [ ] Load testing
- [ ] Bug fixes
- [ ] Documentation

### Day 7: Launch Prep
- [ ] Deployment setup
- [ ] Monitoring
- [ ] Final testing
- [ ] Launch! 🚂

---

## Security & Privacy

- OAuth 2.0 + JWT
- Rate limiting
- Input validation (Zod)
- CORS strict policy
- GDPR compliant

---

## Scalability (Post-Launch)

- Horizontal scaling for API servers
- Redis Cluster for cache
- Database read replicas
- CDN for static assets
- Serverless ML inference

---

## Contributing

1. Fork and clone
2. Create feature branch
3. Commit changes (Conventional Commits)
4. Push and open PR

### Code Standards
- ESLint + Prettier
- Black + isort (Python)
- 80%+ test coverage

---

## License
MIT License

---

## Contact
Built with ❤️ by Error 404. For issues, use GitHub Issues.
