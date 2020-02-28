//──────────────────────────────────────────────────────────────────────────────
// Enonic XP libs (included in jar via gradle dependencies)
//──────────────────────────────────────────────────────────────────────────────
import {isMaster} from '/lib/xp/cluster';
import {listener} from '/lib/xp/event';
import {toStr} from '/lib/util';

import {
	BRANCH_ID_EXPLORER,
	EVENT_COLLECTOR_UNREGISTER,
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE,
	REPO_ID_EXPLORER
} from '/lib/explorer/model/2/constants';
import {init} from '/lib/explorer/init';
import {register, unregister} from '/lib/explorer/collector';
import {runAsSu} from '/lib/explorer/runAsSu';
import {connect} from '/lib/explorer/repo/connect';
import {remove} from '/lib/explorer/node/remove';
import {addFilter} from '/lib/explorer/query/addFilter';
import {hasValue} from '/lib/explorer/query/hasValue';
import {query} from '/lib/explorer/collection/query';
import {getCollectors, reschedule} from '/lib/explorer/collection/reschedule';


const COLLECT_TASK_NAME_WEBCRAWL = 'webcrawl';

//──────────────────────────────────────────────────────────────────────────────
// Main
//──────────────────────────────────────────────────────────────────────────────
if (isMaster()) {
	init();
}

register({
	appName: app.name,
	collectTaskName: COLLECT_TASK_NAME_WEBCRAWL,
	configAssetPath: 'react/WebCrawler.esm.js',
	displayName: 'Web crawler'
});

listener({
	type: `custom.${EVENT_COLLECTOR_UNREGISTER}`,
	localOnly: true, // Only listen to local event? Yes
	callback: (event) => {
		log.info(`Received event ${toStr(event)}`);
		const {collectorId} = event.data;
		if (collectorId) {
			log.info(`Trying to remove collectorId ${collectorId}`);
			return remove({
				connection: connect({
					principals: [PRINCIPAL_EXPLORER_WRITE]
				}),
				_parentPath: '/collectors',
				_name: collectorId
			});
		}
	} // callback
}); // listener

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
		//log.info(toStr({collectors}));

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
		/*const jobs = listJobs();
		log.info(toStr({jobs}));
		jobs.jobs.forEach(({name}) => {
			const job = getJob({name});
			log.info(toStr({job}));
		});*/
		log.info('This cluster node has cron=true in app.config, listening for reschedule events :)');
	}); // runAsSu
	listener({
		type: `custom.${app.name}.reschedule`,
		localOnly: false,
		callback: (event) => {
			// log.info(JSON.stringify(event, null, 4));
			const {collectors,node,oldNode} = event.data;
			reschedule({
				collectors,
				node,
				oldNode
			});
		}
	});
} else {
	log.info('This cluster node does NOT have cron=true in app.config, NOT listening for reschedule events :)');
}

__.disposer(() => {
	unregister({
		appName: app.name,
		collectTaskName: COLLECT_TASK_NAME_WEBCRAWL
	});
});
