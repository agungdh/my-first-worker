import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { MiddlewareHandler } from "hono";
import { sign, verify } from "hono/jwt";
import type { AppContext, AppEnv } from "./types";
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

/**
 * The token only carries the pegawai id. Everything else is resolved from the
 * database on each request, so a stale or forged claim can never grant a role.
 */
export async function signAuthToken(secret: string, userId: number): Promise<string> {
	const now = Math.floor(Date.now() / 1000);

	return sign(
		{
			sub: userId,
			iat: now,
			exp: now + AUTH_TOKEN_TTL_SECONDS,
		},
		secret,
	);
}

export async function verifyAuthToken(secret: string, token: string): Promise<number | null> {
	try {
		const payload = await verify(token, secret, "HS256");

		return typeof payload.sub === "number" ? payload.sub : null;
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
	const userId = token ? await verifyAuthToken(c.env.JWT_SECRET, token) : null;
	if (userId === null) return unauthorized(c);

	// The principal is always read from the database: deleted or deactivated
	// pegawai lose access immediately, without waiting for the token to expire.
	const user = await c.get("services").pegawai.principal(userId);
	if (!user) return unauthorized(c);

	c.set("user", user);
	await next();
};

/**
 * Role guard for authenticated routes. `requireAuth` already resolved the
 * principal from the database, so this only reads `c.get("user")`.
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
