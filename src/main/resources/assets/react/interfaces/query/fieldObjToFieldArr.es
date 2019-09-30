export function fieldObjToFieldArr(obj) {
	const arr = [];
	Object.entries(obj).forEach(([k, v]) => {
		arr.push({
			key: k,
			text: v.text,
			value: k
		});
	});
	return arr;
} // function fieldObjToFieldArr
