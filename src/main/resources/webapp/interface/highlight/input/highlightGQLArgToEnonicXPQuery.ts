import type {Highlight} from './index.d';


//import {toStr} from '@enonic/js-utils';


export function highlightGQLArgToEnonicXPQuery({
	highlightArg
} :{
	highlightArg :Highlight
}) {
	//log.debug('highlightGQLArgToEnonicXPQuery highlightArg:%s', toStr(highlightArg));
	const highlight = {
		properties: {}
	};
	const keys = Object.keys(highlightArg);
	for (let i = 0; i < keys.length; i++) {
	    const key = keys[i];
		//log.debug('highlightGQLArgToEnonicXPQuery i:%s key:%s', i, key);
		if (key === 'fields') {
			for (let j = 0; j < highlightArg.fields.length; j++) {
				//log.debug('highlightGQLArgToEnonicXPQuery highlightArg.properties[%s]:%s', j, toStr(highlightArg.properties[j]));
				const {field, ...rest} = highlightArg.fields[j];
				highlight.properties[field] = rest;
			}
		} else {
			highlight[key] = highlightArg[key];
		}
	}
	return highlight;
}
