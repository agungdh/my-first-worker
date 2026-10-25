import { and, isNull, type SQL } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";
import { createDb, type Db } from "./index";

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

	/**
	 * D1 has no interactive transactions. `db.batch()` is the only atomic
	 * primitive, so multi-statement writes must go through here.
	 */
	protected writeBatch<U extends BatchItem<"sqlite">, T extends Readonly<[U, ...U[]]>>(queries: T) {
		return this.db.batch(queries);
	}
}
