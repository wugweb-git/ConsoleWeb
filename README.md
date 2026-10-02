# ConsoleWeb

ConsoleWeb is the Wugweb master (platform) admin. It is a generic shell that knows nothing about any specific product: each product (DocWeb first) plugs in as a module under `src/modules/<product>/` with a single `module.ts` manifest, and shared capabilities such as blockchain and templates are registered under `src/services/`. Adding a product means adding a folder and one line in the module registry — the shell itself does not change.

## Run

```bash
npm install
npm run dev     # http://localhost:3001
npm run build   # outputs to build/
```
