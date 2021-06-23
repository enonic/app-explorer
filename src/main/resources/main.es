import '@enonic/nashorn-polyfills';
//──────────────────────────────────────────────────────────────────────────────
// Enonic XP libs (included in jar via gradle dependencies)
//──────────────────────────────────────────────────────────────────────────────
import {
	list as listCronJobs,
	//schedule as scheduleCronJob,
	unschedule as unscheduleCronJob
} from '/lib/cron';

import {toStr} from '/lib/util';
import {isMaster} from '/lib/xp/cluster';
import {listener} from '/lib/xp/event';
import {delete as deleteJob} from '/lib/xp/scheduler';
import {submitTask} from '/lib/xp/task';
import {
	BRANCH_ID_EXPLORER,
	EVENT_COLLECTOR_UNREGISTER,
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE,
	REPO_ID_EXPLORER
} from '/lib/explorer/model/2/constants';
import {
	register,
	unregister
} from '/lib/explorer/collector';

import {runAsSu} from '/lib/explorer/runAsSu';
import {connect} from '/lib/explorer/repo/connect';
import {remove} from '/lib/explorer/node/remove';
import {query as queryCollections} from '/lib/explorer/collection/query';
import {getCollectors, createOrModifyJobsFromCollectionNode} from '/lib/explorer/scheduler/createOrModifyJobsFromCollectionNode';
import {listExplorerJobs} from '/lib/explorer/scheduler/listExplorerJobs';


import {EVENT_INIT_COMPLETE} from './tasks/init/init';


const COLLECT_TASK_NAME_WEBCRAWL = 'webcrawl';

/*
 On startup some data needs to be initialized.
 Writing data only happens on the master node,
 but when initialization is complete an event is sent to all the cluster nodes,
  so the node with cron=true can do it's thing, and
  so that a listener for unregister can be setup on the master.
*/

log.info(`Starting ${app.name} ${app.version} isMaster:${isMaster()} config:${toStr(app.config)}`);

//──────────────────────────────────────────────────────────────────────────────
// Unschedule all cronJobs with applicationKey: com.enonic.app.explorer
// libCron works locally so this must be done on all cluster nodes.
// In principle such cronJobs should only exist on the node which has cron=true
// in it's app.config, but lets just make sure and do all cluster nodes.
//──────────────────────────────────────────────────────────────────────────────
/*const scheduledTestCronJob = scheduleCronJob({
	name: 'hopefullyUniqueTestName',
	cron: '1 2 3 4 5',
	callback: () => {
		log.info('This is a test');
	}
});
log.info(`scheduledTestCronJob:${toStr(scheduledTestCronJob)}`);*/

const locallyScheduledExplorerCronJobs = listCronJobs().jobs
	.filter(({applicationKey}) => applicationKey === 'com.enonic.app.explorer');
//log.info(`locallyScheduledExplorerCronJobs:${toStr(locallyScheduledExplorerCronJobs)}`);

locallyScheduledExplorerCronJobs.forEach(({name}) => {
	unscheduleCronJob({name});
});

const localExplorerCronJobsStillScheduled = listCronJobs().jobs
	.filter(({applicationKey}) => applicationKey === 'com.enonic.app.explorer'); // Should be empty
if(localExplorerCronJobsStillScheduled) {
	log.error(`localExplorerCronJobsStillScheduled:${toStr(localExplorerCronJobsStillScheduled)}`);
}

//──────────────────────────────────────────────────────────────────────────────
// Main
//──────────────────────────────────────────────────────────────────────────────

// Since some of the code within this listener callback has to be run on all
// cluster nodes. We have to listen for the event on all cluster nodes.
// Some of the code within the listener callback has to run only once, so we
// have protected that code only with isMaster.
listener({
	type: `custom.${EVENT_INIT_COMPLETE}`,

	// This event is sent from within a distributed task, so we have no control
	// over where the event is sent from. So it's sent as a distributed event,
	// thus that's what we have to listen for.
	localOnly: false,

	callback: (/*event*/) => {
		//log.info(`Received event ${toStr(event)}`);

		// The unregister event is sent as a local event on all cluster nodes.
		// But it should only be listened for, and acted upon on the master node.
		if (isMaster()) {
			listener({
				type: `custom.${EVENT_COLLECTOR_UNREGISTER}`,
				localOnly: true, // Only listen to local event? Yes
				callback: (event) => {
					log.debug(`Received event ${toStr(event)}`);
					const {collectorId} = event.data;
					if (collectorId) {
						const writeConnection = connect({
							principals: [PRINCIPAL_EXPLORER_WRITE]
						});
						if (writeConnection.exists(`/collectors/${collectorId}`)) {
							log.debug(`Trying to remove old type collector registration collectorId ${collectorId}`);
							return remove({
								connection: writeConnection,
								_parentPath: '/collectors',
								_name: collectorId
							});
						}
					}
				} // callback
			}); // listener
		} // isMaster

		register({ // Has isMaster interally
			appName: app.name,
			collectTaskName: COLLECT_TASK_NAME_WEBCRAWL,
			componentPath: 'window.LibWebCrawler.Collector',
			configAssetPath: 'react/WebCrawler.esm.js',
			displayName: 'Web crawler'
		});

		if (isMaster()) {
			runAsSu(() => {
				const allExplorerJobs = listExplorerJobs();
				//log.info(`allExplorerJobs:${toStr({allExplorerJobs})}`);
				log.info(`Deleting all scheduled jobs, before creating new ones.`);
				allExplorerJobs.forEach(({name}) => {
					log.debug(`Deleting job name:${name}, before creating new ones.`);
					deleteJob({name});
				});

				const explorerRepoReadConnection = connect({
					branch: BRANCH_ID_EXPLORER,
					repoId: REPO_ID_EXPLORER,
					principals:[PRINCIPAL_EXPLORER_READ]
				});

				const collectors = getCollectors({
					connection: explorerRepoReadConnection
				});
				//log.debug(`collectors:${toStr({collectors})}`);

				const collectionsRes = queryCollections({
					connection: explorerRepoReadConnection
				});
				//log.info(toStr({collectionsRes})); // huge

				collectionsRes.hits.forEach(collectionNode => createOrModifyJobsFromCollectionNode({
					//connection: explorerRepoReadConnection,
					collectionNode,
					collectors,
					timeZone: 'GMT+02:00' // CEST (Summer Time)
					//timeZone: 'GMT+01:00' // CET
				}));
			}); // runAsSu
		}
	} // callback EVENT_INIT_COMPLETE
}); // listener EVENT_INIT_COMPLETE

// Even though distributed task is used, it should only be run once.
// This it must still be protected with isMaster
if (isMaster()) {
	// We have no control where this is run, only that it run only once.
	submitTask({
		descriptor: 'init'
	});
} // if isMaster

__.disposer(() => {
	log.info(`Stopping ${app.name} ${app.version} isMaster:${isMaster()} config:${toStr(app.config)}`);
	unregister({
		appName: app.name,
		collectTaskName: COLLECT_TASK_NAME_WEBCRAWL
	});
});
