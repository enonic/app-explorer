export function fieldObjToFieldArr(obj) {
	const arr = [];
	Object.keys(obj).forEach((k) => {
		const v = obj[k];
		arr.push({
			key: k,
			text: v.text,
			value: k
		});
	});
	return arr;
} // function fieldObjToFieldArr
