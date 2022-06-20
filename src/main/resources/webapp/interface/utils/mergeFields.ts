import type {DocumentTypeFields} from '/lib/explorer/types/index.d';
import type {Branch} from './index.d';


import {
	VALUE_TYPE_STRING,
	camelize//,
	//toStr
} from '@enonic/js-utils';
import setIn from 'set-value'; // Number.isInteger and Reflect


export function mergeFields({
	camelToFieldObj, // modified
	globalFieldsObj, // just read
	properties // just read
} :{
	camelToFieldObj :Record<string, string>
	globalFieldsObj :Record<string,{
		_max :number
		_min :number
		_valueType :string
	}>
	properties :DocumentTypeFields
}) :Branch {
	const mergedglobalFieldsObj :Branch = JSON.parse(JSON.stringify(globalFieldsObj)); // deref
	//log.debug(`documentTypeName:${toStr(documentTypeName)} mergedglobalFieldsObj:${toStr(mergedglobalFieldsObj)}`);

	if (properties) {
		properties.forEach(({
			max = 0,
			min = 0,
			name,
			valueType = VALUE_TYPE_STRING
		}) => {
			const camelizedFieldPath = name // 'nes-ted.na-me'
				.split('.') // ['nes-ted', 'na-me']
				.map((k) => camelize(k, /[-]/g)) // ['nesTed', 'naMe']
				.join('.'); // 'nesTed.naMe'
			//log.debug('mergeFields name:%s camelizedFieldPath:%s', name, camelizedFieldPath);

			setIn(mergedglobalFieldsObj, camelizedFieldPath, {
				// These are prefixed with underscore to avoid colliding with nested PropertyKeys
				_max: max,
				_min: min,
				_valueType: valueType
			}, { merge: true });

			//const camelizedFieldKey = camelize(name, /[.-]/g);
			const camelizedFieldKey = camelizedFieldPath;
			if (camelToFieldObj[camelizedFieldKey] && camelToFieldObj[camelizedFieldKey] !== name) {
				throw new Error(`Name collision from camelized:${camelizedFieldKey} to both ${camelToFieldObj[camelizedFieldKey]} and ${name}`);
			}
			camelToFieldObj[camelizedFieldKey] = name;
		}); // properties.forEach
	}
	//log.debug('mergeFields mergedglobalFieldsObj:%s', toStr(mergedglobalFieldsObj));
	return mergedglobalFieldsObj;
}
