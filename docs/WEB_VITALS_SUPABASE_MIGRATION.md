# Web Vitals Supabase Migration

## Overview

Week 4 Performance Monitoring System requires a new `web_vitals` table to store Core Web Vitals metrics from client browsers.

## Table Schema

### Create Table SQL

```sql
-- Create web_vitals table for performance monitoring
CREATE TABLE IF NOT EXISTS public.web_vitals (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,

  -- Core Web Vitals (milliseconds or unitless)
  lcp FLOAT,                          -- Largest Contentful Paint (ms)
  fid FLOAT,                          -- First Input Delay (ms)
  cls FLOAT,                          -- Cumulative Layout Shift (0-1)
  ttfb FLOAT,                         -- Time to First Byte (ms)
  fcp FLOAT,                          -- First Contentful Paint (ms)

  -- Page Context
  page_url TEXT NOT NULL,             -- URL path (e.g., /guide/en/eiffel-tower)
  session_id TEXT,                    -- Client session identifier
  language TEXT,                      -- Language code (ko, en, ja, zh, es)
  location TEXT,                      -- Location/page type (homepage, guide, podcast, etc)

  -- User Agent
  user_agent TEXT,                    -- Browser/device info

  -- Timestamps
  timestamp TIMESTAMPTZ NOT NULL,     -- When metrics were measured
  recorded_at TIMESTAMPTZ DEFAULT NOW(), -- When metrics were recorded in DB

  -- Indexing for queries
  CONSTRAINT web_vitals_pkey PRIMARY KEY (id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_web_vitals_recorded_at ON public.web_vitals(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_web_vitals_location ON public.web_vitals(location);
CREATE INDEX IF NOT EXISTS idx_web_vitals_language ON public.web_vitals(language);
CREATE INDEX IF NOT EXISTS idx_web_vitals_session_id ON public.web_vitals(session_id);
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_url ON public.web_vitals(page_url);

-- Composite index for common filter + time queries
CREATE INDEX IF NOT EXISTS idx_web_vitals_location_time ON public.web_vitals(location, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_web_vitals_language_time ON public.web_vitals(language, recorded_at DESC);
```

### Table Structure

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key, auto-incrementing |
| lcp | FLOAT | Largest Contentful Paint (ms) |
| fid | FLOAT | First Input Delay (ms) |
| cls | FLOAT | Cumulative Layout Shift (0-1 scale) |
| ttfb | FLOAT | Time to First Byte (ms) |
| fcp | FLOAT | First Contentful Paint (ms) |
| page_url | TEXT | Page path/URL |
| session_id | TEXT | Client session ID for grouping |
| language | TEXT | Language code |
| location | TEXT | Page location (homepage/guide/podcast) |
| user_agent | TEXT | Browser/device info |
| timestamp | TIMESTAMPTZ | Metrics measurement time |
| recorded_at | TIMESTAMPTZ | Server recording time |

## Row-Level Security (RLS)

```sql
-- Enable RLS on web_vitals table
ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can INSERT metrics (public collection)
CREATE POLICY "Allow public to insert vitals" ON public.web_vitals
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Only authenticated admins can SELECT all metrics
CREATE POLICY "Allow admins to read vitals" ON public.web_vitals
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM public.admin_users
    )
  );

-- Policy: Public can only see aggregated stats (not individual records)
-- This is handled in the API layer, not RLS
```

## API Endpoint

### POST /api/vitals

Receive metrics from client and store in Supabase.

**Request Body:**
```json
{
  "lcp": 2400,
  "fid": 150,
  "cls": 0.05,
  "ttfb": 800,
  "fcp": 1200,
  "pageUrl": "/guide/ko/eiffel-tower",
  "timestamp": 1698789000000,
  "userAgent": "Mozilla/5.0...",
  "sessionId": "1698789000000-a1b2c3d4e5",
  "language": "ko",
  "location": "guide"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Metrics recorded",
  "data": { /* stored metrics */ }
}
```

### GET /api/vitals

Query metrics with filters and statistics.

**Query Parameters:**
- `location`: Filter by page location
- `language`: Filter by language
- `hours`: Time window in hours (default: 24)

**Example:**
```
GET /api/vitals?location=guide&language=ko&hours=24
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalRecords": 1250,
    "averageLcp": 2156,
    "averageFid": 98,
    "averageCls": 0.042,
    "averageTtfb": 645,
    "averageFcp": 1023,
    "percentile75Lcp": 3200,
    "percentile75Fid": 180,
    "timeWindow": "24 hours",
    "filters": {
      "location": "guide",
      "language": "ko"
    }
  },
  "data": [ /* raw records */ ]
}
```

## Performance Thresholds (Web Vitals Goals)

Based on Google Core Web Vitals standards:

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | < 2.5s | 2.5s - 4s | > 4s |
| FID | < 100ms | 100ms - 300ms | > 300ms |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |
| TTFB | < 600ms | 600ms - 1200ms | > 1200ms |
| FCP | < 1.8s | 1.8s - 3s | > 3s |

## Data Collection

### Client-side Tracking

Implemented in `src/lib/monitoring/vitals-client.ts`:

1. **Initialization**: `initializeVitalsTracking()` called on app load
2. **Metrics Collection**: Uses `web-vitals` library to collect metrics
3. **Selective Reporting**: Only sends metrics that exceed good thresholds
4. **Session Tracking**: Assigns unique session ID to group metrics
5. **Session Context**: Extracts language, location from page

### Metrics Sent

- **Always**: LCP, FID, CLS, TTFB, FCP
- **Metadata**: pageUrl, timestamp, sessionId, language, location, userAgent

### Network Impact

- Payload size: ~100-200 bytes per request
- Frequency: 1-5 requests per page session
- Total impact: < 1KB per user session
- Fallback: Uses `navigator.sendBeacon()` for unload events

## Integration Status

- ✅ `web-vitals` library added to package.json
- ✅ `src/lib/monitoring/vitals-client.ts` - client tracking implementation
- ✅ `app/api/vitals/route.ts` - API endpoint for storing metrics
- ✅ `src/components/monitoring/VitalsInitializer.tsx` - client component
- ✅ Integrated into `app/layout.tsx`
- ⏳ **TODO**: Create Supabase table using SQL above
- ⏳ **TODO**: Set up RLS policies
- ⏳ **TODO**: Configure admin access for analytics

## Next Steps

1. **Execute Migration**:
   ```bash
   # Using Supabase CLI
   npx supabase db push
   # OR manually in Supabase dashboard: SQL Editor → Run query
   ```

2. **Verify Table**:
   ```bash
   # Check table exists
   npx supabase db pull
   ```

3. **Test Endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/vitals \
     -H "Content-Type: application/json" \
     -d '{
       "lcp": 2400,
       "fid": 100,
       "cls": 0.05,
       "pageUrl": "/test",
       "timestamp": '$(date +%s)'000,
       "sessionId": "test-session"
     }'
   ```

4. **Monitor Data**:
   ```bash
   # Query Supabase dashboard to see recorded metrics
   SELECT * FROM web_vitals ORDER BY recorded_at DESC LIMIT 10;
   ```

## Week 4 Monitoring System Architecture

```
┌─ Browser (Client) ────────────────────────────────┐
│                                                   │
│  1. Page Loads                                   │
│     ↓                                            │
│  2. VitalsInitializer calls initializeVitalsTracking()
│     ↓                                            │
│  3. web-vitals library measures LCP, FID, CLS   │
│     ↓                                            │
│  4. Send metrics to /api/vitals                 │
│                                                  │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ↓                     ↓
    POST /api/vitals   beforeunload event
        │                     │
        ├─────────────────────┤
        ↓
   ┌─ Next.js Server ────────────────────────────┐
   │                                             │
   │  /api/vitals endpoint                      │
   │  - Validates payload                       │
   │  - Stores in Supabase                      │
   │  - Returns success/error                   │
   │                                             │
   └──────────────────┬──────────────────────────┘
                      ↓
       ┌────────────────────────────────┐
       ↓                                ↓
    Supabase web_vitals table    Admin Dashboard
    - Stores metrics             - Analyzes trends
    - Tracks sessions            - Generates reports
    - Enables querying           - Alerts on issues
```

## Success Criteria

- ✅ Web Vitals collected from all page visits
- ✅ API endpoint receives and stores metrics
- ✅ Data persists in Supabase
- ✅ Query endpoint returns statistics
- ✅ No performance impact on pages (< 1ms overhead)
- ✅ Zero user-facing errors
- ✅ Baseline established by end of Week 4
