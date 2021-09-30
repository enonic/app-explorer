import {GQL_TYPE_NODE_DELETED_NAME} from './constants';


export function addObjectTypes({
	glue
}) {
	glue.addObjectType({
		name: GQL_TYPE_NODE_DELETED_NAME,
		fields: {
			_id: { type: glue.getScalarType('_id') }
		}
	});
}
