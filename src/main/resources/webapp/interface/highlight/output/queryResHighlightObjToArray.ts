import type {HighlightArray} from './index.d';


export function queryResHighlightObjToArray({
	highlightObj
} :{
	highlightObj ?:Record<string,Array<string>>
}) :HighlightArray|null {
	if (!highlightObj) { return null; }
	const highlightArray = [];
	const keys = Object.keys(highlightObj);
	for (let i = 0; i < keys.length; i++) {
	    const key = keys[i];
		highlightArray.push({
			field: key,
			highlights: highlightObj[key]
		});
	}
	return highlightArray;
}
