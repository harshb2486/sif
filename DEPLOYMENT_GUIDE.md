# Deployment Guide

Guide for deploying Field Sales Management System to production.

## Pre-Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Setup production MySQL database
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Setup error logging
- [ ] Add rate limiting
- [ ] Setup backup strategy

## Environment Configuration

### Backend Production .env

```env
PORT=5000
NODE_ENV=production

# Database - Use managed service (AWS RDS, etc.)
DB_HOST=prod-db-host.rds.amazonaws.com
DB_USER=prod_user
DB_PASSWORD=very_strong_password_here
DB_NAME=field_sales_db_prod
DB_PORT=3306

# JWT - Generate strong secret
JWT_SECRET=your_long_random_jwt_secret_key_minimum_32_chars
JWT_EXPIRE=7d

# API
API_URL=https://api.yourdomain.com
```

### Frontend Production .env

```env
REACT_APP_API_URL=https://api.yourdomain.com
```

## Database Deployment

### Option 1: AWS RDS

```bash
# 1. Create RDS instance
# - Engine: MySQL 5.7
# - Multi-AZ: Yes (for redundancy)
# - Storage: 100 GB with auto-scaling
# - Backups: Enabled (30 days retention)

# 2. Create database
mysql -h your-rds-endpoint.rds.amazonaws.com -u admin -p < database.sql

# 3. Configure security groups
# - Allow inbound from app servers only
# - Port 3306
```

### Option 2: Docker (Recommended for simplicity)

```bash
# Create docker-compose.yml for backend and MySQL
version: '3'
services:
  mysql:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: field_sales_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database.sql:/docker-entrypoint-initdb.d/init.sql

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: root
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: field_sales_db
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - mysql

volumes:
  mysql_data:
```

## Backend Deployment

### Option 1: Heroku

```bash
# 1. Create Heroku app
heroku create field-sales-api

# 2. Add MySQL (ClearDB addon)
heroku addons:create cleardb:free

# 3. Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production

# 4. Deploy
git push heroku main

# 5. Run migrations
heroku run "mysql -u root < database.sql"
```

### Option 2: AWS Elastic Beanstalk

```bash
# 1. Install EB CLI
npm install -g @aws-amplify/cli

# 2. Create app
eb init -p node.js field-sales-api

# 3. Create environment
eb create production

# 4. Set environment variables
eb setenv JWT_SECRET=your_secret_key DB_HOST=your_rds_host

# 5. Deploy
eb deploy
```

### Option 3: Digital Ocean / Linode

```bash
# SSH into server
ssh root@your_server_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone your_repo_url
cd sif/backend

# Install dependencies
npm install --production

# Install PM2 for process management
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'field-sales-api',
    script: './src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Setup startup on reboot
pm2 startup
pm2 save
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Navigate to frontend folder
cd frontend

# 3. Deploy
vercel

# 4. Set environment variables in Vercel dashboard
# REACT_APP_API_URL=https://api.yourdomain.com

# 5. Future deployments
vercel --prod
```

### Option 2: Netlify

```bash
# 1. Build React app
cd frontend
npm run build

# 2. Deploy using Netlify UI
# - Drag and drop 'build' folder
# - Set build command: npm run build
# - Set publish directory: build

# 3. Set environment variables
# REACT_APP_API_URL=https://api.yourdomain.com
```

### Option 3: AWS S3 + CloudFront

```bash
# 1. Build app
cd frontend
npm run build

# 2. Create S3 bucket
aws s3 mb s3://field-sales-app

# 3. Upload files
aws s3 sync build/ s3://field-sales-app --delete

# 4. Create CloudFront distribution
# - Origin: S3 bucket
# - HTTPS: Required
# - Custom domain: yourdomain.com

# 5. Configure error handling
# - Error page (404): index.html
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d api.yourdomain.com

# Configure Nginx
sudo nano /etc/nginx/sites-available/default

# Add SSL configuration
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}

# Reload Nginx
sudo systemctl reload nginx

# Auto-renewal
sudo systemctl enable certbot.timer
```

## Performance Optimization

### Backend Optimization

```bash
# 1. Enable Gzip compression
# In server.js:
const compression = require('compression');
app.use(compression());

# 2. Setup Redis cache (optional)
npm install redis

# 3. Database connection pooling (already configured)

# 4. Use CDN for static assets
```

### Frontend Optimization

```bash
# 1. Build optimization
npm run build
# Check bundle size
npm install -g serve
serve -s build

# 2. Enable Service Workers
# Create public/service-worker.js

# 3. Image optimization
# Use WebP format
# Lazy load images

# 4. Code splitting
# React Router lazy loading (already configured)
```

## Monitoring & Logging

### Sentry (Error Tracking)

```bash
npm install @sentry/react @sentry/tracing

# In frontend/src/index.js:
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your_sentry_dsn",
  environment: "production"
});
```

### LogRocket (Session Recording)

```bash
npm install logrocket

# In frontend/src/index.js:
import LogRocket from 'logrocket';
LogRocket.init('app-id');
```

### PM2 Monitoring

```bash
# Install PM2 Plus
pm2 plus

# View logs
pm2 logs

# Monitor performance
pm2 monit
```

## Database Backups

### Automated Backups

```bash
# Create backup script
cat > backup.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p$DB_PASSWORD field_sales_db > backup_$DATE.sql
gzip backup_$DATE.sql
aws s3 cp backup_$DATE.sql.gz s3://backups/
EOF

# Make executable
chmod +x backup.sh

# Schedule with cron (daily at 2 AM)
0 2 * * * /path/to/backup.sh
```

## Security Best Practices

1. **API Security**
   - [ ] Enable CORS only for frontend domain
   - [ ] Implement rate limiting
   - [ ] Add request validation
   - [ ] Use HTTPS only

2. **Database Security**
   - [ ] Change default passwords
   - [ ] Restrict network access
   - [ ] Enable encryption at rest
   - [ ] Enable binary logging for recovery

3. **Application Security**
   - [ ] Implement input sanitization
   - [ ] Use helmet.js for security headers
   - [ ] Regular dependency updates
   - [ ] Implement CSP headers

4. **Authentication**
   - [ ] Use strong JWT secrets (min 32 chars)
   - [ ] Set appropriate expiration times
   - [ ] Implement refresh tokens
   - [ ] Add rate limiting on login

## Rollback Plan

```bash
# Keep previous versions
git tag -a v1.0.0

# Easy rollback
git checkout v1.0.0

# On Heroku
heroku releases
heroku rollback v123

# On Elastic Beanstalk
eb appversion
eb swap
```

## Post-Deployment

- [ ] Test all endpoints
- [ ] Verify email functionality
- [ ] Check database connectivity
- [ ] Monitor server logs
- [ ] Test auto-scaling
- [ ] Setup alerts

## Maintenance

### Weekly
- Check error logs
- Monitor database size
- Verify backups

### Monthly
- Update dependencies: `npm audit fix`
- Review performance metrics
- Check SSL certificate expiration

### Quarterly
- Security audit
- Database optimization
- Capacity planning

## Cost Estimation (AWS)

| Service | Cost |
|---------|------|
| RDS MySQL (t3.small) | $30/month |
| EC2 (t3.micro) | $10/month |
| Elastic IP | $0-3/month |
| Data transfer | $0-10/month |
| S3 + CloudFront | $1-5/month |
| **Total** | **~$50-60/month** |

## Support & Maintenance

- Monitor health dashboards
- Setup alerts for errors
- Keep backups up-to-date
- Regular security audits
- Document deployment process

---

**Remember: Test thoroughly before production deployment!**
