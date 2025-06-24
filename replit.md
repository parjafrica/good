# Granada OS - Grant and Funding Platform

## Overview

Granada is a comprehensive funding discovery and grant management platform designed to empower impact-driven organizations, students, and researchers. The application combines AI-powered donor matching, proposal generation, and real-time funding opportunity discovery to streamline the fundraising process.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme system supporting multiple color schemes
- **State Management**: React Context API for authentication and theme management
- **Routing**: React Router for client-side navigation
- **Animations**: Framer Motion for smooth transitions and micro-interactions

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **API Structure**: RESTful API with `/api` prefix routing
- **Authentication**: Session-based authentication with user role management
- **File Handling**: Support for document upload and processing

### Database Schema
- **Users**: Authentication and profile management with role-based access
- **Organizations**: NGO and institutional profiles
- **Donor Opportunities**: Real-time funding opportunities with verification system
- **Search Bots**: Automated opportunity discovery system
- **Proposals**: Grant proposal management and tracking
- **Projects**: Active project and initiative management

## Key Components

### 1. Donor Discovery Engine
- Real-time search across multiple funding sources
- AI-powered matching based on organization profile and project needs
- Country-specific bot system for localized opportunity discovery
- Verification system for opportunity quality assurance

### 2. AI-Powered Proposal Generator
- Voice input and file upload support
- Multi-language proposal generation
- Integration with multiple AI providers (OpenAI, Gemini, DeepSeek)
- Template-based document generation

### 3. User Type System
- **Students**: Scholarship and research opportunity focus
- **NGOs**: Grant and funding opportunity management
- **Businesses**: Corporate funding and partnership opportunities
- **General Users**: Flexible access to all features

### 4. Real-Time Search Bot Network
- Country-specific search bots for local funding opportunities
- Reward system for successful opportunity discovery
- Performance tracking and success rate monitoring
- Automated verification and quality scoring

### 5. Credit System
- Usage-based pricing model
- Multiple payment method support (cards, mobile money, crypto)
- Regional payment provider integration
- Credit transaction history tracking

## Data Flow

1. **User Registration**: Type-specific onboarding with tailored dashboard experience
2. **Opportunity Discovery**: Real-time search with AI-powered matching and filtering
3. **Proposal Generation**: Multi-modal input processing with AI-assisted content creation
4. **Application Management**: End-to-end tracking from discovery to submission
5. **Project Monitoring**: Progress tracking and milestone management

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development and deployment platform

### AI Services
- **OpenAI**: GPT models for proposal generation
- **Google Gemini**: Alternative AI provider
- **DeepSeek**: Cost-effective AI option
- **DALL-E**: Image generation capabilities

### Payment Processing
- **Dodo Payments**: Multi-region payment processing
- **Mobile Money**: African market payment integration
- **Cryptocurrency**: Alternative payment options

### External APIs
- **Supabase Functions**: Serverless function execution
- **Geographic APIs**: Country detection and localization
- **Search APIs**: Funding opportunity discovery

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Reload**: Real-time code updates during development
- **Environment Variables**: Secure configuration management

### Production Deployment
- **Platform**: Replit autoscale deployment
- **Build Process**: Vite frontend build + esbuild backend compilation
- **Port Configuration**: Port 5000 with external port 80 mapping
- **Static Assets**: Served from `/dist/public` directory

### Database Management
- **Migrations**: Drizzle Kit for schema management
- **Connection Pooling**: Neon serverless connection handling
- **Environment Configuration**: Secure DATABASE_URL management

## Changelog
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.