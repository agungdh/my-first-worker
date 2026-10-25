import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { MiddlewareHandler } from "hono";
import { sign, verify } from "hono/jwt";
import type { AppContext, AppEnv } from "./types";
import type { PegawaiAuth } from "../modules/pegawai/pegawai.domain";
import type { Role } from "../modules/pegawai/pegawai.constants";

export const AUTH_COOKIE = "access_token";
export const AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

const cookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: "Lax",
	path: "/",
	maxAge: AUTH_TOKEN_TTL_SECONDS,
} as const;

export async function signAuthToken(secret: string, user: PegawaiAuth): Promise<string> {
	const now = Math.floor(Date.now() / 1000);

	return sign(
		{
			sub: user.id,
			nip: user.nip,
			nama: user.nama,
			role: user.role,
			iat: now,
			exp: now + AUTH_TOKEN_TTL_SECONDS,
		},
		secret,
	);
}

export async function verifyAuthToken(secret: string, token: string): Promise<PegawaiAuth | null> {
	try {
		const payload = await verify(token, secret, "HS256");
		return {
			id: payload.sub as number,
			nip: payload.nip as string,
			nama: payload.nama as string,
			role: payload.role as Role,
		};
	} catch {
		return null;
	}
}

export function setAuthCookie(c: AppContext, token: string): void {
	setCookie(c, AUTH_COOKIE, token, cookieOptions);
}

export function clearAuthCookie(c: AppContext): void {
	deleteCookie(c, AUTH_COOKIE, cookieOptions);
}

export function getAuthToken(c: AppContext): string | undefined {
	return getCookie(c, AUTH_COOKIE);
}

const publicRoutes = new Set([
	"POST /api/auth/login",
	"POST /api/auth/logout",
	"GET /",
	"GET /redocs",
	"GET /openapi.json",
	"GET /openapi.yaml",
]);

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
	if (publicRoutes.has(`${c.req.method} ${c.req.path}`)) return next();

	const token = getAuthToken(c);

	const user = token ? await verifyAuthToken(c.env.JWT_SECRET, token) : null;
	if (!user) return unauthorized(c);

	c.set("user", user);
	await next();
};

/**
 * Role guard for authenticated routes. Reads the role from the token claims,
 * so it never hits the database.
 */
export function requireRole(...roles: Role[]): MiddlewareHandler<AppEnv> {
	return async (c, next) => {
		const user = c.get("user");
		if (!user || !roles.includes(user.role)) return forbidden(c);

		await next();
	};
}

function unauthorized(c: AppContext) {
	return c.json({ success: false, errors: [{ code: 7003, message: "Unauthorized" }] }, 401);
}

function forbidden(c: AppContext) {
	return c.json({ success: false, errors: [{ code: 7005, message: "Forbidden" }] }, 403);
}
