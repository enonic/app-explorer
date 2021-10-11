import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';

import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
//import {query as queryCollections} from '/lib/explorer/collection/query';
import {getFields} from '/lib/explorer/field/getFields';
import {query as queryInterfaces} from '/lib/explorer/interface/query';
import {connect} from '/lib/explorer/repo/connect';
import {query as getStopWords} from '/lib/explorer/stopWords/query';
//import {query as getThesauri} from '/lib/explorer/thesaurus/query';

import {DEFAULT_INTERFACE_FIELDS} from '../../constants';


export function get() {
	const connection = connect({principals: [PRINCIPAL_EXPLORER_READ]});

	//──────────────────────────────────────────────────────────────────────────
	// Get only fields where inResults not false (aka undefined || true)
	// It is not possible to make a filter for that :(
	// So have to get all fields and then filter on inResults
	//──────────────────────────────────────────────────────────────────────────
	const fieldsInResultsArray = getFields({connection}).hits.map(({
		_id,
		_name,
		//displayName,
		key,
		inResults = true,
		_path
	}) => ({
		_id,
		_name,
		key,
		inResults,
		//text: displayName,
		path: _path,
		value: key
	})).filter(({inResults}) => inResults);
	//log.debug(`fieldsInResultsArray:${toStr({fieldsInResultsArray})}`);


	//──────────────────────────────────────────────────────────────────────────
	// We have to lookup field key from field _id, so make a mapping object
	//──────────────────────────────────────────────────────────────────────────
	const fieldsIdToKey = {};
	fieldsInResultsArray.forEach(({
		_id,
		_name,
		key
	}) => {
		fieldsIdToKey[_id] = key || _name;
	});
	//log.debug(`fieldsIdToKey:${toStr({fieldsIdToKey})}`);

	const fieldsObj = {};
	fieldsInResultsArray.forEach(({
		key: fieldKey,
		//label,
		//inResults,
		path//,
		//text,
		//value,
	}) => {
		//if (inResults) {
		fieldsObj[fieldKey] = {
			//key,
			//label,
			//inResults,
			path,
			text: fieldKey
		};
		//}
	});
	//log.debug(`fieldsObj:${toStr({fieldsObj})}`);

	const interfaces = queryInterfaces({connection});
	interfaces.hits = interfaces.hits.map(({
		_id,
		_name,
		collections,
		displayName,
		fields = DEFAULT_INTERFACE_FIELDS,
		stopWords,
		synonyms
	}) => ({
		_id,
		_name,
		collections: forceArray(collections),
		displayName,
		fields: forceArray(fields),
		id: _id,
		name: _name,
		stopWords: forceArray(stopWords),
		synonyms: forceArray(synonyms)
	}));

	const stopWordOptions = getStopWords({connection}).hits.map(({displayName, name}) => ({
		key: name,
		text: displayName,
		value: name
	}));

	return {
		body: {
			/*collectionOptions: queryCollections({connection}).hits.map(({
				_name: key
			}) => ({
				key,
				text: key,
				value: key
			})),*/
			fieldsObj,
			interfaces,
			stopWordOptions/*,
			thesauriOptions: getThesauri({connection}).hits.map(({displayName, name}) => ({
				key: name,
				text: displayName,
				value: name
			}))*/
		},
		contentType: RT_JSON
	};
} // function get
