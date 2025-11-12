# AGENTS.md - Development Guidelines

## Application Context

**Fullstack roguelike slot machine simulator** - Professional game design tool for configuring and testing mechanics through **presets**. Features 5×3 grid, 11 combo types, progression system, shop, bonuses, jokers, and ascension (0-20+ difficulty). Built for game designers to balance and optimize slot machine mechanics.

## Documentation First

**Always check `docs/` directory before modifying code** - especially:

- `00-OVERVIEW.md` - Architecture overview and workflow
- `01-DATABASE.md` - Database schema and relationships
- `02-SIMULATION-ENGINE.md` - Engine architecture and integration
- `03-UI-ROUTES.md` - Route structure and patterns
- `04-DEVELOPMENT.md` - Development workflows and conventions

## Documentation Updates

**Update relevant docs after making changes** - maintain consistency between code and documentation

- Update only affected sections in appropriate `docs/*.md` files
- Keep minimal format: every word counts, no duplication, no information loss
- Follow current concise style with maximum density
- **Also update this AGENTS.md file** when adding new commands, patterns, or architectural changes

## Commands

- `npm run dev` - Start dev server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - TypeScript type checking
- `npm run lint` - ESLint linting
- `npm run format` - Prettier formatting
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Sync DB schema
- `npm run db:seed` - Seed database with default preset
- `npm run db:reset` - Reset and reseed database
- `npm run db:studio` - Drizzle Studio UI

## Code Style

- **TypeScript**: Strict mode enabled, no `any` types
- **Imports**: Use `~` alias for `app/` imports, group: React → Remix → DB → Components → Utils
- **Naming**: `camelCase` for vars/functions, `PascalCase` for components/types, `SCREAMING_SNAKE_CASE` for constants
- **Files**: `kebab-case.tsx` or `PascalCase.tsx`
- **Formatting**: Prettier config (semi: true, singleQuote: false, tabWidth: 2, trailingComma: es5)
- **ESLint**: Warn on unused vars with `_` prefix pattern

## Architecture Notes

- **Preset-based configuration**: All configs isolated by preset, use `requireActivePreset()` for protected routes
- **Simulation engine**: `app/lib/simulation/` is 100% decoupled from UI, pure functions only
- **Database**: SQLite with Drizzle ORM, 23 tables, types auto-generated from schema
- **Legacy config cache**: Still uses global tables for performance (levelConfigs, shopRarityConfigs)
- **No test framework**: Structure ready for Vitest, no tests currently implemented
- **Effects system**: Hard-coded library (read-only), referenced by bonuses/jokers/characters
- **File-based routing**: Remix 2 with loaders/actions pattern
- **Docker support**: Multi-stage build, persistent SQLite volume, reverse proxy ready
