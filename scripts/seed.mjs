#!/usr/bin/env node
/**
 * Seeds master data (bidang + pangkat golongan) and the first admin account.
 * Idempotent: existing live rows are left untouched.
 *
 * Usage:
 *   npm run seed          # local D1
 *   npm run seed:remote   # remote D1
 *
 * Env overrides: ADMIN_NIP, ADMIN_NAMA, ADMIN_PASSWORD (defaults to ADMIN_NIP).
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

const salt = randomBytes(16);
const hash = pbkdf2Sync(adminPassword, salt, ITERATIONS, 32, "sha256");
const passwordHash = `pbkdf2_sha256$${ITERATIONS}$${salt.toString("base64")}$${hash.toString("base64")}`;

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
SELECT ${q(adminNip)}, ${q(adminNama)}, ${q(passwordHash)}, 'admin', 'aktif', b.id, 'Administrator', ${now}, ${now}
FROM bidangs b
WHERE lower(b.bidang) = lower(${q(BIDANGS[0])})
  AND b.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM users WHERE lower(nip) = lower(${q(adminNip)}) AND deleted_at IS NULL
  );`,
];

const dir = mkdtempSync(join(tmpdir(), "seed-"));
const file = join(dir, "seed.sql");
writeFileSync(file, statements.join("\n"));

console.log(
	`Seeding ${remote ? "remote" : "local"} database. Admin NIP: ${adminNip} (password: ${
		process.env.ADMIN_PASSWORD ? "from ADMIN_PASSWORD" : "same as NIP"
	})`,
);

execFileSync(
	"npx",
	["wrangler", "d1", "execute", DATABASE, remote ? "--remote" : "--local", "--file", file, "-y"],
	{ stdio: "inherit" },
);
