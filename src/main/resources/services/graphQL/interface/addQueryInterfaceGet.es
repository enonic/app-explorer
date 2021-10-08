import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';

import {
	DEFAULT_INTERFACE_FIELDS,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
//import {coerseInterfaceType} from '/lib/explorer/interface/coerseInterfaceType';
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
			const {
				//_id,
				_name,
				_nodeType,
				_path,
				_versionKey,
				collectionIds = [], // Just collection names, not collection nodes
				fields = DEFAULT_INTERFACE_FIELDS,
				stopWords = [],
				synonyms = []
			} = iFace;
			// TODO coerseInterfaceType(iFace)
			return {
				_id,
				_name,
				_nodeType,
				_path,
				_versionKey,
				collectionIds: forceArray(collectionIds),
				fields: forceArray(fields),
				stopWords: forceArray(stopWords),
				synonyms: forceArray(synonyms)
			};
		},
		type: glue.getObjectType(GQL_TYPE_INTERFACE_NAME)
	});
}
