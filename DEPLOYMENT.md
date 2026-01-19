# Deployment Guide

## Production Deployment Checklist

### Pre-Deployment

1. **Environment Variables**
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/db?schema=public&sslmode=require"
   NEXTAUTH_URL="https://yourdomain.com"
   NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
   NODE_ENV="production"
   ```

2. **Security**
   - [ ] Generate strong `NEXTAUTH_SECRET`
   - [ ] Enable SSL for database connection
   - [ ] Configure CORS properly
   - [ ] Set up rate limiting (Redis recommended)
   - [ ] Enable HTTPS
   - [ ] Update security headers

3. **Database**
   - [ ] Run migrations: `npx prisma migrate deploy`
   - [ ] Set up database backups
   - [ ] Configure connection pooling
   - [ ] Enable database SSL

### Deployment Platforms

## Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

**Database**: Use Vercel Postgres or external PostgreSQL (Supabase, Railway, Neon)

## Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t renthub .
docker run -p 3000:3000 --env-file .env renthub
```

## Railway

1. Connect GitHub repository
2. Add PostgreSQL plugin
3. Set environment variables
4. Deploy automatically on push

## Production Database Options

### Supabase
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

### Neon
```env
DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require"
```

### Railway
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway"
```

## Performance Optimization

1. **Caching**
   - Implement Redis for session storage
   - Cache property listings
   - Use Next.js Image Optimization

2. **Database**
   - Connection pooling with PgBouncer
   - Database indexes (already implemented)
   - Query optimization

3. **CDN**
   - Use Vercel Edge Network
   - Or configure Cloudflare

## Monitoring

1. **Error Tracking**
   - Sentry
   - LogRocket
   - Datadog

2. **Performance**
   - Vercel Analytics
   - Google Analytics
   - New Relic

3. **Uptime**
   - UptimeRobot
   - Pingdom
   - StatusCake

## Security Hardening

1. **Rate Limiting** (Production Implementation)
   ```typescript
   // Recommended: Use upstash/ratelimit with Redis
   import { Ratelimit } from '@upstash/ratelimit'
   import { Redis } from '@upstash/redis'

   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(10, '10 s'),
   })
   ```

2. **Security Headers** (Add to next.config.js)
   ```javascript
   module.exports = {
     async headers() {
       return [
         {
           source: '/:path*',
           headers: [
             {
               key: 'X-DNS-Prefetch-Control',
               value: 'on'
             },
             {
               key: 'Strict-Transport-Security',
               value: 'max-age=63072000; includeSubDomains; preload'
             },
             {
               key: 'X-Content-Type-Options',
               value: 'nosniff'
             },
             {
               key: 'X-Frame-Options',
               value: 'SAMEORIGIN'
             },
             {
               key: 'X-XSS-Protection',
               value: '1; mode=block'
             }
           ]
         }
       ]
     }
   }
   ```

3. **CORS Configuration**
   ```typescript
   // In API routes
   const allowedOrigins = [process.env.NEXTAUTH_URL]
   
   if (origin && !allowedOrigins.includes(origin)) {
     return new Response('Forbidden', { status: 403 })
   }
   ```

## Backup Strategy

1. **Database Backups**
   - Daily automated backups
   - Point-in-time recovery
   - Test restore procedures

2. **Image Storage**
   - Use S3 or Cloudinary
   - Implement backup strategy

## SSL/TLS

- Vercel provides automatic HTTPS
- For custom domains, configure DNS properly
- Enable HSTS

## Post-Deployment

1. **Testing**
   - [ ] Test all user flows
   - [ ] Verify authentication
   - [ ] Check API endpoints
   - [ ] Test on mobile devices

2. **Monitoring Setup**
   - [ ] Configure error tracking
   - [ ] Set up uptime monitoring
   - [ ] Enable analytics

3. **Documentation**
   - [ ] Update API documentation
   - [ ] Document deployment process
   - [ ] Create runbooks

## Rollback Plan

```bash
# Vercel rollback to previous deployment
vercel rollback [deployment-url]

# Database rollback
npx prisma migrate resolve --rolled-back [migration-name]
```

## Scaling Considerations

1. **Horizontal Scaling**
   - Use serverless functions (Vercel Edge)
   - Implement caching layer
   - CDN for static assets

2. **Database Scaling**
   - Read replicas
   - Connection pooling
   - Query optimization

3. **File Storage**
   - Move to S3/Cloudinary
   - Implement CDN

## Compliance

- [ ] GDPR compliance (if serving EU users)
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Cookie consent
- [ ] Data retention policies

## Cost Optimization

1. **Database**
   - Right-size instances
   - Connection pooling
   - Query optimization

2. **Hosting**
   - Monitor usage
   - Optimize images
   - Use caching effectively

3. **Third-party Services**
   - Monitor API usage
   - Use free tiers where possible

## Support & Maintenance

1. **Regular Updates**
   - Security patches
   - Dependency updates
   - Feature enhancements

2. **Database Maintenance**
   - Regular vacuum
   - Index optimization
   - Query analysis

3. **Monitoring**
   - Check error rates
   - Monitor performance
   - Review audit logs
