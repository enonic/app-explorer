import {toStr} from '@enonic/js-utils';

import {NT_DOCUMENT_TYPE} from '/lib/explorer/documentType/constants';
import {
	NT_COLLECTION,
	NT_FIELD
} from '/lib/explorer/model/2/constants';
import {reference} from '/lib/graphql';

import {
	GQL_TYPE_COLLECTION_NAME,
	GQL_TYPE_DOCUMENT_TYPE_NAME,
	GQL_TYPE_FIELD_NODE_NAME,
	GQL_INTERFACE_NODE_NAME,
	GQL_TYPE_REFERENCED_BY_NAME/*,
	GQL_TYPE_FIELD_NODE_NAME*/
} from './constants';
//import {referencedByMapped} from './referencedByMapped';


export function generateInterfaces({
	glue
}) {
	glue.addInterfaceType({
		name: GQL_INTERFACE_NODE_NAME,
		fields: {
			_id: { type: glue.getScalarType('_id') },
			_name: { type: glue.getScalarType('_name') },
			_nodeType: { type: glue.getScalarType('_nodeType') },
			_path: { type: glue.getScalarType('_path') },
			referencedBy: {
				//resolve: ({source: {_id}}) => referencedByMapped({_id}),
				//type: reference(GQL_INTERFACE_NODE_NAME)
				type: reference(GQL_TYPE_REFERENCED_BY_NAME)
			}
		},
		typeResolver(node) {
			log.debug(`node:${toStr(node)}`);
			//return GQL_TYPE_FIELD_NODE;
			const {_nodeType} = node;
			log.debug(`_nodeType:${toStr(_nodeType)}`);
			switch (_nodeType) {
			case NT_COLLECTION:
				return glue.getObjectType(GQL_TYPE_COLLECTION_NAME);
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
} // generateInterfaces
