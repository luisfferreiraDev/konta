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

	const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
		draft: { bg: '#f3f4f6', color: '#374151', label: 'Draft' },
		scheduled: { bg: '#dbeafe', color: '#1d4ed8', label: 'Scheduled' },
		sent: { bg: '#dbeafe', color: '#1d4ed8', label: 'Sent' },
		paid: { bg: '#d1fae5', color: '#065f46', label: 'Paid' },
		overdue: { bg: '#fee2e2', color: '#991b1b', label: 'Overdue' },
		cancelled: { bg: '#f3f4f6', color: '#6b7280', label: 'Cancelled' }
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

<div style="padding:48px 56px;min-height:297mm;">

	<!-- Header -->
	<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px;">
		<div>
			{#if organization.logo}
				<img
					src={organization.logo}
					alt="{organization.name} logo"
					style="max-height:48px;max-width:160px;object-fit:contain;display:block;"
				/>
			{:else}
				<div style="font-size:18px;font-weight:700;color:#111827;letter-spacing:-0.3px;">
					{organization.name}
				</div>
			{/if}
			{#if organization.taxId}
				<p style="font-size:12px;color:#9ca3af;margin:6px 0 0 0;">Tax ID: {organization.taxId}</p>
			{/if}
			{#if organization.address}
				<p style="font-size:12px;color:#9ca3af;margin:3px 0 0 0;">{organization.address}</p>
			{/if}
			{#if organization.country}
				<p style="font-size:12px;color:#9ca3af;margin:3px 0 0 0;">{organization.country}</p>
			{/if}
		</div>
		<div style="text-align:right;">
			<p style="font-size:30px;font-weight:300;color:#111827;letter-spacing:-0.5px;margin:0 0 4px 0;">
				Invoice
			</p>
			<p style="font-size:14px;color:{accentColor};font-weight:600;margin:0 0 10px 0;">
				{invoice.number}
			</p>
			<span
				style="display:inline-block;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;background:{statusStyle.bg};color:{statusStyle.color};"
			>
				{statusStyle.label}
			</span>
		</div>
	</div>

	<!-- Thin rule -->
	<div style="height:1px;background:#e5e7eb;margin-bottom:40px;"></div>

	<!-- Parties + Dates -->
	<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px;margin-bottom:40px;">
		<!-- From -->
		<div>
			<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 8px 0;">
				From
			</p>
			<p style="font-size:13px;font-weight:600;color:#111827;margin:0;">{organization.name}</p>
		</div>

		<!-- Bill To -->
		<div>
			<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 8px 0;">
				Bill To
			</p>
			<p style="font-size:13px;font-weight:600;color:#111827;margin:0 0 4px 0;">{client.name}</p>
			{#if client.taxId}
				<p style="font-size:12px;color:#6b7280;margin:0 0 2px 0;">Tax ID: {client.taxId}</p>
			{/if}
			{#if client.address}
				<p style="font-size:12px;color:#6b7280;margin:0 0 2px 0;">{client.address}</p>
			{/if}
			{#if client.country}
				<p style="font-size:12px;color:#6b7280;margin:0 0 2px 0;">{client.country}</p>
			{/if}
			{#if client.email}
				<p style="font-size:12px;color:#6b7280;margin:0;">{client.email}</p>
			{/if}
		</div>

		<!-- Dates -->
		<div style="text-align:right;">
			<div style="margin-bottom:14px;">
				<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 4px 0;">
					Issue Date
				</p>
				<p style="font-size:13px;color:#111827;margin:0;">{formatDate(invoice.issueDate)}</p>
			</div>
			<div style="margin-bottom:14px;">
				<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 4px 0;">
					Due Date
				</p>
				<p style="font-size:13px;font-weight:600;color:{accentColor};margin:0;">{formatDate(invoice.dueDate)}</p>
			</div>
			<div>
				<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 4px 0;">
					Currency
				</p>
				<p style="font-size:13px;color:#111827;margin:0;">{invoice.currency}</p>
			</div>
		</div>
	</div>

	<!-- Line Items -->
	<table style="width:100%;border-collapse:collapse;">
		<thead>
			<tr style="border-bottom:2px solid {accentColor};">
				<th style="padding:8px 0;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">
					Description
				</th>
				<th style="padding:8px 0;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">
					Qty
				</th>
				<th style="padding:8px 0;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">
					Unit Price
				</th>
				{#if hasPerLineTax}
					<th style="padding:8px 0;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">
						Tax
					</th>
				{/if}
				<th style="padding:8px 0;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">
					Total
				</th>
			</tr>
		</thead>
		<tbody>
			{#each invoice.lineItems as item, i (i)}
				<tr style="border-bottom:1px solid #f3f4f6;">
					<td style="padding:13px 0;font-size:13px;color:#1f2937;">{item.description}</td>
					<td style="padding:13px 0;font-size:13px;color:#6b7280;text-align:right;">{item.qty}</td>
					<td style="padding:13px 0;font-size:13px;color:#6b7280;text-align:right;">
						{formatCurrency(item.unitPrice, invoice.currency)}
					</td>
					{#if hasPerLineTax}
						<td style="padding:13px 0;font-size:13px;color:#6b7280;text-align:right;">
							{(item.taxRate * 100).toFixed(2)}%
						</td>
					{/if}
					<td style="padding:13px 0;font-size:13px;font-weight:600;color:#1f2937;text-align:right;">
						{formatCurrency(item.total, invoice.currency)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- Totals -->
	<div style="margin-top:24px;display:flex;justify-content:flex-end;">
		<div style="width:260px;">
			<div style="display:flex;justify-content:space-between;padding:6px 0;">
				<span style="font-size:13px;color:#6b7280;">Subtotal</span>
				<span style="font-size:13px;color:#111827;">
					{formatCurrency(invoice.subtotal, invoice.currency)}
				</span>
			</div>
			<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e5e7eb;">
				<span style="font-size:13px;color:#6b7280;">
					Tax{!hasPerLineTax && invoice.taxRate ? ` (${(invoice.taxRate * 100).toFixed(2)}%)` : ''}
				</span>
				<span style="font-size:13px;color:#111827;">
					{formatCurrency(invoice.taxAmount, invoice.currency)}
				</span>
			</div>
			<div style="display:flex;justify-content:space-between;align-items:baseline;padding:12px 0 4px 0;">
				<span style="font-size:14px;font-weight:700;color:#111827;">Total</span>
				<span style="font-size:20px;font-weight:700;color:{accentColor};">
					{formatCurrency(invoice.totalAmount, invoice.currency)}
				</span>
			</div>
		</div>
	</div>

	<!-- Custom Fields -->
	{#if customFieldEntries.length > 0}
		<div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
			<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin:0 0 12px 0;">
				Additional Information
			</p>
			<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
				{#each customFieldEntries as [key, value] (key)}
					<div>
						<p style="font-size:11px;color:#9ca3af;margin:0 0 2px 0;text-transform:capitalize;">{key}</p>
						<p style="font-size:13px;color:#374151;margin:0;">{value}</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Footer -->
	<div style="margin-top:48px;padding-top:20px;border-top:1px solid #f3f4f6;">
		{#if invoice.paymentMethod}
			<p style="font-size:12px;color:#6b7280;margin:0 0 4px 0;">
				<span style="font-weight:600;">Payment Method:</span>
				{invoice.paymentMethod}
			</p>
		{/if}
		{#if invoice.paymentUrl}
			<p style="font-size:12px;margin:0 0 4px 0;">
				<span style="font-weight:600;color:#6b7280;">Payment Link:</span>
				<span style="color:{accentColor};">{invoice.paymentUrl}</span>
			</p>
		{/if}
		<p style="font-size:11px;color:#d1d5db;margin:12px 0 0 0;">Thank you for your business.</p>
	</div>

</div>
