# NULAP Mobile

Mobile app for NULAP. This app provides a React Native experience for login, dashboard, decks, flashcards, study sessions, books, reading, and tasks.

## Stack

- Expo
- React Native
- TypeScript
- React Navigation
- React Query
- Zustand
- Axios
- Expo SecureStore
- lucide-react-native icons

## Getting Started

```bash
cd nulap-mobile
npm install
cp .env.example .env
npm run start
```

Backend should be running at:

```text
http://localhost:8686/api/v1
```

## Commands

```bash
npm run start    # start Expo
npm run android  # start Expo Android target
npm run ios      # start Expo iOS target
npm run web      # start Expo web target
```

## Environment

`.env.example`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8686/api/v1
EXPO_PUBLIC_APP_ID=nulap-app
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

When running on a physical device or emulator, `localhost` may point to the device itself instead of your computer. Use a reachable LAN IP or emulator-specific host if needed.

Examples:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:8686/api/v1
EXPO_PUBLIC_API_URL=http://10.0.2.2:8686/api/v1
```

## Backend Integration

The mobile app calls backend directly with Axios.

Important files:

```text
src/services/api.ts          # shared Axios client and response unwrap
src/services/auth.ts         # auth API calls
src/services/queryClient.ts  # React Query client
src/stores/authStore.ts      # auth state and token handling
```

Requests include:

```http
X-App-Id: nulap-app
Authorization: Bearer <access_token>
```

Access tokens are stored with Expo SecureStore. If backend returns `401`, the API interceptor clears auth tokens and cached query data.

## Google Sign-In

Mobile Google sign-in uses Expo AuthSession to request a Google ID token, then sends it to the backend `POST /auth/google`. The backend returns NULAP access and refresh tokens, which are stored in Expo SecureStore like password login.

Required setup:

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

This client ID must match the backend `auth.google.clientId`, because the backend validates the Google ID token audience. If separate Android/iOS Google OAuth client IDs are used, update the backend to accept those audiences too.

The app config defines the OAuth redirect scheme:

```text
nulap://oauthredirect
```

## Project Structure

```text
src/navigation/    # root navigator and tab navigator
src/screens/       # screen-level components
src/components/    # feature and UI components
src/services/      # backend API services
src/hooks/         # data hooks
src/stores/        # Zustand stores
src/types/         # TypeScript types
src/constants/     # theme and constants
src/utils/         # utility helpers
assets/            # app icons and static assets
```

## Screens

Current screen areas include:

- Login
- Dashboard
- Decks
- Deck detail
- Card create/edit
- Study
- Study done
- Books
- Book detail
- Book reader
- Todo/tasks

## Feature Areas

- `components/dashboard`: summary widgets.
- `components/flashcard`: flashcard review UI and card form.
- `components/book`: reader UI, reader settings, highlights.
- `components/tasks`: task list, schedule, calendar, filters, task input.
- `components/ui`: shared mobile UI primitives.

## API Response Contract

The mobile API client expects backend responses in this shape:

```json
{
  "status": {
    "code": "OK",
    "message": "Success"
  },
  "data": {}
}
```

`src/services/api.ts` unwraps `data` automatically when `status.code` is `OK`.

## Related Docs

- `../README.md`
- `../DOCS/architecture.md`
- `../nulap-backend/README.md`
- `../nulap-frontend/README.md`
