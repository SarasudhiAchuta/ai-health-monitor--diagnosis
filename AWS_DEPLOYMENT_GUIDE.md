# 🚀 AWS Deployment Guide for HealthAI Monitor

Complete guide to deploy your Next.js health monitoring application to AWS using S3, Lambda, CloudFront, and API Gateway.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Deployment Options](#deployment-options)
4. [Option 1: AWS Amplify (Recommended)](#option-1-aws-amplify-recommended)
5. [Option 2: Manual AWS Setup](#option-2-manual-aws-setup)
6. [Option 3: Serverless Framework](#option-3-serverless-framework)
7. [Environment Variables](#environment-variables)
8. [Database Configuration](#database-configuration)
9. [Post-Deployment Testing](#post-deployment-testing)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required AWS Services
- AWS Account with billing enabled
- IAM user with appropriate permissions
- AWS CLI installed and configured

### Your Application Requirements
- ✅ Next.js 15 with App Router
- ✅ 7 API routes (appointments, assessments, auth, chat, health activities, health metrics, medications)
- ✅ Turso database (already cloud-hosted)
- ✅ Authentication with better-auth
- ✅ Server-side rendering

### Environment Variables Needed
```bash
# Database (Turso)
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Authentication (better-auth)
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-domain.com

# Other keys (if any)
# Add your additional environment variables here
```

---

## 🏗️ Architecture Overview

### Current Application Architecture
```
┌─────────────────────────────────────────────────────┐
│              HealthAI Monitor App                    │
├─────────────────────────────────────────────────────┤
│  Frontend (Next.js SSR)                              │
│  - Homepage, Dashboard, Assessment, Results          │
│  - Login/Register pages                              │
│  - AI Chatbot UI                                     │
├─────────────────────────────────────────────────────┤
│  API Routes (7 endpoints)                            │
│  - /api/appointments                                 │
│  - /api/assessments                                  │
│  - /api/auth/[...all]                                │
│  - /api/chat-messages                                │
│  - /api/health-activities                            │
│  - /api/health-metrics                               │
│  - /api/medications                                  │
├─────────────────────────────────────────────────────┤
│  Database (Turso - Cloud SQLite)                     │
│  - Already hosted externally ✅                      │
└─────────────────────────────────────────────────────┘
```

### AWS Deployment Architecture
```
                    ┌──────────────────┐
                    │   CloudFront     │
                    │   (CDN - Global) │
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
         ┌──────▼─────┐           ┌──────▼──────┐
         │   S3       │           │  Lambda     │
         │  (Static)  │           │  (API/SSR)  │
         └────────────┘           └──────┬──────┘
                                         │
                                  ┌──────▼──────┐
                                  │   Turso DB  │
                                  │  (External) │
                                  └─────────────┘
```

---

## 🎯 Deployment Options

### Option 1: AWS Amplify (⭐ Recommended)
**Best for**: Quick deployment, automatic CI/CD, minimal configuration

**Pros**:
- ✅ Automatic builds and deployments
- ✅ Built-in CDN (CloudFront)
- ✅ Environment variable management
- ✅ Zero-config Next.js support
- ✅ SSL certificate management
- ✅ Branch-based deployments

**Cons**:
- ❌ Less control over infrastructure
- ❌ Higher cost for high-traffic apps

### Option 2: Manual AWS Setup
**Best for**: Full control, enterprise deployments, custom requirements

**Pros**:
- ✅ Complete infrastructure control
- ✅ Cost optimization possible
- ✅ Custom caching strategies

**Cons**:
- ❌ Complex setup
- ❌ Requires AWS expertise
- ❌ Manual updates needed

### Option 3: Serverless Framework
**Best for**: Developers familiar with serverless, infrastructure as code

**Pros**:
- ✅ Infrastructure as code
- ✅ Easy rollbacks
- ✅ Multi-environment support

**Cons**:
- ❌ Learning curve
- ❌ Additional tooling

---

## 🚀 Option 1: AWS Amplify (Recommended)

### Step 1: Prepare Your Repository
1. Push your code to GitHub, GitLab, or Bitbucket
2. Ensure your repository is accessible

### Step 2: Create Amplify App
1. **Go to AWS Console** → AWS Amplify
2. **Click "New App"** → "Host web app"
3. **Connect your repository**:
   - Select provider (GitHub/GitLab/Bitbucket)
   - Authorize AWS Amplify
   - Select your repository
   - Choose the main branch

### Step 3: Configure Build Settings
Amplify auto-detects Next.js. Verify the build configuration:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### Step 4: Add Environment Variables
In Amplify Console:
1. Go to **"Environment variables"**
2. Add each variable:
   ```
   TURSO_DATABASE_URL = libsql://your-database.turso.io
   TURSO_AUTH_TOKEN = your-turso-token
   BETTER_AUTH_SECRET = your-secret-key
   BETTER_AUTH_URL = https://main.yourappid.amplifyapp.com
   ```

### Step 5: Deploy
1. Click **"Save and deploy"**
2. Wait for build to complete (5-10 minutes)
3. Your app will be live at: `https://main.yourappid.amplifyapp.com`

### Step 6: Custom Domain (Optional)
1. Go to **"Domain management"**
2. Add your custom domain
3. AWS will provision SSL certificate
4. Update DNS records as instructed

### Step 7: Update Auth URL
After deployment, update `BETTER_AUTH_URL` to your actual domain:
```bash
BETTER_AUTH_URL=https://yourdomain.com
```

---

## 🔧 Option 2: Manual AWS Setup

### Prerequisites
```bash
# Install AWS CLI
# macOS
brew install awscli

# Windows
# Download from: https://aws.amazon.com/cli/

# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Access Key, Region (e.g., us-east-1)
```

### Step 1: Build Your Application
```bash
# Build Next.js app
npm run build

# This creates:
# - .next/ folder (with standalone output)
# - Static assets in .next/static/
```

### Step 2: Create S3 Bucket for Static Assets
```bash
# Create S3 bucket
aws s3 mb s3://healthai-monitor-static --region us-east-1

# Enable static website hosting
aws s3 website s3://healthai-monitor-static \
  --index-document index.html \
  --error-document error.html

# Upload static files
aws s3 sync .next/static/ s3://healthai-monitor-static/_next/static/ \
  --acl public-read \
  --cache-control "public, max-age=31536000, immutable"
```

### Step 3: Create Lambda Function
1. **Package your application**:
```bash
# Install dependencies for production
npm ci --production

# Create deployment package
zip -r function.zip .next node_modules package.json
```

2. **Create Lambda function in AWS Console**:
   - Runtime: Node.js 20.x
   - Handler: .next/standalone/server.js
   - Memory: 1024 MB (minimum)
   - Timeout: 30 seconds
   - Environment variables: Add all from `.env`

### Step 4: Create API Gateway
1. **Go to AWS Console** → API Gateway
2. **Create new API** → HTTP API
3. **Add integration** → Lambda
4. **Configure routes**:
   - `GET /` → Lambda
   - `GET /{proxy+}` → Lambda
   - `POST /api/{proxy+}` → Lambda
   - `PUT /api/{proxy+}` → Lambda
   - `DELETE /api/{proxy+}` → Lambda

### Step 5: Create CloudFront Distribution
1. **Go to AWS Console** → CloudFront
2. **Create distribution**:
   - Origin domain: Your API Gateway URL
   - Alternate origin: S3 bucket for static assets
   - Viewer protocol: Redirect HTTP to HTTPS
   - Cache behavior:
     - `/_next/static/*` → S3 origin (max caching)
     - `/api/*` → API Gateway (no caching)
     - `/*` → API Gateway (minimal caching)

### Step 6: Update DNS
Point your domain to CloudFront distribution:
```
A Record: yourdomain.com → CloudFront distribution
CNAME: www.yourdomain.com → CloudFront distribution
```

---

## 📦 Option 3: Serverless Framework

### Step 1: Install Serverless Framework
```bash
npm install -g serverless
npm install --save-dev serverless-nextjs-plugin
```

### Step 2: Create `serverless.yml`
```yaml
service: healthai-monitor

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  stage: ${opt:stage, 'production'}
  environment:
    TURSO_DATABASE_URL: ${env:TURSO_DATABASE_URL}
    TURSO_AUTH_TOKEN: ${env:TURSO_AUTH_TOKEN}
    BETTER_AUTH_SECRET: ${env:BETTER_AUTH_SECRET}
    BETTER_AUTH_URL: ${env:BETTER_AUTH_URL}

plugins:
  - serverless-nextjs-plugin

custom:
  nextjs:
    minifyHandlers: true
    useServerlessTraceTarget: true
```

### Step 3: Deploy
```bash
# Deploy to AWS
serverless deploy --stage production

# Your app will be deployed with:
# - Lambda functions for API routes and SSR
# - S3 bucket for static assets
# - CloudFront distribution
```

---

## 🔐 Environment Variables

### Required Environment Variables

Create a file `.env.production` for AWS deployment:

```bash
# ========================================
# DATABASE CONFIGURATION (TURSO)
# ========================================
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# ========================================
# AUTHENTICATION (better-auth)
# ========================================
BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters
BETTER_AUTH_URL=https://yourdomain.com

# ========================================
# NODE ENVIRONMENT
# ========================================
NODE_ENV=production
```

### How to Set Environment Variables

#### AWS Amplify:
1. Console → Your App → Environment variables
2. Add each variable one by one

#### AWS Lambda:
1. Console → Lambda → Configuration → Environment variables
2. Add each variable

#### Serverless Framework:
```yaml
# In serverless.yml
provider:
  environment:
    TURSO_DATABASE_URL: ${env:TURSO_DATABASE_URL}
```

---

## 🗄️ Database Configuration

### Turso Database (Already Configured) ✅

Your Turso database is **cloud-hosted** and will work automatically with AWS deployment.

**No changes needed** because:
- ✅ Turso is accessible from anywhere
- ✅ Connection uses HTTPS
- ✅ Already configured in your code

### Verify Database Connection
After deployment, check database connectivity:
```bash
# Test API endpoint
curl https://yourdomain.com/api/health-metrics

# Should return health metrics data
```

---

## 🧪 Post-Deployment Testing

### 1. Test Homepage
```bash
curl https://yourdomain.com
# Should return HTML
```

### 2. Test API Endpoints
```bash
# Test authentication API
curl https://yourdomain.com/api/auth/session

# Test health metrics API
curl https://yourdomain.com/api/health-metrics

# Test assessments API
curl -X POST https://yourdomain.com/api/assessments \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "fever, cough"}'
```

### 3. Test Authentication Flow
1. Visit: `https://yourdomain.com/register`
2. Create test account
3. Login at: `https://yourdomain.com/login`
4. Access dashboard: `https://yourdomain.com/dashboard`

### 4. Test Database Operations
1. Create new health metric in dashboard
2. Schedule appointment
3. Use symptom checker
4. Verify all data persists

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **500 Internal Server Error**
**Cause**: Missing environment variables
**Fix**: 
- Check all environment variables are set in AWS
- Verify `BETTER_AUTH_URL` matches your domain
- Check Lambda logs in CloudWatch

#### 2. **Database Connection Failed**
**Cause**: Incorrect Turso credentials
**Fix**:
- Verify `TURSO_DATABASE_URL` format: `libsql://name.turso.io`
- Check `TURSO_AUTH_TOKEN` is valid
- Test connection locally first

#### 3. **Authentication Not Working**
**Cause**: Wrong `BETTER_AUTH_URL`
**Fix**:
- Must match your actual domain: `https://yourdomain.com`
- No trailing slash
- Use HTTPS, not HTTP

#### 4. **Static Assets Not Loading**
**Cause**: S3/CloudFront misconfiguration
**Fix**:
- Check S3 bucket is public
- Verify CloudFront origin settings
- Clear CloudFront cache

#### 5. **API Routes Return 404**
**Cause**: API Gateway routing issue
**Fix**:
- Verify all routes are configured: `/api/{proxy+}`
- Check Lambda integration
- Review API Gateway logs

#### 6. **Build Fails**
**Cause**: Missing dependencies or build errors
**Fix**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Test build locally
npm run build

# Check for TypeScript errors
npm run lint
```

### Viewing Logs

#### AWS Amplify:
1. Console → Your App → Build history
2. Click build number → View logs

#### AWS Lambda:
1. Console → Lambda → Monitor
2. View logs in CloudWatch

#### CloudFront:
1. Console → CloudFront → Monitoring
2. Check error rates and cache statistics

---

## 📊 Monitoring & Analytics

### CloudWatch Metrics
Monitor your application:
- Lambda invocations
- Error rates
- Response times
- Database query performance

### Set Up Alarms
1. Go to CloudWatch → Alarms
2. Create alarm for:
   - Lambda errors > 5%
   - API Gateway 5xx errors
   - Lambda duration > 10 seconds

---

## 💰 Cost Estimation

### AWS Amplify (Typical costs):
- **Build minutes**: $0.01/minute (~$5-10/month)
- **Hosting**: $0.15/GB served (~$10-20/month)
- **Total**: ~$15-30/month for moderate traffic

### Manual Setup (Typical costs):
- **Lambda**: First 1M requests free, then $0.20/1M
- **S3**: $0.023/GB storage
- **CloudFront**: $0.085/GB data transfer
- **API Gateway**: $1/million requests
- **Total**: ~$10-50/month depending on traffic

### Turso Database:
- **Free tier**: 500MB storage, 1 billion row reads/month
- **Pro tier**: $25/month for more capacity

---

## 🎉 Success Checklist

After deployment, verify:
- ✅ Homepage loads correctly
- ✅ Login/Register works
- ✅ Dashboard displays user data
- ✅ Symptom checker returns results
- ✅ AI chatbot responds
- ✅ All API endpoints work
- ✅ Database operations succeed
- ✅ SSL certificate is active (HTTPS)
- ✅ Custom domain works (if configured)

---

## 🆘 Getting Help

### Resources
- **AWS Documentation**: https://docs.aws.amazon.com/
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **AWS Amplify Docs**: https://docs.amplify.aws/
- **Turso Documentation**: https://docs.turso.tech/

### AWS Support
- **Basic Support**: Included with AWS account
- **Developer Support**: $29/month
- **Business Support**: $100/month

---

## 🚀 Next Steps

After successful deployment:

1. **Set up monitoring**: Configure CloudWatch alarms
2. **Enable backups**: Set up automated database backups
3. **Configure CDN**: Optimize CloudFront caching rules
4. **Add custom domain**: Point your domain to CloudFront
5. **Set up CI/CD**: Automate deployments from Git pushes
6. **Enable WAF**: Add Web Application Firewall for security
7. **Configure auto-scaling**: Set Lambda concurrency limits

---

## 📝 Summary

Your HealthAI Monitor app is **ready for AWS deployment**!

**Configuration updated**:
- ✅ `next.config.ts` set to `output: 'standalone'`
- ✅ Application structure optimized for serverless
- ✅ Database already cloud-hosted (Turso)

**Recommended approach**:
1. **Start with AWS Amplify** (easiest, fastest)
2. Test thoroughly
3. Migrate to manual setup later if needed for cost optimization

**Important notes**:
- Your Turso database works automatically ✅
- All API routes will work on Lambda ✅
- Authentication is AWS-compatible ✅
- No code changes needed ✅

---

**Ready to deploy? Follow Option 1 (AWS Amplify) above for the quickest deployment!** 🚀
