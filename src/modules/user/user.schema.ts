import { z } from "zod";

export const UserRegisterSchema = z.strictObject({
	username: z
		.string()
		.min(3)
		.max(32)
		.regex(/^[a-zA-Z0-9_.-]+$/, "Username may only contain letters, numbers, dot, underscore and hyphen"),
	name: z.string().min(1).max(100),
	password: z.string().min(8).max(128),
});

export const UserLoginSchema = z.strictObject({
	username: z.string().min(1),
	password: z.string().min(1),
});

export const UserSchema = z.object({
	id: z.number(),
	username: z.string(),
	name: z.string(),
});
