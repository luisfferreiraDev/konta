export const routes = {
	auth: {
		login: () => '/login',
		setup: () => '/setup',
		onboarding: () => '/onboarding',
		dashboard: () => '/dashboard'
	},

	clients: {
		list: () => '/clients',
		new: () => '/clients/new',
		edit: (clientId: string) => `/clients/${clientId}/edit`
	},

	invoices: {
		list: () => '/invoices',
		new: () => '/invoices/new',
		view: (invoiceId: string) => `/invoices/${invoiceId}`,
		edit: (invoiceId: string) => `/invoices/${invoiceId}/edit`
	},

	settings: {
		index: () => '/settings'
	},

	api: {
		invoicePdf: (invoiceId: string) => `/api/invoices/${invoiceId}/pdf`,
		invoicePreview: (invoiceId: string) => `/api/invoices/${invoiceId}/preview`,
		organization: (orgId: string) => `/api/organizations/${orgId}`
	}
} as const;
