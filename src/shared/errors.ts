import type { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const handleError: ErrorHandler = (err, c) => {
	if (err instanceof HTTPException) return err.getResponse();
	console.error("Unhandled error:", err);
	return c.json({ success: false, errors: [{ code: 7000, message: "Internal Server Error" }] }, 500);
};

export const handleNotFound: NotFoundHandler = (c) =>
	c.json({ success: false, errors: [{ code: 7004, message: "Not Found" }] }, 404);