const ALGORITHM = "pbkdf2_sha256";
const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		"PBKDF2",
		false,
		["deriveBits"],
	);

	const bits = await crypto.subtle.deriveBits(
		{ name: "PBKDF2", hash: "SHA-256", salt, iterations },
		keyMaterial,
		HASH_BYTES * 8,
	);

	return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
	const hash = await derive(password, salt, ITERATIONS);

	return `${ALGORITHM}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [algorithm, iterationsRaw, saltRaw, hashRaw] = stored.split("$");
	if (algorithm !== ALGORITHM || !iterationsRaw || !saltRaw || !hashRaw) return false;

	const iterations = Number(iterationsRaw);
	if (!Number.isInteger(iterations) || iterations <= 0) return false;

	const salt = fromBase64(saltRaw);
	const expected = fromBase64(hashRaw);
	const actual = await derive(password, salt, iterations);

	return timingSafeEqual(actual, expected);
}

function toBase64(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
	const binary = atob(value);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
	let diff = a.length ^ b.length;
	const length = Math.max(a.length, b.length);

	for (let i = 0; i < length; i++) {
		diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
	}

	return diff === 0;
}
