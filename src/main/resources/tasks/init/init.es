import {
	COLON_SIGN,
	DOT_SIGN,
	VALUE_TYPE_STRING,
	dirname,
	forceArray,
	uniqueId,
	toStr
} from '@enonic/js-utils';
import {detailedDiff} from 'deep-object-diff';
import deepEqual from 'fast-deep-equal';

import {get as getCollection} from '/lib/explorer/collection/get';
import {query as queryCollections} from '/lib/explorer/collection/query';
//import {getField} from '/lib/explorer/field/getField';
import {ignoreErrors} from '/lib/explorer/ignoreErrors';
import {
	APP_EXPLORER,
	//NT_DOCUMENT,
	NT_INTERFACE,
	NT_SYNONYM,
	PATH_FIELDS,
	PRINCIPAL_EXPLORER_WRITE,
	READWRITE_FIELDS,
	REPO_ID_EXPLORER,
	ROOT_PERMISSION_SYSTEM_ADMIN,
	ROOT_PERMISSION_EXPLORER_READ,
	SYSTEM_FIELDS
} from '/lib/explorer/model/2/constants';
import {
	FOLDERS,
	ROLES,
	REPOSITORIES,
	USERS,
	field,
	folder,
	interfaceModel
} from '/lib/explorer/model/2/index';
import {isModelLessThan} from '/lib/explorer/model/isModelLessThan';
import {setModel} from '/lib/explorer/model/setModel';
import {node as Node} from '/lib/explorer/model/2/nodeTypes/node';
import {create} from '/lib/explorer/node/create';
//import {exists} from '/lib/explorer/node/exists';
import {connect} from '/lib/explorer/repo/connect';
import {init as initRepo} from '/lib/explorer/repo/init';
import {get as getInterface} from '/lib/explorer/interface/get';
import {addFilter} from '/lib/explorer/query/addFilter';
import {hasValue} from '/lib/explorer/query/hasValue';
import {runAsSu} from '/lib/explorer/runAsSu';
import {getCollectors, createOrModifyJobsFromCollectionNode} from '/lib/explorer/scheduler/createOrModifyJobsFromCollectionNode';
//import {listExplorerJobs} from '/lib/explorer/scheduler/listExplorerJobs';

import {
	addMembers,
	createRole,
	createUser,
	getPrincipal/*,
	findPrincipals,
	getUser*/
} from '/lib/xp/auth';
//import {sanitize} from '/lib/xp/common';
import {send} from '/lib/xp/event';
import {get as getRepo} from '/lib/xp/repo';
import {
	create as createJob,
	delete as deleteJob,
	//get as getJob,
	list as listJobs
} from '/lib/xp/scheduler';
import {reference} from '/lib/xp/value';

import {Progress} from './Progress';
import {
	DEFAULT_INTERFACE,
	DEFAULT_INTERFACE_NAME
} from './interfaceDefault';

const FIELD_TYPE = { // TODO This should not be a system field. Remove in lib-explorer-4.0.0?
	key: 'type',
	_name: 'type',
	denyDelete: true,
	denyValues: false,
	fieldType: VALUE_TYPE_STRING,
	indexConfig: 'minimal',
	max: 1,
	min: 0
	//displayName: 'Type'
};


export const EVENT_INIT_COMPLETE = `${APP_EXPLORER}.init.complete`;

// We what less noise on startup.
// Let's report with info when something is actually done.
// And report with debug when only investigating if there is something to do.

// We have no control over which cluster node runs this task.
// However we have ensured it only runs once by surrounding it's submitTask with isMaster.

export function run() {
	runAsSu(() => {
		const progress = new Progress({
			info: 'Task started',
			//sleepMsAfterItem: 1000, // DEBUG
			total: ROLES.length
				+ USERS.length
				+ REPOSITORIES.length
		}).report();

		/*const principalsRes = findPrincipals({
			//count: -1,
			//idProvider: 'system', // nada
			//name: sanitize(`${APP_EXPLORER}.admin`),
			//searchText: sanitize(`${APP_EXPLORER}.`),
			type: 'role'
		});
		log.debug(`principalsRes:${toStr(principalsRes)}`);*/

		ROLES.forEach(({name, displayName, description}) => {
			//progress.addItems(1); Already in total
			progress.setInfo(`Checking for role ${displayName}...`).report();//.debug();
			const principal = getPrincipal(`role:${name}`);
			//log.debug(`principal:${toStr(principal)}`);
			progress.finishItem();
			if(!principal) {
				progress.addItems(1).setInfo(`Creating role ${displayName}...`).report().logInfo();
				ignoreErrors(() => {
					createRole({
						name,
						displayName,
						description
					});
				});
				progress.finishItem();
			}
		});

		USERS.forEach(({name, displayName, idProvider, roles = []}) => {
			//progress.addItems(1); Already in total
			progress.setInfo(`Checking for role ${displayName}...`).report();//.debug();
			const principal = getPrincipal(`user:${idProvider}:${name}`);
			//log.debug(`principal:${toStr(principal)}`);
			progress.finishItem();
			if(!principal) {
				progress.addItems(1).setInfo(`Creating user ${displayName}...`).report().logInfo();
				ignoreErrors(() => {
					createUser({
						idProvider,
						name,
						displayName
					});
					roles.forEach(role => addMembers(`role:${role}`, [`user:${idProvider}:${name}`]));
				});
				progress.finishItem();
			}
		});

		REPOSITORIES.forEach(({id, rootPermissions}) => {
			//progress.addItems(1); Already in total
			progress.setInfo(`Checking for repository ${id}...`).report();//.debug();
			const repo = getRepo(id);
			//log.debug(`repo:${toStr(repo)}`);
			progress.finishItem();
			if (!repo) {
				progress.addItems(1).setInfo(`Creating repository ${id}...`).report().logInfo();
				ignoreErrors(() => {
					initRepo({
						repoId: id,
						rootPermissions
					});
				});
				progress.finishItem();
			}
		});

		const writeConnection = connect({
			principals:[PRINCIPAL_EXPLORER_WRITE]
		});

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
							connection: writeConnection
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
				denyDelete, // TODO remove in 2.0?
				denyValues, // TODO remove in 2.0?
				//displayName,
				fieldType = 'string',
				indexConfig = 'type',
				inResults = true, // TODO remove in 2.0?
				key, // TODO Dissallow creating fields starting with _ and remove in 2.0?
				max = 0,
				min = 0
			}) => {
				progress.setInfo(`Creating default field ${key}...`).report().logInfo();
				const params = field({
					_name,
					_inheritsPermissions: false,
					_permissions: [
						ROOT_PERMISSION_SYSTEM_ADMIN,
						ROOT_PERMISSION_EXPLORER_READ
					],
					denyDelete, // TODO remove in 2.0?
					denyValues, // TODO remove in 2.0?
					//displayName,
					fieldType,
					indexConfig,
					inResults, // TODO remove in 2.0?
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
				emails:[]
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
				filters: addFilter({
					filter: { exists: { field: 'type'}},
					filters: addFilter({
						filter: hasValue('_nodeType', ['default'])
					})
				})
			};

			const nodesWithTypeRes = writeConnection.query(nodesWithTypeQueryParams);
			nodesWithTypeRes.hits = nodesWithTypeRes.hits
				.map(hit => writeConnection.get(hit.id))
				.map(({_id, _nodeType, _path, type}) => ({_id, _nodeType, _path, type}));
			//log.info(`nodesWithTypeRes:${toStr(nodesWithTypeRes)}`);
			//log.info(`nodesWithTypeQueryParams:${toStr(nodesWithTypeQueryParams)}`);
			progress.finishItem();

			progress.addItems(nodesWithTypeRes.total);
			nodesWithTypeRes.hits.forEach(({_id, _nodeType, _path, type}) => {
				progress.setInfo(`Trying to change _nodeType from ${_nodeType} to ${type} on _path:${_path} _id:${_id}...`).report().logInfo();
				ignoreErrors(() => {
					writeConnection.modify({
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
				filters: addFilter({
					filter: hasValue('_nodeType', ['default'])
				})
				/*filters: addFilter({
					filter: hasValue('_indexConfig.default.enabled', [false]) // Doesn't work
				}),*/
				//query: "_indexConfig.default.enabled = 'false'" // Doesn't work
			};
			const nodesWithIndexDefaultNoneRes = writeConnection.query(nodesWithIndexDefaultNoneQueryParams);
			nodesWithIndexDefaultNoneRes.hits = nodesWithIndexDefaultNoneRes.hits
				.map(hit => writeConnection.get(hit.id))
				.map(({
					_id, _indexConfig, _nodeType, _path, type
				}) => ({
					_id, _indexConfig, _nodeType, _path, type
				}))
				.filter(({_indexConfig: {
					default: {
						decideByType,
						enabled,
						nGram,
						fulltext,
						includeInAllText,
						path
					} = {}
				}}) => enabled === false
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
			nodesWithIndexDefaultNoneRes.hits.forEach(({_id, _nodeType, _path, type}) => {
				progress.setInfo(`Trying to change _nodeType from ${_nodeType} to ${type} on _path:${_path} _id:${_id}...`).report().logInfo();
				ignoreErrors(() => {
					writeConnection.modify({
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

			const fieldsWithDisplayNameRes = writeConnection.query(fieldsWithDisplayNameQueryParams);
			fieldsWithDisplayNameRes.hits = fieldsWithDisplayNameRes.hits
				.map(hit => writeConnection.get(hit.id))
				.map(({
					_id, _path, displayName
				})=>({
					_id, _path, displayName
				}));
			//log.debug(`fieldsWithDisplayNameRes:${toStr(fieldsWithDisplayNameRes)}`);
			progress.finishItem();

			progress.addItems(fieldsWithDisplayNameRes.hits.length);
			fieldsWithDisplayNameRes.hits.forEach(({_id, _path, displayName}) => {
				progress.setInfo(`Removing displayName:${displayName} from _path:${_path} _id:${_id}...`).report().logInfo();
				ignoreErrors(() => {
					writeConnection.modify({
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
								values: [NT_INTERFACE]
							}},	{
							hasValue: {
								field: 'type',
								values: [NT_INTERFACE]
							}
						}]
					}
				},
				query: ''
			};
			//log.debug(`allInterfaceNodesQueryParams:${toStr(allInterfaceNodesQueryParams)}`);

			const allInterfaceNodes = writeConnection.query(allInterfaceNodesQueryParams).hits.map(({id}) => writeConnection.get(id));
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
							forceArray(filters[clause]).forEach(({
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
						writeConnection.modify({
							key: _id,
							editor: (interfaceNode) => {
								//log.debug(`interfaceNode:${interfaceNode}`);
								['must', 'mustNot', 'should'].forEach((clause) => {
									const filtersToDelete = [];
									const filtersToKeep = [];
									if (interfaceNode.filters[clause]) {
										forceArray(interfaceNode.filters[clause]).forEach((filter = {}) => {
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
			const fieldsPathsToDelete = [...SYSTEM_FIELDS, FIELD_TYPE].map(({_name}) => `${PATH_FIELDS}/${_name}`);
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

			const collectionsWithCron = queryCollections({
				connection: writeConnection,
				filters: addFilter({
					filter: {
						exists: {
							field: 'cron'
						}
					}
				})
			}).hits;
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
				writeConnection.modify({
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
		// Model 8: Add stemmed query expressions to Default interface (not needed anymore, see 9)
		//──────────────────────────────────────────────────────────────────────

		//──────────────────────────────────────────────────────────────────────
		// Model 9:
		// Remove filters and query from interfaces
		// ...
		// Add thesaurusReference to synonym nodes
		//──────────────────────────────────────────────────────────────────────
		if (isModelLessThan({
			connection: writeConnection,
			version: 9
		})) {
			progress.addItems(1).setInfo('Finding interfaces which has filters, so they can be removed...').report().logInfo();
			const interfacesWithFilters = writeConnection.query({
				count: -1,
				filters: addFilter({
					filter: { exists: { field: 'filters'}},
					filters: addFilter({
						filter: hasValue('_nodeType', [NT_INTERFACE])
					})
				})
			}).hits.map(({id}) => writeConnection.get(id));
			//log.debug(`interfacesWithFilters:${toStr(interfacesWithFilters)}`);
			progress.finishItem();

			if (interfacesWithFilters) {
				progress.addItems(interfacesWithFilters.length);
				interfacesWithFilters.forEach(({_path}) => {
					progress.setInfo(`Removing filters from interface _path:${_path}`).report().logInfo();
					writeConnection.modify({
						key: _path,
						editor: (interfaceNode) => {
							delete interfaceNode.filters;
							//log.debug(`interfaceNode with filters removed:${toStr(interfaceNode)}`);
							return interfaceNode;
						}
					});
					progress.finishItem();
				});
			}

			progress.addItems(1).setInfo('Finding interfaces which has a query, so it can be removed...').report().logInfo();
			const interfacesWithQuery = writeConnection.query({
				count: -1,
				filters: addFilter({
					filter: { exists: { field: 'query'}},
					filters: addFilter({
						filter: hasValue('_nodeType', [NT_INTERFACE])
					})
				})
			}).hits.map(({id}) => writeConnection.get(id));
			//log.debug(`interfacesWithQuery:${toStr(interfacesWithQuery)}`);
			progress.finishItem();

			if (interfacesWithQuery) {
				progress.addItems(interfacesWithQuery.length);
				interfacesWithQuery.forEach(({_path}) => {
					progress.setInfo(`Removing query from interface _path:${_path}`).report().logInfo();
					writeConnection.modify({
						key: _path,
						editor: (interfaceNode) => {
							delete interfaceNode.query;
							//log.debug(`interfaceNode with query removed:${toStr(interfaceNode)}`);
							return interfaceNode;
						}
					});
					progress.finishItem();
				});
			}

			progress.addItems(1).setInfo('Finding interfaces which has resultMappings, so they can be removed...').report().logInfo();
			const interfacesWithResultMappings = writeConnection.query({
				count: -1,
				filters: addFilter({
					filter: { exists: { field: 'resultMappings'}},
					filters: addFilter({
						filter: hasValue('_nodeType', [NT_INTERFACE])
					})
				})
			}).hits.map(({id}) => writeConnection.get(id));
			//log.debug(`interfacesWithResultMappings:${toStr(interfacesWithResultMappings)}`);
			progress.finishItem();

			if (interfacesWithResultMappings) {
				progress.addItems(interfacesWithResultMappings.length);
				interfacesWithResultMappings.forEach(({_path}) => {
					progress.setInfo(`Removing resultMappings from interface _path:${_path}`).report().logInfo();
					writeConnection.modify({
						key: _path,
						editor: (interfaceNode) => {
							delete interfaceNode.resultMappings;
							log.debug(`interfaceNode with resultMappings removed:${toStr(interfaceNode)}`);
							return interfaceNode;
						}
					});
					progress.finishItem();
				});
			}

			progress.addItems(1).setInfo('Finding all interfaces so resultMappings can be removed from indexConfig...').report().logInfo();
			const allInterfaces = writeConnection.query({
				count: -1,
				filters: addFilter({
					filter: hasValue('_nodeType', [NT_INTERFACE])
				})
			}).hits.map(({id}) => writeConnection.get(id));
			//log.debug(`allInterfaces:${toStr(allInterfaces)}`);
			progress.finishItem();

			if (allInterfaces) {
				progress.addItems(allInterfaces.length);
				allInterfaces.forEach(({_indexConfig = {}, _path}) => {
					if (_indexConfig.configs) {
						const hasResultMappingsArray = forceArray(_indexConfig.configs).filter(({path: p}) => p === 'resultMappings*');
						//log.debug(`hasResultMappingsArray:${toStr(hasResultMappingsArray)}`);
						if (hasResultMappingsArray.length) {
							progress.setInfo(`Removing resultMappings from indexConfig of interface _path:${_path}`).report().logInfo();
							writeConnection.modify({
								key: _path,
								editor: (interfaceNode) => {
									interfaceNode._indexConfig.configs.forEach(({path}, i) => {
										if (path === 'resultMappings*') {
											//log.debug(`The index of the indexConfig with path 'resultMapping*' is:${toStr(i)} in inteface with _path:${_path}`);
											interfaceNode._indexConfig.configs.splice(i, 1);
										}
									});
									//log.debug(`interfaceNode with resultMappings removed from indexConfig:${toStr(interfaceNode)}`);
									return interfaceNode;
								}
							});
						}
					}
					progress.finishItem();
				});
			}

			progress.addItems(1).setInfo('Finding interfaces which has facets, so they can be removed...').report().logInfo();
			const interfacesWithFacets = writeConnection.query({
				count: -1,
				filters: addFilter({
					filter: { exists: { field: 'facets'}},
					filters: addFilter({
						filter: hasValue('_nodeType', [NT_INTERFACE])
					})
				})
			}).hits.map(({id}) => writeConnection.get(id));
			//log.debug(`interfacesWithFacets:${toStr(interfacesWithFacets)}`);
			progress.finishItem();

			if (interfacesWithFacets) {
				progress.addItems(interfacesWithFacets.length);
				interfacesWithFacets.forEach(({_path}) => {
					progress.setInfo(`Removing facets from interface _path:${_path}`).report().logInfo();
					writeConnection.modify({
						key: _path,
						editor: (interfaceNode) => {
							delete interfaceNode.facets;
							//log.debug(`interfaceNode with facets removed:${toStr(interfaceNode)}`);
							return interfaceNode;
						}
					});
					progress.finishItem();
				});
			}

			progress.addItems(1).setInfo('Finding interfaces which has pagination, so they can be removed...').report().logInfo();
			const interfacesWithPagination = writeConnection.query({
				count: -1,
				filters: addFilter({
					filter: { exists: { field: 'pagination'}},
					filters: addFilter({
						filter: hasValue('_nodeType', [NT_INTERFACE])
					})
				})
			}).hits.map(({id}) => writeConnection.get(id));
			//log.debug(`interfacesWithPagination:${toStr(interfacesWithPagination)}`);
			progress.finishItem();

			if (interfacesWithPagination) {
				progress.addItems(interfacesWithPagination.length);
				interfacesWithPagination.forEach(({_path}) => {
					progress.setInfo(`Removing pagination from interface _path:${_path}`).report().logInfo();
					writeConnection.modify({
						key: _path,
						editor: (interfaceNode) => {
							delete interfaceNode.pagination;
							//log.debug(`interfaceNode with pagination removed:${toStr(interfaceNode)}`);
							return interfaceNode;
						}
					});
					progress.finishItem();
				});
			}

			progress.addItems(1).setInfo('Finding interfaces which has thesauri, so they can be removed...').report().logInfo();
			const interfacesWithThesauri = writeConnection.query({
				count: -1,
				filters: addFilter({
					filter: { exists: { field: 'thesauri'}},
					filters: addFilter({
						filter: hasValue('_nodeType', [NT_INTERFACE])
					})
				})
			}).hits.map(({id}) => writeConnection.get(id));
			//log.debug(`interfacesWithThesauri:${toStr(interfacesWithThesauri)}`);
			progress.finishItem();

			if (interfacesWithThesauri) {
				progress.addItems(interfacesWithThesauri.length);
				interfacesWithThesauri.forEach(({_path}) => {
					progress.setInfo(`Removing thesauri from interface _path:${_path}`).report().logInfo();
					writeConnection.modify({
						key: _path,
						editor: (interfaceNode) => {
							delete interfaceNode.thesauri;
							//log.debug(`interfaceNode with thesauri removed:${toStr(interfaceNode)}`);
							return interfaceNode;
						}
					});
					progress.finishItem();
				});
			}

			const NT_FIELD_VALUE = `${APP_EXPLORER}${COLON_SIGN}field-value`;
			progress.addItems(1).setInfo('Finding fieldValues so they can be deleted...').report().logInfo();
			const fieldValueIds = writeConnection.query({
				count: -1,
				filters: addFilter({
					filters: addFilter({
						filter: hasValue('_nodeType', [NT_FIELD_VALUE])
					})
				})
			}).hits.map(({id}) => id);
			//log.debug(`fieldValueIds:${toStr(fieldValueIds)}`);
			progress.finishItem();

			if(fieldValueIds.length) {
				progress.addItems(1).setInfo(`Deleting ${fieldValueIds.length} fieldValues...`).report().logInfo();
				writeConnection.delete(fieldValueIds);
				progress.finishItem();
			}

			progress.addItems(1).setInfo('Creating/updating default interface...').report().logInfo();

			const existingInterfaceNode = getInterface({
				connection: writeConnection,
				interfaceName: DEFAULT_INTERFACE_NAME
			});
			//log.debug(`existingInterfaceNode:${toStr(existingInterfaceNode)}`);

			const interfaceParams = interfaceModel(DEFAULT_INTERFACE);
			//log.debug(`interfaceParams:${toStr(interfaceParams)}`);

			if(existingInterfaceNode) {
				const maybeChangedInterface = JSON.parse(JSON.stringify(existingInterfaceNode));
				delete interfaceParams._parentPath;
				Object.keys(interfaceParams).forEach((k) => {
					maybeChangedInterface[k] = interfaceParams[k];
				});
				//log.debug(`maybeChangedInterface:${toStr(maybeChangedInterface)}`);

				if (!deepEqual(existingInterfaceNode, maybeChangedInterface)) {
					interfaceParams.modifiedTime = new Date();
					maybeChangedInterface.modifiedTime = interfaceParams.modifiedTime;
					ignoreErrors(() => {
						log.info(`Changes detected, updating default interface. Diff:${toStr(detailedDiff(existingInterfaceNode, maybeChangedInterface))}`);
						writeConnection.modify({
							key: existingInterfaceNode._id,
							editor: (node) => {
								Object.keys(interfaceParams).forEach((k) => {
									node[k] = interfaceParams[k];
								});
								return node;
							}
						});
					});
				}
			} else {
				ignoreErrors(() => {
					create(interfaceParams, {
						connection: writeConnection
					}); // Should contain _parentPath
				});
			}
			progress.finishItem();

			progress.addItems(1).setInfo('Finding synonyms without thesaurusReference...').report().logInfo();
			const synonymsWithoutThesaurusReferenceParams = {
				//count: 2, // DEBUG
				count: -1,
				filters: addFilter({
					filter: {
						notExists: { field: 'thesaurusReference'}
					},
					filters: addFilter({
						filter: hasValue('_nodeType', [NT_SYNONYM])
					})
				})
			};
			//log.debug(`synonymsWithoutThesaurusReferenceParams:${toStr(synonymsWithoutThesaurusReferenceParams)}`);
			const synonymsWithoutThesaurusReference = writeConnection
				.query(synonymsWithoutThesaurusReferenceParams)
				.hits.map(({id}) => writeConnection.get(id));
			//log.debug(`synonymsWithoutThesaurusReference:${toStr(synonymsWithoutThesaurusReference)}`);

			const thesaurusPathToId = {};

			progress.addItems(synonymsWithoutThesaurusReference.length);
			synonymsWithoutThesaurusReference.forEach(({_id, _path}) => {
				progress.addItems(1).setInfo(`Adding thesaurusReference to synonym _id:${_id}`).report().logInfo();
				const thesaurusPath = dirname(_path); //_path.match(/[^/]+/g)[1];
				//log.debug(`thesaurusPath:${toStr(thesaurusPath)}`);
				if (!thesaurusPathToId[thesaurusPath]) {
					const thesaurusNode = writeConnection.get(thesaurusPath);
					//log.debug(`thesaurusNode:${toStr(thesaurusNode)}`);
					thesaurusPathToId[thesaurusPath] = thesaurusNode._id;
					//log.debug(`thesaurusPathToId:${toStr(thesaurusPathToId)}`);
				}
				const thesaurusId = thesaurusPathToId[thesaurusPath];
				//log.debug(`thesaurusId:${toStr(thesaurusId)}`);
				//const synonymWithoutThesaurusModifyRes =
				writeConnection.modify({
					key: _id,
					editor: (node) => {
						node.thesaurusReference = reference(thesaurusId);
						return node;
					}
				});
				//log.debug(`synonymWithoutThesaurusModifyRes:${toStr(synonymWithoutThesaurusModifyRes)}`);
				progress.finishItem();
			});

			writeConnection.refresh();

			progress.finishItem();

			setModel({
				connection: writeConnection,
				version: 9
			});
		} // if model < 9

		//──────────────────────────────────────────────────────────────────────
		// Model 10: Change job name format
		//──────────────────────────────────────────────────────────────────────
		if (isModelLessThan({
			connection: writeConnection,
			version: 10
		})) {
			const jobs = listJobs();
			//log.debug(`jobs:${toStr(jobs)}`);

			jobs.forEach((job) => {
				//log.debug(`job:${toStr(job)}`);
				const {
					name
				} = job;
				//log.debug(`name:${toStr(name)}`);
				/*const fullJob = getJob({name}); // Not needed, list contains everything.
				log.debug(`fullJob:${toStr(fullJob)}`);*/
				if (name.startsWith(APP_EXPLORER)) {
					const {
						config: {
							collectionId: collectionIdAlreadyPresent,
							name: collectionName
						},
						descriptor
					} = job;

					if (!collectionIdAlreadyPresent) {
						progress.addItems(1).setInfo(`Renaming job ${name}`).report().logInfo();

						const jobPrefix = `${descriptor.replace(':', DOT_SIGN)}${DOT_SIGN}${collectionName}${DOT_SIGN}`;
						//log.debug(`jobPrefix:${toStr(jobPrefix)}`);

						const jobNumber = name.replace(jobPrefix, '');
						//log.debug(`jobNumber:${toStr(jobNumber)}`);

						//log.debug(`collectionName:${toStr(collectionName)}`);
						const collectionNode = getCollection({
							connection: writeConnection,
							name: collectionName
						});
						//log.debug(`collectionNode:${toStr(collectionNode)}`);
						const {_id: collectionId} = collectionNode;
						//log.debug(`collectionId:${toStr(collectionId)}`);
						job.config.collectionId = collectionId; // Not using reference since this is in another repo.
						job.name = uniqueId({
							repoId: REPO_ID_EXPLORER,
							nodeId: collectionId,
							versionKey: jobNumber
						});
						//log.debug(`job.name:${toStr(job.name)}`);
						log.debug(`job:${toStr(job)}`);
						const createdJob = createJob(job);
						log.debug(`createdJob:${toStr(createdJob)}`);
						if (createdJob) {
							const deleteRes = deleteJob({name});
							log.debug(`deleteRes:${toStr(deleteRes)}`);
						}
						progress.finishItem();
					}
				} // if (name.startsWith(APP_EXPLORER))
			}); // jobs.forEach

			setModel({
				connection: writeConnection,
				version: 10
			});
		}
		//──────────────────────────────────────────────────────────────────────
		// Model 11: interface.collections -> interface.collectionIds
		//──────────────────────────────────────────────────────────────────────
		if (isModelLessThan({
			connection: writeConnection,
			version: 11
		})) {
			progress.addItems(1).setInfo('Finding interfaces with collections...').report().logInfo();
			const allCollections = queryCollections({
				connection: writeConnection
			}).hits;
			//log.debug(`allCollections:${toStr(allCollections)}`); // HUGE!

			const collectionNameToIdObj = {};
			allCollections.forEach(({_id, _name}) => {
				collectionNameToIdObj[_name] = _id;
			});
			//log.debug(`collectionNameToIdObj:${toStr(collectionNameToIdObj)}`);

			const interfacesWithCollectionsQueryParams = {
				count: -1,
				filters: addFilter({
					filter: {
						exists: { field: 'collections'}
					},
					filters: addFilter({
						filter: hasValue('_nodeType', [NT_INTERFACE])
					})
				})
			};
			//log.debug(`interfacesWithCollectionsQueryParams:${toStr(interfacesWithCollectionsQueryParams)}`);

			const interfaceIds = writeConnection.query(interfacesWithCollectionsQueryParams).hits.map(({id}) => id);
			//log.debug(`interfaceIds:${toStr(interfaceIds)}`);

			progress.addItems(interfaceIds.length); // .setInfo(`Found ${interfaceIds.length} interfaces with collections.`)
			progress.finishItem(); // .setInfo('Done finding interfaces with collections.')

			interfaceIds.forEach((interfaceId) => {
				progress.setInfo(`Converting collections -> collectionIds in interfaceId:${interfaceId}`).report().logInfo();
				writeConnection.modify({
					key: interfaceId,
					editor: (interfaceNode) => {
						//log.debug(`(in) collectionIdReferences:${toStr(interfaceNode.collectionIds)}`); // Oh, NO! Seems they all come in as nulls???
						interfaceNode.collectionIds = interfaceNode.collectionIds
							? forceArray(interfaceNode.collectionIds)
								.map((collectionIdReference) => `${collectionIdReference}`) // Convert reference to string, so comparisons work
								.filter((v,i,a)=>a.indexOf(v)==i) // Remove duplicates (NOTE Doesn't work on references)
							: [];
						//log.debug(`(before) interfaceNode.collectionIds:${toStr(interfaceNode.collectionIds)}`); // Should be strings
						interfaceNode.collections && forceArray(interfaceNode.collections).forEach((collectionName) => {
							const collectionId = collectionNameToIdObj[collectionName];
							if (collectionId) {
								if (!interfaceNode.collectionIds.includes(collectionId)) { // NOTE Comparison doesn't work on references
									interfaceNode.collectionIds.push(collectionId);
								} else {
									log.warning(`collectionId:${collectionId} already present in collectionIds`);
								}
							} else {
								log.error(`Unable to find collectionId from collectionName:${collectionName}. Dropped from interface!`);
							}
						}); // forEach collectionName
						//log.debug(`(after) interfaceNode.collectionIds:${toStr(interfaceNode.collectionIds)}`); // Should be strings
						interfaceNode.collectionIds = interfaceNode.collectionIds.map((collectionId) => reference(collectionId));
						//log.debug(`(out) collectionIdReferences:${toStr(interfaceNode.collectionIds)}`); // This should report nulls again
						delete interfaceNode.collections;
						return interfaceNode;
					} // editor
				}); // modify
				progress.finishItem(); // setInfo(`Done converting collections -> collectionIds in interfaceId:${interfaceId}`)
			}); // forEach interfaceId

			setModel({
				connection: writeConnection,
				version: 11
			});
		}
		//──────────────────────────────────────────────────────────────────────

		progress.setInfo('Initialization complete :)').report().debug();
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
} // export function run
