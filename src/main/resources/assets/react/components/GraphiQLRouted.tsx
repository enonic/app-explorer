import {HTTP_HEADERS} from '@enonic/explorer-utils/src'
import {useLocation} from 'react-router-dom';
import GraphiQL from './GraphiQL';

function GraphiQLRouted({
	basename,
	searchString = '',
}: {
	basename: string
	searchString?: string
}) {
	const location = useLocation();
	const urlSearchParams = new URLSearchParams(location.search);
	const interfaceName = urlSearchParams.get('interfaceName') || 'default';

	return <GraphiQL
		headers={{
			[HTTP_HEADERS.EXPLORER_INTERFACE_NAME]: interfaceName
		}}
		searchString={searchString}
		url={`${basename}/api/v1/interface`}
	/>;
}

export default GraphiQLRouted;
