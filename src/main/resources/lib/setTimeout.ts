// Nashorn doesn't have analogues for setTimeout;
declare const Java :{
	type :<T>(s :string) => T
};

//type TimerClass =

export const setTimeout = (fn, millis) => {

	const Timer = Java.type<(s:string, b:boolean) => void>('java.util.Timer'); // This is NOT a NodeJS.Timer
	const Phaser = Java.type<() => void>('java.util.concurrent.Phaser');

	const timer = new Timer('jsEventLoop', false);
	const phaser = new Phaser();

	let timeoutStack = 0;

	function pushTimeout() {
		timeoutStack++;
	}

	function popTimeout() {
		timeoutStack--;
		if (timeoutStack > 0) {
			return;
		}
		timer.cancel();
		phaser.forceTermination();
	}

	const onTaskFinished = function () {
		phaser.arriveAndDeregister();
	};

	function doSetTimeout(
		fn :() => void,
		millis :number
	/* [, args...] */) {
		const args = [].slice.call(arguments, 2, arguments.length); // eslint-disable-line prefer-rest-params

		//const phase =
		phaser.register();
		let canceled = false;
		timer.schedule(function () {
			if (canceled) {
				return;
			}

			try {
				fn.apply(context, args);
			} catch (e) {
				//print(e); // type of DOM print conflicts with Nashorn print, using Enonic XP log.error instead
				log.error(e.message, e);
			} finally {
				onTaskFinished();
				popTimeout();
			}
		}, millis);

		pushTimeout();

		return function () {
			onTaskFinished();
			canceled = true;
			popTimeout();
		};
	}

	doSetTimeout(fn, millis);
};
