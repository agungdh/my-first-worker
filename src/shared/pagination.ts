import { gt, lt, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { PAGE_SIZE } from "./config";

export type SortOrder = "asc" | "desc";

export interface Page<T> {
	items: T[];
	nextCursor: number | null;
	hasMore: boolean;
}

export const CursorSchema = z.number().int().positive();
export const SortOrderSchema = z.enum(["asc", "desc"]).default("desc");

/**
 * Cursor pagination always fetches one extra row to know whether another
 * page exists without running a count query.
 */
export function buildPage<T>(rows: T[], getId: (row: T) => number): Page<T> {
	const hasMore = rows.length > PAGE_SIZE;
	const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
	const last = items.at(-1);

	return {
		items,
		hasMore,
		nextCursor: hasMore && last ? getId(last) : null,
	};
}

/**
 * Keyset condition for `id` only. The cursor id is the single anchor of the
 * pagination; `order` just flips the direction. Never anchor on another column.
 */
export function keysetCondition(
	idColumn: SQLiteColumn,
	cursorId: number,
	order: SortOrder,
): SQL {
	const compare = order === "asc" ? gt : lt;

	return compare(idColumn, cursorId)!;
}
