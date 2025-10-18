# lhihi AI - ChatGPT Clone

## Overview

lhihi AI is a conversational AI application built with Next.js 15, designed to replicate the ChatGPT experience. The application features contextual understanding, text generation, text-to-speech capabilities, and multiple AI-powered tools including web search, image generation, YouTube search, and temporary email creation. The system uses Google's Genkit AI framework with Gemini 1.5 Pro for natural language processing and Firebase for authentication and data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Rendering**
- Built on Next.js 15 with App Router and React Server Components (RSC)
- Uses Turbopack for development with custom port configuration (5000)
- TypeScript strict mode enabled with build error bypassing for rapid iteration
- Mobile-first responsive design using Tailwind CSS with custom design tokens

**UI Component System**
- shadcn/ui components with Radix UI primitives for accessibility
- Custom design system following ChatGPT aesthetics:
  - Off-white background (#F0F0F0) for reduced eye strain
  - Deep green primary color (#34A853) for trust and responsiveness
  - Light gray accent (#9AA0A6) for subtle interactions
  - Inter font family for both body and headlines
- Component organization: `@/components/ui` for primitives, `@/components/chat` for feature components

**State Management Pattern**
- React Hook Form with Zod validation for form state
- Local component state for UI interactions
- Firebase Firestore real-time subscriptions for chat persistence
- Custom hooks for mobile detection and toast notifications

**Chat Interface Design**
- Single-column layout with fixed bottom input
- Auto-expanding textarea with 200px max height
- Message streaming with skeleton loading states
- Support for file attachments with preview
- Inline rendering of special content types (code blocks, images, YouTube videos)

### Backend Architecture

**AI Framework: Google Genkit**
- Centralized AI instance configuration in `src/ai/genkit.ts`
- Model: Google Gemini 1.5 Pro via `@genkit-ai/google-genai`
- Development mode with hot-reload via tsx watch

**AI Flows (Server Actions)**
1. **analyzeContext**: Summarizes conversation history and current input for context-aware responses
2. **generateResponse**: Core text generation with tool calling, generates related queries and tracks sources
3. **textToSpeech**: Converts text to WAV audio format (24kHz, mono, 16-bit)

**AI Tools (Function Calling)**
1. **getPageContent**: Google Custom Search integration for web browsing
2. **generateImage**: Pollinations.ai integration for image generation
3. **searchYouTube**: YouTube Data API v3 for video search
4. **createTempMailAccount**: Mail.tm API for temporary email accounts

**Response Enhancement**
- Automatic generation of 3-4 related follow-up questions
- Source URL tracking for factual responses
- Special markup parsing for embedded content (images, videos)

### Authentication & Authorization

**Firebase Authentication**
- Google OAuth sign-in via Firebase Auth
- Client-side authentication state management with `onAuthStateChanged`
- Context-based auth state distribution via `FirebaseProvider`
- Custom `useUser` hook for accessing current user across components

**Session Management**
- Firebase handles token refresh automatically
- No custom session management required
- Auth state persists across page reloads

### Data Storage & Persistence

**Firebase Firestore Structure**
```
users/{userId}/
  chats/{chatId}/
    - name: string
    - createdAt: timestamp
    messages/{messageId}/
      - role: "user" | "assistant"
      - content: string
      - attachments: array (optional)
      - audioUrl: string (optional)
      - relatedQueries: array (optional)
      - sources: array (optional)
      - createdAt: timestamp
```

**Data Access Patterns**
- Real-time subscriptions for chat list and messages
- Ordered queries by `createdAt` descending for chat history
- Batch writes for chat deletion (chat document + all messages)
- Server timestamps for consistent ordering

**Chat Management**
- Automatic chat naming from first user message
- New chat creation on first message send
- Chat selection updates URL state (via props, not router)
- Delete functionality with confirmation dialog

### External Dependencies

**Google APIs**
- Google Custom Search API: Web search functionality (requires `GOOGLE_API_KEY` and `SEARCH_ENGINE_ID`)
- YouTube Data API v3: Video search (requires `GOOGLE_API_KEY`)
- Google Genkit AI: Core AI orchestration framework
- Google Gemini 1.5 Pro: Language model for text generation

**Third-Party Services**
- Pollinations.ai: AI image generation (no API key required)
- Mail.tm: Temporary email service (no API key required)

**Firebase Services**
- Firebase Authentication: Google OAuth provider
- Firebase Firestore: Real-time NoSQL database
- Configuration via environment variables with `NEXT_PUBLIC_FIREBASE_*` prefix

**UI & Styling Libraries**
- Radix UI: Headless component primitives (17+ components)
- Tailwind CSS: Utility-first styling with CSS variables
- Lucide React: Icon library
- class-variance-authority: Component variant management
- embla-carousel-react: Carousel functionality

**Form & Validation**
- react-hook-form: Form state management
- zod: Schema validation
- @hookform/resolvers: Zod integration with react-hook-form

**Data Visualization**
- recharts: Chart components (configured but not actively used in main flow)
- date-fns: Date formatting and manipulation

**Audio Processing**
- wav: PCM to WAV conversion for text-to-speech output

**Development Tools**
- dotenv: Environment variable management
- patch-package: NPM package patching
- tsx: TypeScript execution for Genkit dev server

**Configuration Notes**
- Image domains whitelisted: placehold.co, images.unsplash.com, picsum.photos, image.pollinations.ai
- TypeScript and ESLint errors ignored during builds for rapid iteration
- Next.js 15 with Turbopack enabled in development