# Implementation Tasks

## Task 1: Create ZITADEL admin API client
- [x] Create `lib/zitadel/admin-api.ts`
- [x] Implement `createZitadelUser(givenName, familyName, email)` calling POST /v2/users
- [x] Implement `assignUserGrant(userId, role)` calling POST /management/v1/users/{userId}/grants
- [x] Use env vars: ZITADEL_SERVICE_USER_PAT, ZITADEL_ISSUER, ZITADEL_PROJECT_ID

## Task 2: Create server action
- [x] Create `app/actions/users.ts`
- [x] Implement `inviteUserAction` with admin check, validation, ZITADEL API calls
- [x] Handle errors (duplicate user, API failure, role assignment failure)

## Task 3: Create UI components
- [x] Create `components/admin/InviteUserForm.tsx` (client component)
- [x] Create `app/admin/invite/page.tsx` (server component with admin guard)

## Task 4: Update admin navigation
- [x] Add nav link in `app/admin/layout.tsx`
- [x] Add dashboard card in `app/admin/page.tsx`
