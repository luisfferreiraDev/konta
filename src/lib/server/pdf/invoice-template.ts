import { render } from 'svelte/server';
import InvoiceTemplate from './InvoiceTemplate.svelte';
import type { IInvoice } from '../models/invoice.model.js';
import type { IOrganization } from '../models/organization.model.js';
import type { IClient } from '../models/client.model.js';

export interface InvoiceTemplateData {
	invoice: IInvoice & { clientId: IClient };
	organization: IOrganization;
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
	const { invoice, organization } = data;

	const rawFont = organization.templateSettings?.font || 'inter';
	const googleFont = FONT_MAP[rawFont.toLowerCase()] || 'Inter';
	const fontFamily = `'${googleFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

	const { body, head } = render(InvoiceTemplate, { props: { invoice, organization } });

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
    background: #ffffff;
  }
  @page { size: A4; margin: 20mm 15mm 25mm 15mm; }
  table { border-collapse: collapse; width: 100%; }
</style>
</head>
<body>${body}</body>
</html>`;
}
