# SlideIQ Deployment Checklist

Use this checklist to deploy SlideIQ to production successfully.

---

## Pre-Deployment (Local)

### Code Quality
- [ ] All new code reviewed for security issues
- [ ] No console.log() statements left (except error logging)
- [ ] No hardcoded API keys or secrets
- [ ] All imports are correct and used
- [ ] No TypeScript errors (or known ignores are documented)

### Testing
- [ ] PDF upload works correctly
- [ ] All 8 personalities load and display
- [ ] Quiz generation completes successfully
- [ ] Error boundary catches crashes gracefully
- [ ] Navigation through wizard is smooth
- [ ] Mobile layout looks good on small screens
- [ ] No console errors or warnings

### Environment Variables
- [ ] `.env.local` created from `.env.example`
- [ ] All required variables filled in with real values:
  - [ ] `ANTHROPIC_API_KEY` (server-side)
  - [ ] Firebase credentials (all 7 `VITE_` variables)
  - [ ] Firebase service account info (3 variables)
  - [ ] `VITE_APP_URL` set to localhost

### Build
- [ ] `npm run build` completes without errors
- [ ] `npm run build` completes without warnings (or acceptable ones)
- [ ] Build artifacts size is reasonable
- [ ] No missing dependencies in `package.json`

---

## Firebase Setup

### Firestore
- [ ] Firestore database created
- [ ] Collections exist (or will be auto-created):
  - [ ] `uploads`
  - [ ] `quiz_sessions`
  - [ ] `quiz_results`
  - [ ] `user_preferences`

### Security Rules
- [ ] Copy content from `firestore.rules`
- [ ] Go to Firebase Console > Firestore > Rules
- [ ] Clear existing rules
- [ ] Paste new rules
- [ ] Click "Publish"
- [ ] Test a read/write to confirm rules work

### Authentication
- [ ] Authentication enabled in Firebase
- [ ] Google sign-in configured
- [ ] Sign in works locally
- [ ] ID tokens can be obtained (`user.getIdToken()`)

### Service Account
- [ ] Service account created in Firebase Console
- [ ] JSON key downloaded
- [ ] Extract: `projectId`, `privateKey`, `clientEmail`
- [ ] Verify private key includes newlines

---

## Vercel Setup

### Project Connection
- [ ] Project connected to GitHub
- [ ] Branch set to `main` (or your deployment branch)
- [ ] Auto-deploy on push enabled (optional but recommended)

### Environment Variables
Set in **Vercel Settings > Environment Variables:**

**Server-side (Function environment):**
- [ ] `ANTHROPIC_API_KEY` = your API key
- [ ] `FIREBASE_PROJECT_ID` = from Firebase
- [ ] `FIREBASE_PRIVATE_KEY` = from service account (with `\n` literals)
- [ ] `FIREBASE_CLIENT_EMAIL` = from service account

**Client-side (Frontend):**
- [ ] `VITE_FIREBASE_API_KEY` = from Firebase
- [ ] `VITE_FIREBASE_PROJECT_ID` = from Firebase
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` = your-project.firebaseapp.com
- [ ] `VITE_FIREBASE_DATABASE_URL` = from Firebase
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` = your-project.appspot.com
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` = from Firebase
- [ ] `VITE_FIREBASE_APP_ID` = from Firebase
- [ ] `VITE_APP_URL` = https://your-vercel-domain.vercel.app

### Deployment
- [ ] Code pushed to GitHub
- [ ] Vercel detected changes and triggered deploy
- [ ] Deployment completed successfully
- [ ] All environment variables deployed
- [ ] Functions deployed (check `/api/generate-quiz` exists)

---

## Post-Deployment Testing

### Access
- [ ] App loads without errors
- [ ] No 404 errors on pages
- [ ] Correct domain shows in URL bar

### Authentication
- [ ] Sign in with Google works
- [ ] Sign out works
- [ ] Authenticated user can access dashboard

### Core Functionality
- [ ] PDF upload works
- [ ] Text extraction successful
- [ ] Personality selection works
- [ ] Quiz generation works
- [ ] All 8 personalities produce valid quizzes

### API Security
- [ ] Open DevTools > Network
- [ ] Generate a quiz
- [ ] Check request to `/api/generate-quiz`
- [ ] Verify `Authorization` header contains token
- [ ] Verify API response does NOT leak any secrets

### Error Handling
- [ ] Try generating without selecting personality → error message appears
- [ ] Try uploading invalid file → error message appears
- [ ] Intentionally break something → error boundary catches it
- [ ] Error messages are user-friendly (not technical jargon)

### Performance
- [ ] Quiz generation takes < 30 seconds
- [ ] PDF upload is reasonably fast (< 5 seconds)
- [ ] No hanging requests in Network tab
- [ ] No memory leaks (check DevTools Performance)

### Mobile Testing
- [ ] Responsive design works on iPhone
- [ ] Responsive design works on Android
- [ ] Touch targets are at least 44px x 44px
- [ ] No horizontal scrolling
- [ ] Text is readable (no tiny fonts)

---

## Security Verification

### API Key Protection
- [ ] `ANTHROPIC_API_KEY` NOT visible in Vercel environment (frontend)
- [ ] Network requests don't expose API key
- [ ] Only `VITE_` prefixed vars are public
- [ ] Server-side vars are actually server-side

### Firebase Security
- [ ] Users can only read their own data
- [ ] Quiz data is not publicly accessible
- [ ] Test by trying to read another user's data (should fail)

### Input Validation
- [ ] Cannot submit form with invalid data
- [ ] Server validates all inputs (check error messages)
- [ ] XSS attempts are sanitized

### Authentication
- [ ] All API requests require valid Firebase token
- [ ] Requests with invalid token are rejected
- [ ] ID tokens auto-refresh (still valid after 1 hour)

---

## Monitoring & Logging

### Error Tracking (Optional but Recommended)
- [ ] Set up Sentry (optional)
- [ ] Deploy token configured
- [ ] Errors logged to Sentry
- [ ] Email alerts configured for critical errors

### Analytics (Optional)
- [ ] Set up Vercel Web Analytics (optional)
- [ ] Basic metrics visible in Vercel dashboard
- [ ] Page views and errors tracked

### Function Logs
- [ ] Visit Vercel Dashboard > Functions
- [ ] Can see logs from `/api/generate-quiz`
- [ ] No error logs for successful requests
- [ ] Error logs are informative for debugging

---

## Documentation

### Setup Docs
- [ ] QUICK_START.md reviewed
- [ ] IMPLEMENTATION_SUMMARY.md reviewed
- [ ] All docs are up to date

### Deployment History
- [ ] Document deployment date
- [ ] Note any issues encountered
- [ ] Document resolutions

### Runbooks
- [ ] Document how to roll back if needed
- [ ] Document how to update environment variables
- [ ] Document how to deploy new code

---

## Final Checks

### Browser Compatibility
- [ ] Works on Chrome (latest)
- [ ] Works on Firefox (latest)
- [ ] Works on Safari (latest)
- [ ] Works on Edge (latest)

### Accessibility (Basic)
- [ ] Can navigate with Tab key
- [ ] Can see focus indicators on buttons
- [ ] Error messages are read by screen readers

### Performance
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] First Input Delay (FID) < 100ms
- [ ] No 404s for static assets

### SEO (If Needed)
- [ ] Title tag is descriptive
- [ ] Meta description present
- [ ] Open Graph tags present (optional)

---

## Go-Live

### Announcement
- [ ] Announce new deployment to team
- [ ] Notify stakeholders of any breaking changes (none in this release)
- [ ] Update status page if applicable

### Monitoring First 24 Hours
- [ ] Check error logs frequently
- [ ] Monitor database activity
- [ ] Look for unusual API patterns
- [ ] Be ready to rollback if critical issues found

### Rollback Plan
- [ ] Previous version tagged in git
- [ ] Rollback procedure documented
- [ ] Team knows how to execute rollback
- [ ] Keep rollback until confident in new version

---

## Scaling Considerations (Future)

Once app is stable and receiving traffic:

- [ ] Monitor database usage (Firestore)
- [ ] Monitor API request volumes
- [ ] Monitor error rates
- [ ] Consider rate limiting if needed
- [ ] Plan database indexing if queries slow down
- [ ] Consider caching strategies if needed

---

## Sign-Off

**Deployment Date:** _______________

**Deployed By:** _______________

**Reviewed By:** _______________

**All checks passed:** ☐ YES ☐ NO

**Issues found during deployment:**
```
___________________________________
___________________________________
___________________________________
```

**Notes:**
```
___________________________________
___________________________________
___________________________________
```

---

## Post-Deployment (Weekly Checks)

After deployment, check these items weekly:

- [ ] No spike in error rate
- [ ] Database growing at expected rate
- [ ] API response times stable
- [ ] No unusual traffic patterns
- [ ] User feedback positive
- [ ] All features working as expected

---

**Congratulations! SlideIQ is now in production!**
