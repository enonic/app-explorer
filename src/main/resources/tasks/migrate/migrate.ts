log.info('Migrate task read into memory');
// @ts-ignore
const {currentTimeMillis} = Java.type('java.lang.System') as {
	currentTimeMillis :() => number
};
const startTimeLoadMs = currentTimeMillis();


import type {IndexConfigObject} from '@enonic-types/lib-explorer';
import type {CollectionWithCron} from '@enonic-types/lib-explorer/Collection.d';
//import type {InterfaceNode} from '/lib/explorer/interface/types.d';
import type { RepoConnection } from '/lib/xp/node';
import type {
	InterfaceNodeFilter,
	InterfaceNodeWithFilter,
	NodeWithType
} from '../init/types.d';


import {
	FOLDERS,
	NodeType,
	Path,
	Principal
} from '@enonic/explorer-utils';
import {
	VALUE_TYPE_STRING,
	addQueryFilter,
	forceArray,
	// toStr
} from '@enonic/js-utils';
// import prettyMs from 'pretty-ms'; // Adds to bundle size and thus makes things take more time
import {ignoreErrors} from '/lib/explorer/ignoreErrors';
import {
	READWRITE_FIELDS,
	SYSTEM_FIELDS,
} from '/lib/explorer/model/2/constants';
import {
	field,
	folder
} from '/lib/explorer/model/2/index';
import {isModelLessThan} from '/lib/explorer/model/isModelLessThan';
import {setModel} from '/lib/explorer/model/setModel';
import {node as Node} from '/lib/explorer/model/2/nodeTypes/node';
import {create} from '/lib/explorer/node/create';
import {hasValue} from '/lib/explorer/query/hasValue';
import {connect} from '/lib/explorer/repo/connect';
import {runAsSu} from '/lib/explorer/runAsSu';
import {getCollectors, createOrModifyJobsFromCollectionNode} from '/lib/explorer/scheduler/createOrModifyJobsFromCollectionNode';
import {send} from '/lib/xp/event';
import {model9} from './model/9';
import {model10} from './model/10';
import {model11} from './model/11';
import {model12} from './model/12';
import {model13} from './model/13';
import {model14} from './model/14';
import {model15} from './model/15';
import {model16} from './model/16';
import {model17} from './model/17';
import model18 from './model/18';
import model19 from './model/19';
import {applicationListener} from '../init/applicationListener';
import {Progress} from '../init/Progress';
import {EVENT_INIT_COMPLETE} from '../init/init';


const FIELD_TYPE = { // TODO This should not be a system field. Remove in lib-explorer-4.0.0?
	key: 'type',
	_name: 'type',
	fieldType: VALUE_TYPE_STRING,
	indexConfig: 'minimal',
	max: 1,
	min: 0
	//displayName: 'Type'
};


export function run() {
	const startTimeRunMs = currentTimeMillis();
	log.info('Migrate task run() called!');
	runAsSu(() => {
		const progress = new Progress({
			info: 'Task started',
			//sleepMsAfterItem: 1000, // DEBUG
			total: 1
		}).report();
		const writeConnection = connect({
			principals:[Principal.EXPLORER_WRITE]
		}) as RepoConnection;

		//──────────────────────────────────────────────────────────────────────
		// Model 0: Initial data
		//──────────────────────────────────────────────────────────────────────
		if (isModelLessThan({
			connection: writeConnection,
			version: 0
		})) {
			progress.addItems(FOLDERS.length);
			FOLDERS.forEach((_name) => {
				progress.setInfo(`Creating folder ${_name}...`).report().logInfo();
				ignoreErrors(() => {
					create(
						folder({
							_name
						}), {
							connection: writeConnection,
							sanitize: false // Fix #787 Cannot create node with name test, parent '/api-keys'
						}
					);
				});
				progress.finishItem();
			});
			// Ok, lets think worst case scenarios about fields:
			//
			// Model 1: System fields in repo.
			// Model 2: System fields in code.
			//
			// Scenario 1: One installs the latest version of app-explorer,
			// which removes all system fields from the repo.
			// Then you roll back to some old version of app-explorer,
			// which will simply recreate the deleted fields.
			// So that shouldn't be an issue.
			// System fields are ASFAIK only used in dropdowns under interfaces within, to setup filters and query, and maybe
			// date facets, based on document_metadata.createdTime or document_metadata.modifiedTime???
			//
			// Scenario 2: Someone has made a client or collector that uses Model 1.
			// It expects the system fields in repo. But the installed version of app-explorer uses Model 2.
			// Where are the places in the client or collector code that have access to fields?
			// Collectors should only write to fields, and not system fields. Not an issue.
			// Clients should get fields via interfaces, so as long as interfaces are backwards compatible, that shouldn't be an issue.
			//
			// Scenario 3: Someone has made a client or collector that uses Model 2
			// But are using an old version of app-explorer with Model 1.
			// As long as the lib-explorer code is backwards compatible, this should not be an issue.

			progress.addItems(READWRITE_FIELDS.length);
			READWRITE_FIELDS.forEach(({
				_name,
				//displayName,
				fieldType = 'string',
				key, // TODO Dissallow creating fields starting with _ and remove in 2.0?
				max = 0,
				min = 0
			}) => {
				progress.setInfo(`Creating default field ${key}...`).report().logInfo();
				const params = field({
					_name,
					//displayName,
					fieldType,
					key, // TODO Dissallow creating fields starting with _ and remove in 2.0?
					max,
					min
				});
				//log.info(toStr({params}));
				ignoreErrors(() => {
					create(params, {
						connection: writeConnection
					}); // ;( This currently uses sanitize so _ becomes -
				});
				progress.finishItem();
			}); // READWRITE_FIELDS.forEach
			writeConnection.refresh();

			progress.addItems(1);
			progress.setInfo('Creating notificationsData...').report().logInfo();
			const notificationsData = Node({
				_name: 'notifications',
				emails: [] as Array<string>
			});
			//log.info(toStr({notificationsData}));
			ignoreErrors(() => {
				//const notificationsNode =
				create(notificationsData, {
					connection: writeConnection
				});
				//log.info(toStr({notificationsNode}));
			});
			progress.finishItem();

			setModel({
				connection: writeConnection,
				version: 0
			});
		} // if model < 0

		//──────────────────────────────────────────────────────────────────────
		// Model 1: Move type -> _nodeType
		//──────────────────────────────────────────────────────────────────────
		if (isModelLessThan({
			connection: writeConnection,
			version: 1
		})) {
			progress.addItems(1).setInfo(`Finding nodes where _nodeType = default and node.type exists...`).report().debug();
			// WARNING Does not find nodes there _indexConfig is none!
			const nodesWithTypeQueryParams = {
				count: -1,
				filters: addQueryFilter({
					filter: { exists: { field: 'type' } },
					filters: addQueryFilter({
						filter: hasValue('_nodeType', ['default'])
					})
				}),
				query: ''
			};
			//log.info(`nodesWithTypeQueryParams:${toStr(nodesWithTypeQueryParams)}`);

			const nodesWithTypeRes = writeConnection.query(nodesWithTypeQueryParams);
			//log.info(`nodesWithTypeRes:${toStr(nodesWithTypeRes)}`);

			const nodesWithType = nodesWithTypeRes.hits
				.map(hit => writeConnection.get<NodeWithType>(hit.id))
				.map(({_id, _nodeType, _path, type}) => ({_id, _nodeType, _path, type}));
			progress.finishItem();

			progress.addItems(nodesWithTypeRes.total);
			nodesWithType.forEach(({_id, _nodeType, _path, type}) => {
				progress.setInfo(`Trying to change _nodeType from ${_nodeType} to ${type} on _path:${_path} _id:${_id}...`).report().logInfo();
				ignoreErrors(() => {
					writeConnection.modify<NodeWithType>({
						key: _id,
						editor: (node) => {
							node._nodeType = node.type;
							delete node.type;
							return node;
						}
					});
				}); // ignoreErrors
				progress.finishItem();
			});
			writeConnection.refresh();
			setModel({
				connection: writeConnection,
				version: 1
			});
		} // if model < 1

		//──────────────────────────────────────────────────────────────────────
		// Model 2: Nodes where _indexConfig.default = none
		//──────────────────────────────────────────────────────────────────────
		if (isModelLessThan({
			connection: writeConnection,
			version: 2
		})) {
			progress.addItems(1).setInfo(`Finding nodes where _nodeType still is default and _indexConfig.default = none...`).report().debug();
			const nodesWithIndexDefaultNoneQueryParams = {
				count: -1,
				filters: addQueryFilter({
					filter: hasValue('_nodeType', ['default'])
				}),
				/*filters: addQueryFilter({
					filter: hasValue('_indexConfig.default.enabled', [false]) // Doesn't work
				}),*/
				//query: "_indexConfig.default.enabled = 'false'" // Doesn't work
				query: ''
			};

			interface NodeWithIndexConfigDefaultIsNone extends NodeWithType {
				_indexConfig :{
					default: IndexConfigObject
				}
			}

			const nodesWithIndexDefaultNoneRes = writeConnection.query(nodesWithIndexDefaultNoneQueryParams);
			const nodesWithIndexDefaultNone = nodesWithIndexDefaultNoneRes.hits
				.map(hit => writeConnection.get<NodeWithIndexConfigDefaultIsNone>(hit.id))
				.map(({
					_id, _indexConfig, _nodeType, _path, type
				}) => ({
					_id, _indexConfig, _nodeType, _path, type
				}))
				.filter(({
					_indexConfig: {
						default: {
							decideByType,
							enabled,
							nGram,
							fulltext,
							includeInAllText,
							path
						} = {}
					}
				}) => enabled === false
					&& decideByType === false
					&& nGram === false
					&& fulltext === false
					&& includeInAllText === false
					&& path === false
				);
			//log.debug(`nodesWithIndexDefaultNoneRes:${toStr(nodesWithIndexDefaultNoneRes)}`);
			//log.debug(`nodesWithIndexDefaultNoneQueryParams:${toStr(nodesWithIndexDefaultNoneQueryParams)}`);
			progress.finishItem();

			progress.addItems(nodesWithIndexDefaultNoneRes.hits.length);
			nodesWithIndexDefaultNone.forEach(({_id, _nodeType, _path, type}) => {
				progress.setInfo(`Trying to change _nodeType from ${_nodeType} to ${type} on _path:${_path} _id:${_id}...`).report().logInfo();
				ignoreErrors(() => {
					writeConnection.modify<NodeWithIndexConfigDefaultIsNone>({
						key: _id,
						editor: (node) => {
							node._indexConfig.default.enabled = true;
							node._nodeType = node.type;
							delete node.type;
							return node;
						}
					});
				}); // ignoreErrors
				progress.finishItem();
			});
			writeConnection.refresh();
			setModel({
				connection: writeConnection,
				version: 2
			});
		} // if model < 2

		//──────────────────────────────────────────────────────────────────────
		// Model 3: Removing displayName from all fields
		//──────────────────────────────────────────────────────────────────────
		if (isModelLessThan({
			connection: writeConnection,
			version: 3
		})) {
			progress.addItems(1).setInfo(`Finding fields with displayName...`).report().debug();
			const fieldsWithDisplayNameQueryParams = {
				count: -1,
				filters: {
					boolean: {
						must: [{exists: {field: 'displayName'}}],
						should: [{
							hasValue: {
								field: '_nodeType',
								values: ['com.enonic.app.explorer:field']
							}},	{
							hasValue: {
								field: 'type',
								values: ['com.enonic.app.explorer:field']
							}
						}]
					}
				},
				query: ''
			};
			//log.debug(`fieldsWithDisplayNameQueryParams:${toStr(fieldsWithDisplayNameQueryParams)}`);

			interface NodeWithDisplayName {
				_id :string
				_path :string
				displayName :string
			}

			const fieldsWithDisplayNameRes = writeConnection.query(fieldsWithDisplayNameQueryParams);
			//log.debug(`fieldsWithDisplayNameRes:${toStr(fieldsWithDisplayNameRes)}`);

			const fieldsWithDisplayName = fieldsWithDisplayNameRes.hits
				.map(hit => writeConnection.get<NodeWithDisplayName>(hit.id))
				.map(({
					_id, _path, displayName
				})=>({
					_id, _path, displayName
				}));
			progress.finishItem();

			progress.addItems(fieldsWithDisplayName.length);
			fieldsWithDisplayName.forEach(({_id, _path, displayName}) => {
				progress.setInfo(`Removing displayName:${displayName} from _path:${_path} _id:${_id}...`).report().logInfo();
				ignoreErrors(() => {
					writeConnection.modify<NodeWithDisplayName>({
						key: _id,
						editor: (node) => {
							delete node.displayName;
							return node;
						}
					});
				}); // ignoreErrors
				progress.finishItem();
			});
			writeConnection.refresh();
			setModel({
				connection: writeConnection,
				version: 3
			});
		} // if model < 3

		//──────────────────────────────────────────────────────────────────────
		// Model 4: Creating/updating default interface (moved to 9)
		//──────────────────────────────────────────────────────────────────────

		//──────────────────────────────────────────────────────────────────────
		// Model 5: Remove filters on SYSTEM_FIELDS from interface nodes
		//──────────────────────────────────────────────────────────────────────
		if (isModelLessThan({
			connection: writeConnection,
			version: 5
		})) {
			progress.addItems(1).setInfo('Remove filters on SYSTEM_FIELDS from interface nodes...').report().logInfo();
			const allInterfaceNodesQueryParams = {
				count: -1,
				filters: {
					boolean: {
						should: [{
							hasValue: {
								field: '_nodeType',
								values: [NodeType.INTERFACE]
							}},	{
							hasValue: {
								field: 'type',
								values: [NodeType.INTERFACE]
							}
						}]
					}
				},
				query: ''
			};
			//log.debug(`allInterfaceNodesQueryParams:${toStr(allInterfaceNodesQueryParams)}`);

			const allInterfaceNodes = writeConnection.query(allInterfaceNodesQueryParams).hits.map(({id}) => writeConnection.get<InterfaceNodeWithFilter>(id));
			//log.debug(`allInterfaceNodes:${toStr(allInterfaceNodes)}`);

			const SYSTEM_FIELD_KEYS = [...SYSTEM_FIELDS, FIELD_TYPE].map(({key}) => key);
			//log.debug(`SYSTEM_FIELD_KEYS:${toStr(SYSTEM_FIELD_KEYS)}`);

			allInterfaceNodes.forEach(({
				_id,
				//_path,
				filters
			}) => {
				if (filters) {
					let boolHasFilterOnSystemField = false;
					['must', 'mustNot', 'should'].forEach((clause) => {
						if (filters[clause]) {
							forceArray<InterfaceNodeFilter>(filters[clause]).forEach(({
								filter,
								params: {
									field
								} = {}
							} = {}) => {
								if (['exists', 'hasValue', 'notExists'].includes(filter)) {
									if (SYSTEM_FIELD_KEYS.includes(field)) {
										//log.debug(`_path:${_path} filters:${toStr(filters)}`);
										boolHasFilterOnSystemField = true;
									}
								}
							}); // forEach filter
						}
					}); // foreach clause
					if (boolHasFilterOnSystemField) {
						writeConnection.modify<InterfaceNodeWithFilter>({
							key: _id,
							editor: (interfaceNode) => {
								//log.debug(`interfaceNode:${interfaceNode}`);
								['must', 'mustNot', 'should'].forEach((clause) => {
									const filtersToDelete = [];
									const filtersToKeep = [];
									if (interfaceNode.filters[clause]) {
										forceArray<InterfaceNodeFilter>(interfaceNode.filters[clause]).forEach((filter = {}) => {
											const {
												filter: filterFunction,
												params: {
													field
												} = {}
											} = filter;
											if (
												['exists', 'hasValue', 'notExists'].includes(filterFunction)
												&& SYSTEM_FIELD_KEYS.includes(field)
											) {
												filtersToDelete.push(filter);
											} else {
												filtersToKeep.push(filter);
											}
										}); // forEach filter
										//log.debug(`_path:${_path} filtersToDelete:${toStr(filtersToDelete)}`);
										//log.debug(`_path:${_path} filtersToKeep:${toStr(filtersToKeep)}`);
										interfaceNode.filters[clause] = filtersToKeep; // overwrite filter clause
									}
								}); // forEach clause
								//log.debug(`modified interfaceNode:${interfaceNode}`);
								return interfaceNode;
							}
						});
						writeConnection.refresh();
					} // if boolHasFilterOnSystemField
				} // if filters
			}); // allInterfaceNodes.forEach

			setModel({
				connection: writeConnection,
				version: 5
			});
			progress.finishItem();
		} // if model < 5

		//──────────────────────────────────────────────────────────────────────
		// Model 6: Remove "system" fields
		//──────────────────────────────────────────────────────────────────────
		// NOTE: This will delete the type field, but it can be recreated and
		// used as a normal field after that.
		//──────────────────────────────────────────────────────────────────────
		if (isModelLessThan({
			connection: writeConnection,
			version: 6
		})) {
			progress.addItems(1).setInfo(`Removing "system" fields from explorer repo...`).report().logInfo();
			const fieldsPathsToDelete = [...SYSTEM_FIELDS, FIELD_TYPE].map(({_name}) => `${Path.FIELDS}/${_name}`);
			//log.debug(`fieldsPathsToDelete:${toStr(fieldsPathsToDelete)}`);

			//const deleteRes =
			writeConnection.delete(...fieldsPathsToDelete);
			//log.debug(`deleteRes:${toStr(deleteRes)}`);

			writeConnection.refresh();
			setModel({
				connection: writeConnection,
				version: 6
			});
			progress.finishItem();
		} // if model < 6

		//──────────────────────────────────────────────────────────────────────
		// Model 7: Migrate from collection.cron to system.scheduler
		//──────────────────────────────────────────────────────────────────────
		if (isModelLessThan({
			connection: writeConnection,
			version: 7
		})) {
			progress.addItems(1).setInfo(`Migrate from collection.cron to system.scheduler...`).report().logInfo();

			const collectors = getCollectors({
				connection: writeConnection
			});
			//log.debug(`collectors:${toStr({collectors})}`);

			const collectionsWithCron = writeConnection.query({
				count: -1,
				filters: addQueryFilter({
					filter: {
						exists: {
							field: 'cron'
						}
					},
					filters: addQueryFilter({
						filter: hasValue('_nodeType', [NodeType.COLLECTION]),
					})
				}),
				query: ''
			}).hits.map(({id}) => writeConnection.get<CollectionWithCron>(id));
			//log.debug(`collectionsWithCron:${toStr(collectionsWithCron)}`); // huge?

			collectionsWithCron.forEach(collectionNode => {
				//log.debug(`collectionNode:${toStr(collectionNode)}`);
				createOrModifyJobsFromCollectionNode({
					connection: writeConnection,
					collectionNode,
					collectors,
					timeZone: 'GMT+02:00' // CEST (Summer Time)
					//timeZone: 'GMT+01:00' // CET
				});
				writeConnection.modify<CollectionWithCron>({
					key: collectionNode._id,
					editor: (cNode) => {
						delete cNode.cron;
						delete cNode.doCollect;
						return cNode;
					}
				});
				writeConnection.refresh();
			}); // collectionsWithCron.forEach

			setModel({
				connection: writeConnection,
				version: 7
			});
			progress.finishItem();
		} // if model < 7


		//──────────────────────────────────────────────────────────────────────
		// Things done after all data is initialized:
		// Make sure no schedule exist for collections that are somehow deleted?
		// Make sure a schedule exist for an imported collection? No, collections no longer contain cron definitions.
		//──────────────────────────────────────────────────────────────────────
		/*progress.setInfo(`Make sure no schedule exist for collections that are somehow deleted...`).report().logDebug();
		const explorerJobs = listExplorerJobs();
		log.debug(`explorerJobs:${toStr(explorerJobs)}`);
		//deleteJob({name:})
		progress.finishItem();*/
		//──────────────────────────────────────────────────────────────────────
		if (isModelLessThan({
			connection: writeConnection,
			version: 19
		})) {
			if (isModelLessThan({
				connection: writeConnection,
				version: 18
			})) {
				if (isModelLessThan({
					connection: writeConnection,
					version: 17
				})) {
					if (isModelLessThan({
						connection: writeConnection,
						version: 16
					})) {
						if (isModelLessThan({
							connection: writeConnection,
							version: 15
						})) {
							if (isModelLessThan({
								connection: writeConnection,
								version: 14
							})) {
								if (isModelLessThan({
									connection: writeConnection,
									version: 13
								})) {
									if (isModelLessThan({
										connection: writeConnection,
										version: 12
									})) {
										if (isModelLessThan({
											connection: writeConnection,
											version: 11
										})) {
											if (isModelLessThan({
												connection: writeConnection,
												version: 10
											})) {
												if (isModelLessThan({
													connection: writeConnection,
													version: 9
												})) {
													// Model 8: Add stemmed query expressions to Default interface (not needed anymore, see 9)
													model9({ // Remove filters and query from interfaces and Add thesaurusReference to synonym nodes
														progress,
														writeConnection
													});
												} // <9
												model10({ // Change job name format
													progress,
													writeConnection
												});
											} // <10
											model11({ // interface.collections -> interface.collectionIds
												progress,
												writeConnection
											});
										} // <11
										model12({ // interface.synonyms -> interface.synonymIds
											progress,
											writeConnection
										});
									} // <12
									model13({ // Make sure ApiKeys has correct structure
										progress,
										writeConnection
									});
								} // <13
								model14({
									progress,
									writeConnection
								});
							} // <14
							model15({
								progress,
								writeConnection
							});
						} // <15
						model16({
							progress,
							writeConnection
						});
					} // <16
					model17({
						progress,
						writeConnection
					});
				} // <17
				model18({
					progress,
					writeConnection
				});
			} // <18
			model19({
				progress,
				writeConnection
			});
		} // <19
		progress.setInfo('Initialization complete :)').report().debug();
		applicationListener();
		const event = {
			type: EVENT_INIT_COMPLETE,

			// Since we have no control over where this distributable task is
			// run we have to send this event to all cluster nodes.
			// After init some code need to be executed only once (isMaster),
			// while other code need to run on all cluster nodes.
			// So this distributed event is listened for on all cluster nodes.
			distributed: true,

			data: {}
		};
		//log.info(`Sending event ${toStr(event)}`);
		send(event);
	}); // runAsSu
	const endTimeMs = currentTimeMillis();
	const durationSinceLoadMs = endTimeMs - startTimeLoadMs
	const durationSinceRunMs = endTimeMs - startTimeRunMs;
	// log.info('Migrate since load:%s run:%s', prettyMs(durationSinceLoadMs), prettyMs(durationSinceRunMs));
	log.info('Migrate since load:%s run:%s', durationSinceLoadMs, durationSinceRunMs);
}
