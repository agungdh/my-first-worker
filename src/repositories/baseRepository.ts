import { and, isNull, type SQL } from "drizzle-orm";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";
import { createDb, type Db } from "../db";

export type SoftDeleteTable = SQLiteTable & { deletedAt: SQLiteColumn };

export abstract class BaseRepository<TTable extends SoftDeleteTable> {
	protected readonly db: Db;

	constructor(
		d1: D1Database,
		protected readonly table: TTable,
	) {
		this.db = createDb(d1);
	}

	protected liveWhere(...conditions: (SQL | undefined)[]) {
		return and(isNull(this.table.deletedAt), ...conditions);
	}
}
