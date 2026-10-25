import type { SortOrder } from "../../shared/pagination";

export interface Bidang {
	id: number;
	bidang: string;
}

export interface BidangInput {
	bidang: string;
}

export type BidangSort = "id" | "bidang";

export interface BidangFilter {
	id?: number;
	sort: BidangSort;
	order: SortOrder;
}
