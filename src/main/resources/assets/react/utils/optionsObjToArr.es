import {isString} from './isString';


export function optionsObjToArr(obj) {
	if (Array.isArray(obj)) { // Array of objects
		obj.forEach(({options}, index) => {
			if (options) {
				obj[index].options = optionsObjToArr(options) // Recurse
			}
		});
		return obj;
	}

	// Assume obj
	const arr = [];
	Object.entries(obj).forEach(([k, v]) => {
		const rObj = {
			//key: k,
			value: k
		};
		if (isString(v)) {
			rObj.label = v;
			//rObj.text = v;
		} else { // Assume obj
			rObj.label = v.label;
			//rObj.text = v.text || v.label;
			if (v.options) {
				rObj.options = optionsObjToArr(v.options); // Recurse
			}
		}
		arr.push(rObj);
	});
	return arr;
}
