import type { HonoOpenAPIRouterType } from "chanfana";
import { requireRole } from "../shared/auth";
import { registerBidangRoutes } from "../modules/bidang/bidang.routes";
import { registerPangkatGolonganRoutes } from "../modules/pangkat-golongan/pangkat-golongan.routes";
import { registerPegawaiRoutes } from "../modules/pegawai/pegawai.routes";

const adminOnlyPaths = [
	"/api/pegawai",
	"/api/pegawai/*",
	"/api/bidang",
	"/api/bidang/*",
	"/api/pangkat-golongan",
	"/api/pangkat-golongan/*",
];

export function registerRoutes(openapi: HonoOpenAPIRouterType<any>) {
	for (const path of adminOnlyPaths) {
		openapi.use(path, requireRole("admin"));
	}

	registerPegawaiRoutes(openapi);
	registerBidangRoutes(openapi);
	registerPangkatGolonganRoutes(openapi);
}
