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
	ROLES,
	REPOSITORIES,
	USERS,
	field,
	fieldValue,
	interfaceModel
} from '/lib/explorer/model/2/index';
import {node as Node} from '/lib/explorer/model/2/nodeTypes/node';
import {create} from '/lib/explorer/node/create';
import {connect} from '/lib/explorer/repo/connect';
import {init as initRepo} from '/lib/explorer/repo/init';
import {runAsSu} from '/lib/explorer/runAsSu';
//import {toStr} from '/lib/util';
import {addMembers, createRole, createUser} from '/lib/xp/auth';
import {send} from '/lib/xp/event';
import {Progress} from './Progress';

export const EVENT_INIT_COMPLETE = `${APP_EXPLORER}.init.complete`;

export function run() {
	const progress = new Progress({
		info: 'Task started',
		//sleepMsAfterItem: 1000, // DEBUG
		total: ROLES.length + USERS.length + REPOSITORIES.length + DEFAULT_FIELDS.length + 3
		// Field type document
		// Default interface
		// notificationsData
	}).report();
	runAsSu(() => {
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

		const connection = connect({principals:[PRINCIPAL_EXPLORER_WRITE]});

		/*connection.modify({
			key: '/',
			editor: (node) => {
				node.initialized = false;
			}
		});*/

		DEFAULT_FIELDS.forEach(({
			_name,
			denyDelete,
			denyValues,
			displayName,
			key,
			inResults = true
		}) => {
			progress.setInfo(`Creating default field ${displayName}`).report();
			const params = field({
				_name,
				_inheritsPermissions: false,
				_permissions: [
					ROOT_PERMISSION_SYSTEM_ADMIN,
					ROOT_PERMISSION_EXPLORER_READ
				],
				denyDelete,
				denyValues,
				displayName,
				key,
				inResults
			});
			params.__connection = connection; // eslint-disable-line no-underscore-dangle
			//log.info(toStr({params}));
			ignoreErrors(() => {
				create(params);
			});
			progress.finishItem();
		}); // DEFAULT_FIELDS.forEach

		progress.setInfo('Creating fieldValue Document for field type').report();
		const node = getField({
			connection,
			_name: 'type'
		});
		//log.info(`node:${toStr({node})}`);
		if (node) {
			const paramsV = fieldValue({
				displayName: 'Document',
				field: 'type',
				fieldReference: node._id,
				value: NT_DOCUMENT
			});
			//log.info(`paramsV:${toStr({paramsV})}`);
			paramsV.__connection = connection; // eslint-disable-line no-underscore-dangle
			try {
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

		progress.setInfo('Creating default interface').report();
		const paramsI = interfaceModel(DEFAULT_INTERFACE);
		paramsI.__connection = connection; // eslint-disable-line no-underscore-dangle
		ignoreErrors(() => {
			create(paramsI);
		});
		progress.finishItem();

		progress.setInfo('Creating notificationsData').report();
		const notificationsData = Node({
			__connection: connection,
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

		/*connection.modify({
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
