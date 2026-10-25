import type { Context } from "hono";
import type { Services } from "./container";
import type { User } from "../modules/user/user.domain";

export interface AppVariables {
	services: Services;
	user: User | null;
}

export type AppEnv = { Bindings: Env; Variables: AppVariables };

export type AppContext = Context<AppEnv>;
