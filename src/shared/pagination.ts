import { and, eq, gt, lt, or, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { PAGE_SIZE } from "./config";

export type SortOrder = "asc" | "desc";

export interface Page<T> {
	items: T[];
	nextId: number | null;
	hasMore: boolean;
}

export const IdSchema = z.number().int().positive();
export const SortOrderSchema = z.enum(["asc", "desc"]).default("desc");

/**
 * Keyset pagination always fetches one extra row to know whether another
 * page exists without running a count query.
 */
export function buildPage<T>(rows: T[], getId: (row: T) => number): Page<T> {
	const hasMore = rows.length > PAGE_SIZE;
	const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
	const last = items.at(-1);

	return {
		items,
		hasMore,
		nextId: hasMore && last ? getId(last) : null,
	};
}

/**
 * Keyset condition for `(sortColumn, id)` ordered in the same direction.
 * The client only sends the `id` of the last item; when `sort` is not `id`,
 * the repository resolves that row's sort value itself, so there is no
 * `cursor_value` param. All sortable columns are NOT NULL.
 */
export function keysetCondition(
	sortColumn: SQLiteColumn | null,
	sortValue: string | null,
	idColumn: SQLiteColumn,
	lastId: number,
	order: SortOrder,
): SQL {
	const compare = order === "asc" ? gt : lt;

	if (!sortColumn || sortValue === null) return compare(idColumn, lastId)!;

	return or(
		compare(sortColumn, sortValue),
		and(eq(sortColumn, sortValue), compare(idColumn, lastId)),
	)!;
}
