## TV Scheduler

A personal TV dashboard built with React and AWS serverless services.


# AWS TV scheduler
http://tv-scheduler-jamesdileva-2026.s3-website-us-east-1.amazonaws.com/

### Features
- View today's TV schedule
- Save favorite shows
- Prevent duplicates
- Delete saved shows
- Expand show details
- Display next episode air date

### Tech Stack
- React + Vite
- Amazon S3
- API Gateway
- AWS Lambda
- DynamoDB
- TVMaze API

### Architecture
Serverless full-stack application with a static frontend and cloud backend.

### Local Development

```bash
# Frontend
cd frontend
npm install
npm run dev
```

### Deployment

```bash
cd frontend
npm run build
aws s3 sync dist/ s3://YOUR_BUCKET --delete
```

### API Routes
- GET `/schedule/today`
- GET `/watchlist`
- POST `/watchlist`
- DELETE `/watchlist/{showId}`
- GET `/show-details?name=...`

### Future Enhancements
- Authentication
- Notifications
- Advanced filtering
- Calendar integration

---

# 4. UI Polish Recommendations

## Immediate Improvements
- Replace inline styles with CSS modules
- Add hover effects
- Use cards for episodes and watchlist items
- Add loading indicators
- Add empty states
- Replace `alert()` with toast notifications

## Layout Improvements
- Sticky details panel
- Responsive mobile layout
- Search and filtering
- Sorting options

## Design Ideas
- Dark mode
- Poster thumbnails
- Genre badges
- Countdown to next episode

---

### Why Some Shows May Be Missing
- TVMaze may filter by timezone/date
- Data may not include every region/network

## Additional Features
- Search for any show
- Track watched episodes
- Email reminders
- Habit Tracker project (reuse same AWS architecture)

---

# Summary

- built a real serverless full-stack application using:

- React
- Amazon S3
- API Gateway
- AWS Lambda
- DynamoDB
- IAM
- CloudWatch
- External APIs

This architecture is directly applicable to:
- SaaS products
- Dashboards
- Automation tools
- Internal business applications
