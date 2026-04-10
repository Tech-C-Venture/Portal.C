# Technical Design: ZITADEL User Invitation

## Overview
Admin-driven user invitation via ZITADEL v2 API, following Portal.C's existing patterns (server actions, admin layout, spindle-ui components).

## Architecture

### New Files
1. **`lib/zitadel/admin-api.ts`** - ZITADEL Management API client
   - `createZitadelUser(givenName, familyName, email)` → calls `POST {ZITADEL_ISSUER}/v2/users`
   - `assignUserGrant(userId, role)` → calls `POST {ZITADEL_ISSUER}/management/v1/users/{userId}/grants`
   - Authenticates with service user PAT via `Authorization: Bearer` header

2. **`app/actions/users.ts`** - Server action
   - `inviteUserAction(prevState, formData)` → validates input, calls ZITADEL API, assigns role
   - Pattern: matches `createEventAction` (isAdmin check, FormData extraction, error/success state)

3. **`components/admin/InviteUserForm.tsx`** - Client component
   - Pattern: matches `CreateEventForm` (useActionState, SubmitButton, spindle-ui Button)
   - Fields: givenName, familyName, email

4. **`app/admin/invite/page.tsx`** - Admin page
   - Server component with isAdmin guard
   - Renders InviteUserForm

### Modified Files
5. **`app/admin/layout.tsx`** - Add "メンバー招待" nav link
6. **`app/admin/page.tsx`** - Add dashboard card for invitation

### Environment Variables
- `ZITADEL_SERVICE_USER_PAT` - Service user Personal Access Token
- `ZITADEL_PROJECT_ID` - Project ID for role assignment via user grants

## API Flow
```
Admin submits form
  → Server Action validates input
  → POST {ZITADEL_ISSUER}/v2/users (create user, sendCode for email verification)
  → POST {ZITADEL_ISSUER}/management/v1/users/{userId}/grants (assign "member" role)
  → Return success/error to UI
```

## Security
- PAT stored server-side only (env var)
- Admin role check in both layout (redirect) and server action (return error)
- Input validation: email format, required fields
