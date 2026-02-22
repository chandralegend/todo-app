# Research: Converting Next.js 16 Todo App to Electron Desktop App

**Date:** Feb 22, 2026
**Current Stack:** Next.js 16.1.6, React 19.2.3, Prisma 7.4.1 (PostgreSQL), NextAuth 5 beta, Tailwind CSS 4, Bun

---

## 1. Next.js + Electron Integration Approaches

### 1A. Nextron (github.com/saltyshiomix/nextron)

**Status:** Semi-maintained. 4.4k stars, 121 open issues, last npm publish ~2 months ago (v9.5.0). The repo was originally at `saltyshiomix/nextron` (the `nicedoc/nextron` URL in the request is a 404 — the correct repo is `saltyshiomix/nextron`).

**How it works:**
- Splits project into `main/` (Electron main process) and `renderer/` (Next.js app)
- Uses `output: 'export'` to generate static HTML files that Electron loads via `file://`
- Dev mode: runs `next dev` server and loads via `http://localhost:8888`
- Production: static export loaded from filesystem
- Uses `electron-builder` for packaging

**Compatibility table from README:**
| Next.js | Nextron |
|---------|---------|
| v14.x   | v9.x   |
| v12/v13 | v8.x   |

**Critical finding: No Next.js 15 or 16 support listed.** The latest Nextron v9.x only officially supports Next.js 14.

**Pros:**
- Easiest setup — `npx create-nextron-app` gets you running quickly
- Well-documented with many templates (TypeScript, Tailwind, etc.)
- Handles dev/prod mode switching automatically
- Uses electron-builder with good defaults

**Cons:**
- **Does NOT support Next.js 15 or 16** — version gap is a dealbreaker
- Requires `output: 'export'` which **eliminates all server-side features**: API routes, server actions, server components with data fetching, middleware, NextAuth
- Your app relies heavily on server actions, API routes (`/api/chat`, `/api/cron`, `/api/auth`, `/api/health`, `/api/lists`), and NextAuth — all incompatible with static export
- Semi-maintained; 121 open issues suggest declining activity
- Pages Router examples only (no App Router examples visible)

**Verdict: NOT VIABLE** for this project. The static export requirement kills it.

---

### 1B. `output: 'export'` (Static Export) + Electron

**How it works:**
- `next build` generates static HTML/CSS/JS
- Electron loads the static files via `file://` protocol or a simple file server
- No Node.js server at runtime

**Pros:**
- Simplest architecture — just static files in an Electron wrapper
- Fast startup, small bundle
- No server process to manage

**Cons:**
- **Eliminates all server features:** API routes, server actions, server components, middleware, NextAuth, Prisma queries from server
- Your entire backend layer (auth, CRUD, AI chat, recurrence cron) would need to be rewritten
- Would need to move ALL data access to Electron main process via IPC
- Massive refactor — essentially rewriting the backend from scratch

**Verdict: NOT VIABLE** without a complete rewrite of the backend.

---

### 1C. `output: 'standalone'` + Electron (Embedded Next.js Server)

**How it works:**
- `next build` with `output: 'standalone'` produces a self-contained Node.js server
- Electron main process spawns (or imports) the Next.js standalone server
- Electron's BrowserWindow loads `http://localhost:3000`
- All server features work: API routes, server actions, server components, middleware, NextAuth

**Architecture:**
```
electron main process
  ├── spawns/imports Next.js standalone server (port 3000)
  └── BrowserWindow → loads http://localhost:3000
```

**Pros:**
- **All server features preserved** — API routes, server actions, server components, middleware
- Minimal code changes to existing app
- NextAuth, Prisma, AI chat — all continue working as-is
- Hot reload works in dev (run `next dev` + electron separately)
- Can still deploy the same codebase to Vercel/web

**Cons:**
- Larger bundle size (~50-100MB+ for standalone server + Electron)
- Two processes to manage (Electron + Node.js server)
- Port conflicts possible (need dynamic port allocation)
- Slightly slower startup (server needs to boot)
- Need to handle server lifecycle (start, stop, crash recovery)
- `output: 'standalone'` generates a `.next/standalone` folder with its own `node_modules` subset

**Verdict: BEST OPTION** for this project. Preserves the entire existing codebase.

---

### 1D. Custom Electron + Next.js (Manual Integration)

**How it works:**
- Write your own Electron main process that uses Next.js programmatically
- In dev: `next dev` via the Next.js API
- In prod: use `next start` or the custom server API

**Example main process:**
```typescript
// electron/main.ts
import { app, BrowserWindow } from 'electron';
import next from 'next';
import { createServer } from 'http';

const nextApp = next({ dev: !app.isPackaged, dir: __dirname + '/../' });
const handle = nextApp.getRequestHandler();

app.whenReady().then(async () => {
  await nextApp.prepare();
  const server = createServer((req, res) => handle(req, res));
  server.listen(0, () => { // random port
    const port = server.address().port;
    const win = new BrowserWindow({ ... });
    win.loadURL(`http://localhost:${port}`);
  });
});
```

**Pros:**
- Full control over the integration
- Can use dynamic port allocation
- All server features work
- Most flexible approach

**Cons:**
- More setup work than using a framework
- Need to handle dev/prod switching yourself
- Need to configure electron-builder/forge yourself
- Need to handle native module rebuilding

**Verdict: GOOD OPTION** — essentially a DIY version of approach 1C but with more control.

---

### Recommended Approach: 1C or 1D (Standalone/Custom Server)

**For this project, approach 1C (`output: 'standalone'`) or 1D (custom server) is the only viable path** because:
1. The app has 6 API routes, multiple server actions, NextAuth, and Prisma queries from server components
2. Static export would require a complete backend rewrite
3. Nextron doesn't support Next.js 16

The practical implementation would be:
1. Add `output: 'standalone'` to `next.config.ts`
2. Create an `electron/` directory with `main.ts` and `preload.ts`
3. Main process starts the standalone server, then opens BrowserWindow
4. Use `electron-builder` or `electron-forge` for packaging

---

## 2. Embedded Database Options (Prisma + SQLite)

### Current State

The app currently uses:
- **PostgreSQL** as the database
- **Prisma 7.4.1** with `@prisma/adapter-pg` (pg driver adapter)
- `provider = "postgresql"` in schema.prisma
- PostgreSQL-specific features: `String[]` arrays (tags, daysOfWeek), `@db.Date` type

### 2A. SQLite with Prisma

**Prisma officially supports SQLite.** Per the Prisma docs, "a fixed version of SQLite is shipped with every Prisma ORM release."

**Migration from PostgreSQL to SQLite requires schema changes:**

| PostgreSQL Feature | SQLite Equivalent | Migration Effort |
|---|---|---|
| `String[]` arrays | JSON field or separate join table | Medium |
| `Int[]` arrays | JSON field or separate join table | Medium |
| `@db.Date` | `DateTime` (no native Date type) | Low |
| `@default(cuid())` | Works in SQLite | None |
| `@unique` constraints | Supported | None |
| `@@index` | Supported | None |
| Enums | Supported via Prisma (stored as strings) | None |

**Key issue:** Your schema uses `String[]` for tags and `Int[]` for daysOfWeek. SQLite doesn't support array types natively. Prisma stores these as JSON in SQLite, but the query API changes slightly (can't use array `has`/`hasEvery` filters — need to switch to string `contains` or restructure).

**Prisma 7.x with SQLite uses driver adapters:**
```typescript
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: "file:./app.db" });
const prisma = new PrismaClient({ adapter });
```

### 2B. `better-sqlite3` vs `sql.js`

| Feature | better-sqlite3 | sql.js |
|---------|---------------|--------|
| Performance | Excellent (native C++ binding) | Good (WASM) |
| Native module? | Yes — requires `@electron/rebuild` | No — pure JS/WASM |
| Electron compatibility | Needs rebuild for Electron ABI | Works out of the box |
| Prisma support | Official adapter (`@prisma/adapter-better-sqlite3`) | No official Prisma adapter |
| Synchronous API | Yes | Yes |
| Size | ~10MB native binary | ~2MB WASM |
| Write performance | Faster (native) | Slower (WASM) |

**Recommendation: `better-sqlite3`** because:
1. Prisma has an official adapter for it (`@prisma/adapter-better-sqlite3`)
2. Performance is significantly better for write-heavy todo operations
3. The rebuild step is well-documented and automated by `@electron/rebuild`
4. `sql.js` has no Prisma adapter, which would require dropping Prisma entirely

### 2C. Database File Location

In Electron, the correct place to store user data:

```typescript
import { app } from 'electron';

// Platform-specific paths:
// macOS: ~/Library/Application Support/the-todo-app/
// Windows: %APPDATA%/the-todo-app/
// Linux: ~/.config/the-todo-app/
const dbPath = path.join(app.getPath('userData'), 'todo.db');

// Pass to Prisma via environment variable
process.env.DATABASE_URL = `file:${dbPath}`;
```

**Important:** The `userData` directory is:
- Persisted across app updates
- User-writable (no permission issues)
- Platform-appropriate
- Not bundled inside the app binary (survives updates)

### 2D. Prisma + Electron Bundling Issues

**Known challenges:**

1. **Prisma query engine binary:** Prisma ships platform-specific native binaries. For Electron, you need the correct `binaryTargets` in your schema:
   ```prisma
   generator client {
     provider      = "prisma-client-js"
     binaryTargets = ["native", "darwin-arm64", "win32-x64-msvc", "linux-x64-gnu"]
   }
   ```
   However, with Prisma 7.x and the new driver adapter approach (`@prisma/adapter-better-sqlite3`), the engine binary situation is simplified — the adapter handles the database interaction directly.

2. **`@electron/rebuild`:** Native modules like `better-sqlite3` must be rebuilt against Electron's Node.js ABI version. Use:
   ```bash
   npx @electron/rebuild
   ```

3. **Prisma migrations at runtime:** In a desktop app, you can't run `prisma migrate dev`. Instead:
   - Ship migrations with the app
   - Run `prisma migrate deploy` on app startup (applies pending migrations)
   - Or use `prisma db push` for simpler scenarios

4. **prisma-client-js generates into node_modules:** With Prisma 7.x's new `prisma-client` generator, output goes to a custom directory — better for bundling.

---

## 3. Auth Considerations for Desktop App

### Current Auth Setup

- NextAuth v5 beta with Credentials provider
- bcryptjs password hashing
- JWT session strategy
- PrismaAdapter for database persistence
- Login/register pages
- Middleware-based route protection

### Options for Desktop App

#### Option A: Remove Auth Entirely

**Pros:**
- Simplest approach — remove NextAuth, middleware, login/register pages
- Desktop app = single user, local database = no security boundary needed
- Removes bcryptjs dependency (another native module to worry about in Electron)
- Faster startup

**Cons:**
- Database is unprotected if someone accesses the file
- If you ever add cloud sync, you'd need to re-add auth
- Breaks the `userId` foreign keys throughout the schema

**Implementation:** Create a fixed "local user" at first launch. Replace `auth()` calls with a constant user ID.

#### Option B: Simple PIN/Password on Launch

**Pros:**
- Quick protection without full auth infrastructure
- Can still use existing user model
- PIN stored as hash in the local DB
- Protects against casual access

**Cons:**
- Not real security (DB file is still accessible)
- Extra friction for single user
- Need to build a PIN entry UI

#### Option C: Keep Auth As-Is (Recommended for Transition)

**Pros:**
- **Zero code changes** to auth flow
- Supports multiple local users (family computer scenario)
- Same codebase works for web deployment AND desktop
- NextAuth, JWT sessions, middleware — all still work with embedded server
- Can still share the app with cloud deployment

**Cons:**
- Slight overkill for single-user desktop
- bcryptjs is pure JS — works fine, no native module concern
- Login screen on every app launch (mitigate with long session expiry)

**Recommendation:** **Option C** for the initial Electron port (zero changes), then optionally simplify to Option A later with a "local mode" flag. This keeps the codebase unified.

---

## 4. Key Challenges and Solutions

### 4A. Prisma Binary Targets for Electron

**With Prisma 7.x + driver adapters (recommended approach):**
The new adapter-based approach (`@prisma/adapter-better-sqlite3`) sidesteps the binary target problem because the query engine runs in JavaScript, not as a separate native binary. The only native module is `better-sqlite3` itself, which needs `@electron/rebuild`.

**With legacy `prisma-client-js` generator:**
You'd need:
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "darwin-arm64", "win32-x64-msvc", "linux-x64-gnu"]
}
```
Plus the engine binaries must be included in the Electron package.

**Recommendation:** Use Prisma 7.x with the new `prisma-client` generator + `@prisma/adapter-better-sqlite3`. This eliminates the binary target problem.

### 4B. Next.js API Routes in Electron

**With the standalone server approach, API routes work exactly as they do now.** The standalone server is a full Node.js HTTP server — API routes, server actions, middleware all function normally.

**Changes needed:**
- `/api/cron/recurrence`: Instead of Vercel Cron, use Electron's `setInterval` or `node-cron` to trigger the recurrence generation on a schedule
- `/api/auth/[...nextauth]`: Works as-is
- `/api/chat`: Works as-is (if OpenAI API key is configured)
- `/api/health`: Works as-is

### 4C. Hot Reload During Development

**Dev workflow:**
```bash
# Terminal 1: Next.js dev server
next dev --port 3000

# Terminal 2: Electron pointing to dev server
NEXT_DEV_URL=http://localhost:3000 electron electron/main.ts
```

**Implementation in main.ts:**
```typescript
const isDev = !app.isPackaged;
if (isDev) {
  win.loadURL('http://localhost:3000');
} else {
  // Start standalone server, then load
  win.loadURL(`http://localhost:${serverPort}`);
}
```

Hot reload works via Next.js's built-in HMR when loading from the dev server. Electron main process changes require restart (use `electron-reload` or `nodemon` for main process hot reload).

### 4D. Packaging and Distribution

#### electron-builder vs electron-forge

| Feature | electron-builder | electron-forge |
|---------|-----------------|----------------|
| Maturity | Very mature, widely used | Official Electron tool |
| Config | YAML-based (`electron-builder.yml`) | JS config (`forge.config.js`) |
| Output formats | DMG, NSIS, AppImage, Snap, deb, MSI | DMG, DEB, RPM, Squirrel, WiX |
| Auto-update | Built-in | Via makers/publishers |
| Bundling approach | Files-based | Webpack/Vite plugin system |
| Native modules | Manual rebuild | Built-in `@electron/rebuild` |
| Nextron uses | electron-builder | N/A |

**Recommendation: electron-builder** because:
1. Nextron uses it (good precedent for Next.js apps)
2. More straightforward for "bring your own build" setups
3. Better cross-platform output format support
4. YAML config is simpler for this use case

**Key config:**
```yaml
# electron-builder.yml
appId: com.yourname.todo-app
productName: The Todo App
directories:
  output: dist
files:
  - .next/standalone/**/*
  - electron/**/*
  - prisma/migrations/**/*
  - package.json
extraResources:
  - from: prisma/migrations
    to: migrations
mac:
  target: [dmg, zip]
win:
  target: [nsis]
linux:
  target: [AppImage, deb]
```

---

## 5. Overall Recommendation

### Recommended Architecture

```
todo-app/
├── electron/
│   ├── main.ts          # Electron main process
│   ├── preload.ts       # Preload script (IPC bridge)
│   └── utils/
│       ├── server.ts    # Start/stop standalone Next.js server
│       ├── database.ts  # DB path, migration runner
│       └── scheduler.ts # Recurrence cron (replaces Vercel Cron)
├── app/                 # Existing Next.js app (unchanged)
├── prisma/
│   ├── schema.prisma    # Switch to SQLite provider
│   └── migrations/      # SQLite migrations
├── next.config.ts       # Add output: 'standalone'
├── electron-builder.yml # Packaging config
└── package.json         # Add electron scripts
```

### Migration Steps (High Level)

1. **Phase 1: Database Migration (PostgreSQL -> SQLite)**
   - Change `provider = "sqlite"` in schema.prisma
   - Replace `@prisma/adapter-pg` + `pg` with `@prisma/adapter-better-sqlite3` + `better-sqlite3`
   - Handle array fields (`String[]`, `Int[]`) — convert to JSON or join tables
   - Remove `@db.Date` annotation
   - Create fresh SQLite migrations
   - Update `lib/prisma.ts` to use SQLite adapter

2. **Phase 2: Electron Shell**
   - Add `electron`, `@electron/rebuild`, `electron-builder` dependencies
   - Create `electron/main.ts` with BrowserWindow
   - Add `output: 'standalone'` to next.config.ts
   - Wire up dev mode (next dev + electron) and prod mode (standalone server)
   - Configure electron-builder.yml

3. **Phase 3: Desktop Adaptations**
   - Replace Vercel Cron with local scheduler (node-cron or setInterval)
   - Set database path to `app.getPath('userData')/todo.db`
   - Run Prisma migrations on app startup
   - Optional: Remove auth or simplify to local-only mode
   - Optional: Add native menus, tray icon, auto-update

4. **Phase 4: Build and Package**
   - Configure electron-builder for macOS/Windows/Linux
   - Test native module rebuilding (`better-sqlite3`)
   - Test packaging and distribution
   - Add auto-update support (optional)

### Effort Estimate

| Phase | Effort | Risk |
|-------|--------|------|
| Database migration (PG -> SQLite) | 2-3 days | Medium (array fields) |
| Electron shell setup | 1-2 days | Low |
| Desktop adaptations | 1-2 days | Low |
| Build/package/test | 1-2 days | Medium (native modules) |
| **Total** | **5-9 days** | |

### Key Risks

1. **Array fields in SQLite:** `String[]` and `Int[]` need rework. Prisma SQLite stores them as JSON, but filtering semantics change. Tags filtering (`has`, `hasEvery`) won't work — need `contains` or restructure to join tables.

2. **Native module rebuilding:** `better-sqlite3` must be rebuilt for Electron's ABI. Well-documented but can be finicky across platforms.

3. **Bundle size:** Electron + Chromium + Node.js + Next.js standalone = 150-250MB minimum. This is standard for Electron apps but worth noting.

4. **Dual deployment:** If maintaining both web (Vercel/PostgreSQL) and desktop (Electron/SQLite) from the same codebase, you'd need a database abstraction layer or environment-based configuration.

---

## 6. Alternative: Skip Electron, Use Tauri

Worth mentioning: **Tauri** is a lighter alternative to Electron (~10MB vs 150MB+), but:
- Uses system webview (not Chromium) — less consistent rendering
- Backend is Rust, not Node.js — your entire Next.js server-side code wouldn't work
- Would require an even bigger rewrite than Electron
- Not viable for this project without a fundamental architecture change

**Verdict:** Electron is the right choice for this project given the existing Next.js server-side architecture.
