import * as React from 'react';


export function useIntervalSync<
	Callback extends () => unknown = () => unknown
>(
	callback :Callback,
	delay :number
) {
	const savedCallback = React.useRef<Callback>();

	// Remember the latest callback.
	React.useLayoutEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	// Set up the interval.
	React.useLayoutEffect(() => {
		function tick() {
			savedCallback.current();
		}
		if (delay !== null) {
			const id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
	}, [delay]);
} // useInterval
