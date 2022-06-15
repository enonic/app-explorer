import {
	sortKeys//,
	//toStr
} from '@enonic/js-utils';

//@ts-ignore
import {GraphQLString} from '/lib/graphql';

import {
	GQL_INTERFACE_TYPE_DOCUMENT,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH_HIT_HIGHLIGHT
} from '../constants';
import {documentTypeNameToGraphQLObjectTypeName} from './documentTypeNameToGraphQLObjectTypeName';
import {mergeFields} from './mergeFields';
import {objToGraphQL} from './objToGraphQL';


export function addDocumentTypeObjectTypes({
	camelToFieldObj, // modified
	documentTypeObjectTypes, // modified
	documentTypes, // just read
	globalFieldsObj, // just read
	glue // modified (via calling functions)
}) {
	const interfaceTypeDocument = glue.getInterfaceType(GQL_INTERFACE_TYPE_DOCUMENT);
	documentTypes.forEach(({
		_name: documentTypeName,
		properties
	}) => {
		const mergedglobalFieldsObj = mergeFields({
			camelToFieldObj, // modified
			globalFieldsObj, // just read
			properties // just read
		});

		//log.debug(`addDynamicTypes Object.keys(globalFieldsObj):${toStr(Object.keys(globalFieldsObj))}`);
		const fields = {
			...objToGraphQL({
				documentTypeName,
				glue,
				obj: mergedglobalFieldsObj
			}),
			_highlight: { type: glue.getObjectType(GQL_OBJECT_TYPE_INTERFACE_SEARCH_HIT_HIGHLIGHT) }
		};
		/*Object.keys(globalFieldsObj).map((k) => {
			//log.debug(`addDynamicTypes k:${toStr(k)}`);
			fields[`${k}_as_string`] = { type: GraphQLString };
		});*/
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
