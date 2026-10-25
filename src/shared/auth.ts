import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { MiddlewareHandler } from "hono";
import { sign, verify } from "hono/jwt";
import type { AppContext, AppEnv } from "./types";

export const AUTH_COOKIE = "access_token";
export const AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface AuthPayload {
	id: number;
	username: string;
}

const cookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: "Lax",
	path: "/",
	maxAge: AUTH_TOKEN_TTL_SECONDS,
} as const;

export async function signAuthToken(secret: string, payload: AuthPayload): Promise<string> {
	const now = Math.floor(Date.now() / 1000);

	return sign(
		{
			sub: payload.id,
			username: payload.username,
			iat: now,
			exp: now + AUTH_TOKEN_TTL_SECONDS,
		},
		secret,
	);
}

export async function verifyAuthToken(secret: string, token: string): Promise<AuthPayload | null> {
	try {
		const payload = await verify(token, secret, "HS256");
		if (typeof payload.sub !== "number" || typeof payload.username !== "string") return null;
		return { id: payload.sub, username: payload.username };
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
	"POST /api/auth/register",
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

	const payload = token ? await verifyAuthToken(c.env.JWT_SECRET, token) : null;
	if (!payload) return unauthorized(c);

	const user = await c.get("services").users.find(payload.id);
	if (!user) return unauthorized(c);

	c.set("user", user);
	await next();
};

function unauthorized(c: AppContext) {
	return c.json({ success: false, errors: [{ code: 7003, message: "Unauthorized" }] }, 401);
}
