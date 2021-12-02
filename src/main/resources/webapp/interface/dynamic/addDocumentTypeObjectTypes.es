import {
	VALUE_TYPE_STRING,
	camelize,
	forceArray,
	sortKeys//,
	//toStr
} from '@enonic/js-utils';
import setIn from 'set-value'; // Number.isInteger and Reflect

import {GraphQLString} from '/lib/graphql';

import {
	GQL_INTERFACE_TYPE_DOCUMENT,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH_HIT_HIGHLIGHT
} from '../constants';
import {documentTypeNameToGraphQLObjectTypeName} from './documentTypeNameToGraphQLObjectTypeName';
import {objToGraphQL} from './objToGraphQL';


export function addDocumentTypeObjectTypes({
	camelToFieldObj,
	documentTypeObjectTypes,
	documentTypes,
	globalFieldsObj,
	glue
}) {
	documentTypes.forEach(({
		_name: documentTypeName,
		properties
	}) => {
		const interfaceTypeDocument = glue.getInterfaceType(GQL_INTERFACE_TYPE_DOCUMENT);
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

		//log.debug(`addDynamicTypes Object.keys(globalFieldsObj):${toStr(Object.keys(globalFieldsObj))}`);
		const fields = {
			...objToGraphQL({
				documentTypeName,
				glue,
				obj: mergedglobalFieldsObj
			}),
			_highlight: { type: glue.getObjectType(GQL_OBJECT_TYPE_INTERFACE_SEARCH_HIT_HIGHLIGHT) }
		};
		Object.keys(globalFieldsObj).map((k) => {
			//log.debug(`addDynamicTypes k:${toStr(k)}`);
			fields[`${k}_as_string`] = { type: GraphQLString };
		});
		const sortedFields = sortKeys(fields);
		//log.debug(`addDynamicTypes Object.keys(sortedFields):${toStr(Object.keys(sortedFields))}`);

		documentTypeObjectTypes[documentTypeName] = glue.addObjectType({
			name: documentTypeNameToGraphQLObjectTypeName(documentTypeName),
			fields: sortedFields,
			interfaces: [
				//reference(GQL_INTERFACE_TYPE_DOCUMENT) // Error: type Document not found in schema
				interfaceTypeDocument
			]
		});
	}); // documentTypes.forEach
	//log.debug(`documentTypeObjectTypes:${toStr(documentTypeObjectTypes)}`);
}
