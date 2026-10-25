import { z } from "zod";

export const ValidationSampleSchema = z.strictObject({
	name: z.string().superRefine((value, ctx) => {
		if (value.length < 3) {
			ctx.addIssue({ code: "custom", message: "name minimal 3 karakter" });
		}
		if (value.length > 50) {
			ctx.addIssue({ code: "custom", message: "name maksimal 50 karakter" });
		}
		if (/\s/.test(value)) {
			ctx.addIssue({ code: "custom", message: "name tidak boleh mengandung spasi" });
		}
		if (!/[A-Z]/.test(value)) {
			ctx.addIssue({ code: "custom", message: "name harus mengandung minimal 1 huruf besar" });
		}
		if (!/[0-9]/.test(value)) {
			ctx.addIssue({ code: "custom", message: "name harus mengandung minimal 1 angka" });
		}
	}),
	email: z.string().superRefine((value, ctx) => {
		if (!value.includes("@")) {
			ctx.addIssue({ code: "custom", message: "email harus mengandung @" });
		}
		if (!value.includes(".")) {
			ctx.addIssue({ code: "custom", message: "email harus mengandung titik" });
		}
		if (value.length > 100) {
			ctx.addIssue({ code: "custom", message: "email maksimal 100 karakter" });
		}
	}),
	password: z.string().superRefine((value, ctx) => {
		if (value.length < 8) {
			ctx.addIssue({ code: "custom", message: "password minimal 8 karakter" });
		}
		if (!/[A-Z]/.test(value)) {
			ctx.addIssue({ code: "custom", message: "password harus mengandung huruf besar" });
		}
		if (!/[a-z]/.test(value)) {
			ctx.addIssue({ code: "custom", message: "password harus mengandung huruf kecil" });
		}
		if (!/[0-9]/.test(value)) {
			ctx.addIssue({ code: "custom", message: "password harus mengandung angka" });
		}
		if (!/[^A-Za-z0-9]/.test(value)) {
			ctx.addIssue({ code: "custom", message: "password harus mengandung simbol" });
		}
	}),
});
