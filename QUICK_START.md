# SlideIQ Quick Start Guide

## What's Been Fixed

Your SlideIQ app had critical security and architectural issues. Here's what's been fixed:

### Critical Issues Resolved

1. **API Key Security** ✓
   - API key was exposed in the browser
   - Now handled securely by backend Vercel Functions
   - Environment variables kept private

2. **Error Handling** ✓
   - App would crash on any error
   - Now has global error boundary
   - Shows user-friendly error messages

3. **Component Architecture** ✓
   - Dashboard was 538 lines in one component
   - Split into 4 clean, maintainable sub-components
   - Much easier to test and debug

4. **Input Validation** ✓
   - No validation of user inputs
   - Now validates all quiz parameters
   - Prevents invalid requests to API

5. **State Management** ✓
   - State was duplicated and inconsistent
   - Consolidated in QuizContext
   - Proper cleanup on logout

---

## Getting Started

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment Variables

Copy the template and fill in your values:
```bash
cp .env.example .env.local
```

You need:
- **Firebase credentials** from Firebase Console
- **Anthropic API key** from console.anthropic.com
- **Firebase Service Account** (for server-side auth)

### Step 3: Run Locally
```bash
npm run dev
```

Visit `http://localhost:5173`

### Step 4: Deploy to Vercel

```bash
npm run build
vercel deploy
```

Then set environment variables in Vercel dashboard.

---

## Key Architecture Changes

### Before (Problems)
```
App.jsx
└─ Dashboard.jsx (538 lines - monolithic)
   ├─ Upload logic
   ├─ Personality selection
   ├─ Quiz config
   ├─ Generation with exposed API key
   └─ Error handling missing
```

### After (Clean)
```
App.jsx
└─ ErrorBoundary (catches all crashes)
   └─ Dashboard.jsx (404 lines - orchestrator)
      ├─ UploadStep.jsx
      ├─ PersonalityStep.jsx
      ├─ ConfigStep.jsx
      └─ GenerationStep.jsx
      
Backend:
├─ /api/generate-quiz.js (secure, with auth)
└─ /api/generate-feedback.js (template ready)
```

---

## Important Files

### New Backend Files
- **`api/generate-quiz.js`** - Secure quiz generation endpoint
- **`src/api/client.js`** - Client-side API wrapper with auth

### New Utilities
- **`src/utils/validation.js`** - Input validation for all forms
- **`src/utils/errors.js`** - Error handling, timeouts, retries
- **`src/styles/tokens.js`** - Centralized design tokens

### New Components
- **`src/components/ErrorBoundary.jsx`** - Global error catcher
- **`src/components/Dashboard/*.jsx`** - Split dashboard steps

### Security & Deployment
- **`.env.example`** - Environment variable template
- **`firestore.rules`** - Row-level security rules
- **`IMPLEMENTATION_SUMMARY.md`** - Detailed technical docs

---

## Environment Variables

### Server-Side (Vercel Functions) - KEEP SECRET
```
ANTHROPIC_API_KEY=sk_your_key_here
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_service_account_email
```

### Client-Side (Public - safe to expose)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_AUTH_DOMAIN=...
etc.
```

**IMPORTANT:** Never put `ANTHROPIC_API_KEY` in `VITE_` prefixed variables. It's now server-only.

---

## Testing the Changes

### Test Security
1. Open browser DevTools > Network
2. Generate a quiz
3. Check network requests to `/api/generate-quiz`
4. Verify you DO NOT see your Anthropic API key

### Test Error Handling
1. Try generating without selecting personality
2. Try uploading a non-PDF file
3. Intentionally cause an error
4. Verify error message appears with retry option

### Test State Management
1. Upload PDF → select personality → configure
2. Go back and change values
3. Proceed through wizard
4. Values should persist correctly

---

## Common Tasks

### Change Colors/Design
Edit `src/styles/tokens.js`:
```javascript
export const colors = {
  primary: '#a855f7', // Change this
  // ... other colors
};
```

### Add a New Personality
Update `PERSONALITIES` in:
```
src/components/PersonalitySelector/PersonalitySelector.jsx
```

Also update personality descriptions in:
```
api/generate-quiz.js (PERSONALITY_DESCRIPTIONS)
src/utils/validation.js (validatePersonality)
```

### Change Error Messages
Edit `src/utils/errors.js`:
```javascript
export function getErrorMessage(error) {
  // Customize messages here
}
```

### Add Input Validation
Edit `src/utils/validation.js`:
```javascript
export function validateMyInput(value) {
  if (!value) {
    return { valid: false, error: 'Custom error message' };
  }
  return { valid: true };
}
```

---

## Troubleshooting

### "Cannot find module '@anthropic-ai/sdk'"
```bash
npm install @anthropic-ai/sdk firebase-admin
```

### "API key not found" error
- Check `.env.local` has `ANTHROPIC_API_KEY`
- Verify you're running `npm run dev` not `npm start`
- Clear `.next` folder: `rm -rf .next`

### "Firebase authentication failed"
- Verify `VITE_FIREBASE_*` variables are set
- Check Firebase project ID matches
- Ensure Authentication is enabled in Firebase

### "Quiz generation times out"
- Check your internet connection
- Verify Anthropic API status at status.anthropic.com
- Increase timeout in `src/api/client.js` if needed

### "Firestore rules error"
- Go to Firebase Console > Firestore > Rules
- Copy entire content from `firestore.rules`
- Delete old rules first
- Publish the new rules

---

## Next Steps

Now that the app is production-ready, consider:

1. **Deploy to Vercel**
   - Set all environment variables
   - Deploy from GitHub
   - Test in production

2. **Set Up Monitoring**
   - Add Sentry for error tracking
   - Add analytics (Vercel Web Analytics, PostHog)
   - Monitor API performance

3. **Gather User Feedback**
   - Add feedback form
   - Track which personalities are popular
   - Identify pain points

4. **Plan Phase 6 Enhancements**
   - Quiz result export (PDF/CSV)
   - Quiz history and analytics
   - Spaced repetition system
   - OCR support for scanned PDFs
   - Rate limiting to prevent abuse

---

## Support

For issues:

1. Check `IMPLEMENTATION_SUMMARY.md` for detailed technical docs
2. Review error logs in console
3. Check Vercel function logs if backend is failing
4. Verify Firebase and Anthropic credentials

---

**You now have a secure, maintainable, production-ready application!**
