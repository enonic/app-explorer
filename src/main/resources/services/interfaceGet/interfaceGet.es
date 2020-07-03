import traverse from 'traverse';

import generateUuidv4 from 'uuid/v4';
//import { v4 as generateUuidv4 } from 'uuid'; // As of uuid 7.0.0

//import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {isString} from '/lib/util/value';

import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {jsonError} from '/lib/explorer/jsonError';
import {get as getInterface} from '/lib/explorer/interface/get';
import {connect} from '/lib/explorer/repo/connect';


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
			} else if (Array.isArray(value)) {
				this.update(value.map(entry => {
					if (!isString(entry) && !entry.uuid4) {
						entry.uuid4 = generateUuidv4();
					}
					return entry;
				}));
			} // if isArray
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
		collections = [],
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
		collections: forceArray(collections),
		displayName,
		facets: forceArray(facets),
		filters: convert({object: filters, fields: ['must', 'mustNot', 'values']}),
		id,
		_name,
		name,
		query: convert({object: query, fields: ['expressions', 'fields']}),
		resultMappings: forceArray(resultMappings),
		stopWords: forceArray(stopWords),
		thesauri: forceArray(thesauri)
	};
	//log.info(`body:${toStr(body)}`);
	return {
		body,
		contentType: RT_JSON
	};
} // function get
