import { type HonoOpenAPIRouterType, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../shared/types";
import { success, SuccessSchema } from "../../shared/http";
import { setAuthCookie, clearAuthCookie, signAuthToken } from "../../shared/auth";
import {
	LoginSchema,
	PegawaiCreateSchema,
	PegawaiListQuerySchema,
	PegawaiListSchema,
	PegawaiSchema,
	PegawaiUpdateSchema,
} from "./pegawai.schema";
import type { CreatePegawaiInput, Pegawai, UpdatePegawaiInput } from "./pegawai.domain";

class PegawaiLogin extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Login and set the auth cookie",
		request: {
			body: {
				content: {
					"application/json": {
						schema: LoginSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Returns the authenticated pegawai and sets the auth cookie",
				content: {
					"application/json": {
						schema: z.object({ success: z.boolean(), user: PegawaiSchema }),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const user = await c.get("services").pegawai.login(data.body);

		const token = await signAuthToken(c.env.JWT_SECRET, user.id);
		setAuthCookie(c, token);

		return c.json(success({ user: toPegawaiResponse(user) }));
	}
}

class PegawaiLogout extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Clear the auth cookie",
		responses: {
			"200": {
				description: "Auth cookie cleared",
				content: {
					"application/json": {
						schema: SuccessSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		clearAuthCookie(c);

		return c.json(success({}));
	}
}

class PegawaiList extends OpenAPIRoute {
	schema = {
		tags: ["Pegawai"],
		summary: "List pegawai",
		request: {
			query: PegawaiListQuerySchema,
		},
		responses: {
			"200": {
				description: "Returns a page of pegawai",
				content: {
					"application/json": {
						schema: PegawaiListSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const query = data.query;

		const page = await c.get("services").pegawai.list({
			cursor: query.cursor,
			cursorValue: query.cursor_value,
			sort: query.sort,
			order: query.order,
			search: query.search,
			role: query.role,
			status: query.status,
			bidangId: query.bidang_id,
			pangkatGolonganId: query.pangkat_golongan_id,
			kategoriJabatan: query.kategori_jabatan,
			kategoriKebutuhanJamPelatihan: query.kategori_kebutuhan_jam_pelatihan,
		});

		return success({
			pegawai: page.items.map(toPegawaiResponse),
			next_cursor: page.nextCursor,
			has_more: page.hasMore,
		});
	}
}

class PegawaiFetch extends OpenAPIRoute {
	schema = {
		tags: ["Pegawai"],
		summary: "Get a pegawai by id",
		request: {
			params: z.object({
				pegawaiId: z.number().describe("Pegawai id"),
			}),
		},
		responses: {
			"200": {
				description: "Returns the pegawai",
				content: {
					"application/json": {
						schema: z.object({ success: z.boolean(), pegawai: PegawaiSchema }),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const pegawai = await c.get("services").pegawai.get(data.params.pegawaiId);

		return success({ pegawai: toPegawaiResponse(pegawai) });
	}
}

class PegawaiCreate extends OpenAPIRoute {
	schema = {
		tags: ["Pegawai"],
		summary: "Create a pegawai",
		request: {
			body: {
				content: {
					"application/json": {
						schema: PegawaiCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Pegawai created",
				content: {
					"application/json": {
						schema: SuccessSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const body = data.body;

		const input: CreatePegawaiInput = {
			nip: body.nip,
			nama: body.nama,
			role: body.role,
			status: body.status,
			bidangId: body.bidang_id,
			pangkatGolonganId: body.pangkat_golongan_id ?? null,
			jabatan: body.jabatan || null,
			peran: body.peran || null,
			kategoriJabatan: body.kategori_jabatan ?? null,
			kategoriKebutuhanJamPelatihan: body.kategori_kebutuhan_jam_pelatihan ?? null,
			password: body.password,
		};

		await c.get("services").pegawai.create(input, c.get("user")!.id);

		return c.json(success({}), 201);
	}
}

class PegawaiUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Pegawai"],
		summary: "Replace a pegawai",
		request: {
			params: z.object({
				pegawaiId: z.number().describe("Pegawai id"),
			}),
			body: {
				content: {
					"application/json": {
						schema: PegawaiUpdateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Pegawai updated",
				content: {
					"application/json": {
						schema: SuccessSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const body = data.body;

		const input: UpdatePegawaiInput = {
			nip: body.nip,
			nama: body.nama,
			role: body.role,
			status: body.status,
			bidangId: body.bidang_id,
			pangkatGolonganId: body.pangkat_golongan_id ?? null,
			jabatan: body.jabatan || null,
			peran: body.peran || null,
			kategoriJabatan: body.kategori_jabatan ?? null,
			kategoriKebutuhanJamPelatihan: body.kategori_kebutuhan_jam_pelatihan ?? null,
			password: body.password,
		};

		await c.get("services").pegawai.update(data.params.pegawaiId, input, c.get("user")!.id);

		return success({});
	}
}

class PegawaiDelete extends OpenAPIRoute {
	schema = {
		tags: ["Pegawai"],
		summary: "Delete a pegawai",
		request: {
			params: z.object({
				pegawaiId: z.number().describe("Pegawai id"),
			}),
		},
		responses: {
			"200": {
				description: "Pegawai deleted",
				content: {
					"application/json": {
						schema: SuccessSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		await c.get("services").pegawai.remove(data.params.pegawaiId, c.get("user")!.id);

		return success({});
	}
}

export function registerPegawaiRoutes(openapi: HonoOpenAPIRouterType<any>) {
	openapi.post("/api/auth/login", PegawaiLogin);
	openapi.post("/api/auth/logout", PegawaiLogout);

	openapi.get("/api/pegawai", PegawaiList);
	openapi.get("/api/pegawai/:pegawaiId", PegawaiFetch);
	openapi.post("/api/pegawai", PegawaiCreate);
	openapi.put("/api/pegawai/:pegawaiId", PegawaiUpdate);
	openapi.delete("/api/pegawai/:pegawaiId", PegawaiDelete);
}

function toPegawaiResponse(pegawai: Pegawai) {
	return {
		id: pegawai.id,
		nip: pegawai.nip,
		nama: pegawai.nama,
		role: pegawai.role,
		status: pegawai.status,
		jabatan: pegawai.jabatan,
		peran: pegawai.peran,
		kategori_jabatan: pegawai.kategoriJabatan,
		kategori_kebutuhan_jam_pelatihan: pegawai.kategoriKebutuhanJamPelatihan,
		bidang: pegawai.bidang,
		pangkat_golongan: pegawai.pangkatGolongan,
	};
}
