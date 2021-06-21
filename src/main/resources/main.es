import '@enonic/nashorn-polyfills';
//──────────────────────────────────────────────────────────────────────────────
// Enonic XP libs (included in jar via gradle dependencies)
//──────────────────────────────────────────────────────────────────────────────
/*import {
	//get as getJob,
	list as listJobs
} from '/lib/cron';*/
import {toStr} from '/lib/util';
import {isMaster} from '/lib/xp/cluster';
import {listener} from '/lib/xp/event';
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
import {addFilter} from '/lib/explorer/query/addFilter';
import {hasValue} from '/lib/explorer/query/hasValue';
import {query} from '/lib/explorer/collection/query';
import {getCollectors, reschedule} from '/lib/explorer/collection/reschedule';

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


		// The master node is typically not the cluster node which executes cron jobs.
		// So we cannot protect this code with isMaster.
		// But we have protected it with an app.config on a single cluster node instead.
		// TODO: In Enonic XP 7.7 we will use internal scheduling instead.

		const cron = app.config.cron === 'true';
		if (cron) {
			log.info('This cluster node has cron=true in app.config, rescheduling all cron jobs :)');
			runAsSu(() => {
				const explorerRepoReadConnection = connect({
					branch: BRANCH_ID_EXPLORER,
					repoId: REPO_ID_EXPLORER,
					principals:[PRINCIPAL_EXPLORER_READ]
				});

				const collectors = getCollectors({
					connection: explorerRepoReadConnection
				});
				//log.debug(`collectors:${toStr({collectors})}`);

				const collectionsRes = query({
					connection: explorerRepoReadConnection,
					filters: addFilter({
						filter: hasValue('doCollect', true)
					})
				});
				//log.info(toStr({collectionsRes})); // huge

				collectionsRes.hits.forEach(node => reschedule({
					collectors,
					node
				}));

				/*const cronList = listJobs();
				log.debug(`cronList:${toStr({cronList})}`);
				cronList.jobs.forEach(({name}) => {
					const job = getJob({name});
					log.debug(`job:${toStr({job})}`);
				});*/
			}); // runAsSu
			log.info('This cluster node has cron=true in app.config, listening for reschedule events :)');
			listener({
				type: `custom.${app.name}.reschedule`,
				localOnly: false,
				callback: (event) => {
					//log.debug(JSON.stringify(event, null, 4));
					const {collectors,node,oldNode} = event.data;
					reschedule({
						collectors,
						node,
						oldNode
					});
				}
			});
		} else {
			log.debug('This cluster node does NOT have cron=true in app.config, NOT listening for reschedule events :)');
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
