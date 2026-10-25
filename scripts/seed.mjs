#!/usr/bin/env node
/**
 * Seeds master data (bidang + pangkat golongan), the first admin account, and
 * demo pegawai (100 by default).
 * Idempotent: existing live rows are left untouched.
 *
 * Usage:
 *   npm run seed          # local D1
 *   npm run seed:remote   # remote D1
 *
 * Env overrides:
 *   ADMIN_NIP, ADMIN_NAMA, ADMIN_PASSWORD (defaults to ADMIN_NIP).
 *   SEED_PEGAWAI_COUNT (default 100, set 0 to skip demo pegawai).
 *   SEED_PEGAWAI_PASSWORD (default: each generated NIP).
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pbkdf2Sync, randomBytes } from "node:crypto";

const DATABASE = "my-first-worker-db";
const ITERATIONS = 100_000;

const remote = process.argv.includes("--remote");
const adminNip = process.env.ADMIN_NIP ?? "198001012000011001";
const adminNama = process.env.ADMIN_NAMA ?? "Administrator";
const adminPassword = process.env.ADMIN_PASSWORD ?? adminNip;

const BIDANGS = [
	"KEPALA PERWAKILAN",
	"KEPALA BAGIAN UMUM",
	"SUBBAGIAN KEPEGAWAIAN",
	"SUBBAGIAN KEUANGAN",
	"SUBBAGIAN UMUM",
	"BIDANG PENGAWASAN INSTANSI PEMERINTAH PUSAT",
	"BIDANG AKUNTABILITAS PEMERINTAH DAERAH",
	"BIDANG AKUNTAN NEGARA",
	"BIDANG INVESTIGASI",
	"BIDANG PROGRAM DAN PELAPORAN SERTA PEMBINAAN JFA",
];

const PANGKAT_GOLONGANS = [
	["Juru", "Juru Muda", "I", "a"],
	["Juru", "Juru Muda Tingkat I", "I", "b"],
	["Juru", "Juru", "I", "c"],
	["Juru", "Juru Tingkat I", "I", "d"],
	["Pengatur", "Pengatur Muda", "II", "a"],
	["Pengatur", "Pengatur Muda Tingkat I", "II", "b"],
	["Pengatur", "Pengatur", "II", "c"],
	["Pengatur", "Pengatur Tingkat I", "II", "d"],
	["Penata", "Penata Muda", "III", "a"],
	["Penata", "Penata Muda Tingkat I", "III", "b"],
	["Penata", "Penata", "III", "c"],
	["Penata", "Penata Tingkat I", "III", "d"],
	["Pembina", "Pembina", "IV", "a"],
	["Pembina", "Pembina Tingkat I", "IV", "b"],
	["Pembina Utama", "Pembina Utama Muda", "IV", "c"],
	["Pembina Utama", "Pembina Utama Madya", "IV", "d"],
	["Pembina Utama", "Pembina Utama", "IV", "e"],
];

const NAMA_DEPAN = [
	"Ahmad",
	"Budi",
	"Citra",
	"Dewi",
	"Eko",
	"Fitri",
	"Gita",
	"Hendra",
	"Indra",
	"Joko",
	"Kartika",
	"Lestari",
	"Muhammad",
	"Nur",
	"Oki",
	"Putri",
	"Rahmat",
	"Siti",
	"Taufik",
	"Umi",
	"Vina",
	"Wahyu",
	"Yudi",
	"Zahra",
	"Agus",
];

const NAMA_BELAKANG = [
	"Pratama",
	"Wijaya",
	"Saputra",
	"Hidayat",
	"Kusuma",
	"Nugroho",
	"Permana",
	"Ramadhan",
	"Santoso",
	"Setiawan",
	"Susanto",
	"Utama",
	"Wibowo",
	"Hakim",
	"Firmansyah",
	"Anggraini",
	"Handayani",
	"Maharani",
	"Puspita",
	"Safitri",
];

const JABATANS = [
	"Auditor Muda",
	"Auditor Madya",
	"Auditor Utama",
	"Analis Kepegawaian",
	"Analis Anggaran",
	"Bendahara Pengeluaran",
	"Pengelola Keuangan",
	"Arsiparis",
	"Perencana",
	"Pranata Komputer",
];

const PERANS = ["ketua tim", "anggota tim", "koordinator", "pendukung"];

const KATEGORI_JABATANS = ["struktural", "fungsional auditor", "fungsional tertentu"];
const KATEGORI_KEBUTUHANS = ["admin", "pejabat", "auditor"];

const PEGAWAI_COUNT = Number(process.env.SEED_PEGAWAI_COUNT ?? 100);
const pegawaiPassword = process.env.SEED_PEGAWAI_PASSWORD;

if (!Number.isInteger(PEGAWAI_COUNT) || PEGAWAI_COUNT < 0) {
	throw new Error("SEED_PEGAWAI_COUNT must be a non-negative integer");
}

const pad = (value, length) => String(value).padStart(length, "0");

/** 18-digit NIP: YYYYMMDD (lahir) + YYYYMM (TMT) + jenis kelamin + nomor urut. */
function buildNip(index) {
	const lahir = `${1970 + (index % 30)}${pad(1 + (index % 12), 2)}${pad(1 + (index % 28), 2)}`;
	const tmt = `${2010 + (index % 15)}${pad(1 + ((index * 7) % 12), 2)}`;
	const kelamin = index % 2 === 0 ? "1" : "2";

	return `${lahir}${tmt}${kelamin}${pad(index + 1, 3)}`;
}

function buildPegawai() {
	return Array.from({ length: PEGAWAI_COUNT }, (_, index) => ({
		nip: buildNip(index),
		nama: `${NAMA_DEPAN[index % NAMA_DEPAN.length]} ${
			NAMA_BELAKANG[Math.floor(index / NAMA_DEPAN.length) % NAMA_BELAKANG.length]
		}`,
		status: index % 10 === 9 ? "non_aktif" : "aktif",
		bidang: BIDANGS[index % BIDANGS.length],
		pangkatGolongan: PANGKAT_GOLONGANS[index % PANGKAT_GOLONGANS.length],
		jabatan: JABATANS[index % JABATANS.length],
		peran: PERANS[index % PERANS.length],
		kategoriJabatan: KATEGORI_JABATANS[index % KATEGORI_JABATANS.length],
		kategoriKebutuhan: KATEGORI_KEBUTUHANS[index % KATEGORI_KEBUTUHANS.length],
	}));
}

const PEGAWAI = buildPegawai();

function hashPassword(password) {
	const salt = randomBytes(16);
	const hash = pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256");

	return `pbkdf2_sha256$${ITERATIONS}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

const adminPasswordHash = hashPassword(adminPassword);
const sharedPegawaiPasswordHash = pegawaiPassword ? hashPassword(pegawaiPassword) : null;

const now = Date.now();
const q = (value) => `'${String(value).replace(/'/g, "''")}'`;

const statements = [
	...BIDANGS.map(
		(bidang) => `INSERT INTO bidangs (bidang, created_at, updated_at)
SELECT ${q(bidang)}, ${now}, ${now}
WHERE NOT EXISTS (
  SELECT 1 FROM bidangs WHERE lower(bidang) = lower(${q(bidang)}) AND deleted_at IS NULL
);`,
	),
	...PANGKAT_GOLONGANS.map(
		([jenjang, pangkat, golongan, ruang]) => `INSERT INTO pangkat_golongans (jenjang, pangkat, golongan, ruang, created_at, updated_at)
SELECT ${q(jenjang)}, ${q(pangkat)}, ${q(golongan)}, ${q(ruang)}, ${now}, ${now}
WHERE NOT EXISTS (
  SELECT 1 FROM pangkat_golongans
  WHERE lower(pangkat) = lower(${q(pangkat)})
    AND lower(golongan) = lower(${q(golongan)})
    AND lower(ruang) = lower(${q(ruang)})
    AND deleted_at IS NULL
);`,
	),
	`INSERT INTO users (nip, nama, password_hash, role, status, bidang_id, jabatan, created_at, updated_at)
SELECT ${q(adminNip)}, ${q(adminNama)}, ${q(adminPasswordHash)}, 'admin', 'aktif', b.id, 'Administrator', ${now}, ${now}
FROM bidangs b
WHERE lower(b.bidang) = lower(${q(BIDANGS[0])})
  AND b.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM users WHERE lower(nip) = lower(${q(adminNip)}) AND deleted_at IS NULL
  );`,
	...PEGAWAI.map((pegawai) => {
		const [, pangkat, golongan, ruang] = pegawai.pangkatGolongan;
		const passwordHash = sharedPegawaiPasswordHash ?? hashPassword(pegawai.nip);

		return `INSERT INTO users (nip, nama, password_hash, role, status, bidang_id, pangkat_golongan_id, jabatan, peran, kategori_jabatan, kategori_kebutuhan_jam_pelatihan, created_at, updated_at)
SELECT ${q(pegawai.nip)}, ${q(pegawai.nama)}, ${q(passwordHash)}, 'pegawai', ${q(pegawai.status)}, b.id, p.id, ${q(pegawai.jabatan)}, ${q(pegawai.peran)}, ${q(pegawai.kategoriJabatan)}, ${q(pegawai.kategoriKebutuhan)}, ${now}, ${now}
FROM bidangs b, pangkat_golongans p
WHERE lower(b.bidang) = lower(${q(pegawai.bidang)})
  AND b.deleted_at IS NULL
  AND lower(p.pangkat) = lower(${q(pangkat)})
  AND lower(p.golongan) = lower(${q(golongan)})
  AND lower(p.ruang) = lower(${q(ruang)})
  AND p.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM users WHERE lower(nip) = lower(${q(pegawai.nip)}) AND deleted_at IS NULL
  )
LIMIT 1;`;
	}),
];

const dir = mkdtempSync(join(tmpdir(), "seed-"));
const file = join(dir, "seed.sql");
writeFileSync(file, statements.join("\n"));

console.log(
	`Seeding ${remote ? "remote" : "local"} database. Admin NIP: ${adminNip} (password: ${
		process.env.ADMIN_PASSWORD ? "from ADMIN_PASSWORD" : "same as NIP"
	})`,
);
console.log(
	`Demo pegawai: ${PEGAWAI_COUNT} rows (password: ${
		pegawaiPassword ? "from SEED_PEGAWAI_PASSWORD" : "same as each NIP"
	})`,
);

execFileSync(
	"npx",
	["wrangler", "d1", "execute", DATABASE, remote ? "--remote" : "--local", "--file", file, "-y"],
	{ stdio: "inherit" },
);
