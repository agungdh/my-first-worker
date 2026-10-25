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

app.use(
	"*",
	cors({
		origin: (origin) => (localOrigin.test(origin) ? origin : undefined),
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

app.use("*", requireAuth);

app.onError(handleError);
app.notFound(handleNotFound);

const openapi = fromHono(app, {
	docs_url: "/",
});

registerRoutes(openapi);

export default app;