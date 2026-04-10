# Requirements Document

## Introduction
This feature enables Portal.C administrators to invite new users directly from the application's custom admin UI. The system creates human users in ZITADEL via its v2 API, assigns the "member" role, and triggers email verification. Once the invited user verifies their email and logs in, the existing `ensureMemberOnSignIn()` flow creates their Firestore member record and routes them through onboarding.

## Requirements

### Requirement 1: Admin User Invitation Form
**Objective:** As an administrator, I want to invite new users by entering their name and email, so that I can onboard new members without accessing the ZITADEL console directly.

#### Acceptance Criteria
1. When an admin navigates to the user invitation page, the Portal.C Admin UI shall display a form with fields for given name, family name, and email address.
2. When an admin submits the invitation form with valid data, the Portal.C API shall call the ZITADEL v2 API to create a new human user.
3. When the ZITADEL user is successfully created, the Portal.C API shall display a success message with the invited user's email.
4. If the email address is already registered in ZITADEL, the Portal.C API shall display an error message indicating the user already exists.
5. If the ZITADEL API call fails, the Portal.C API shall display an error message with the failure reason.

### Requirement 2: ZITADEL User Creation via API
**Objective:** As the system, I want to create users in ZITADEL programmatically, so that user provisioning is automated and consistent.

#### Acceptance Criteria
1. When a user creation request is received, the Portal.C API shall authenticate to ZITADEL using a service user Personal Access Token (PAT).
2. When creating a user, the Portal.C API shall send a POST request to the ZITADEL v2 users endpoint with given name, family name, and email.
3. When creating a user, the Portal.C API shall request ZITADEL to send a verification email automatically (sendCode).
4. The Portal.C API shall store the ZITADEL service user PAT as a server-side environment variable, never exposing it to the client.

### Requirement 3: Role Assignment
**Objective:** As an administrator, I want invited users to automatically receive the "member" role, so that they have appropriate access upon first login.

#### Acceptance Criteria
1. When a user is successfully created in ZITADEL, the Portal.C API shall assign the "member" project role to the new user via the ZITADEL API.
2. If role assignment fails after user creation, the Portal.C API shall display a warning indicating the user was created but role assignment failed.

### Requirement 4: Access Control
**Objective:** As the system, I want to restrict the invitation feature to administrators only, so that unauthorized users cannot create new accounts.

#### Acceptance Criteria
1. The Portal.C Admin UI shall only display the user invitation page to authenticated users with the "admin" role.
2. When a non-admin user attempts to access the invitation API endpoint, the Portal.C API shall return an authorization error.
3. When an unauthenticated user attempts to access the invitation API endpoint, the Portal.C API shall return an authentication error.

### Requirement 5: Invited User Login Flow
**Objective:** As an invited user, I want to verify my email and log in seamlessly, so that I can start using Portal.C after being invited.

#### Acceptance Criteria
1. When an invited user clicks the verification link in the email, ZITADEL shall verify their email address and allow them to set a password.
2. When a verified invited user logs in for the first time, the existing `ensureMemberOnSignIn()` shall create their Firestore member record.
3. When a newly created member logs in, the Portal.C middleware shall redirect them to the onboarding flow.
