import {toStr} from '@enonic/js-utils';

import {
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {get} from '/lib/explorer/node/get';
import {connect} from '/lib/explorer/repo/connect';

import {GQL_TYPE_ID} from '../types';
import {
	GQL_TYPE_FROM,
	GQL_TYPE_TO,
	GQL_TYPE_SYNONYM,
	forceTypeSynonym
} from './types';


export const fieldSynonymUpdate = {
	args: {
		_id: GQL_TYPE_ID,
		from: GQL_TYPE_FROM,
		to: GQL_TYPE_TO
	},
	resolve({
		args: {
			_id,
			from,
			to
		}
	}) {
		//log.debug(`_id:${toStr(_id)}`);
		//log.debug(`from:${toStr(from)}`);
		//log.debug(`to:${toStr(to)}`);
		const synonymNode = get({
			connection: connect({
				principals: [PRINCIPAL_EXPLORER_READ]
			}),
			key: _id
		});
		if (!synonymNode) {
			throw new Error(`Unable to find synonym with _id:${_id}!`);
		}
		const writeConnection = connect({
			principals: [PRINCIPAL_EXPLORER_WRITE]
		});

		const modifyRes = writeConnection.modify({
			key: _id,
			editor: (node) => {
				log.debug(`node:${toStr(node)}`);
				node.from = from;
				node.to = to;
				log.debug(`node:${toStr(node)}`);
				return node;
			}
		});
		if (!modifyRes) {
			throw new Error(`Something went wrong when trying to modify synonym _id:${_id} from:${toStr(from)} to:${toStr(to)}!`);
		}
		//log.debug(`modifyRes:${toStr(modifyRes)}`);
		return forceTypeSynonym(modifyRes);
	},
	type: GQL_TYPE_SYNONYM
}; // fieldSynonymUpdate
