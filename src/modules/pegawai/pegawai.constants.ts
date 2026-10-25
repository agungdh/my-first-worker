export const PEGAWAI_ROLES = ["admin", "pegawai"] as const;
export type Role = (typeof PEGAWAI_ROLES)[number];

export const PEGAWAI_STATUSES = ["aktif", "non_aktif"] as const;
export type Status = (typeof PEGAWAI_STATUSES)[number];

export const KATEGORI_JABATAN = [
	"struktural",
	"fungsional auditor",
	"fungsional tertentu",
] as const;
export type KategoriJabatan = (typeof KATEGORI_JABATAN)[number];

export const KATEGORI_KEBUTUHAN_JAM_PELATIHAN = ["admin", "pejabat", "auditor"] as const;
export type KategoriKebutuhanJamPelatihan = (typeof KATEGORI_KEBUTUHAN_JAM_PELATIHAN)[number];

export const NIP_PATTERN = /^\d{8,20}$/;
export const SEARCH_MIN_LENGTH = 3;
