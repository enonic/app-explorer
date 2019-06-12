//──────────────────────────────────────────────────────────────────────────────
// Enonic XP libs (included in jar via gradle dependencies)
//──────────────────────────────────────────────────────────────────────────────
import {isMaster} from '/lib/xp/cluster';
import {listener} from '/lib/xp/event';
import {init} from '/lib/explorer/init';
import {reschedule} from '/lib/explorer/collection/reschedule';

//──────────────────────────────────────────────────────────────────────────────
// Main
//──────────────────────────────────────────────────────────────────────────────
if (isMaster()) {
	init();
}

const cron = app.config.cron === 'true';
if (cron) {
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
}
