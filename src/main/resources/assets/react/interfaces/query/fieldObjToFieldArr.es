function isSet(value) {
	if (typeof value === 'boolean') { return true; } // If value is true/false it is set
	return value !== null && typeof value !== 'undefined';
}

export function fieldObjToFieldArr(obj) {
	const arr = [];
	Object.keys(obj).sort().forEach((k) => {
		const v = obj[k];
		arr.push({
			key: isSet(v.key) ? v.key : k,
			text: isSet(v.text) ? v.text : k,
			value: isSet(v.value) ? v.value : k
		});
	});
	return arr;
} // function fieldObjToFieldArr
