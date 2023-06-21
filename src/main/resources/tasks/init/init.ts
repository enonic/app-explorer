log.debug('Init task read into memory');
// @ts-ignore
const {currentTimeMillis} = Java.type('java.lang.System') as {
	currentTimeMillis :() => number
};
const startTimeLoadMs = currentTimeMillis();

import type {RepoConnection} from '/lib/xp/node';


// import {toStr} from '@enonic/js-utils';


// import ms from 'ms'; // use safeMs?

//import {getField} from '/lib/explorer/field/getField';
import {ignoreErrors} from '/lib/explorer/ignoreErrors';
import {
	APP_EXPLORER,
	//NT_DOCUMENT,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/index';
import {
	ROLES,
	REPOSITORIES,
	USERS,
} from '/lib/explorer/model/2/index';
import {isModelLessThan} from '/lib/explorer/model/isModelLessThan';

//import {exists} from '/lib/explorer/node/exists';
import {connect} from '/lib/explorer/repo/connect';
import {init as initRepo} from '/lib/explorer/repo/init';
import {runAsSu} from '/lib/explorer/runAsSu';
//import {listExplorerJobs} from '/lib/explorer/scheduler/listExplorerJobs';
// import {
// 	execute
// 	//@ts-ignore
// } from '/lib/graphql';
// import {getCachedSchema} from '/services/graphQL/graphQL';

//@ts-ignore
// import {request as httpClientRequest} from '/lib/http-client';
import {
	addMembers,
	createRole,
	createUser,
	getPrincipal//,
	//findPrincipals
} from '/lib/xp/auth';
//import {sanitize} from '/lib/xp/common';
// import {getToolUrl} from '/lib/xp/admin';
import {send} from '/lib/xp/event';
import {get as getRepo} from '/lib/xp/repo';
import {submitTask} from '/lib/xp/task';
// import {list as listVhosts} from '/lib/xp/vhost';


import {Progress} from './Progress';
import {applicationListener} from './applicationListener';


export const EVENT_INIT_COMPLETE = `${APP_EXPLORER}.init.complete`;

// const URI_FRAGMENTS = [
// 	'home',
// 	'collections',
// 	'status',
// 	'journal',
// 	'notifications',
// 	'schedule',
// 	'documentTypes',
// 	'stopWords',
// 	'synonyms',
// 	'interfaces',
// 	'about'
// ];

// We what less noise on startup.
// Let's report with info when something is actually done.
// And report with debug when only investigating if there is something to do.

// We have no control over which cluster node runs this task.
// However we have ensured it only runs once by surrounding it's submitTask with isMaster.

export function run() {
	log.debug('Init task run() called!');
	runAsSu(() => {
		const startTimeRunMs = currentTimeMillis();
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
			progress.setInfo(`Checking for user ${displayName}...`).report();//.debug();
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
		}) as RepoConnection;

		// ... TODO MODELS WAS HERE ...
		if (isModelLessThan({
			connection: writeConnection,
			version: 17
		})) {
			submitTask({
				descriptor: 'migrate'
			});
		} else {
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

			//submitTask({descriptor: 'test'});

			const endTimeMs = currentTimeMillis();
			const durationSinceLoadMs = endTimeMs - startTimeLoadMs
			const durationSinceRunMs = endTimeMs - startTimeRunMs;
			log.debug('Init since load:%s run:%s', durationSinceLoadMs, durationSinceRunMs);
			// log.info('Init since load:%s run:%s', prettyMs(durationSinceLoadMs), prettyMs(durationSinceRunMs));

			// 		const query = `{
			// 	getLocales {
			// 		country
			// 	}
			// }`;
			// 		const beforeExecuteMs = currentTimeMillis();
			// 		// const obj =
			// 		execute(getCachedSchema(),query,null);
			// 		const afterExecuteMs = currentTimeMillis();
			// 		const durationExecuteMs = afterExecuteMs - beforeExecuteMs;
			// 		log.info('execute:%s', durationExecuteMs);
			// 		// log.info('execute:%s', prettyMs(durationExecuteMs));
			// 		// log.info('obj:%s', toStr(obj));
		}
	}); // runAsSu
} // export function run
