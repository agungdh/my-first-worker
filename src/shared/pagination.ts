import { InputValidationException } from "chanfana";
import { and, eq, gt, lt, or, type SQL } from "drizzle-orm";
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
export const CursorValueSchema = z.string().min(1).max(255);
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
 * Keyset condition for `(sortColumn, id)` ordered by the same direction.
 * All sortable columns are NOT NULL, so no null ordering is involved.
 */
export function keysetCondition(
	sortColumn: SQLiteColumn | null,
	cursorValue: string | null,
	idColumn: SQLiteColumn,
	cursorId: number,
	order: SortOrder,
): SQL {
	const compare = order === "asc" ? gt : lt;

	if (!sortColumn) return compare(idColumn, cursorId)!;
	if (cursorValue === null) {
		throw new InputValidationException("cursor_value is required when sort is not id");
	}

	return or(
		compare(sortColumn, cursorValue),
		and(eq(sortColumn, cursorValue), compare(idColumn, cursorId)),
	)!;
}

export function assertCursorValue(
	cursor: number | undefined,
	cursorValue: string | undefined,
	isIdSort: boolean,
): void {
	if (cursor !== undefined && !isIdSort && cursorValue === undefined) {
		throw new InputValidationException("cursor_value is required when sort is not id");
	}
}
