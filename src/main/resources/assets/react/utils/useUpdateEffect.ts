import * as React from 'react';


export function useUpdateEffect(
	effect :React.EffectCallback,
	deps :React.DependencyList = []
) {
	const isInitialMount = React.useRef(true);

	React.useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
		} else {
			return effect();
		}
	}, deps);
}
