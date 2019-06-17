//──────────────────────────────────────────────────────────────────────────────
// Enonic XP libs (included in jar via gradle dependencies)
//──────────────────────────────────────────────────────────────────────────────
import {isMaster} from '/lib/xp/cluster';
import {listener} from '/lib/xp/event';

import {
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {init} from '/lib/explorer/init';
import {runAsSu} from '/lib/explorer/runAsSu';
import {connect} from '/lib/explorer/repo/connect';
import {addFilter} from '/lib/explorer/query/addFilter';
import {hasValue} from '/lib/explorer/query/hasValue';
import {query} from '/lib/explorer/collection/query';
import {getCollectors, reschedule} from '/lib/explorer/collection/reschedule';


//──────────────────────────────────────────────────────────────────────────────
// Main
//──────────────────────────────────────────────────────────────────────────────
if (isMaster()) {
	init();
}

const cron = app.config.cron === 'true';
if (cron) {
	log.info('This cluster node has cron=true in app.config, rescheduling all cron jobs :)');
	runAsSu(() => {
		const connection = connect({principals:[PRINCIPAL_EXPLORER_WRITE]});
		const collectors = getCollectors({connection});
		//log.info(toStr({collectors}));

		const collectionsRes = query({
			connection,
			filters: addFilter({
				filter: hasValue('doCollect', true)
			})
		});
		//log.info(toStr({collectionsRes})); // huge
		collectionsRes.hits.forEach(node => reschedule({
			collectors,
			node
		}))
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
