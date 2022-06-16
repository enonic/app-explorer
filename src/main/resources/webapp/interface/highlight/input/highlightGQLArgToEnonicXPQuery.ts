import type {Highlight} from './index.d';


export function highlightGQLArgToEnonicXPQuery({
	highlightArg
} :{
	highlightArg :Highlight
}) {
	const highlight = {
		properties: {}
	};
	const keys = Object.keys(highlightArg);
	for (let i = 0; i < keys.length; i++) {
	    const key = keys[i];
		if (key === 'properties') {
			for (let j = 0; j < highlightArg.properties.length; j++) {
				const {fieldPath, ...rest} = highlightArg.properties[j];
				highlight.properties[fieldPath] = rest;
			}
		} else {
			highlight[key] = highlightArg[key];
		}
	}
	return highlight;
}
