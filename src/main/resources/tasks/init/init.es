import {
	forceArray,
	toStr
} from '@enonic/js-utils';
import {detailedDiff} from 'deep-object-diff';
import deepEqual from 'fast-deep-equal';

import {query as queryCollections} from '/lib/explorer/collection/query';
//import {getField} from '/lib/explorer/field/getField';
import {ignoreErrors} from '/lib/explorer/ignoreErrors';
import {
	APP_EXPLORER,
	//NT_DOCUMENT,
	NT_INTERFACE,
	PATH_FIELDS,
	PRINCIPAL_EXPLORER_WRITE,
	READWRITE_FIELDS,
	ROOT_PERMISSION_SYSTEM_ADMIN,
	ROOT_PERMISSION_EXPLORER_READ,
	SYSTEM_FIELDS
} from '/lib/explorer/model/2/constants';
import {
	DEFAULT_INTERFACE,
	DEFAULT_INTERFACE_NAME,
	FOLDERS,
	ROLES,
	REPOSITORIES,
	USERS,
	field,
	//fieldValue,
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

import {Progress} from './Progress';


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
			progress.setInfo(`Checking for role ${displayName}...`).report().debug();
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
			progress.setInfo(`Checking for role ${displayName}...`).report().debug();
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
			progress.setInfo(`Checking for repository ${id}...`).report().debug();
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
			}); // DEFAULT_FIELDS.forEach
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
		// Model 4: Creating/updating default interface
		//──────────────────────────────────────────────────────────────────────
		if (isModelLessThan({
			connection: writeConnection,
			version: 4
		})) {
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
			setModel({
				connection: writeConnection,
				version: 4
			});
		} // if model < 4

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

			const SYSTEM_FIELD_KEYS = SYSTEM_FIELDS.map(({key}) => key);
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
			const fieldsPathsToDelete = SYSTEM_FIELDS.map(({_name}) => `${PATH_FIELDS}/${_name}`);
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
		// Model 8: Add stemmed query expressions to Default interface
		//──────────────────────────────────────────────────────────────────────
		if (isModelLessThan({
			connection: writeConnection,
			version: 8
		})) {
			progress.addItems(1).setInfo('Add stemmed query expressions to Default interface...').report().logInfo();

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
			}

			progress.finishItem();
			setModel({
				connection: writeConnection,
				version: 8
			});
		} // if model < 8

		//──────────────────────────────────────────────────────────────────────

		progress.setInfo('Initialization complete :)').report().logInfo();
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
