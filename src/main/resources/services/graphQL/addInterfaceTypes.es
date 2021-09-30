import {toStr} from '@enonic/js-utils';

import {NT_DOCUMENT_TYPE} from '/lib/explorer/documentType/constants';
import {
	NT_COLLECTION,
	NT_FIELD
} from '/lib/explorer/model/2/constants';
import {
	//list,
	reference
} from '/lib/graphql';

import {
	GQL_INPUT_TYPE_FILTERS_NAME,

	GQL_INTERFACE_NODE_NAME,
	//GQL_INTERFACE_QUERY_RESULT_NAME,

	GQL_TYPE_COLLECTION_NAME,
	GQL_TYPE_DOCUMENT_TYPE_NAME,
	GQL_TYPE_FIELD_NODE_NAME,
	GQL_TYPE_REFERENCED_BY_NAME
} from './constants';
import {referencedByMapped} from './referencedByMapped';


export function addInterfaceTypes({
	glue
}) {
	glue.addInterfaceType({
		name: GQL_INTERFACE_NODE_NAME,
		fields: {
			_id: { type: glue.getScalarType('_id') },
			_name: { type: glue.getScalarType('_name') },
			_nodeType: { type: glue.getScalarType('_nodeType') },
			_path: { type: glue.getScalarType('_path') },
			_referencedBy: {
				args: {
					//filters: reference(GQL_INPUT_TYPE_FILTERS_NAME)
					// Input types are defined before interfaceTypes, so we can use getInputType here
					filters: glue.getInputType(GQL_INPUT_TYPE_FILTERS_NAME)
				},
				resolve: ({
					args: {filters},
					source: {_id}
				}) => referencedByMapped({_id, filters}),
				type: reference(GQL_TYPE_REFERENCED_BY_NAME) // NOTE Must use reference, since type not defined yet
			},
			_versionKey: { type: glue.getScalarType('_versionKey') }
		},
		typeResolver(node) {
			// WARNING I believe you cannot use lib-graphql.reference in here!
			log.debug(`node:${toStr(node)}`);
			//return GQL_TYPE_FIELD_NODE;
			const {_nodeType} = node;
			log.debug(`_nodeType:${toStr(_nodeType)}`);
			switch (_nodeType) {
			case NT_COLLECTION:
				return glue.getObjectType(GQL_TYPE_COLLECTION_NAME); // This works because it's resolved later
			case NT_DOCUMENT_TYPE:
				return glue.getObjectType(GQL_TYPE_DOCUMENT_TYPE_NAME);
			case NT_FIELD:
				return glue.getObjectType(GQL_TYPE_FIELD_NODE_NAME);
			default: {
				const msg = `Unhandeled _nodeType:${_nodeType}!`;
				log.error(msg);
				//throw new Error(msg);
				return glue.getObjectType(GQL_TYPE_FIELD_NODE_NAME);
			}
			}
		}
	});
	/*glue.addInterfaceType({
		name: GQL_INTERFACE_QUERY_RESULT_NAME,
		fields: {
			count: { type: glue.getScalarType('count') },
			hits: {
				type: list(glue.getInterfaceType(GQL_INTERFACE_NODE_NAME))
			},
			total: { type: glue.getScalarType('total') }
		},
		typeResolver(result) {
			log.debug(`result:${toStr(result)}`);
		}
	});*/
} // addInterfaceTypes
