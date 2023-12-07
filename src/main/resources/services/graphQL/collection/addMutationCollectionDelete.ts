import {
	//forceArray,
	toStr
} from '@enonic/js-utils';
import {
	APP_EXPLORER,
	COLLECTION_REPO_PREFIX,
	NodeType,
	Principal
} from '@enonic/explorer-utils';
import { connect } from '/lib/explorer/repo/connect';
import { listExplorerJobsThatStartWithName } from '/lib/explorer/scheduler/listExplorerJobsThatStartWithName';
// @ts-expect-error No types yet
import { GraphQLBoolean } from '/lib/graphql';
import { delete as deleteRepo } from '/lib/xp/repo';
import { delete as deleteJob } from '/lib/xp/scheduler';
import { executeFunction } from '/lib/xp/task';
import {
	GQL_MUTATION_COLLECTION_DELETE_NAME,
	GQL_TYPE_NODE_DELETED_NAME
} from '../constants';


export default function addMutationCollectionDelete({glue}) {
	glue.addMutation({
		name: GQL_MUTATION_COLLECTION_DELETE_NAME,
		args: {
			_id: glue.getScalarType('_id'),
			deleteRepo: GraphQLBoolean
		},
		resolve(env: {
			args: {
				_id: string
				deleteRepo: boolean
			}
		}) {
			//log.debug('env:%s', toStr(env));
			const {
				args: {
					_id,
					deleteRepo: boolDeleteRepo,
				}
			} = env;
			// log.debug('_id:%s', _id);

			const writeConnection = connect({
				principals: [Principal.EXPLORER_WRITE]
			});

			const collectionNode = writeConnection.get(_id);

			if (!collectionNode) {
				throw new Error(`Unable to get collection with id:${_id}`);
			}

			if (collectionNode._nodeType !== NodeType.COLLECTION) {
				throw new Error(`id:${_id} not a collection!`);
			}

			executeFunction({
				description: `Delete any scheduled job relating to collection with path:${collectionNode._path}`,
				func: () => {
					const jobName = `${APP_EXPLORER}.${collectionNode._id}`;
					const explorerJobsThatStartWithName = listExplorerJobsThatStartWithName({name: jobName});
					log.debug('collection path:%s explorerJobsThatStartWithName:%s', collectionNode._path, toStr(explorerJobsThatStartWithName));
					explorerJobsThatStartWithName.forEach(({name}) => {
						log.info(`Deleting job name:${name}, while deleting collection with path:${collectionNode._path}`);
						deleteJob({name});
					});
				}
			});

			if (boolDeleteRepo) {
				const repoName = `${COLLECTION_REPO_PREFIX}${collectionNode._name}`;
				executeFunction({
					description: `Delete repo with name:${repoName}`,
					func: () => {
						log.info('Deleting repo with name:%s...', repoName);
						if (deleteRepo(repoName)) {
							log.info('Repo with name:%s, deleted.', repoName);
						} else {
							log.warning(
								'Repository with name:%s was not found! While deleteing collection with path:%s',
								repoName,
								collectionNode._path
							);
						}
					}
				});
			}

			const deleteCollectionRes = writeConnection.delete(_id);
			// log.debug('deleteCollectionRes:%s', toStr(deleteCollectionRes));

			if (deleteCollectionRes.length !== 1 ) {
				throw new Error(`Something went wrong when trying to delete collection with id:${_id}`);
			}
			writeConnection.refresh(); // So the data becomes immidiately searchable
			return {
				_id: deleteCollectionRes[0]
			};
		},
		type: glue.getObjectType(GQL_TYPE_NODE_DELETED_NAME)
	});
}
