import type { MultiRepoConnection } from '@enonic-types/lib-node';


import {
	COLLECTION_REPO_PREFIX,
	Principal
} from '@enonic/explorer-utils';
import { startsWith } from '@enonic/js-utils/string/startsWith';
import { toStr } from '@enonic/js-utils/value/toStr';
import cleanPermissions from '/lib/explorer/node/cleanPermissions';
import { connect } from '/lib/explorer/repo/connect';
import { multiConnect } from '/lib/explorer/repo/multiConnect';
import { runAsSu } from '/lib/explorer/runAsSu';
import { list as listRepos } from '/lib/xp/repo';
import { Progress } from '../init/Progress';


export function concisePersmissions({
	progress,
}: {
	progress: Progress
}) {
	progress.addItems(1).setInfo('Finding all collection repos...').report().logInfo();
	runAsSu(() => {
		const repoList = listRepos();
		const collectionRepoIds: string[] = [];
		for (let i = 0; i < repoList.length; i++) {
			const {
				id: repoId
			} = repoList[i];
			if (startsWith(repoId, COLLECTION_REPO_PREFIX)) {
				collectionRepoIds.push(repoId);
			}
		}

		progress.addItems(1).finishItem().setInfo('Finding nodes with wrong permissions...').report().logInfo();
		const multiRepoReadConnection = multiConnect({
			sources: [{
				branch: 'master',
				principals: [Principal.SYSTEM_ADMIN],
				repoId: 'com.enonic.app.explorer'
			}].concat(collectionRepoIds.map((repoId) => ({
				branch: 'master',
				principals: [Principal.SYSTEM_ADMIN],
				repoId
			})))
		}) as unknown as MultiRepoConnection;
		const queryRes = multiRepoReadConnection.query({
			query: {
				boolean: {
					// One or more expressions must evaluate to true to include a node in the result.
					should: [{
						boolean: {
							// All expressions in the mustNot must evaluate to false for nodes to match.
							mustNot: {
								term: {
									field: '_permissions.create',
									value: Principal.EXPLORER_WRITE
								}
							}
						}
					},{
						boolean: {
							// All expressions in the mustNot must evaluate to false for nodes to match.
							mustNot: {
								term: {
									field: '_permissions.create',
									value: Principal.SYSTEM_ADMIN
								}
							}
						}
					},{
						boolean: {
							// All expressions in the mustNot must evaluate to false for nodes to match.
							mustNot: {
								term: {
									field: '_permissions.delete',
									value: Principal.EXPLORER_WRITE
								}
							}
						}
					},{
						boolean: {
							// All expressions in the mustNot must evaluate to false for nodes to match.
							mustNot: {
								term: {
									field: '_permissions.delete',
									value: Principal.SYSTEM_ADMIN
								}
							}
						}
					},{
						boolean: {
							// All expressions in the mustNot must evaluate to false for nodes to match.
							mustNot: {
								term: {
									field: '_permissions.modify',
									value: Principal.EXPLORER_WRITE
								}
							}
						}
					},{
						boolean: {
							// All expressions in the mustNot must evaluate to false for nodes to match.
							mustNot: {
								term: {
									field: '_permissions.modify',
									value: Principal.SYSTEM_ADMIN
								}
							}
						}
					},{
						boolean: {
							// All expressions in the mustNot must evaluate to false for nodes to match.
							mustNot: {
								term: {
									field: '_permissions.read',
									value: Principal.EXPLORER_READ,
								}
							}
						}
					},{
						boolean: {
							// All expressions in the mustNot must evaluate to false for nodes to match.
							mustNot: {
								term: {
									field: '_permissions.read',
									value: Principal.EXPLORER_WRITE
								}
							}
						}
					},{
						boolean: {
							// All expressions in the mustNot must evaluate to false for nodes to match.
							mustNot: {
								term: {
									field: '_permissions.read',
									value: Principal.SYSTEM_ADMIN
								}
							}
						}
					},{
						boolean: {
							// All expressions in the mustNot must evaluate to false for nodes to match.
							mustNot: {
								term: {
									field: '_permissions.publish',
									value: Principal.SYSTEM_ADMIN
								}
							}
						}
					},{
						boolean: {
							// All expressions in the mustNot must evaluate to false for nodes to match.
							mustNot: {
								term: {
									field: '_permissions.readpermissions',
									value: Principal.SYSTEM_ADMIN
								}
							}
						}
					},{
						boolean: {
							// All expressions in the mustNot must evaluate to false for nodes to match.
							mustNot: {
								term: {
									field: '_permissions.writepermissions',
									value: Principal.SYSTEM_ADMIN
								}
							}
						}
					}],
				}
			}
		});
		// log.debug('queryRes:%s', toStr(queryRes));

		progress.addItems(queryRes.hits.length)
			.finishItem()
			.setInfo(`Fixing ${queryRes.hits.length} nodes with wrong permissions...`)
			.report()
			.logInfo();

		for (let index = 0; index < queryRes.hits.length; index++) {
			const {
				branch,
				id,
				repoId
			} = queryRes.hits[index];
			const writeConnection = connect({
				branch,
				principals: [Principal.SYSTEM_ADMIN],
				repoId
			});
			writeConnection.modify({
				key: id,
				editor: (node) => {
					const { _path } = node;
					const fullPath = `${repoId}:${branch}:${_path}`;
					// log.debug('fullPath:%s node before modifying:%s', fullPath, toStr(node));
					/* eslint-disable no-param-reassign */
					// node['modifiedTime'] = new Date(); // This is a content layer property, we might not want it on all nodes.
					node._permissions = cleanPermissions({
						_permissions: node._permissions,
						node
					});
					/* eslint-enable no-param-reassign */
					// log.debug('fullPath:%s modifiedNode:%s', fullPath, toStr(node));
					return node;
				}
			});
			progress.finishItem();
		} // for
		progress.setInfo(`Finished fixing ${queryRes.hits.length} nodes with wrong permissions...`)
			.report()
			.debug();
	}); // runAsSu
} // concisePersmissions


export function run() {
	const progress = new Progress({
		info: 'Task started',
		total: 1
	}).report();
	concisePersmissions({
		progress
	});
} // run
