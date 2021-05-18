import {detailedDiff} from 'deep-object-diff';
import deepEqual from 'fast-deep-equal';

import {getField} from '/lib/explorer/field/getField';
import {ignoreErrors} from '/lib/explorer/ignoreErrors';
import {
	APP_EXPLORER,
	DEFAULT_FIELDS,
	NT_DOCUMENT,
	PRINCIPAL_EXPLORER_WRITE,
	ROOT_PERMISSION_SYSTEM_ADMIN,
	ROOT_PERMISSION_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {
	DEFAULT_INTERFACE,
	DEFAULT_INTERFACE_NAME,
	FOLDERS,
	ROLES,
	REPOSITORIES,
	USERS,
	field,
	fieldValue,
	folder,
	interfaceModel
} from '/lib/explorer/model/2/index';
import {node as Node} from '/lib/explorer/model/2/nodeTypes/node';
import {create} from '/lib/explorer/node/create';
import {connect} from '/lib/explorer/repo/connect';
import {init as initRepo} from '/lib/explorer/repo/init';
import {getFields} from '/lib/explorer/field/getFields';
import {get as getInterface} from '/lib/explorer/interface/get';
import {addFilter} from '/lib/explorer/query/addFilter';
import {hasValue} from '/lib/explorer/query/hasValue';
import {runAsSu} from '/lib/explorer/runAsSu';

import {toStr} from '/lib/util';
import {
	addMembers,
	createRole,
	createUser/*,
	getUser*/
} from '/lib/xp/auth';
import {send} from '/lib/xp/event';
import {Progress} from './Progress';

export const EVENT_INIT_COMPLETE = `${APP_EXPLORER}.init.complete`;

export function run() {
	runAsSu(() => {
		const progress = new Progress({
			info: 'Task started',
			//sleepMsAfterItem: 1000, // DEBUG
			total: ROLES.length + USERS.length + REPOSITORIES.length + DEFAULT_FIELDS.length + 5
			// Field type document
			// Default interface
			// notificationsData
		}).report();

		const writeConnection = connect({
			principals:[PRINCIPAL_EXPLORER_WRITE]
		});

		//──────────────────────────────────────────────────────────────────────
		// Move type -> _nodeType
		//──────────────────────────────────────────────────────────────────────
		progress.setInfo(`Finding nodes where _nodeType = default and node.type exists`).report();
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
			progress.setInfo(`Trying to change _nodeType from ${_nodeType} to ${type} on _path:${_path} _id:${_id}`).report();
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

		//──────────────────────────────────────────────────────────────────────
		// Nodes where _indexConfig.default = none
		//──────────────────────────────────────────────────────────────────────
		progress.setInfo(`Finding nodes where _nodeType still is default and _indexConfig.default = none`).report();
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
			progress.setInfo(`Trying to change _nodeType from ${_nodeType} to ${type} on _path:${_path} _id:${_id}`).report();
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
		//──────────────────────────────────────────────────────────────────────

		ROLES.forEach(({name, displayName, description}) => {
			progress.setInfo(`Creating role ${displayName}`).report();
			ignoreErrors(() => {
				createRole({
					name,
					displayName,
					description
				});
			});
			progress.finishItem();
		});

		USERS.forEach(({name, displayName, idProvider, roles = []}) => {
			progress.setInfo(`Creating user ${displayName}`).report();
			ignoreErrors(() => {
				createUser({
					idProvider,
					name,
					displayName
				});
				roles.forEach(role => addMembers(`role:${role}`, [`user:${idProvider}:${name}`]));
			});
			progress.finishItem();
		});

		REPOSITORIES.forEach(({id, rootPermissions}) => {
			progress.setInfo(`Creating repository ${id}`).report();
			ignoreErrors(() => {
				initRepo({
					repoId: id,
					rootPermissions
				});
			});
			progress.finishItem();
		});

		/*writeConnection.modify({
			key: '/',
			editor: (node) => {
				node.initialized = false;
			}
		});*/

		FOLDERS.forEach((_name) => {
			ignoreErrors(() => {
				create(folder({
					__connection: writeConnection,
					_name
				}));
			});
		});

		DEFAULT_FIELDS.forEach(({
			_name,
			denyDelete,
			denyValues,
			//displayName,
			key,
			inResults = true
		}) => {
			progress.setInfo(`Creating default field ${key}`).report();
			const params = field({
				_name,
				_inheritsPermissions: false,
				_permissions: [
					ROOT_PERMISSION_SYSTEM_ADMIN,
					ROOT_PERMISSION_EXPLORER_READ
				],
				denyDelete,
				denyValues,
				//displayName,
				key,
				inResults
			});
			params.__connection = writeConnection; // eslint-disable-line no-underscore-dangle
			//log.info(toStr({params}));
			ignoreErrors(() => {
				create(params);
			});
			progress.finishItem();
		}); // DEFAULT_FIELDS.forEach
		writeConnection.refresh();

		//──────────────────────────────────────────────────────────────────────
		// Removing displayName from all fields
		//──────────────────────────────────────────────────────────────────────
		progress.setInfo(`Finding fields with displayName`).report();
		const fieldsWithDisplayNameRes = getFields({
			connection: writeConnection,
			filters: addFilter({
				filter: {exists:{field: 'displayName'}}
			})
		});
		fieldsWithDisplayNameRes.hits = fieldsWithDisplayNameRes.hits.map(({
			_id, _path, displayName
		})=>({
			_id, _path, displayName
		}));
		//log.debug(`fieldsWithDisplayNameRes:${toStr(fieldsWithDisplayNameRes)}`);
		progress.finishItem();

		progress.addItems(fieldsWithDisplayNameRes.hits.length);
		fieldsWithDisplayNameRes.hits.forEach(({_id, _path, displayName}) => {
			progress.setInfo(`Removing displayName:${displayName} from _path:${_path} _id:${_id}`).report();
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
		//──────────────────────────────────────────────────────────────────────

		progress.setInfo('Creating fieldValue Document for field _nodeType').report();
		const existingNodeTypeFieldNode = getField({
			connection: writeConnection,
			_name: 'underscore-nodetype'
		});
		//log.debug(`existingNodeTypeFieldNode:${toStr({existingNodeTypeFieldNode})}`);

		if (existingNodeTypeFieldNode) {
			const paramsV = fieldValue({
				displayName: 'Document',
				field: 'underscore-nodetype', // _name not key
				fieldReference: existingNodeTypeFieldNode._id,
				value: NT_DOCUMENT
			});
			//log.debug(`paramsV:${toStr({paramsV})}`);
			paramsV.__connection = writeConnection; // eslint-disable-line no-underscore-dangle
			try {
				//const user = getUser();
				//log.debug(`user:${toStr({user})}`);
				create(paramsV);
			} catch (e) {
				if (e.class.name !== 'com.enonic.xp.node.NodeAlreadyExistAtPathException') {
					log.error(`${e.class.name} ${e.message}`, e);
				}
			}
		} else {
			log.error(`Field type not found! Cannot create field value ${NT_DOCUMENT}`);
		}
		progress.finishItem();

		//──────────────────────────────────────────────────────────────────────
		progress.setInfo('Creating/updating default interface').report();

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
			interfaceParams.__connection = writeConnection; // eslint-disable-line no-underscore-dangle
			ignoreErrors(() => {
				create(interfaceParams); // Should contain _parentPath
			});
		}

		progress.finishItem();
		//──────────────────────────────────────────────────────────────────────

		progress.setInfo('Creating notificationsData').report();
		const notificationsData = Node({
			__connection: writeConnection,
			_name: 'notifications',
			emails:[]
		});
		//log.info(toStr({notificationsData}));
		ignoreErrors(() => {
			//const notificationsNode =
			create(notificationsData);
			//log.info(toStr({notificationsNode}));
		});
		progress.finishItem();

		/*writeConnection.modify({
			key: '/',
			editor: (node) => {
				node.initialized = true;
			}
		});*/

		progress.setInfo('Initialization complete :)').report();
		const event = {
			type: EVENT_INIT_COMPLETE,
			distributed: true,
			data: {}
		};
		//log.info(`Sending event ${toStr(event)}`);
		send(event);
	}); // runAsSu
} // export function run
