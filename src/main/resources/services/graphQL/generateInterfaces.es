import {toStr} from '@enonic/js-utils';

import {NT_FIELD} from '/lib/explorer/model/2/constants';
//import {reference} from '/lib/graphql';

import {GQL_INTERFACE_NODE_NAME} from './constants';
//import {GQL_TYPE_REFERENCED_BY_NAME} from './generateReferencedByField';
//import {referencedByMapped} from './referencedByMapped';


export function generateInterfaces({
	// Common types
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,

	// Specific types
	GQL_TYPE_FIELD_NODE,

	schemaGenerator
}) {

	const {
		createInterfaceType
	} = schemaGenerator;

	const GQL_INTERFACE_NODE = createInterfaceType({
		name: GQL_INTERFACE_NODE_NAME,
		fields: {
			_id: { type: GQL_TYPE_ID },
			_name: { type: GQL_TYPE_NAME },
			_nodeType: { type: GQL_TYPE_NODE_TYPE },
			_path: { type: GQL_TYPE_PATH }/*,
			referencedBy: {
				resolve: ({source: {_id}}) => referencedByMapped({_id}),
				type: reference(GQL_TYPE_REFERENCED_BY_NAME)
			}*/
		},
		typeResolver(node) {
			log.debug(`node:${toStr(node)}`);
			const {_nodeType} = node;
			switch (_nodeType) {
			case NT_FIELD:
				return GQL_TYPE_FIELD_NODE;
			default:
				throw new Error(`Unhandeled _nodeType:${_nodeType}!`);
			}
		}
	});

	return {
		GQL_INTERFACE_NODE
	};
} // generateInterfaces
