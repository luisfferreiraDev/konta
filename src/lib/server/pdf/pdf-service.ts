import puppeteer, { type Browser } from 'puppeteer';

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
	if (!browser || !browser.connected) {
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});
	}
	return browser;
}

export async function generateInvoicePDF(html: string, invoiceNumber: string): Promise<Buffer> {
	let b: Browser;
	try {
		b = await getBrowser();
	} catch {
		throw new Error('Failed to launch PDF renderer. Ensure Puppeteer is installed correctly.');
	}

	const page = await b.newPage();
	try {
		await page.setContent(html, { waitUntil: 'networkidle0' });

		const pdf = await page.pdf({
			format: 'A4',
			printBackground: true,
			margin: { top: '20mm', bottom: '25mm', left: '15mm', right: '15mm' },
			displayHeaderFooter: true,
			headerTemplate: `
				<div style="width:100%;font-size:9px;color:#9ca3af;padding:0 15mm;text-align:right;font-family:sans-serif;">
					${invoiceNumber}
				</div>`,
			footerTemplate: `
				<div style="width:100%;font-size:9px;color:#9ca3af;padding:0 15mm;text-align:center;font-family:sans-serif;">
					Page <span class="pageNumber"></span> of <span class="totalPages"></span>
				</div>`
		});

		return Buffer.from(pdf);
	} finally {
		await page.close();
	}
}
