import type { HighlightResult } from '@enonic-types/core';

import {
	STEMMING_LANGUAGE_CODES,
	ELLIPSIS,
	hasOwnProperty,
	isObject,
	isString,
	toStr
} from '@enonic/js-utils';
import {
    FRAGMENT_SIZE_DEFAULT,
	POST_TAG,
	PRE_TAG,
} from './constants';


function shortenFallback(fallback: string, fragmentSize: number) {
    if (isString(fallback)) {
        if (fallback.length > fragmentSize) {
            return `${fallback.substring(0, fragmentSize)}${ELLIPSIS}`
        }
        return fallback;
    }
}


export default function getHighlightedHtml({
	_highlight,// = {},
	fallback = '',
	fieldPath,
	fragmentSize = FRAGMENT_SIZE_DEFAULT,
}: {
	_highlight?: HighlightResult
	fallback: string
	fieldPath: string
	fragmentSize?: number
}) {
	// console.debug('getHighlightedHtml', {_highlight, fallback, fieldPath, fragmentSize});

	if (!isObject(_highlight)) {
		return shortenFallback(fallback, fragmentSize);
	}

	const lcFieldPath = fieldPath.toLowerCase();
	let highlightedHtml// = fallback;

	if (
		hasOwnProperty(_highlight as object, lcFieldPath) // NOTE: This casting is only needed in VSCode
		// No need to deep-check shape of _highlight, trust what comes from GraphQL
		// && (_highlight as object)[lcFieldPath].length // NOTE: This casting is only needed in VSCode
		// && isStringArray(_highlight[lcFieldPath])
	) {
		highlightedHtml = (_highlight as object)[lcFieldPath][0]; // NOTE: This casting is only needed in VSCode
	} else {
		for (let i = 0; i < STEMMING_LANGUAGE_CODES.length; i++) {
			const langCode = STEMMING_LANGUAGE_CODES[i];
			if ((_highlight as object)[`${lcFieldPath}._stemmed_${langCode}`]) { // NOTE: This casting is only needed in VSCode
                // console.debug(`getHighlightedHtml: found _highlight[${lcFieldPath}._stemmed_${langCode}]`);
				highlightedHtml = (_highlight as object)[`${lcFieldPath}._stemmed_${langCode}`][0]; // NOTE: This casting is only needed in VSCode
				break;
			}
		} // for
	}
	
	if (!highlightedHtml) {
		// console.debug(`getHighlightedHtml: _highlight is an object, but no key matching ${lcFieldPath}, nor ${lcFieldPath}._stemmed_{STEMMING_LANGUAGE_CODES} was found. _highlight:${toStr(_highlight)}`);
		return shortenFallback(fallback, fragmentSize);
	}

	const strippedHighlight = highlightedHtml.replace(new RegExp(PRE_TAG,'g'), '').replace(new RegExp(POST_TAG,'g'), '');
	if (
		strippedHighlight !== fallback
	) {
		const startOfFieldWithSameLengthAsStrippedHighlight = fallback.substring(0, strippedHighlight.length);
		const endOfFieldWithSameLengthAsStrippedHighlight = fallback.substring(fallback.length - strippedHighlight.length);
		// console.debug({
		// 	fallback,
		// 	'fallback.length': fallback.length,
		// 	// fragmentSize, // Not used on _highlight
		// 	highlightedHtml,
		// 	strippedHighlight,
		// 	'strippedHighlight.length': strippedHighlight.length,
		// 	startOfFieldWithSameLengthAsStrippedHighlight,
		// 	endOfFieldWithSameLengthAsStrippedHighlight,
		// });
		if (strippedHighlight === startOfFieldWithSameLengthAsStrippedHighlight) {
			highlightedHtml = `${highlightedHtml}${ELLIPSIS}`;
		} else if (strippedHighlight === endOfFieldWithSameLengthAsStrippedHighlight) {
			highlightedHtml = `${ELLIPSIS}${highlightedHtml}`;
		} else {
			highlightedHtml = `${ELLIPSIS}${highlightedHtml}${ELLIPSIS}`;
		}
	}

	return highlightedHtml;
}