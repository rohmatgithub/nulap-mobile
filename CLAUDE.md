# NULAP Mobile

Mobile app untuk platform belajar NULAP, built dengan React Native + Expo.

## Tech Stack

- **Framework:** Expo SDK 56 + React Native 0.85
- **Language:** TypeScript
- **Navigation:** React Navigation 7 (Bottom Tabs + Native Stack)
- **State Management:** Zustand
- **API Client:** Axios + React Query
- **Animations:** Reanimated 4
- **Icons:** Lucide React Native

## Design System

Menggunakan design system **Neobrutalism × Editorial Dark** yang sama dengan web frontend:

- **Fonts:** Playfair Display (display), Space Mono (heading/label), Lora (body)
- **Colors:** Dark theme dengan aksen oranye, hijau, dan emas
- **Components:** Hard box shadows, no border radius, thick borders

## Folder Structure

```
src/
├── components/
│   ├── ui/          # Base UI components (Button, Card, Text, etc.)
│   ├── layout/      # Layout components
│   ├── dashboard/   # Dashboard-specific components
│   ├── flashcard/   # Flashcard components
│   ├── todo/        # Todo components
│   └── book/        # Book reader components
├── screens/         # Screen components
├── navigation/      # Navigation setup
├── hooks/           # Custom hooks
├── services/        # API services
├── stores/          # Zustand stores
├── types/           # TypeScript types
├── constants/       # Theme, config constants
└── utils/           # Utility functions
```

## Development

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
```

## Path Aliases

Use `@/` to import from `src/`:

```typescript
import { Button } from '@/components/ui';
import { colors } from '@/constants/theme';
```

@AGENTS.md
