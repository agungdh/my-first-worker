import { fromHono } from "chanfana";
import { Hono } from "hono";
import { registerRoutes } from "./routes";
import { buildServices } from "./shared/container";
import { handleError, handleNotFound } from "./shared/errors";
import { requireAuth } from "./shared/auth";
import type { AppEnv } from "./shared/types";

const app = new Hono<AppEnv>();

app.use("*", async (c, next) => {
	c.set("services", buildServices(c.env));
	await next();
});

app.use("/api/tasks/*", requireAuth);
app.use("/api/auth/me", requireAuth);

app.onError(handleError);
app.notFound(handleNotFound);

const openapi = fromHono(app, {
	docs_url: "/",
});

registerRoutes(openapi);

export default app;