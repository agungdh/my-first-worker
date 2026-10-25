/**
 * Business/transaction timestamps are stored as epoch seconds.
 * Audit columns stay in epoch milliseconds (see `src/db/audit.ts`).
 */
export function nowSeconds(): number {
	return Math.floor(Date.now() / 1000);
}

export function toSeconds(date: Date): number {
	return Math.floor(date.getTime() / 1000);
}

export function fromSeconds(seconds: number): Date {
	return new Date(seconds * 1000);
}
