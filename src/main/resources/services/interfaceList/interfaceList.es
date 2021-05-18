//import {toStr} from '/lib/util';

import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {query as queryCollections} from '/lib/explorer/collection/query';
import {getFields} from '/lib/explorer/field/getFields';
import {getFieldValues} from '/lib/explorer/field/getFieldValues';
import {query} from '/lib/explorer/interface/query';
import {addFilter} from '/lib/explorer/query/addFilter';
import {hasValue} from '/lib/explorer/query/hasValue';
import {connect} from '/lib/explorer/repo/connect';
import {query as getStopWords} from '/lib/explorer/stopWords/query';
import {query as getThesauri} from '/lib/explorer/thesaurus/query';


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

	//──────────────────────────────────────────────────────────────────────────
	// Get only fieldValues for fieldsInResults
	//──────────────────────────────────────────────────────────────────────────
	const fieldValuesArray = getFieldValues({
		connection,
		filters: addFilter({
			filter: hasValue(
				'fieldReference',
				fieldsInResultsArray.map(({_id}) => _id)
			)
		})
	}).hits;
	//log.debug(`fieldValuesArray:${toStr({fieldValuesArray})}`);

	const fieldValuesObj = {};
	fieldValuesArray.forEach(({
		_name,
		_path,
		displayName,

		// _name of fieldNode, not key of fieldNode
		// So underscore-nodetype not _nodeType
		field: fieldName,
		fieldReference,

		value
	}) => {
		const fieldKey = fieldsIdToKey[fieldReference];
		if (!fieldKey) {
			throw new Error(`Unable to find field key for fieldName:${fieldName} fieldId:${fieldReference}`);
		}
		const key = value || _name;
		//log.info(toStr({field, displayName, value, _name, key}));
		/*if (!fieldValuesObj[field]) {fieldValuesObj[field] = []}
		fieldValuesObj[field].push({
			label: displayName,
			value: _name,
			path: _path
		});*/
		if (!fieldValuesObj[fieldKey]) {fieldValuesObj[fieldKey] = {};}
		fieldValuesObj[fieldKey][key] = {
			key,
			text: displayName,
			path: _path//,
			//value
		};
	});
	//log.debug(`fieldValuesObj:${toStr({fieldValuesObj})}`);

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
			text: fieldKey,
			values: fieldValuesObj[fieldKey]
		};
		//}
	});
	//log.debug(`fieldsObj:${toStr({fieldsObj})}`);

	const interfaces = query({connection});
	interfaces.hits = interfaces.hits.map(({
		_id,
		_name,
		displayName
	}) => ({
		_id,
		_name,
		displayName,
		id: _id,
		name: _name
	}));

	const stopWordOptions = getStopWords({connection}).hits.map(({displayName, name}) => ({
		key: name,
		text: displayName,
		value: name
	}));

	return {
		body: {
			collectionOptions: queryCollections({connection}).hits.map(({
				_name: key
			}) => ({
				key,
				text: key,
				value: key
			})),
			fieldsObj,
			interfaces,
			stopWordOptions,
			thesauriOptions: getThesauri({connection}).hits.map(({displayName, name}) => ({
				key: name,
				text: displayName,
				value: name
			}))
		},
		contentType: RT_JSON
	};
} // function get
