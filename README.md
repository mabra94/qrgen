# QR Private Studio

A browser-only QR code generator. Everything — content, styling, and the optional
center logo — is generated locally in the browser. There is no backend, no
upload, and no telemetry, so the data you type never leaves your machine.

## Features

- **Content types:** Website URL, plain text, Wi-Fi, vCard, email, SMS, and phone.
- **Wi-Fi safety:** SSID/password fields are escaped so `;`, `,`, `\` and newlines
  cannot break the payload.
- **Design controls:** foreground/background colors, module shape, error-correction
  level, margin, and transparent background.
- **Center logo:** upload a PNG, JPEG, WebP, or SVG (max 2 MB). The file is read
  as a data URL in the browser and error correction is raised to `H` automatically.
- **Export:** download the result as PNG (512–4000 px) or SVG.
- **Live preview:** the QR code re-renders as you type.

## Privacy

All processing happens client-side. The only network requests are the initial
page load (the app bundle), and an end-to-end regression test asserts that QR
content and Wi-Fi credentials are never transmitted after that.

## Prerequisites

- **Podman** (recommended, no local Node needed), or
- **Node.js 22+** and npm for local development.

## Quick start with Podman

```bash
podman compose up
```

Then open <http://127.0.0.1:5173>.

The compose service runs `npm install && npm run dev`, mounts the repository into
the container, and keeps `node_modules` in a named volume.

## Local development

```bash
npm install
npm run dev
```

Open <http://127.0.0.1:5173>. To run the browser tests locally, install the
browser once:

```bash
npx playwright install chromium
```

## Testing

| Command | What it does |
| --- | --- |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`). |
| `npm run test:unit` | Vitest unit tests for payload generation and logo validation. |
| `npm run test:e2e` | Playwright browser tests against the dev server. |
| `npm run build` | Typecheck plus a production build into `dist/`. |
| `npm run check` | The full suite: typecheck → unit → build → end-to-end. |

Run everything with:

```bash
npm run check
```

### Full suite in a container

Everything above also runs inside a prebuilt Playwright image, so no host Node
install is needed:

```bash
podman build -t qr-private-studio-test -f Containerfile.test .
podman run --rm qr-private-studio-test
```

### What the tests cover

- **Unit:** payload output for URL/Wi-Fi/vCard/email/text, control-character
  escaping, URL/email/phone validation, and logo type/size validation.
- **End-to-end:** rendering and switching content type, embedding an uploaded SVG
  logo as a `data:` URL with error correction set to `H`, removing the logo,
  rejecting unsupported file types, and verifying QR/Wi-Fi content is never sent
  over the network.

## Project structure

```
index.html               # Vite entry point
src/
  main.ts                # UI wiring, QR rendering, PNG/SVG export
  payloads.ts            # QR payload builders, escaping, validation
  logo.ts                # Logo type/size validation and data-URL reading
  types.ts               # Shared State and ContentType types
  style.css              # App styles
tests/
  unit/                  # Vitest tests + shared state factory
  e2e/                   # Playwright specs and fixtures
Containerfile.test       # Test/CI image
compose.yaml             # Podman Compose dev service
```

## License

MIT © 2026 Mathis Bramkamp. See [LICENSE](./LICENSE).
