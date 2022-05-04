import {
	addQueryFilter//,
	//toStr
} from '@enonic/js-utils';

import {
	COLLECTION_REPO_PREFIX,
	//NT_DOCUMENT,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {multiConnect} from '/lib/explorer/repo/multiConnect';


export function hasField({
	collectionName,
	collections = collectionName ? [collectionName] : [],
	count = -1,
	field,
	filters = {}
}) {
	const queryParams = {
		// WARNING Can't aggregate on branch and repoId as they are not actual fields :(
		// TODO We could add document_metadata.repoId to enable aggregation...
		/*aggregations: {
			branch: {
				terms: {
					field: 'branch',
					order: '_count desc',
					size: 100
				}
			},
			repoId: {
				terms: {
					field: 'repoId',
					order: '_count desc',
					size: 100
				},
				aggregations: {
					branch: {
						terms: {
							field: 'branch',
							order: '_count desc',
							size: 100
						}
					}
				}
			}
		},*/
		count,
		filters: addQueryFilter({
			filter: {
				exists: {
					field
				}
			},
			filters
		}),
		query: ''
	};
	//log.debug(`queryParams:${toStr(queryParams)}`);

	const multiConnectParams = {
		principals: [PRINCIPAL_EXPLORER_READ],
		sources: collections.map(collection => ({
			repoId: `${COLLECTION_REPO_PREFIX}${collection}`,
			branch: 'master', // NOTE Hardcoded
			principals: [PRINCIPAL_EXPLORER_READ]
		}))
	};
	//log.debug(`multiConnectParams:${toStr(multiConnectParams)}`);
	const multiRepoReadConnection = multiConnect(multiConnectParams);

	const queryRes = multiRepoReadConnection.query(queryParams);
	//log.debug(`queryRes:${toStr(queryRes)}`);

	queryRes.hits = queryRes.hits.map(({
		id,
		score,
		repoId,
		branch
	}) => {
		const node = connect({
			branch,
			principals: [PRINCIPAL_EXPLORER_READ],
			repoId
		}).get(id);
		//log.debug(`node:${toStr(node)}`);
		node._branchId = branch;
		node._repoId = repoId;
		node._score = score;
		//log.debug(`node:${toStr(node)}`);
		return node;
	});
	return queryRes;
}