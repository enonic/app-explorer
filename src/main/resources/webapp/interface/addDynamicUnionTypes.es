//import {toStr} from '@enonic/js-utils';

import {GQL_UNION_TYPE_DOCUMENT_TYPES} from './constants';


export function addDynamicUnionTypes({
	documentTypeObjectTypes, // Must be already populated, since used in types below
	glue
}) {
	/*log.debug(`addDynamicUnionTypes({
		Object.keys(documentTypeObjectTypes): ${toStr(Object.keys(documentTypeObjectTypes))}
	})`);*/
	glue.addUnionType({
		name: GQL_UNION_TYPE_DOCUMENT_TYPES,
		/*types: [
			//reference('InterfaceSearchHits')
			objectTypeInterfaceSearchHit
		],*/
		//types: Object.values(documentTypeObjectTypes), // Object.values is not a function
		types: Object.keys(documentTypeObjectTypes).map((documentTypeName) => documentTypeObjectTypes[documentTypeName]),
		// Perhaps this has smaller footprint?
		//types: Object.keys(documentTypeObjectTypes).map((documentTypeName) => reference(documentTypeNameToGraphQLObjectTypeName(documentTypeName))),
		typeResolver(node) {
			//log.debug(`node:${toStr(node)}`);
			const {
				//_documentTypeId
				_documentTypeName
			} = node;
			//return objectTypeInterfaceSearchHit;
			return documentTypeObjectTypes[_documentTypeName]; // eslint-disable-line no-underscore-dangle
		}
	});
}
