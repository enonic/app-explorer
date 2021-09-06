import {toStr} from '@enonic/js-utils';

import {
	NT_SYNONYM,
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {get} from '/lib/explorer/node/get';
import {connect} from '/lib/explorer/repo/connect';
import {createRandomNamed} from '/lib/explorer/node/createRandomNamed';
import {reference} from '/lib/xp/value';

import {
	GQL_TYPE_ID
} from '../types';
import {
	GQL_TYPE_FROM,
	GQL_TYPE_TO,
	GQL_TYPE_SYNONYM,
	forceTypeSynonym
} from './types';


export const fieldSynonymCreate = {
	args: {
		from: GQL_TYPE_FROM,
		thesaurusId: GQL_TYPE_ID,
		to: GQL_TYPE_TO
	},
	resolve({
		args: {
			from,
			thesaurusId,
			to
		}
	}) {
		//log.debug(`from:${toStr(from)}`);
		//log.debug(`thesaurusId:${toStr(thesaurusId)}`);
		//log.debug(`to:${toStr(to)}`);
		const thesaurusNode = get({
			connection: connect({
				principals: [PRINCIPAL_EXPLORER_READ]
			}),
			path: thesaurusId
		});
		//log.info(`synonymCreate thesaurusNode:${toStr(thesaurusNode)}`);
		if (!thesaurusNode) {
			throw new Error(`Unable to find thesaurus with id:${thesaurusId}!`);
		}
		const createRes = createRandomNamed({
			_indexConfig: {default: 'byType'},
			_nodeType: NT_SYNONYM,
			_parentPath: thesaurusNode._path,
			//displayName: `${Array.isArray(from) ? from.join(', ') : from} => ${Array.isArray(to) ? to.join(', ') : to}`,
			from,
			thesaurusReference: reference(thesaurusNode._id),
			to/*,
			type: NT_SYNONYM*/ // TODO This could be a problem in explorer-1.5.0
		}, {
			connection: connect({
				principals: [PRINCIPAL_EXPLORER_WRITE]
			})
		});
		if (!createRes) {
			throw new Error(`Something went wrong when trying to create synonym from:${toStr(from)} to:${toStr(to)} in thesaurus with id:${thesaurusId}!`);
		}
		//log.debug(`createRes:${toStr(createRes)}`);

		return forceTypeSynonym(createRes);
	},
	type: GQL_TYPE_SYNONYM
}; // fieldSynonymCreate
