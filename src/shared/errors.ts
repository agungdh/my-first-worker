import type { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";

const CONSTRAINT_MESSAGE = /FOREIGN KEY constraint failed|SQLITE_CONSTRAINT/i;

export const handleError: ErrorHandler = (err, c) => {
	if (err instanceof HTTPException) return err.getResponse();

	// D1 enforces foreign keys itself (see `onDelete`/`onUpdate` in the schema).
	// Surface its constraint errors as 409 instead of letting them become a 500.
	if (isConstraintViolation(err)) {
		return c.json(
			{ success: false, errors: [{ code: 7006, message: "Constraint violation" }] },
			409,
		);
	}

	console.error("Unhandled error:", err);
	return c.json({ success: false, errors: [{ code: 7000, message: "Internal Server Error" }] }, 500);
};

export const handleNotFound: NotFoundHandler = (c) =>
	c.json({ success: false, errors: [{ code: 7004, message: "Not Found" }] }, 404);

/** Drizzle wraps the driver error, so walk the `cause` chain. */
function isConstraintViolation(err: unknown): boolean {
	let current: unknown = err;

	for (let depth = 0; depth < 5 && current; depth += 1) {
		if (current instanceof Error && CONSTRAINT_MESSAGE.test(current.message)) return true;

		current = current instanceof Error ? current.cause : undefined;
	}

	return false;
}
