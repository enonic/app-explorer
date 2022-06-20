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
			const lowercasedName = name.toLowerCase(); // TODO handle on lowerlevels, so it always comes here in lowercase?

			// In GraphQL Name must be non-null, non-empty and match /^[_A-Za-z][_0-9A-Za-z]*$/

			/*
			// In Explorer<2.0.0 a global field could contain a dash, which GraphQL Name can't contain, so this code camelized it away:
			const camelizedFieldPath = name // 'nes-ted.na-me'
				.split('.') // ['nes-ted', 'na-me']
				.map((k) => camelize(k, /[-]/g)) // ['nesTed', 'naMe'] // This was done for old broken field names, which contained '-'
				.join('.'); // 'nesTed.naMe'
			*/

			// But the thing is a GraphQL can't contain a dot either, so if we camelize both [.-] there is no way to know which is correct:
			// nesTedNaMe -> nes.ted.na.me or nes-ted-na-me ???
			// So let's forget about old BORKEN names with dash in them, and only care about the dot.

			// Because of how Enonic XP indexes fields, our DocumentType fieldPaths are actually /^[a-z][_0-9a-z]*(.[a-z][_0-9a-z]*)*$/
			// Special fields can start with undescore. Those should be strictly controlled by us. For now they are hardcoded.
			setIn(mergedglobalFieldsObj, lowercasedName, {
				// These are prefixed with underscore to avoid colliding with nested PropertyKeys
				_max: max,
				_min: min,
				_valueType: valueType
			}, { merge: true });

			const camelizedFieldKey = camelize(lowercasedName, /[.]/g); // Used to be [.-]
			if (camelToFieldObj[camelizedFieldKey] && camelToFieldObj[camelizedFieldKey] !== lowercasedName) {
				// Since we only replace dots now (not dashes), this collision should never happen anymore
				throw new Error(`Name collision from camelized:${camelizedFieldKey} to both ${camelToFieldObj[lowercasedName]} and ${name}`);
			}
			camelToFieldObj[camelizedFieldKey] = name;
		}); // properties.forEach
	}
	//log.debug('mergeFields mergedglobalFieldsObj:%s', toStr(mergedglobalFieldsObj));
	return mergedglobalFieldsObj;
}
