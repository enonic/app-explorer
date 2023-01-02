import type {
	AnyObject,
	MultiRepoConnectionQueryNode
} from '/lib/explorer/types/index.d';

import {
	addQueryFilter//,
	// toStr
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
	collections = collectionName ? [collectionName] : [], // NOTE: empty sources no longer allowed!
	count = -1,
	field,
	filters = {}
} :{
	collectionName :string
	field ?:string
	collections ?:Array<string>
	count ?:number
	filters ?:AnyObject
}) {
	const queryParams = {
		// WARNING Can't aggregate on branch and repoId as they are not actual fields :(
		// TODO We could add document_metadata.repoId to enable aggregation...
		/*aggregations: {
			branch: {
				terms: {
					field: 'branch',
					order: '_count desc',
					size: 0, // Seems to mean infinite (undocumented)
				}
			},
			repoId: {
				terms: {
					field: 'repoId',
					order: '_count desc',
					size: 0, // Seems to mean infinite (undocumented)
				},
				aggregations: {
					branch: {
						terms: {
							field: 'branch',
							order: '_count desc',
							size: 0, // Seems to mean infinite (undocumented)
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
	// log.debug('multiConnectParams:%s', toStr(multiConnectParams));

	const rv = {
		count: 0,
		total: 0,
		hits: []
	};

	// When a collection exist, but not the corrensponding repo this fails with: multiConnect: empty sources is not allowed
	try {
		const multiRepoReadConnection = multiConnect(multiConnectParams); // NOTE: This now protects against empty sources array.

		const qr = multiRepoReadConnection.query(queryParams);
		//log.debug(`queryRes:${toStr(queryRes)}`);

		rv.count = qr.count;
		rv.total = qr.total;
		rv.hits = qr.hits.map(({
			id,
			score,
			repoId,
			branch
		}) => {
			const node = connect({
				branch,
				principals: [PRINCIPAL_EXPLORER_READ],
				repoId
			}).get(id) as MultiRepoConnectionQueryNode;
			//log.debug(`node:${toStr(node)}`);
			node._branchId = branch;
			node._repoId = repoId;
			node._score = score;
			//log.debug(`node:${toStr(node)}`);
			return node;
		});
	} catch (e) {
		// No-op, see comment before try
	}
	return rv;
}
