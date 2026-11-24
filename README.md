# Web App — User Authentication

A React web application implementing user authentication: sign-up with email verification, login with session management, password reset, profile editing, and an administrator panel for user management.

Stack: **React 19** (TypeScript, Vite, Mantine UI, React Router v7).

```
frontend/task-management-ui/
  src/api/         typed fetch wrappers — auth.ts, endpoints.ts, client.ts
  src/context/     AuthContext — current user and session state
  src/components/  reusable presentational pieces (guards, forms, badges)
  src/pages/       one component per route, owns its own data fetching
  src/types/       shared TypeScript interfaces and enums
```

---

## 1. Features

### Sign-up and email verification
- Collect first name, last name, unique email, and password on registration.
- Enforce password complexity: minimum 8 characters including uppercase, lowercase, digit, and special character.
- Send a verification email with a 24-hour link after sign-up; login is blocked until the link is clicked.
- Allow resending the verification link from the login page.
- Unverified accounts are automatically deleted after 7 days.

### Login and session management
- Login with email and password; a "Remember me" option extends the session to 30 days.
- Sessions expire after 30 minutes of inactivity and redirect to the login page.
- Logout button ends the session immediately.
- Accounts are locked after 5 consecutive failed login attempts for 15 minutes (or until an admin unlocks them).
- All login failure messages are generic ("Email or password is incorrect") to prevent email enumeration.

### Password reset
- "Forgot password?" link sends a single-use reset link valid for 1 hour.
- The confirmation page shows the same message regardless of whether the email exists.
- Resetting the password logs the user out of all other devices.

### Profile
- Registered users can view and edit their first and last name.
- Password change requires the current password and enforces the same complexity rules.

### Admin panel
- Administrators see a searchable list of all users with name, email, role, status, and last login.
- Admins can lock/unlock accounts and assign or remove the administrator role.

---

## 2. Roles and permissions

Three roles: **Visitor**, **Registered User**, and **Administrator**.

| Action | Visitor | Registered User | Administrator |
|---|---|---|---|
| Create an account / log in | ✅ | ✅ | ✅ |
| Stay signed in, reset password, update profile, log out | — | ✅ | ✅ |
| View all users, lock/unlock accounts, assign admin role | — | — | ✅ |

---

## 3. Business rules

| Rule | Value |
|---|---|
| Password minimum length | 8 characters |
| Password must contain | Uppercase, lowercase, digit, special character |
| Failed logins before lockout | 5 in a row |
| Lockout duration | 15 minutes or until admin unlock |
| Verification link valid for | 24 hours |
| Password reset link valid for | 1 hour, single use |
| Idle session timeout | 30 minutes |
| "Remember me" duration | 30 days |
| Unverified accounts | Cannot log in; deleted after 7 days |

---

## 4. Non-functional requirements

- **Security** — passwords hashed with bcrypt or Argon2; all traffic over HTTPS; sessions via secure, HTTP-only cookies or short-lived tokens with refresh tokens; rate limiting per IP on sign-up, login, and forgot-password endpoints.
- **Accessibility** — WCAG 2.1 AA; every form field has a label and works with keyboard-only navigation.
- **Responsive** — works on mobile, tablet, and desktop.
- **Performance** — 95% of login requests respond within 2 seconds.
- **Availability** — 99.5% uptime per month.
- **Audit logging** — successful logins, failed logins, lockouts, and password changes are logged with timestamp and IP address.

---

## 5. Frontend architecture

No Redux or Zustand — the only shared global state is the current user (held in `AuthContext`). Everything else is fetched per-page.

```
src/api/
  client.ts       base fetch wrapper, attaches auth token to every request
  auth.ts         login, register, logout, password reset calls
  endpoints.ts    all other API calls

src/context/
  AuthContext.tsx  current user, JWT, login/logout helpers — wraps the whole app

src/components/
  RequireAuth.tsx  route guard: redirects unauthenticated users to /login
  ...              presentational badges and shared form components

src/pages/
  LoginPage.tsx         login form with "Remember me" and resend-verification link
  RegisterPage.tsx      sign-up form with inline validation
  UsersPage.tsx         admin panel — user list, search, lock/unlock, role assignment
  ...                   project and work item pages from the previous release
```

Inline form validation (as the user types) is provided by `@mantine/form`. Route protection is handled by `RequireAuth`, which reads from `AuthContext`.

---

## 6. Prerequisites

- Node.js 20+
- npm

---

## 7. Setup

```bash
cd frontend/task-management-ui
npm install
npm run dev
```

Open http://localhost:5173. The frontend expects an API at `http://localhost:5174/api` (configured in `src/api/client.ts`).

---

## 8. Out of scope

Deliberately not built in this release:

- Two-factor authentication (SMS or authenticator app).
- Login with Microsoft, Apple, or Facebook.
- Single sign-on for enterprise customers.
- User-initiated account deletion.

Open questions for a future release:

- Is "Continue with Google" required, or can it be deferred?
- Should admins be able to invite users by email?
- Which email service provider will send verification and reset emails?
