import type { SortOrder } from "../../shared/pagination";

export interface PangkatGolongan {
	id: number;
	jenjang: string;
	pangkat: string;
	golongan: string;
	ruang: string;
}

export interface PangkatGolonganInput {
	jenjang: string;
	pangkat: string;
	golongan: string;
	ruang: string;
}

export type PangkatGolonganSort = "id" | "jenjang" | "pangkat" | "golongan" | "ruang";

export interface PangkatGolonganFilter {
	cursor?: number;
	cursorValue?: string;
	sort: PangkatGolonganSort;
	order: SortOrder;
}
