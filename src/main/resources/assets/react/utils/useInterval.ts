import * as React from 'react';


export function useInterval<
	Callback extends () => unknown = () => unknown
>(
	callback :Callback,
	delay :number
) {
	const savedCallback = React.useRef<Callback>();

	// Remember the latest callback.
	React.useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	// Set up the interval.
	React.useEffect(() => {
		function tick() {
			savedCallback.current();
		}
		if (delay !== null) {
			const id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
	}, [delay]);
} // useInterval
