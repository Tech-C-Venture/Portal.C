# Requirements Document

## Project Description (Input)
Admin user invitation feature: Administrators can create new ZITADEL users from Portal.C's custom UI. The system uses ZITADEL v2 API (POST /v2/users) to create human users with "member" role. Admin fills in user details (name, email), ZITADEL sends verification email automatically (sendCode). After the invited user verifies email and logs in, ensureMemberOnSignIn() creates the Firestore member record as usual. Requires service user PAT for ZITADEL API authentication.

## Requirements
<!-- Will be generated in /kiro:spec-requirements phase -->

