# lhihi AI - ChatGPT Clone

## Overview

lhihi AI is a conversational AI application built with Next.js 15, designed to replicate the ChatGPT experience. The application features contextual understanding, text generation, text-to-speech capabilities, and multiple AI-powered tools including web search, image generation, YouTube search, and temporary email creation. The system uses Google's Genkit AI framework with **multi-model support** (Gemini 2.0 Flash, 1.5 Flash, and 1.5 Pro) for natural language processing and Firebase for authentication and data persistence.

## Recent Changes (October 18, 2025)

**Vercel to Replit Migration**
- Migrated project from Vercel to Replit environment
- Configured Next.js dev server to run on port 5000 with 0.0.0.0 binding
- Removed hardcoded API keys and implemented secure environment variable management
- Added runtime warnings for missing API credentials (Google API Key, Search Engine ID, Firebase config)
- Configured deployment settings for production (autoscale deployment target)

**Multi-Model Support**
- Upgraded default model from Gemini 1.5 Pro to **Gemini 2.0 Flash (experimental)** for faster responses
- Implemented dynamic model selection with UI dropdown in chat header
- Added support for three AI models:
  - **Gemini 2.0 Flash** (default): Fast and efficient - Best for quick responses
  - **Gemini 1.5 Flash**: Balanced performance and speed
  - **Gemini 1.5 Pro**: Most capable - Best for complex tasks
- Model selection persists during chat session and is passed to backend AI flows
- Created `AVAILABLE_MODELS` array in types.ts for centralized model configuration

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
- **Model selector dropdown** in header with model name and description
- Real-time model switching without page reload

### Backend Architecture

**AI Framework: Google Genkit**
- Centralized AI instance configuration in `src/ai/genkit.ts`
- Default Model: **Google Gemini 2.0 Flash (experimental)** via `@genkit-ai/google-genai`
- Multi-model support: Users can switch between Gemini 2.0 Flash, 1.5 Flash, and 1.5 Pro
- Model selection passed dynamically to AI flows via `model` parameter
- Development mode with hot-reload via tsx watch

**AI Flows (Server Actions)**
1. **analyzeContext**: Summarizes conversation history and current input for context-aware responses
2. **generateResponse**: Core text generation with tool calling, generates related queries and tracks sources
   - Accepts optional `model` parameter for dynamic model selection
   - Defaults to `googleai/gemini-2.0-flash-exp` if no model specified
   - Supports all three Gemini models (2.0 Flash, 1.5 Flash, 1.5 Pro)
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
- Google Gemini Models: Multi-model support for text generation
  - Gemini 2.0 Flash (experimental) - Default
  - Gemini 1.5 Flash
  - Gemini 1.5 Pro

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
- Development server runs on port 5000 with 0.0.0.0 binding for Replit compatibility
- Production deployment configured with autoscale target

**Security & Environment Variables**
- All API keys stored as environment variables (never hardcoded)
- Runtime warnings for missing credentials:
  - `GOOGLE_API_KEY`: Required for YouTube search and web search
  - `SEARCH_ENGINE_ID`: Required for Google Custom Search
  - `NEXT_PUBLIC_FIREBASE_*`: Required for authentication (optional for now)
- Secrets managed through Replit's secret management system