import { integer } from "drizzle-orm/sqlite-core";

export const auditColumns = {
	createdAt: integer("created_at"),
	updatedAt: integer("updated_at"),
	deletedAt: integer("deleted_at"),
	createdBy: integer("created_by"),
	updatedBy: integer("updated_by"),
	deletedBy: integer("deleted_by"),
};

export function auditCreate(actorId: number | null = null) {
	const now = Date.now();
	return { createdAt: now, updatedAt: now, createdBy: actorId, updatedBy: actorId };
}

export function auditUpdate(actorId: number | null = null) {
	return { updatedAt: Date.now(), updatedBy: actorId };
}

export function auditDelete(actorId: number | null = null) {
	return { deletedAt: Date.now(), deletedBy: actorId };
}
