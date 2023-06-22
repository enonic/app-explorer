import type { StrictDropdownItemProps } from 'semantic-ui-react';


import { HTTP_HEADERS } from '@enonic/explorer-utils/src'
import { Link } from 'react-router-dom';
import { Segment } from 'semantic-ui-react';
import GraphiQL from './GraphiQL';


function GraphiQLRouted({
	basename,
	interfaceNameState,
	interfaceOptions,
	searchString = '',
}: {
	basename: string
	interfaceNameState: string
	interfaceOptions: StrictDropdownItemProps[]
	searchString?: string
}) {
	if (interfaceNameState === 'default') {
		if (!interfaceOptions.length) {
			return <Segment basic textAlign='center'>
				Please <Link to='/interfaces/create'>create an interface</Link> to start using GraphQL.
			</Segment>;
		}
		return <Segment basic textAlign='center'>
			Please select an interface in the dropdown above to start using GraphQL.
		</Segment>;
	}
	return <GraphiQL
		headers={{
			[HTTP_HEADERS.EXPLORER_INTERFACE_NAME]: interfaceNameState
		}}
		searchString={searchString}
		url={`${basename}/api/v1/interface`}
	/>;
}

export default GraphiQLRouted;
