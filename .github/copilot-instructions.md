# Copilot Instructions

This repository is a frontend project. Please use the following technical stack as a reference when GitHub Copilot provides code completions and suggestions.

## Tech Stack

- **Framework**: React  
- **Build Tool**: Vite  
- **State Management**: Jotai  
- **UI Components**: Chakra UI v2

## Project Structure

The project follows an organized structure:

- **src/components/**
  - **atoms/**: Small, basic components (e.g., buttons, form inputs)
  - **organisms/**: More complex components composed of multiple atoms
  - **pages/**: Full page components used by routes

- **src/lib/**
  - **atom/**: Jotai atoms for state management
  - **domain/**: API interfaces and query functions
  - **infrastructure/**: Core services like Axios client
  - **provider/**: Context providers
  - **route/**: Routing components and guards

## Development Guidelines

- Please suggest code that is **readable and maintainable**.
- Provide styling suggestions that **align with Chakra UI v2's component design philosophy**.
- Use **Jotai atoms** for state management (no need for Redux, etc.).
- Prioritize **Hooks-based implementations** for React when appropriate.
- Provide completions optimized for the Vite development experience based on its configurations.

## Code Organization Rules

- Follow **Atomic Design** principles for components (atoms → organisms → pages).
- Keep API logic in domain-specific query files.
- Store global state in Jotai atoms under the `atom` directory.
- Separate infrastructure concerns from domain logic.
- Use protected routes for authenticated sections of the application.

## Additional Guidelines

- Code should be TypeScript-based (please provide accurate type completions).
- Code suggestions should consider Chakra UI theme customization and responsive design.
- When providing code examples or suggestions, please follow **current best practices** whenever possible.
- Use Biome for code formatting (run with `npm run format:fix && npm run lint:fix && npm run check:fix`).