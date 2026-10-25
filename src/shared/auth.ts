import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { MiddlewareHandler } from "hono";
import { sign, verify } from "hono/jwt";
import type { AppContext, AppEnv } from "./types";
import type { User } from "../modules/user/user.domain";

export const AUTH_COOKIE = "access_token";
export const AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

const cookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: "Lax",
	path: "/",
	maxAge: AUTH_TOKEN_TTL_SECONDS,
} as const;

export async function signAuthToken(secret: string, user: User): Promise<string> {
	const now = Math.floor(Date.now() / 1000);

	return sign(
		{
			sub: user.id,
			username: user.username,
			name: user.name,
			iat: now,
			exp: now + AUTH_TOKEN_TTL_SECONDS,
		},
		secret,
	);
}

export async function verifyAuthToken(secret: string, token: string): Promise<User | null> {
	try {
		const payload = await verify(token, secret, "HS256");
		if (
			typeof payload.sub !== "number" ||
			typeof payload.username !== "string" ||
			typeof payload.name !== "string"
		) {
			return null;
		}

		return { id: payload.sub, username: payload.username, name: payload.name };
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

	const user = token ? await verifyAuthToken(c.env.JWT_SECRET, token) : null;
	if (!user) return unauthorized(c);

	c.set("user", user);
	await next();
};

function unauthorized(c: AppContext) {
	return c.json({ success: false, errors: [{ code: 7003, message: "Unauthorized" }] }, 401);
}
