# Vercel Deployment Plan - MERN QMS

This document outlines the deployment strategy for the MERN Quiz Management System on Vercel and complementary platforms.

## 📋 Overview

The MERN QMS consists of:
- **Frontend**: React + Vite application (deployable to Vercel)
- **Backend**: Microservices architecture with 5 Node.js services
- **Database**: MongoDB (requires external hosting)
- **Cache**: Redis (optional, requires external hosting)

## 🎯 Deployment Strategy

### Option 1: Hybrid Deployment (Recommended)

**Frontend on Vercel** + **Backend on Platform Supporting Long-Running Services**

#### Frontend Deployment (Vercel)
- ✅ Deploy the `client/` directory to Vercel
- ✅ Fast CDN distribution
- ✅ Automatic HTTPS
- ✅ Environment variable management
- ✅ Preview deployments for PRs

#### Backend Deployment Options

Since Vercel serverless functions have execution time limits and don't support persistent connections well, deploy backend services to:

1. **Railway** (Recommended for simplicity)
   - Deploy all 5 microservices
   - Built-in MongoDB support
   - Easy environment variable management
   - Automatic deployments from GitHub

2. **Render** (Alternative)
   - Free tier available
   - Supports Docker deployments
   - MongoDB available as addon

3. **Fly.io** (Alternative)
   - Good for microservices
   - Global distribution
   - Supports Docker

4. **AWS/GCP/Azure** (Enterprise)
   - Full control and scalability
   - ECS/GKE/Container Instances
   - Managed MongoDB (Atlas, DocumentDB, etc.)

### Option 2: Vercel Serverless Functions (Not Recommended)

⚠️ **Limitations:**
- 10-second execution limit (Pro: 60 seconds)
- Cold starts
- MongoDB connections need connection pooling
- Redis connections need reconnection logic
- Complex microservices architecture doesn't fit serverless well

**However**, if you want to explore this:
- Convert each service route to a serverless function
- Use MongoDB connection pooling libraries
- Implement proper error handling for cold starts

## 🚀 Step-by-Step Deployment Guide

### Phase 1: Frontend Deployment to Vercel

#### Prerequisites
1. Vercel account (free tier available)
2. GitHub repository connected
3. Backend API URL ready (from backend deployment)

#### Steps

1. **Install Vercel CLI** (optional, can use web interface)
   ```bash
   npm i -g vercel
   ```

2. **Navigate to client directory**
   ```bash
   cd client
   ```

3. **Deploy to Vercel**
   ```bash
   vercel
   ```
   Or use Vercel dashboard:
   - Import project from GitHub
   - Set root directory to `client`
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Configure Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   VITE_API_GATEWAY_URL=https://your-backend-api.com/api
   ```

5. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **Set up Custom Domain** (optional)
   - Add domain in Vercel dashboard
   - Configure DNS records

### Phase 2: Backend Deployment (Railway Example)

#### Prerequisites
1. Railway account
2. MongoDB Atlas account (or Railway MongoDB service)

#### Steps

1. **Create Railway Project**
   - Login to Railway
   - Create new project
   - Connect GitHub repository

2. **Deploy API Gateway**
   - Add new service → GitHub repo
   - Set root directory: `server/api-gateway`
   - Environment variables:
     ```
     PORT=5000
     AUTH_SERVICE_URL=https://auth-service-production.railway.app
     QUIZ_SERVICE_URL=https://quiz-service-production.railway.app
     ASSESSMENT_SERVICE_URL=https://assessment-service-production.railway.app
     REPORTING_SERVICE_URL=https://reporting-service-production.railway.app
     ```

3. **Deploy Auth Service**
   - Add new service
   - Root directory: `server/auth-service`
   - Environment variables:
     ```
     PORT=5001
     MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/qms-auth
     JWT_SECRET=your-secure-secret-key
     CLIENT_URL=https://your-vercel-app.vercel.app
     ```

4. **Deploy Quiz Service**
   - Similar process
   - Root directory: `server/quiz-service`
   - Environment variables as per configuration guide

5. **Deploy Assessment Service**
   - Similar process
   - Root directory: `server/assessment-service`

6. **Deploy Reporting Service**
   - Similar process
   - Root directory: `server/reporting-service`

7. **Get Service URLs**
   - Railway provides public URLs for each service
   - Update API Gateway environment variables with these URLs

8. **Update Frontend Environment Variable**
   - Update `VITE_API_GATEWAY_URL` in Vercel with API Gateway URL

### Phase 3: Database Setup

#### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Go to MongoDB Atlas
   - Create free cluster
   - Choose cloud provider and region

2. **Configure Network Access**
   - Add IP: `0.0.0.0/0` (or specific IPs for security)
   - Or use VPC peering for Railway

3. **Create Database Users**
   - Create user with read/write permissions

4. **Get Connection String**
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database`
   - Use different databases for each service:
     - `qms-auth`
     - `qms-quiz`
     - `qms-assessment`
     - `qms-reporting`

5. **Update Service Environment Variables**
   - Update `MONGO_URI` for each service

#### Redis (Optional)

1. **Upstash** (Serverless Redis)
   - Create database
   - Get connection URL
   - Update `REDIS_URL` in services

2. **Redis Cloud** (Alternative)
   - Free tier available
   - Get connection details

### Phase 4: Post-Deployment

1. **Seed Admin User**
   ```bash
   # Update MONGO_URI in seedAdmin.js
   node seedAdmin.js
   ```

2. **Verify Services**
   - Check API Gateway health: `https://api-gateway-url/`
   - Test authentication endpoints
   - Test quiz endpoints

3. **Update CORS Settings**
   - Update `CLIENT_URL` in all backend services
   - Add Vercel deployment URLs

4. **Monitor and Logs**
   - Use Railway logs for backend
   - Use Vercel Analytics for frontend
   - Set up error tracking (Sentry, etc.)

## 🔧 Configuration Files

### vercel.json
Located in `/client/vercel.json` (or root if deploying from root)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Environment Variables Checklist

#### Vercel (Frontend)
- `VITE_API_GATEWAY_URL` - Backend API Gateway URL

#### Backend Services (Railway/Render/etc.)
- `PORT` - Service port
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret (same across all services)
- `CLIENT_URL` - Frontend URL (for CORS)
- `REDIS_URL` - Redis connection (optional)
- Service-specific URLs (for inter-service communication)

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit secrets to repository
   - Use Vercel/Railway environment variable management
   - Rotate JWT secrets regularly

2. **CORS Configuration**
   - Restrict origins to your Vercel domain(s)
   - Don't use wildcard (`*`) in production

3. **MongoDB Security**
   - Use strong passwords
   - Restrict IP access if possible
   - Enable MongoDB Atlas security features

4. **Rate Limiting**
   - Configure Redis-backed rate limiting for production
   - Adjust limits based on usage

5. **HTTPS Only**
   - Vercel provides HTTPS automatically
   - Ensure backend services use HTTPS

## 📊 Monitoring & Maintenance

1. **Health Checks**
   - Set up health check endpoints
   - Monitor service availability

2. **Logging**
   - Use structured logging
   - Aggregate logs (Datadog, LogTail, etc.)

3. **Performance**
   - Monitor API response times
   - Use Vercel Analytics
   - Monitor database performance

4. **Backups**
   - MongoDB Atlas provides automatic backups
   - Set up manual backup procedures

## 🚨 Troubleshooting

### Frontend Issues

**Build Failures**
- Check Node.js version (Vercel auto-detects)
- Verify all dependencies in package.json
- Check build logs in Vercel dashboard

**API Connection Issues**
- Verify `VITE_API_GATEWAY_URL` is set correctly
- Check CORS configuration on backend
- Verify backend services are running

### Backend Issues

**Service Unavailable**
- Check service logs
- Verify environment variables
- Check MongoDB connection

**Database Connection Issues**
- Verify MongoDB connection string
- Check network access rules
- Verify credentials

**Inter-Service Communication**
- Verify service URLs are correct
- Check service health endpoints
- Verify network connectivity

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables documented
- [ ] Database backups configured
- [ ] CORS settings updated
- [ ] Security review completed
- [ ] Error handling tested

### Frontend (Vercel)
- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Custom domain configured (if needed)
- [ ] Deployment successful
- [ ] Health check passing

### Backend Services
- [ ] All services deployed
- [ ] Environment variables configured
- [ ] Service URLs documented
- [ ] Inter-service communication verified
- [ ] Health checks passing

### Database
- [ ] MongoDB cluster created
- [ ] Database users created
- [ ] Connection strings configured
- [ ] Network access configured
- [ ] Backups enabled

### Post-Deployment
- [ ] Admin user seeded
- [ ] Smoke tests passing
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team notified

## 🔄 CI/CD Integration

### Vercel
- Automatic deployments from Git
- Preview deployments for PRs
- Custom deployment hooks available

### Railway
- Automatic deployments from Git
- Manual deployments available
- Rollback support

### Recommended Workflow
1. Push to `main` branch → Auto-deploy to production
2. Create PR → Preview deployment
3. Merge PR → Production deployment

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

## 🎯 Quick Start Commands

```bash
# Frontend deployment
cd client
vercel

# Or use Vercel dashboard for GUI deployment

# Backend deployment (Railway)
# Use Railway dashboard to connect GitHub repo

# Seed admin (after deployment)
# Update MONGO_URI in seedAdmin.js
node seedAdmin.js
```

---

**Note**: This deployment plan focuses on a hybrid approach (Vercel for frontend + Railway/Render for backend) as it's the most practical for this microservices architecture. Vercel serverless functions can work but require significant refactoring.


