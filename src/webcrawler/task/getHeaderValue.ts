export function getHeaderValue(
	headers: Record<string, string|string[]>|undefined,
	name: string
): string|undefined {
	if (!headers) {
		return undefined;
	}
	const lowerCasedName = name.toLowerCase();
	const key = Object.keys(headers).find(k => k.toLowerCase() === lowerCasedName);
	if (!key) {
		return undefined;
	}
	const value = headers[key];
	return Array.isArray(value) ? value[0] : value;
}
