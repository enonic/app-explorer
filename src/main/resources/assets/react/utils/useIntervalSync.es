export function useIntervalSync(callback, delay) {
	const savedCallback = React.useRef();

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
			let id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
	}, [delay]);
} // useInterval
