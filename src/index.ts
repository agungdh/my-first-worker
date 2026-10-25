import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { registerRoutes } from "./routes";
import { buildServices } from "./shared/container";
import { handleError, handleNotFound } from "./shared/errors";
import { requireAuth } from "./shared/auth";
import type { AppEnv } from "./shared/types";

const app = new Hono<AppEnv>();

const localOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function parseOrigins(value: string | undefined): string[] {
	return (value ?? "")
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean);
}

app.use(
	"*",
	cors({
		origin: (origin, c) => {
			if (!origin) return undefined;

			const configured = parseOrigins(c.env.CORS_ORIGINS);
			const allowed =
				configured.length > 0 ? configured.includes(origin) : localOrigin.test(origin);

			return allowed ? origin : undefined;
		},
		credentials: true,
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type"],
		maxAge: 600,
	}),
);

app.use("*", async (c, next) => {
	c.set("services", buildServices(c.env));
	await next();
});

const DOCS_PATHS = new Set(["/", "/redocs", "/openapi.json", "/openapi.yaml"]);

// Docs (Swagger UI, ReDoc, OpenAPI schema) are a development-only feature.
// In production those paths answer a lightweight health check instead.
app.use("*", async (c, next) => {
	if (c.env.ENVIRONMENT !== "development" && DOCS_PATHS.has(c.req.path)) {
		return c.json({ success: true }, 200);
	}

	await next();
});

app.use("*", requireAuth);

app.onError(handleError);
app.notFound(handleNotFound);

const openapi = fromHono(app, {
	docs_url: "/",
});

registerRoutes(openapi);

export default app;