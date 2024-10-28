import type {ExplorerProps} from './index.d';

import {useWhenInit} from '@seamusleahy/init-hooks';
import {
	BrowserRouter as Router,
} from 'react-router-dom';
import GraphQLContextProvider from './components/GraphQLContextProvider';
import Explorer from './components/Explorer';

export function App({
	basename,
	collectorComponents,
	licensedTo,
	licenseValid,
	servicesBaseUrl,
}: ExplorerProps) {

	useWhenInit(() => {
		// This has to happen before GraphiQL is loaded
		if (!localStorage.getItem('graphiql:theme')) {
			localStorage.setItem('graphiql:theme', 'light');
		}
	});

	return <GraphQLContextProvider
		basename={basename}
	>
		<Router basename={basename}>
			<Explorer
				basename={basename}
				collectorComponents={collectorComponents}
				licensedTo={licensedTo}
				licenseValid={licenseValid}
				servicesBaseUrl={servicesBaseUrl}
			/>
		</Router>
	</GraphQLContextProvider>;
}

// Not needed when imported in script type='module' in admin/tools/explorer/htmlResponse.ts
// window['Explorer'].App = App;
