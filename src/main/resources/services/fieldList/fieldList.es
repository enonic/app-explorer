import getIn from 'get-value';
import {isString} from '/lib/util/value';

import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getFields} from '/lib/explorer/field/getFields';
import {getFieldValues} from '/lib/explorer/field/getFieldValues';


export function get() {
	const connection = connect({principals: PRINCIPAL_EXPLORER_READ});
	const fieldsRes = getFields({connection});
	fieldsRes.hits = fieldsRes.hits.map(({
		_name: name,
		denyDelete = false,
		denyValues = false,
		displayName,
		fieldType,
		indexConfig, // String or object
		key
	}) => {
		const valuesRes = getFieldValues({
			connection,
			field: name
		});
		valuesRes.hits = valuesRes.hits.map(({
			//_name,
			//field,
			//fieldReference,
			displayName,
			value
		}) => ({
			displayName,
			value
		}))
		return {
			denyDelete,
			denyValues,
			displayName,
			fieldType,
			key,
			name,

			instruction: isString(indexConfig) ? indexConfig : 'custom',

			decideByType: getIn(indexConfig, 'decideByType', true),
			enabled: getIn(indexConfig, 'enabled', true),
			fulltext: getIn(indexConfig, 'fulltext', true),
			includeInAllText: getIn(indexConfig, 'includeInAllText', true),
			nGram: getIn(indexConfig, 'nGram', true), // node._indexConfig.default.nGram uses uppercase G in nGram
			path: getIn(indexConfig, 'path', false),

			valuesRes
		};
	});
	return {
		body: {
			fieldsRes
		},
		contentType: RT_JSON
	};
} // get
