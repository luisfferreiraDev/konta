# Konta

Konta (/ˈkɔn.tɑ/) is a self-hosted invoice generator built with SvelteKit. The name derives from *conta*, the Portuguese word for bill.

It is designed for individuals and small teams who want full control over their invoicing data without relying on third-party services.

## Features

- **Invoice creation and PDF export** — generate professional invoices and export them as PDFs via Puppeteer
- **Custom fields** — define your own fields per invoice to capture data beyond standard layouts: tax IDs, project references, purchase order numbers, or any domain-specific information your workflow requires
- **Authentication** — secure access via better-auth
- **Data validation** — runtime validation with Zod throughout
- **Self-hosted, privacy-first** — your invoice data stays on your infrastructure

The custom fields system is the core differentiator. Rather than being locked into a fixed invoice template, you can extend invoices with arbitrary structured data, making Konta adaptable to different business contexts and regional requirements.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit (Svelte 5), TypeScript |
| Styling | Tailwind CSS v4 |
| Database | MongoDB with Mongoose |
| Authentication | better-auth |
| PDF generation | Puppeteer |
| Validation | Zod |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A running MongoDB instance

### Environment Setup

Copy the example environment file and fill in the required values:

```bash
cp .env.example .env
```

Open `.env` and configure the variables — at minimum you will need a MongoDB connection string and the authentication secret.

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
pnpm preview
```

To run in production, build the application and serve it with the appropriate SvelteKit adapter for your environment. Refer to the [SvelteKit deployment documentation](https://kit.svelte.dev/docs/adapters) for adapter options.

## License

Konta is released under the [MIT License](LICENSE).
