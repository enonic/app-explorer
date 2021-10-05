//import {toStr} from '@enonic/js-utils';

import {reference} from '/lib/graphql';

import {
	GQL_INPUT_TYPE_FILTERS_NAME,
	GQL_INTERFACE_NODE_NAME,
	GQL_TYPE_REFERENCED_BY_NAME,
	GQL_UNION_TYPE_ANY_NODE
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
			__referencedBy: {
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
		typeResolver: glue.getUnionTypeObj(GQL_UNION_TYPE_ANY_NODE).typeResolver
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
