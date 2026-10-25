import type { Context } from "hono";
import type { Services } from "./container";
import type { PegawaiAuth } from "../modules/pegawai/pegawai.domain";

export interface AppVariables {
	services: Services;
	user: PegawaiAuth | null;
}

export type AppEnv = { Bindings: Env; Variables: AppVariables };

export type AppContext = Context<AppEnv>;
