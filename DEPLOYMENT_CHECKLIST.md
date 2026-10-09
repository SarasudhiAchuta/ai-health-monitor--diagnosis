# 🚀 AWS Deployment Checklist

Use this checklist to ensure smooth deployment of your HealthAI Monitor application to AWS.

---

## ✅ Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All code is committed to Git
- [ ] Application builds successfully locally (`npm run build`)
- [ ] All tests pass (if you have tests)
- [ ] No TypeScript errors
- [ ] All dependencies are in `package.json`

### 2. Configuration Files
- [ ] `next.config.ts` has `output: 'standalone'` ✅ (Already configured)
- [ ] `.env.production.example` is filled out
- [ ] `.gitignore` includes `.env*` files
- [ ] Database connection tested locally

### 3. Environment Variables Ready
- [ ] `TURSO_DATABASE_URL` - from Turso dashboard
- [ ] `TURSO_AUTH_TOKEN` - from Turso dashboard  
- [ ] `BETTER_AUTH_SECRET` - generated (32+ characters)
- [ ] `BETTER_AUTH_URL` - your domain (update after deployment)

### 4. Database (Turso)
- [ ] Database is created and accessible
- [ ] Schema is migrated (`drizzle-kit push`)
- [ ] Seed data is loaded (if needed)
- [ ] Database credentials are valid

### 5. Repository Setup
- [ ] Code is pushed to GitHub/GitLab/Bitbucket
- [ ] Repository is set to public or AWS has access
- [ ] Default branch is set (main/master)

---

## 🎯 AWS Amplify Deployment Steps

### Phase 1: Initial Setup
- [ ] 1. Go to AWS Console → AWS Amplify
- [ ] 2. Click "New App" → "Host web app"
- [ ] 3. Connect your Git repository
- [ ] 4. Authorize AWS Amplify access
- [ ] 5. Select repository and branch

### Phase 2: Build Configuration
- [ ] 6. Verify build settings (auto-detected)
- [ ] 7. Check Node.js version is 18.x or 20.x
- [ ] 8. Review build commands:
  ```yaml
  build:
    commands:
      - npm run build
  ```

### Phase 3: Environment Variables
- [ ] 9. Go to Environment Variables section
- [ ] 10. Add `TURSO_DATABASE_URL`
- [ ] 11. Add `TURSO_AUTH_TOKEN`
- [ ] 12. Add `BETTER_AUTH_SECRET`
- [ ] 13. Add `BETTER_AUTH_URL` (temporary, will update later)
- [ ] 14. Add `NODE_ENV=production`

### Phase 4: Deploy
- [ ] 15. Click "Save and Deploy"
- [ ] 16. Wait for build to complete (5-10 minutes)
- [ ] 17. Note your Amplify URL: `https://main.xxxxx.amplifyapp.com`

### Phase 5: Update Configuration
- [ ] 18. Copy your Amplify URL
- [ ] 19. Update `BETTER_AUTH_URL` environment variable with Amplify URL
- [ ] 20. Redeploy (Amplify → Redeploy this version)

---

## 🧪 Post-Deployment Testing

### Functional Tests
- [ ] Homepage loads (`https://yourapp.amplifyapp.com`)
- [ ] Static assets load (images, CSS, JS)
- [ ] Registration page works (`/register`)
- [ ] Login page works (`/login`)
- [ ] Can create new user account
- [ ] Can login with created account
- [ ] Dashboard loads after login (`/dashboard`)
- [ ] User session persists on page refresh

### API Endpoint Tests
- [ ] Health check: `GET /api/health`
- [ ] Appointments: `GET /api/appointments`
- [ ] Assessments: `POST /api/assessments`
- [ ] Auth session: `GET /api/auth/session`
- [ ] Chat messages: `GET /api/chat-messages`
- [ ] Health activities: `GET /api/health-activities`
- [ ] Health metrics: `GET /api/health-metrics`
- [ ] Medications: `GET /api/medications`

### Feature Tests
- [ ] Symptom checker works (`/assessment`)
- [ ] Assessment returns results
- [ ] Results page displays doctors and medicines (`/results`)
- [ ] AI chatbot responds to messages
- [ ] Dashboard shows user health data
- [ ] Appointments can be created
- [ ] Medications can be added
- [ ] Health metrics can be tracked

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] Images load quickly
- [ ] No console errors in browser

### Security Tests
- [ ] HTTPS is enabled (should be automatic)
- [ ] Protected routes redirect to login
- [ ] Cannot access dashboard without login
- [ ] Sessions expire correctly
- [ ] Database credentials not exposed

---

## 🌐 Custom Domain Setup (Optional)

### If Adding Custom Domain:
- [ ] Domain is registered (e.g., GoDaddy, Namecheap)
- [ ] Go to Amplify → Domain Management
- [ ] Click "Add domain"
- [ ] Enter your domain name
- [ ] Choose subdomain configuration (www, etc.)
- [ ] AWS will create SSL certificate (5-10 minutes)
- [ ] Copy DNS records provided by AWS
- [ ] Add DNS records to your domain registrar:
  - [ ] CNAME record for subdomain
  - [ ] ANAME/ALIAS record for root domain
- [ ] Wait for DNS propagation (5-60 minutes)
- [ ] Verify domain is accessible
- [ ] Update `BETTER_AUTH_URL` to your custom domain
- [ ] Redeploy application

---

## 📊 Monitoring Setup

### CloudWatch Configuration
- [ ] Go to CloudWatch → Alarms
- [ ] Create alarm for Lambda errors > 5%
- [ ] Create alarm for API Gateway 5xx errors
- [ ] Create alarm for high response times
- [ ] Set up SNS notifications for alarms

### Application Monitoring
- [ ] Check Amplify build logs
- [ ] Review Lambda function logs
- [ ] Monitor API Gateway metrics
- [ ] Check CloudFront cache hit ratio

---

## 🔒 Security Hardening

### Post-Deployment Security
- [ ] Review IAM permissions (least privilege)
- [ ] Enable AWS WAF (Web Application Firewall)
- [ ] Set up rate limiting in API Gateway
- [ ] Enable CloudFront geo-restrictions (if needed)
- [ ] Review security headers in responses
- [ ] Enable AWS Shield Standard (DDoS protection)
- [ ] Set up AWS Backup for database
- [ ] Review environment variable encryption

---

## 🐛 Troubleshooting Checklist

### If Build Fails:
- [ ] Check build logs in Amplify Console
- [ ] Verify all dependencies are in `package.json`
- [ ] Ensure Node.js version is compatible
- [ ] Check for TypeScript errors
- [ ] Verify environment variables are set

### If Application Doesn't Load:
- [ ] Check CloudFront distribution status
- [ ] Verify DNS records are correct
- [ ] Check for SSL certificate issues
- [ ] Review browser console for errors
- [ ] Check Lambda function logs

### If API Endpoints Fail:
- [ ] Verify environment variables in AWS
- [ ] Check database connection (Turso)
- [ ] Review Lambda timeout settings (increase if needed)
- [ ] Check API Gateway configuration
- [ ] Review Lambda function logs in CloudWatch

### If Authentication Fails:
- [ ] Verify `BETTER_AUTH_URL` matches your domain
- [ ] Check `BETTER_AUTH_SECRET` is set
- [ ] Review auth API logs
- [ ] Test session creation locally
- [ ] Check cookie settings in browser

### If Database Connection Fails:
- [ ] Verify `TURSO_DATABASE_URL` is correct
- [ ] Check `TURSO_AUTH_TOKEN` is valid
- [ ] Test connection from local environment
- [ ] Check Turso dashboard for database status
- [ ] Review database connection logs

---

## 📈 Performance Optimization

### After Initial Deployment:
- [ ] Configure CloudFront caching rules
- [ ] Enable gzip/brotli compression
- [ ] Optimize image delivery
- [ ] Set up Lambda provisioned concurrency (if needed)
- [ ] Review and optimize database queries
- [ ] Enable CloudFront origin shield
- [ ] Set up CDN cache invalidation rules

---

## 🎉 Launch Checklist

### Before Going Live:
- [ ] All tests pass ✅
- [ ] Performance is acceptable ✅
- [ ] Security measures in place ✅
- [ ] Monitoring configured ✅
- [ ] Backup strategy defined ✅
- [ ] Rollback plan ready ✅
- [ ] Documentation complete ✅

### Announcement Ready:
- [ ] Share production URL with team
- [ ] Update documentation with live URLs
- [ ] Notify users of new deployment
- [ ] Monitor closely for first 24 hours

---

## 📝 Post-Launch Tasks

### Within First Week:
- [ ] Monitor error rates daily
- [ ] Review user feedback
- [ ] Check cost reports in AWS Billing
- [ ] Optimize based on real traffic patterns
- [ ] Set up automated backups
- [ ] Document any issues and resolutions

### Ongoing Maintenance:
- [ ] Weekly: Review CloudWatch metrics
- [ ] Monthly: Analyze costs and optimize
- [ ] Quarterly: Security audit
- [ ] As needed: Update dependencies
- [ ] As needed: Scale resources

---

## 🆘 Emergency Contacts

### If Critical Issues Arise:
- **AWS Support**: https://console.aws.amazon.com/support
- **Turso Support**: https://turso.tech/support
- **Next.js Discord**: https://nextjs.org/discord

### Rollback Procedure:
1. Go to Amplify Console
2. Find previous successful build
3. Click "Redeploy this version"
4. Monitor deployment
5. Verify application is working

---

## ✨ Success!

**Your HealthAI Monitor app is now live on AWS!** 🎉

**Your deployment URL**: `https://main.xxxxx.amplifyapp.com`

**Next steps**:
1. Share with users
2. Monitor performance
3. Gather feedback
4. Iterate and improve

**🎊 Congratulations on your deployment!** 🚀
