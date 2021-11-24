import {
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_REFERENCE,
	VALUE_TYPE_STRING,
	camelize
} from '@enonic/js-utils';
//import 'reflect-metadata'; // Must only be added once to a webpack bundle
import setIn from 'set-value'; // Number.isInteger and Reflect

import {VALUE_TYPE_JSON} from './constants';


export function buildGlobalFieldsObj({
	fieldsRes
}) {
	const globalFieldsObj = { // NOTE Hardcoded common fields, which are not currently system fields
		_collectionId: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_REFERENCE
		},
		_collectionName: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_STRING
		},
		_documentTypeId: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_REFERENCE
		},
		_documentTypeName: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_STRING
		},
		_json: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_JSON
		},
		//_highlight, // TODO ???
		_repoId: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_REFERENCE
		},
		_score: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_DOUBLE
		}
	};
	fieldsRes.hits.forEach(({ // TODO traverse
		fieldType: valueType,
		inResults,
		//isSystemField = false,
		key,
		max = 0,
		min = 0
	}) => {
		const camelizedFieldPath = key.split('.').map((k) => camelize(k, /[-]/g)).join('.');
		//log.debug(`inResults:${toStr(inResults)} key:${toStr(key)} camelizedFieldPath:${toStr(camelizedFieldPath)}`);

		if (inResults !== false) {
			setIn(globalFieldsObj, camelizedFieldPath, {
				//_isSystemField: isSystemField,
				_max: max,
				_min: min,
				_valueType: valueType
			}, { merge: true });
		}
	});
	//log.debug(`nestedFieldsObj:${toStr(nestedFieldsObj)}`);
	return globalFieldsObj;
}
