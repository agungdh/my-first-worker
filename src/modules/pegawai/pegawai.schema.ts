import { z } from "zod";
import {
	CursorSchema,
	CursorValueSchema,
	SortOrderSchema,
} from "../../shared/pagination";
import {
	KATEGORI_JABATAN,
	KATEGORI_KEBUTUHAN_JAM_PELATIHAN,
	NIP_PATTERN,
	PEGAWAI_ROLES,
	PEGAWAI_STATUSES,
	SEARCH_MIN_LENGTH,
} from "./pegawai.constants";

const PasswordSchema = z.union([z.string().trim().min(8).max(128), z.literal("")]).optional();

const NullableText = z.string().trim().max(150).nullable();
const NullableKategoriJabatan = z.enum(KATEGORI_JABATAN).nullable();
const NullableKategoriKebutuhanJamPelatihan = z.enum(KATEGORI_KEBUTUHAN_JAM_PELATIHAN).nullable();

export const LoginSchema = z.strictObject({
	nip: z.string().trim().min(1).max(20),
	password: z.string().min(1).max(128),
});

export const PegawaiCreateSchema = z.strictObject({
	nip: z.string().trim().regex(NIP_PATTERN, "NIP must be 8-20 digits"),
	nama: z.string().trim().min(1).max(150),
	role: z.enum(PEGAWAI_ROLES),
	status: z.enum(PEGAWAI_STATUSES),
	bidang_id: z.number().int().positive(),
	pangkat_golongan_id: z.number().int().positive().nullable().optional(),
	jabatan: NullableText.optional(),
	peran: NullableText.optional(),
	kategori_jabatan: NullableKategoriJabatan.optional(),
	kategori_kebutuhan_jam_pelatihan: NullableKategoriKebutuhanJamPelatihan.optional(),
	password: PasswordSchema,
});

export const PegawaiUpdateSchema = z.strictObject({
	nip: z.string().trim().regex(NIP_PATTERN, "NIP must be 8-20 digits"),
	nama: z.string().trim().min(1).max(150),
	role: z.enum(PEGAWAI_ROLES),
	status: z.enum(PEGAWAI_STATUSES),
	bidang_id: z.number().int().positive(),
	pangkat_golongan_id: z.number().int().positive().nullable(),
	jabatan: NullableText,
	peran: NullableText,
	kategori_jabatan: NullableKategoriJabatan,
	kategori_kebutuhan_jam_pelatihan: NullableKategoriKebutuhanJamPelatihan,
	password: PasswordSchema,
});

export const PegawaiListQuerySchema = z.object({
	cursor: CursorSchema.optional().describe("Id of the last item from the previous page"),
	cursor_value: CursorValueSchema.optional().describe(
		"Sort value of the last item; required when sort is not id",
	),
	sort: z.enum(["id", "nama", "nip"]).default("id").describe("Sort column"),
	order: SortOrderSchema.describe("Sort direction"),
	search: z
		.string()
		.trim()
		.min(SEARCH_MIN_LENGTH, `Search must be at least ${SEARCH_MIN_LENGTH} characters`)
		.max(100)
		.optional(),
	role: z.enum(PEGAWAI_ROLES).optional(),
	status: z.enum(PEGAWAI_STATUSES).optional(),
	bidang_id: z.number().int().positive().optional(),
	pangkat_golongan_id: z.number().int().positive().optional(),
	kategori_jabatan: z.enum(KATEGORI_JABATAN).optional(),
	kategori_kebutuhan_jam_pelatihan: z.enum(KATEGORI_KEBUTUHAN_JAM_PELATIHAN).optional(),
});

export const BidangRefSchema = z.object({
	id: z.number(),
	bidang: z.string(),
});

export const PangkatGolonganRefSchema = z.object({
	id: z.number(),
	jenjang: z.string(),
	pangkat: z.string(),
	golongan: z.string(),
	ruang: z.string(),
});

export const PegawaiSchema = z.object({
	id: z.number(),
	nip: z.string(),
	nama: z.string(),
	role: z.enum(PEGAWAI_ROLES),
	status: z.enum(PEGAWAI_STATUSES),
	jabatan: z.string().nullable(),
	peran: z.string().nullable(),
	kategori_jabatan: z.enum(KATEGORI_JABATAN).nullable(),
	kategori_kebutuhan_jam_pelatihan: z.enum(KATEGORI_KEBUTUHAN_JAM_PELATIHAN).nullable(),
	bidang: BidangRefSchema,
	pangkat_golongan: PangkatGolonganRefSchema.nullable(),
});

export const PegawaiListSchema = z.object({
	success: z.boolean(),
	pegawai: PegawaiSchema.array(),
	next_cursor: z.number().nullable(),
	has_more: z.boolean(),
});
