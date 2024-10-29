import {useWhenInit} from '@seamusleahy/init-hooks';
import {useState} from 'react';
import {
	BrowserRouter as Router,
} from 'react-router-dom';
import GraphQLContextProvider from './components/GraphQLContextProvider';
import Explorer from './components/Explorer';

export function App() {
	const [toolUrl, setToolUrl] = useState<string | null>(null);
	const [servicesBaseUrl, setServicesBaseUrl] = useState<string | null>(null);

	useWhenInit(() => {
		// This has to happen before GraphiQL is loaded
		if (!localStorage.getItem('graphiql:theme')) {
			localStorage.setItem('graphiql:theme', 'light');
		}

		fetch(document.location.href, {
			// method: 'OPTIONS', // This doesn't work with vite.config.ts server.headers, neither under Enonic XP.
			method: 'GET', // This works with vite.config.ts server.headers, but uses a few more bytes.
		}).then(response => {
			const tUrl = response.headers.get('explorer-tool-url');
			setToolUrl(tUrl);
			setServicesBaseUrl(`${tUrl}/_/service/com.enonic.app.explorer`)
		});
	});

	if (!toolUrl || !servicesBaseUrl) {
		return null;
	}

	return <GraphQLContextProvider
		basename={toolUrl}
	>
		<Router basename={toolUrl}>
			<Explorer
				basename={toolUrl}
				servicesBaseUrl={servicesBaseUrl}
			/>
		</Router>
	</GraphQLContextProvider>;
}

// Not needed when imported in script type='module' in admin/tools/explorer/htmlResponse.ts
// window['Explorer'].App = App;
