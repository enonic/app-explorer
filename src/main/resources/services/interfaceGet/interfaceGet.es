import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';
import traverse from 'traverse';

import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {jsonError} from '/lib/explorer/jsonError';
import {get as getInterface} from '/lib/explorer/interface/get';
import {connect} from '/lib/explorer/repo/connect';
import {mapResultMappings} from '../graphQL/interface';


function convert({object, fields, recurse = true}) {
	traverse(object).forEach(function(value) { // Fat arrow destroys this
		const key = this.key;
		if (fields.includes(key)) { // Fields that should become array
			if (!value) {
				this.update([]);
			} else if (!Array.isArray(value)) { // Convert single value to array
				value = [value];
				if (recurse) {
					convert({object: value, fields, recurse}); // Recurse
				}
				this.update(value);
			}
		}
	}); // traverse
	return object;
} // function convert


export function get({
	params: {
		id: key
		//name: interfaceName
	}
}) {
	if (!key) {
		return jsonError('Missing required parameter id!');
	}
	//log.info(`key:${key}`);
	const iFace = getInterface({
		connection: connect({principals: [PRINCIPAL_EXPLORER_READ]}),
		key
		//interfaceName
	});
	//log.info(`iFace:${toStr(iFace)}`);

	const {
		_id: id,
		_name,
		collections = [], // Just collection names, not collection nodes
		displayName = '',
		facets = [],
		filters = {},
		name = '',
		query = {},
		resultMappings = [],
		stopWords = [],
		thesauri = []
	} = iFace;
	const body = {
		collections: forceArray(collections), // Just collection names, not collection nodes
		displayName,
		facets: forceArray(facets),
		filters: convert({object: filters, fields: ['must', 'mustNot', 'should', 'values']}),
		id,
		_name,
		name,
		query: convert({object: query, fields: ['expressions', 'fields']}),
		resultMappings: mapResultMappings(resultMappings),
		stopWords: forceArray(stopWords),
		thesauri: forceArray(thesauri)
	};
	//log.info(`body:${toStr(body)}`);

	return {
		body,
		contentType: RT_JSON
	};
} // function get
