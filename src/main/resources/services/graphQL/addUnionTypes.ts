import {NT_DOCUMENT_TYPE} from '/lib/explorer/documentType/constants';
import {
	NT_COLLECTION,
	NT_FIELD,
	NT_INTERFACE,
	NT_STOP_WORDS,
	NT_THESAURUS
} from '/lib/explorer/model/2/constants';
//@ts-ignore
import {reference} from '/lib/graphql';

import {
	GQL_TYPE_COLLECTION_NAME,
	GQL_TYPE_DOCUMENT_TYPE_NAME,
	GQL_TYPE_FIELD_NODE_NAME,
	GQL_TYPE_INTERFACE_NAME,
	GQL_TYPE_STOP_WORDS_NAME,
	GQL_TYPE_THESAURUS_NAME,
	GQL_UNION_TYPE_ANY_NODE
} from './constants';


// Has to be added before interfaceTypes?
export function addUnionTypes({glue}) {
	glue.addUnionType({
		name: GQL_UNION_TYPE_ANY_NODE,
		types: [
			reference(GQL_TYPE_COLLECTION_NAME),
			reference(GQL_TYPE_DOCUMENT_TYPE_NAME),
			reference(GQL_TYPE_FIELD_NODE_NAME),
			reference(GQL_TYPE_INTERFACE_NAME),
			reference(GQL_TYPE_STOP_WORDS_NAME),
			reference(GQL_TYPE_THESAURUS_NAME)
		],
		typeResolver(node) {
			// WARNING I believe you cannot use lib-graphql.reference in here!
			//log.debug(`node:${toStr(node)}`);
			//return GQL_TYPE_FIELD_NODE;
			const {_nodeType} = node;
			//log.debug(`_nodeType:${toStr(_nodeType)}`);
			switch (_nodeType) {
			case NT_COLLECTION:
				return glue.getObjectType(GQL_TYPE_COLLECTION_NAME); // This works because it's resolved later
			case NT_DOCUMENT_TYPE:
				return glue.getObjectType(GQL_TYPE_DOCUMENT_TYPE_NAME);
			case NT_FIELD:
				return glue.getObjectType(GQL_TYPE_FIELD_NODE_NAME);
			case NT_INTERFACE:
				return glue.getObjectType(GQL_TYPE_INTERFACE_NAME);
			case NT_STOP_WORDS:
				return glue.getObjectType(GQL_TYPE_STOP_WORDS_NAME);
			case NT_THESAURUS:
				return glue.getObjectType(GQL_TYPE_THESAURUS_NAME);
			default: {
				const msg = `Unhandeled _nodeType:${_nodeType}!`;
				log.error(msg);
				//throw new Error(msg);
				return glue.getObjectType(GQL_TYPE_FIELD_NODE_NAME);
			}
			}
		}
	});
} // createUnionTypes
