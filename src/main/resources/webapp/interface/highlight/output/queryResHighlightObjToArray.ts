import type {HighlightArray} from './index.d';


export function queryResHighlightObjToArray({
	highlightObj
} :{
	highlightObj :Record<string,Array<string>>
}) :HighlightArray {
	const highlightArray = [];
	const keys = Object.keys(highlightObj);
	for (let i = 0; i < keys.length; i++) {
	    const key = keys[i];
		highlightArray.push({
			fieldPath: key,
			highlights: highlightObj[key]
		});
	}
	return highlightArray;
}
