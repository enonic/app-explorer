import '@enonic/nashorn-polyfills';
//import {toStr} from '@enonic/js-utils';

//@ts-ignore
import {isMaster} from '/lib/xp/cluster';
//@ts-ignore
import {submitTask} from '/lib/xp/task';


declare const __ :{
	disposer :(fn :() => void) => void
}


//log.info(`Starting ${app.name} ${app.version} isMaster:${isMaster()} config:${toStr(app.config)}`);
log.info(`Starting ${app.name} ${app.version} isMaster:${isMaster()}`);

// Even though distributed task is used, it should only be run once.
// Thus it must still be protected with isMaster.
if (isMaster()) {
	// We have no control where this is run, only that it run only once.
	// It will initialize some data.
	// When initialization is complete an event is sent to all the cluster nodes.
	submitTask({
		descriptor: 'init'
	});
} // if isMaster

__.disposer(() => {
	//log.info(`Stopping ${app.name} ${app.version} isMaster:${isMaster()} config:${toStr(app.config)}`);
	log.info(`Stopping ${app.name} ${app.version} isMaster:${isMaster()}`);
});
