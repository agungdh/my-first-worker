import type { Sort } from "../../shared/pagination";

export interface Bidang {
	id: number;
	bidang: string;
}

export interface BidangInput {
	bidang: string;
}

export interface BidangFilter {
	id?: number;
	sort: Sort;
}
