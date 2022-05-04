import type {SynonymNodeCreateParams} from '/lib/explorer/types/index.d';

import {toStr} from '@enonic/js-utils';

import {
	NT_SYNONYM,
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {get} from '/lib/explorer/node/get';
import {connect} from '/lib/explorer/repo/connect';
import {createRandomNamed} from '/lib/explorer/node/createRandomNamed';
import {coerseSynonymType} from '/lib/explorer/synonym/coerseSynonymType';
//@ts-ignore
import {reference as referenceValue} from '/lib/xp/value';

import {GQL_TYPE_SYNONYM_NAME} from '../constants';


export function generateCreateSynonymField({
	GQL_TYPE_FROM,
	GQL_TYPE_TO,
	glue
}) {
	return {
		args: {
			from: GQL_TYPE_FROM,
			thesaurusId: glue.getScalarType('_id'),
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
			const createRes = createRandomNamed<SynonymNodeCreateParams>({
				_indexConfig: {default: 'byType'},
				_nodeType: NT_SYNONYM,
				_parentPath: thesaurusNode._path,
				//displayName: `${Array.isArray(from) ? from.join(', ') : from} => ${Array.isArray(to) ? to.join(', ') : to}`,
				from,
				thesaurusReference: referenceValue(thesaurusNode._id),
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

			return coerseSynonymType(createRes);
		},
		type: glue.getObjectType(GQL_TYPE_SYNONYM_NAME)
	};
}
