import type {
	MultiRepoConnection,
	QueryNodeParams,
	RepoConnection
} from '/lib/xp/node';
import type { Progress } from '../../init/Progress';


import {
	COLLECTION_REPO_PREFIX,
	FieldPath,
	NodeType,
	Principal
} from '@enonic/explorer-utils';
import {
	setIn,
	startsWith,
	// toStr
} from '@enonic/js-utils';
import {setModel} from '/lib/explorer/model/setModel';
import {connect} from '/lib/explorer/repo/connect';
import {multiConnect} from '/lib/explorer/repo/multiConnect';
import {list} from '/lib/xp/repo';
import { Node } from 'cheerio';


export function model17({
	progress,
	writeConnection
}: {
	progress: Progress
	writeConnection: RepoConnection
}) {
	progress.addItems(1).setInfo('Finding all collection repos...').report().logInfo();
	const repoList = list();
	const collectionRepoIds: string[] = [];
	for (let i = 0; i < repoList.length; i++) {
		const {
			id: repoId
		} = repoList[i];
		if (startsWith(repoId, COLLECTION_REPO_PREFIX)) {
			collectionRepoIds.push(repoId);
		}
	}
	progress.finishItem()

	if (collectionRepoIds.length) {
		progress.addItems(1).setInfo(`Finding all documents without ${FieldPath.META_COLLECTION}...`).report().logInfo();
		const multiRepoReadConnection = multiConnect({
			sources: collectionRepoIds.map((repoId) => ({
				branch: 'master',
				principals: [Principal.EXPLORER_READ],
				repoId
			}))
		}) as unknown as MultiRepoConnection;

		const queryParams :QueryNodeParams = {
			count: -1,
			filters: {
				boolean: {
					mustNot: {
						exists: {
							field: FieldPath.META_COLLECTION
						}
					}
				},
			},
			query: {
				boolean: {
					must: {
						term: {
							field: '_nodeType',
							value: NodeType.DOCUMENT
						}
					}
				}
			}
		}
		// log.debug('queryParams:%s', toStr(queryParams));

		const documents = multiRepoReadConnection.query(queryParams).hits.map(({
			id,
			repoId
		}) => ({
			id,
			repoId
		}));
		// log.debug('documents.length:%s', documents.length);
		// log.debug('documents:%s', toStr(documents));

		progress.addItems(documents.length).finishItem();

		for (let i = 0; i < documents.length; i++) {
			const {
				id: documentNodeId,
				repoId
			} = documents[i];
			progress.setInfo(`Processing repoId:${repoId} documentId:${documentNodeId}...`).report().logInfo();

			const collectionRepoWriteConnection = connect({
				repoId,
				principals: [Principal.EXPLORER_WRITE]
			});

			const documentNode = collectionRepoWriteConnection.get(documentNodeId) as Node;
			// log.debug('documentNode:%s', toStr(documentNode));

			if (!documentNode) {
				log.error('Document in repo:%s with id:%s not found!', repoId, documentNodeId);
			} else {
				const collectionName = repoId.replace(COLLECTION_REPO_PREFIX, '');
				// log.debug('collectionName:%s', toStr(collectionName));

				try {
					collectionRepoWriteConnection.modify({
						key: documentNodeId,
						editor: (node) => {
							setIn(node, FieldPath.META_COLLECTION, collectionName)
							return node;
						}
					});
				} catch (e) {
					log.error(`Ignoring error:`, e);
				}
			} // else collectionNode
			progress.finishItem();
		} // for collectionIds
	} // if (collectionRepoIds.length)

	setModel({
		connection: writeConnection,
		version: 17
	});
}
