import type {ExplorerProps} from '/index.d';


import GraphQLContextProvider from './components/GraphQLContextProvider';
import Explorer from './components/Explorer';


export function App({
	basename,
	collectorComponents,
	licensedTo,
	licenseValid,
	servicesBaseUrl,
}: ExplorerProps) {
	return <GraphQLContextProvider
		basename={basename}
	>
		<Explorer
			basename={basename}
			collectorComponents={collectorComponents}
			licensedTo={licensedTo}
			licenseValid={licenseValid}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</GraphQLContextProvider>;
}
