import { render } from 'svelte/server';
import InvoiceTemplate from './InvoiceTemplate.svelte';
import InvoiceTemplateMinimal from './InvoiceTemplateMinimal.svelte';
import InvoiceTemplateBoxed from './InvoiceTemplateBoxed.svelte';
import type { IInvoice } from '../models/invoice.model.js';
import type { IOrganization } from '../models/organization.model.js';
import type { IClient } from '../models/client.model.js';
import type { InvoiceLayout } from '../models/organization.model.js';

const TEMPLATE_COMPONENTS: Record<InvoiceLayout, typeof InvoiceTemplate> = {
	default: InvoiceTemplate,
	minimal: InvoiceTemplateMinimal,
	boxed: InvoiceTemplateBoxed
};

export interface InvoiceTemplateData {
	invoice: IInvoice & { clientId: IClient };
	organization: IOrganization;
	preview?: boolean;
}

const FONT_MAP: Record<string, string> = {
	inter: 'Inter',
	roboto: 'Roboto',
	lato: 'Lato',
	opensans: 'Open Sans',
	'open sans': 'Open Sans',
	montserrat: 'Montserrat',
	playfair: 'Playfair Display',
	'playfair display': 'Playfair Display'
};

export function renderInvoiceHTML(data: InvoiceTemplateData): string {
	const { invoice, organization, preview = false } = data;

	const rawFont = organization.templateSettings?.font || 'inter';
	const googleFont = FONT_MAP[rawFont.toLowerCase()] || 'Inter';
	const fontFamily = `'${googleFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

	const layout = (organization.templateSettings?.layout as InvoiceLayout) || 'default';
	const TemplateComponent = TEMPLATE_COMPONENTS[layout] ?? InvoiceTemplate;

	const { body, head } = render(TemplateComponent, { props: { invoice, organization } });

	const previewStyles = preview
		? `
  body {
    background: #e5e7eb;
    display: flex;
    justify-content: center;
    padding: 32px 16px;
    min-height: 100vh;
  }
  .a4-sheet {
    background: #ffffff;
    width: 794px;
    min-height: 1123px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.12);
    flex-shrink: 0;
  }`
		: `body { background: #ffffff; }`;

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Invoice ${invoice.number}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(googleFont)}:wght@400;500;600;700&display=swap" rel="stylesheet" />
${head}
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: ${fontFamily};
    font-size: 13px;
    color: #1f2937;
  }
  @page { size: A4; margin: 20mm 15mm 25mm 15mm; }
  table { border-collapse: collapse; width: 100%; }
  ${previewStyles}
</style>
</head>
<body><div class="a4-sheet">${body}</div></body>
</html>`;
}
