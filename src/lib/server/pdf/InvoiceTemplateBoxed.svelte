<script lang="ts">
	import type { IInvoice } from '../models/invoice.model.js';
	import type { IOrganization } from '../models/organization.model.js';
	import type { IClient } from '../models/client.model.js';

	interface Props {
		invoice: IInvoice & { clientId: IClient };
		organization: IOrganization;
	}

	let { invoice, organization }: Props = $props();

	const client = invoice.clientId as IClient;
	const accentColor = organization.templateSettings?.accentColor || '#2563eb';

	// Darken the accent slightly for text-on-white uses
	const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
		draft: { bg: 'rgba(255,255,255,0.15)', color: '#ffffff', label: 'Draft' },
		scheduled: { bg: 'rgba(255,255,255,0.2)', color: '#ffffff', label: 'Scheduled' },
		sent: { bg: 'rgba(255,255,255,0.2)', color: '#ffffff', label: 'Sent' },
		paid: { bg: '#d1fae5', color: '#065f46', label: 'Paid' },
		overdue: { bg: '#fee2e2', color: '#991b1b', label: 'Overdue' },
		cancelled: { bg: 'rgba(255,255,255,0.15)', color: '#ffffff', label: 'Cancelled' }
	};

	const statusStyle = STATUS_STYLES[invoice.status] ?? STATUS_STYLES.draft;
	const hasPerLineTax = invoice.lineItems.some((item) => item.taxRate !== invoice.taxRate);

	const customFieldEntries = Array.from(
		(invoice.customFields as Map<string, unknown>).entries?.() ??
			Object.entries(invoice.customFields as Record<string, unknown>)
	);

	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatCurrency(amount: number, currency: string): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency,
			minimumFractionDigits: 2
		}).format(amount);
	}
</script>

<div style="min-height:297mm;">

	<!-- Accent Header -->
	<div style="background:{accentColor};padding:32px 48px;display:flex;justify-content:space-between;align-items:center;">
		<div>
			{#if organization.logo}
				<img
					src={organization.logo}
					alt="{organization.name} logo"
					style="max-height:52px;max-width:180px;object-fit:contain;display:block;"
				/>
				<p style="font-size:13px;color:rgba(255,255,255,0.75);margin:8px 0 0 0;">{organization.name}</p>
			{:else}
				<p style="font-size:22px;font-weight:700;color:#ffffff;margin:0;">{organization.name}</p>
			{/if}
		</div>
		<div style="text-align:right;">
			<p style="font-size:26px;font-weight:700;color:#ffffff;letter-spacing:2px;margin:0 0 4px 0;">
				INVOICE
			</p>
			<p style="font-size:15px;color:rgba(255,255,255,0.85);font-weight:500;margin:0 0 10px 0;">
				{invoice.number}
			</p>
			<span
				style="display:inline-block;padding:4px 12px;border-radius:4px;font-size:11px;font-weight:600;background:{statusStyle.bg};color:{statusStyle.color};border:1px solid rgba(255,255,255,0.3);"
			>
				{statusStyle.label}
			</span>
		</div>
	</div>

	<!-- Body -->
	<div style="padding:40px 48px;">

		<!-- Parties row -->
		<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;">
			<!-- From -->
			<div style="border:1px solid #e5e7eb;border-radius:8px;padding:20px 24px;">
				<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:{accentColor};margin:0 0 10px 0;">
					From
				</p>
				<p style="font-size:14px;font-weight:700;color:#111827;margin:0 0 6px 0;">{organization.name}</p>
				{#if organization.taxId}
					<p style="font-size:12px;color:#6b7280;margin:0 0 3px 0;">Tax ID: {organization.taxId}</p>
				{/if}
				{#if organization.address}
					<p style="font-size:12px;color:#6b7280;margin:0 0 3px 0;">{organization.address}</p>
				{/if}
				{#if organization.country}
					<p style="font-size:12px;color:#6b7280;margin:0;">{organization.country}</p>
				{/if}
			</div>

			<!-- Bill To -->
			<div style="border:1px solid #e5e7eb;border-radius:8px;padding:20px 24px;border-left:3px solid {accentColor};">
				<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:{accentColor};margin:0 0 10px 0;">
					Bill To
				</p>
				<p style="font-size:14px;font-weight:700;color:#111827;margin:0 0 6px 0;">{client.name}</p>
				{#if client.taxId}
					<p style="font-size:12px;color:#6b7280;margin:0 0 3px 0;">Tax ID: {client.taxId}</p>
				{/if}
				{#if client.address}
					<p style="font-size:12px;color:#6b7280;margin:0 0 3px 0;">{client.address}</p>
				{/if}
				{#if client.country}
					<p style="font-size:12px;color:#6b7280;margin:0 0 3px 0;">{client.country}</p>
				{/if}
				{#if client.email}
					<p style="font-size:12px;color:#6b7280;margin:0;">{client.email}</p>
				{/if}
			</div>
		</div>

		<!-- Dates band -->
		<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;margin-bottom:32px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
			<div style="padding:14px 20px;border-right:1px solid #e5e7eb;">
				<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin:0 0 4px 0;">
					Issue Date
				</p>
				<p style="font-size:13px;font-weight:500;color:#111827;margin:0;">{formatDate(invoice.issueDate)}</p>
			</div>
			<div style="padding:14px 20px;border-right:1px solid #e5e7eb;">
				<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin:0 0 4px 0;">
					Due Date
				</p>
				<p style="font-size:13px;font-weight:600;color:{accentColor};margin:0;">{formatDate(invoice.dueDate)}</p>
			</div>
			<div style="padding:14px 20px;">
				<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin:0 0 4px 0;">
					Currency
				</p>
				<p style="font-size:13px;font-weight:500;color:#111827;margin:0;">{invoice.currency}</p>
			</div>
		</div>

		<!-- Line Items -->
		<table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
			<thead>
				<tr style="background:{accentColor};">
					<th style="padding:11px 16px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#ffffff;">
						Description
					</th>
					<th style="padding:11px 16px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#ffffff;width:60px;">
						Qty
					</th>
					<th style="padding:11px 16px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#ffffff;width:100px;">
						Unit Price
					</th>
					{#if hasPerLineTax}
						<th style="padding:11px 16px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#ffffff;width:60px;">
							Tax
						</th>
					{/if}
					<th style="padding:11px 16px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#ffffff;width:100px;">
						Total
					</th>
				</tr>
			</thead>
			<tbody>
				{#each invoice.lineItems as item, i (i)}
					<tr style="background:{i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
						<td style="padding:11px 16px;font-size:13px;color:#1f2937;border-bottom:1px solid #e5e7eb;">
							{item.description}
						</td>
						<td style="padding:11px 16px;font-size:13px;color:#6b7280;text-align:right;border-bottom:1px solid #e5e7eb;">
							{item.qty}
						</td>
						<td style="padding:11px 16px;font-size:13px;color:#6b7280;text-align:right;border-bottom:1px solid #e5e7eb;">
							{formatCurrency(item.unitPrice, invoice.currency)}
						</td>
						{#if hasPerLineTax}
							<td style="padding:11px 16px;font-size:13px;color:#6b7280;text-align:right;border-bottom:1px solid #e5e7eb;">
								{(item.taxRate * 100).toFixed(2)}%
							</td>
						{/if}
						<td style="padding:11px 16px;font-size:13px;font-weight:600;color:#1f2937;text-align:right;border-bottom:1px solid #e5e7eb;">
							{formatCurrency(item.total, invoice.currency)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<!-- Totals -->
		<div style="margin-top:24px;display:flex;justify-content:flex-end;">
			<div style="width:280px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
				<div style="display:flex;justify-content:space-between;padding:10px 16px;border-bottom:1px solid #e5e7eb;">
					<span style="font-size:13px;color:#6b7280;">Subtotal</span>
					<span style="font-size:13px;font-weight:500;color:#111827;">
						{formatCurrency(invoice.subtotal, invoice.currency)}
					</span>
				</div>
				<div style="display:flex;justify-content:space-between;padding:10px 16px;border-bottom:1px solid #e5e7eb;">
					<span style="font-size:13px;color:#6b7280;">
						Tax{!hasPerLineTax && invoice.taxRate ? ` (${(invoice.taxRate * 100).toFixed(2)}%)` : ''}
					</span>
					<span style="font-size:13px;font-weight:500;color:#111827;">
						{formatCurrency(invoice.taxAmount, invoice.currency)}
					</span>
				</div>
				<div style="display:flex;justify-content:space-between;padding:14px 16px;background:{accentColor};">
					<span style="font-size:15px;font-weight:700;color:#ffffff;">Total</span>
					<span style="font-size:15px;font-weight:700;color:#ffffff;">
						{formatCurrency(invoice.totalAmount, invoice.currency)}
					</span>
				</div>
			</div>
		</div>

		<!-- Custom Fields -->
		{#if customFieldEntries.length > 0}
			<div style="margin-top:32px;padding:20px 24px;border:1px solid #e5e7eb;border-radius:8px;">
				<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin:0 0 14px 0;">
					Additional Information
				</p>
				<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
					{#each customFieldEntries as [key, value] (key)}
						<div>
							<p style="font-size:11px;font-weight:500;color:#9ca3af;margin:0 0 2px 0;text-transform:capitalize;">
								{key}
							</p>
							<p style="font-size:13px;color:#374151;margin:0;">{value}</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Footer -->
		<div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;">
			{#if invoice.paymentMethod}
				<div style="margin-bottom:10px;">
					<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin:0 0 3px 0;">
						Payment Method
					</p>
					<p style="font-size:13px;color:#374151;margin:0;">{invoice.paymentMethod}</p>
				</div>
			{/if}
			{#if invoice.paymentUrl}
				<div style="margin-bottom:10px;">
					<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin:0 0 3px 0;">
						Payment Link
					</p>
					<p style="font-size:13px;color:{accentColor};margin:0;">{invoice.paymentUrl}</p>
				</div>
			{/if}
			<p style="font-size:11px;color:#9ca3af;margin:12px 0 0 0;">Thank you for your business.</p>
		</div>

	</div>
</div>
