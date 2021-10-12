//import {toStr} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {coerseInterfaceType} from '/lib/explorer/interface/coerseInterfaceType';
import {get as getInterface} from '/lib/explorer/interface/get';
import {connect} from '/lib/explorer/repo/connect';

import {
	GQL_QUERY_INTERFACE_GET_NAME,
	GQL_TYPE_INTERFACE_NAME
} from '../constants';


export function addQueryInterfaceGet({glue}) {
	glue.addQuery({
		name: GQL_QUERY_INTERFACE_GET_NAME,
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
			const iFace = getInterface({
				connection: connect({principals: [PRINCIPAL_EXPLORER_READ]}),
				key: _id
			});
			const rv = coerseInterfaceType(iFace);
			//log.debug(`rv:${toStr(rv)}`);
			return rv;
		},
		type: glue.getObjectType(GQL_TYPE_INTERFACE_NAME)
	});
}
