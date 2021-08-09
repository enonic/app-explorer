import {isString} from '@enonic/js-utils';
import getIn from 'get-value';

import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getFields} from '/lib/explorer/field/getFields';


export function get() {
	const connection = connect({principals: PRINCIPAL_EXPLORER_READ});
	const fieldsRes = getFields({connection});
	fieldsRes.hits = fieldsRes.hits.map(({
		_name: name,
		allowArray = false,
		denyDelete = false,
		fieldType,
		indexConfig, // String or object
		key,
		min = 0,
		max = 0
	}) => {
		return {
			allowArray,
			denyDelete,
			fieldType,
			key,
			min,
			max,
			name,

			instruction: isString(indexConfig) ? indexConfig : 'custom',

			decideByType: getIn(indexConfig, 'decideByType', true),
			enabled: getIn(indexConfig, 'enabled', true),
			fulltext: getIn(indexConfig, 'fulltext', true),
			includeInAllText: getIn(indexConfig, 'includeInAllText', true),
			nGram: getIn(indexConfig, 'nGram', true), // node._indexConfig.default.nGram uses uppercase G in nGram
			path: getIn(indexConfig, 'path', false)
		};
	});
	return {
		body: {
			fieldsRes
		},
		contentType: RT_JSON
	};
} // get
