/**
 * Returns true if a value is set. Returns false if the value is NOT set.
 * @param {*} value
 * @returns {boolean}
 */
export function isSet(value) {
	if (typeof value === 'boolean') { return true; } // If value is true/false it is set
	return value !== null && typeof value !== 'undefined';
}
