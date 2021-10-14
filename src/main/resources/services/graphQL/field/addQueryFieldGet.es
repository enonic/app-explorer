//import {toStr} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {coerseFieldType} from '/lib/explorer/field/coerseFieldType';
import {getField} from '/lib/explorer/field/getField';
import {connect} from '/lib/explorer/repo/connect';

import {
	GQL_QUERY_FIELD_GET_NAME,
	GQL_TYPE_FIELD_NODE_NAME
} from '../constants';

export function addQueryFieldGet({glue}) {
	glue.addQuery({
		name: GQL_QUERY_FIELD_GET_NAME,
		args: {
			_id: glue.getScalarType('_id')
		},
		resolve(env) {
			//log.debug(`env:${toStr(env)}`);
			const {
				args: {
					_id
				}
			} = env;
			const fieldNode = getField({
				connection: connect({principals: [PRINCIPAL_EXPLORER_READ]}),
				key: _id
			});
			const rv = coerseFieldType(fieldNode);
			//log.debug(`rv:${toStr(rv)}`);
			return rv;
		},
		type: glue.getObjectType(GQL_TYPE_FIELD_NODE_NAME)
	});
}
