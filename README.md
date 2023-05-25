## Getting Started with Lancer

#### Start the app

1. clone the repository
2. `cd app`
3. `yarn`
4. Ask Jack for the `.env` file
5. `yarn run`

#### Build and load the extension

1. `cd extension`
2. `yarn`
3. `yarn content`
4. `cp manifest.json dist`
5. Follow [this guide](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/) to install the extension on Chrome. Other browser support is coming soon.

## Lancer File Structure

- app (the entire we app)
  - escrow (all rust code for smart contract and adapters)
    - adapters (code for help with creating instructions on the frontend)
    - programs (the actual rust code for the smart contract)
    - sdk (typescript generated to directly interacting with the contract)
    - tests (tests for the smart contract)
  - pages (wrapper pages for all routes in the app)
    - api (authentication & type rpc calls)
      - auth (catch-all route for auth0 handler)
      - trpc (catch-all route for trpc handler)
  - prisma (database schema)
    - helpers (queries for interacting with the database)
  - public (static assets)
  - server (backend code for trpc)
    - api (trpc configuration and routes)
      - routers (actual routes for trpc endpoints)
  - src (frontend code)
    - assets (static svgs)
    - atoms (smallest level components)
    - components (mid sized components)
    - layouts (general page layouts)
    - pages (functional code for pages and page-specific components)
    - providers (all code related to app-level state management)
    - styles (css stylesheets)
    - utils (helper functions used throughout the code base)
- extension
  - content (all code used in the extension content-script)
    - components (actual components injected into the page)
    - helpers (functions for finding existing page components and exist lancer components)
