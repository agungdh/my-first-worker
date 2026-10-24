import type { Context } from "hono";
import type { Services } from "./container";

export type AppContext = Context<{ Bindings: Env; Variables: { services: Services } }>;