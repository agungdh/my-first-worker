import type { Sort } from "../../shared/pagination";

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

export interface PangkatGolonganFilter {
	id?: number;
	sort: Sort;
}
