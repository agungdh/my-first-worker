import { fromHono } from "chanfana";
import { Hono } from "hono";
import { registerRoutes } from "./routes";
import { buildServices } from "./shared/container";
import { handleError, handleNotFound } from "./shared/errors";

const app = new Hono<{ Bindings: Env; Variables: { services: ReturnType<typeof buildServices> } }>();

app.use("*", async (c, next) => {
	c.set("services", buildServices(c.env));
	await next();
});

app.onError(handleError);
app.notFound(handleNotFound);

const openapi = fromHono(app, {
	docs_url: "/",
});

registerRoutes(openapi);

export default app;