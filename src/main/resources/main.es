//──────────────────────────────────────────────────────────────────────────────
// Enonic XP libs (included in jar via gradle dependencies)
//──────────────────────────────────────────────────────────────────────────────
import {init} from '/lib/enonic/yase/init';
import {register} from '/lib/enonic/yase/collector/register';

//──────────────────────────────────────────────────────────────────────────────
// Main
//──────────────────────────────────────────────────────────────────────────────
init();
register({
	appName: app.name
});
