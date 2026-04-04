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

	const accentColor = organization.templateSettings?.accentColor || '#1a1a2e';

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

<div style="padding:40px 48px;min-height:297mm;">

	<!-- Header -->
	<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid {accentColor};">
		<div>
			{#if organization.logo}
				<img
					src={organization.logo}
					alt="{organization.name} logo"
					style="max-height:60px;max-width:180px;object-fit:contain;"
				/>
			{:else}
				<div style="font-size:22px;font-weight:700;color:{accentColor};">{organization.name}</div>
			{/if}
		</div>
		<div style="text-align:right;">
			<p style="font-size:28px;font-weight:700;color:{accentColor};letter-spacing:-0.5px;margin:0 0 4px 0;">
				INVOICE
			</p>
			<p style="font-size:16px;font-weight:600;color:#374151;margin:0 0 8px 0;">{invoice.number}</p>
			<span
				style="display:inline-block;padding:4px 12px;border-radius:9999px;font-size:11px;font-weight:600;background:{statusStyle.bg};color:{statusStyle.color};"
			>
				{statusStyle.label}
			</span>
		</div>
	</div>

	<!-- Parties -->
	<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px;">
		<!-- From -->
		<div>
			<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:{accentColor};margin:0 0 10px 0;">
				From
			</p>
			<p style="font-size:14px;font-weight:700;color:#111827;margin:0 0 4px 0;">{organization.name}</p>
			{#if organization.taxId}
				<p style="font-size:12px;color:#6b7280;margin:0 0 2px 0;">Tax ID: {organization.taxId}</p>
			{/if}
			{#if organization.address}
				<p style="font-size:12px;color:#6b7280;margin:0 0 2px 0;">{organization.address}</p>
			{/if}
			{#if organization.country}
				<p style="font-size:12px;color:#6b7280;margin:0;">{organization.country}</p>
			{/if}
		</div>

		<!-- Bill To -->
		<div>
			<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:{accentColor};margin:0 0 10px 0;">
				Bill To
			</p>
			<p style="font-size:14px;font-weight:700;color:#111827;margin:0 0 4px 0;">{client.name}</p>
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
	</div>

	<!-- Meta -->
	<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;padding:16px 20px;background:#f9fafb;border-radius:8px;border-left:3px solid {accentColor};">
		<div>
			<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;margin:0 0 4px 0;">
				Issue Date
			</p>
			<p style="font-size:13px;font-weight:500;color:#111827;margin:0;">{formatDate(invoice.issueDate)}</p>
		</div>
		<div>
			<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;margin:0 0 4px 0;">
				Due Date
			</p>
			<p style="font-size:13px;font-weight:500;color:#111827;margin:0;">{formatDate(invoice.dueDate)}</p>
		</div>
		<div>
			<p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;margin:0 0 4px 0;">
				Currency
			</p>
			<p style="font-size:13px;font-weight:500;color:#111827;margin:0;">{invoice.currency}</p>
		</div>
	</div>

	<!-- Line Items -->
	<table style="width:100%;margin-bottom:0;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
		<thead>
			<tr style="background:{accentColor};">
				<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#ffffff;">
					Description
				</th>
				<th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#ffffff;">
					Qty
				</th>
				<th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#ffffff;">
					Unit Price
				</th>
				{#if hasPerLineTax}
					<th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#ffffff;">
						Tax
					</th>
				{/if}
				<th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#ffffff;">
					Total
				</th>
			</tr>
		</thead>
		<tbody>
			{#each invoice.lineItems as item, i (i)}
				<tr style="background:{i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
					<td style="padding:10px 12px;font-size:13px;color:#1f2937;border-bottom:1px solid #e5e7eb;">
						{item.description}
					</td>
					<td style="padding:10px 12px;font-size:13px;color:#6b7280;text-align:right;border-bottom:1px solid #e5e7eb;">
						{item.qty}
					</td>
					<td style="padding:10px 12px;font-size:13px;color:#6b7280;text-align:right;border-bottom:1px solid #e5e7eb;">
						{formatCurrency(item.unitPrice, invoice.currency)}
					</td>
					{#if hasPerLineTax}
						<td style="padding:10px 12px;font-size:13px;color:#6b7280;text-align:right;border-bottom:1px solid #e5e7eb;">
							{(item.taxRate * 100).toFixed(2)}%
						</td>
					{/if}
					<td style="padding:10px 12px;font-size:13px;font-weight:600;color:#1f2937;text-align:right;border-bottom:1px solid #e5e7eb;">
						{formatCurrency(item.total, invoice.currency)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- Totals -->
	<div style="margin-top:24px;display:flex;justify-content:flex-end;">
		<div style="width:280px;">
			<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;">
				<span style="font-size:13px;color:#6b7280;">Subtotal</span>
				<span style="font-size:13px;font-weight:500;color:#111827;">
					{formatCurrency(invoice.subtotal, invoice.currency)}
				</span>
			</div>
			<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;">
				<span style="font-size:13px;color:#6b7280;">
					Tax{!hasPerLineTax && invoice.taxRate ? ` (${(invoice.taxRate * 100).toFixed(2)}%)` : ''}
				</span>
				<span style="font-size:13px;font-weight:500;color:#111827;">
					{formatCurrency(invoice.taxAmount, invoice.currency)}
				</span>
			</div>
			<div style="display:flex;justify-content:space-between;padding:12px 16px;margin-top:4px;background:{accentColor};border-radius:6px;">
				<span style="font-size:15px;font-weight:700;color:#ffffff;">Total</span>
				<span style="font-size:15px;font-weight:700;color:#ffffff;">
					{formatCurrency(invoice.totalAmount, invoice.currency)}
				</span>
			</div>
		</div>
	</div>

	<!-- Custom Fields -->
	{#if customFieldEntries.length > 0}
		<div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb;">
			<p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;margin:0 0 12px 0;">
				Additional Information
			</p>
			<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
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
	<div style="margin-top:48px;padding-top:24px;border-top:1px solid #e5e7eb;">
		{#if invoice.paymentMethod}
			<div style="margin-bottom:12px;">
				<p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;margin:0 0 4px 0;">
					Payment Method
				</p>
				<p style="font-size:13px;color:#374151;margin:0;">{invoice.paymentMethod}</p>
			</div>
		{/if}
		{#if invoice.paymentUrl}
			<div style="margin-bottom:12px;">
				<p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;margin:0 0 4px 0;">
					Payment Link
				</p>
				<p style="font-size:13px;color:{accentColor};margin:0;">{invoice.paymentUrl}</p>
			</div>
		{/if}
		<p style="font-size:11px;color:#9ca3af;margin:0;">Thank you for your business.</p>
	</div>

</div>
