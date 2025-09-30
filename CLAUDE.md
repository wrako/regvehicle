# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This repository contains a vehicle management system with two main components:

1. **Next.js Frontend** (`WebstormProjects/untitled/`) - React-based web application
2. **Spring Boot Backend** (`IdeaProjects/management/`) - Java REST API and data layer

## Frontend (Next.js Application)

### Development Commands
- `npm run dev` - Start development server (runs on 0.0.0.0:3000)
- `npm run dev:turbo` - Start development server with Turbo mode
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Architecture
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **State Management**: React hooks and context
- **AI Integration**: Google Genkit AI for enhanced functionality
- **Database**: Firebase integration

### Key Directories
- `src/app/` - App Router pages and layouts
  - `dashboard/` - Main application dashboard with vehicle management
  - `(auth)/` - Authentication pages
- `src/components/` - Reusable React components
  - `dashboard/` - Dashboard-specific components (forms, tables, dialogs)
  - `ui/` - shadcn/ui components
- `src/lib/` - Utilities and API client functions
- `src/types/` - TypeScript type definitions
- `src/hooks/` - Custom React hooks

### Domain Model
The application manages vehicles with the following key entities:
- **Vehicle**: Core entity with registration plates (SPZ), make/model, status, devices
- **Provider**: Service providers managing vehicles
- **NetworkPoint**: Station/substation/hospital locations
- **RdstDevice & AvlDevice**: Tracking devices attached to vehicles

## Backend (Spring Boot Application)

### Development Commands
- `./mvnw spring-boot:run` - Start development server
- `./mvnw clean compile` - Compile the project
- `./mvnw test` - Run tests
- `./mvnw clean package` - Build JAR file

### Architecture
- **Framework**: Spring Boot 3.5.5 with Java 21
- **Database**: MariaDB with JPA/Hibernate
- **Security**: Spring Security
- **Build Tool**: Maven
- **Annotations**: Lombok for reducing boilerplate

### Key Packages
- `entity/` - JPA entities (Vehicle, Provider, NetworkPoint, etc.)
- `controller/` - REST controllers
- `service/` - Business logic layer
- `repository/` - Data access layer
- `dto/` - Data transfer objects
- `config/` - Spring configuration classes
- `listener/` - Event listeners (e.g., VehicleListener)

### Database
- Uses MariaDB as the primary database
- JPA/Hibernate for ORM
- Vehicle lifecycle tracking with VehicleLog entity

## Development Workflow

### Working Directory
The working directory is `/home/pacrad/regvehicle`. Both projects are subdirectories:
- Frontend: `WebstormProjects/untitled/`
- Backend: `IdeaProjects/management/`

### Type Safety
- Frontend uses TypeScript with strict type checking
- Backend uses Java 21 with Lombok annotations
- Always run `npm run typecheck` after frontend changes
- Use `./mvnw compile` to validate Java compilation

### UI Components
- Uses shadcn/ui component library with Radix UI primitives
- Components configuration in `components.json`
- Tailwind CSS with custom configuration
- Lucide React for icons

## Common Development Patterns

### Frontend Forms
- React Hook Form for form state management
- Zod schemas for validation
- Custom form components in `src/components/dashboard/form-fields.tsx`

### API Integration
- API client functions in `src/lib/api.ts`
- Mock data in `src/lib/data.ts` for development
- Firebase integration for data persistence

### Backend REST APIs
- Standard Spring Boot REST controllers
- JPA repositories for data access
- DTO pattern for API responses
- Spring Security for authentication/authorization