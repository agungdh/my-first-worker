import type { Sort } from "../../shared/pagination";
import type { Role, Status, KategoriJabatan, KategoriKebutuhanJamPelatihan } from "./pegawai.constants";

export interface BidangRef {
	id: number;
	bidang: string;
}

export interface PangkatGolonganRef {
	id: number;
	jenjang: string;
	pangkat: string;
	golongan: string;
	ruang: string;
}

export interface Pegawai {
	id: number;
	nip: string;
	nama: string;
	role: Role;
	status: Status;
	jabatan: string | null;
	peran: string | null;
	kategoriJabatan: KategoriJabatan | null;
	kategoriKebutuhanJamPelatihan: KategoriKebutuhanJamPelatihan | null;
	bidang: BidangRef;
	pangkatGolongan: PangkatGolonganRef | null;
}

/** Identity carried by the auth token; never includes password material. */
export interface PegawaiAuth {
	id: number;
	nip: string;
	nama: string;
	role: Role;
}

export interface CreatePegawaiInput {
	nip: string;
	nama: string;
	role: Role;
	status: Status;
	bidangId: number;
	pangkatGolonganId: number | null;
	jabatan: string | null;
	peran: string | null;
	kategoriJabatan: KategoriJabatan | null;
	kategoriKebutuhanJamPelatihan: KategoriKebutuhanJamPelatihan | null;
	/** Empty or missing means "use the NIP" on create. */
	password?: string;
}

export interface UpdatePegawaiInput {
	nip: string;
	nama: string;
	role: Role;
	status: Status;
	bidangId: number;
	pangkatGolonganId: number | null;
	jabatan: string | null;
	peran: string | null;
	kategoriJabatan: KategoriJabatan | null;
	kategoriKebutuhanJamPelatihan: KategoriKebutuhanJamPelatihan | null;
	/** Empty or missing keeps the current password. */
	password?: string;
}

export interface PegawaiFilter {
	id?: number;
	sort: Sort;
	search?: string;
	role?: Role;
	status?: Status;
	bidangId?: number;
	pangkatGolonganId?: number;
	kategoriJabatan?: KategoriJabatan;
	kategoriKebutuhanJamPelatihan?: KategoriKebutuhanJamPelatihan;
}

export interface LoginInput {
	nip: string;
	password: string;
}
