import {
	VALUE_TYPE_STRING,
	camelize,
	forceArray//,
	//toStr
} from '@enonic/js-utils';
import setIn from 'set-value'; // Number.isInteger and Reflect


export function mergeFields({
	camelToFieldObj, // modified
	globalFieldsObj, // just read
	properties // just read
}) {
	const mergedglobalFieldsObj = JSON.parse(JSON.stringify(globalFieldsObj)); // deref
	//log.debug(`documentTypeName:${toStr(documentTypeName)} mergedglobalFieldsObj:${toStr(mergedglobalFieldsObj)}`);

	if (properties) {
		forceArray(properties).forEach(({
			max = 0,
			min = 0,
			name,
			valueType = VALUE_TYPE_STRING
		}) => {
			const camelizedFieldPath = name.split('.').map((k) => camelize(k, /[-]/g)).join('.');
			setIn(mergedglobalFieldsObj, camelizedFieldPath, {
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
	//log.debug(`documentTypeName:${toStr(documentTypeName)} mergedglobalFieldsObj:${toStr(mergedglobalFieldsObj)}`);
	return mergedglobalFieldsObj;
}
