import type { SortOrder } from "../../shared/pagination";

export interface Bidang {
	id: number;
	bidang: string;
}

export interface BidangInput {
	bidang: string;
}

export interface BidangFilter {
	cursor?: number;
	order: SortOrder;
}
