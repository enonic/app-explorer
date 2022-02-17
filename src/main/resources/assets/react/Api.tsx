import * as React from 'react';
import {
	Header,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';


import {DeleteApiKeyModal} from './api/DeleteApiKeyModal';
import {NewOrEditApiKeyModal} from './api/NewOrEditApiKeyModal';

//@ts-ignore
import {useInterval} from './utils/useInterval';


const GQL = `{
	queryApiKeys {
		hits {
			_id
			_name
			collections
			interfaces
		}
	}
	queryCollections {
		hits {
			_name
		}
	}
	queryInterfaces {
		hits {
			_name
		}
	}
}`;


export const Api = (props :{
	servicesBaseUrl :string
}) => {
	//console.debug('props', props);
	const {
		servicesBaseUrl
	} = props;

	const [queryApiKeysGraph, setQueryApiKeysGraph] = React.useState({
		count: 0,
		hits: [],
		total: 0
	});
	const [queryCollectionsGraph, setQueryCollectionsGraph] = React.useState({});
	const [queryInterfacesGraph, setQueryInterfacesGraph] = React.useState({});
	const [boolPoll, setBoolPoll] = React.useState(true);

	const [showCollections, setShowCollections] = React.useState(false);
	const [showInterfaces, setShowInterfaces] = React.useState(false);

	const fetchApiKeys = () => {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: GQL })
		})
			.then(res => res.json())
			.then(res => {
				//console.log(res);
				if (res && res.data) {
					setQueryApiKeysGraph(res.data.queryApiKeys);
					setQueryCollectionsGraph(res.data.queryCollections);
					setQueryInterfacesGraph(res.data.queryInterfaces);
				}
			});
	};

	React.useEffect(() => fetchApiKeys(), []); // Only once

	useInterval(() => {
		// This will continue to run as long as the Collections "tab" is open
		if (boolPoll) {
			fetchApiKeys();
		}
	}, 2500);

	return <>
		<Segment basic inverted style={{
			marginLeft: -14,
			marginTop: -14,
			marginRight: -14
		}}>
			<Table basic collapsing compact inverted>
				<Table.Body>
					<Table.Row verticalAlign='middle'>
						<Table.Cell collapsing>
							<Radio
								label={"Show all fields"}
								className='inverted'
								checked={showCollections}
								onChange={(
									//@ts-ignore
									ignored,
									{checked}
								) => {
									setShowCollections(checked);
									setShowInterfaces(checked);
								}}
								toggle
							/>
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
		</Segment>
		<Header as='h1'>API Keys</Header>
		<Table celled collapsing compact selectable sortable striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Edit</Table.HeaderCell>
					<Table.HeaderCell>Name</Table.HeaderCell>
					{showCollections ? <Table.HeaderCell>Collections</Table.HeaderCell> : null}
					{showInterfaces ? <Table.HeaderCell>Interfaces</Table.HeaderCell> : null}
					<Table.HeaderCell>Actions</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{queryApiKeysGraph.hits && queryApiKeysGraph.hits.map(({
					_id,
					_name,
					collections,
					interfaces
				}) => {
					return <Table.Row key={_name}>
						<Table.Cell collapsing>
							<NewOrEditApiKeyModal
								_id={_id}
								_name={_name}
								initialValues={{
									_name,
									collections,
									interfaces
								}}
								afterClose={() => {
									//console.debug('NewOrEditApiKeyModal afterClose');
									fetchApiKeys();
									setBoolPoll(true);
								}}
								beforeOpen={() => {
									//console.debug('NewOrEditApiKeyModal beforeOpen');
									setBoolPoll(false);
								}}
								queryCollectionsGraph={queryCollectionsGraph}
								queryInterfacesGraph={queryInterfacesGraph}
								servicesBaseUrl={servicesBaseUrl}
							/>
						</Table.Cell>
						<Table.Cell collapsing>{_name}</Table.Cell>
						{showCollections ? <Table.Cell>{collections.join(', ')}</Table.Cell> : null}
						{showInterfaces ? <Table.Cell>{interfaces.join(', ')}</Table.Cell> : null}
						<Table.Cell collapsing>
							<DeleteApiKeyModal
								_id={_id}
								_name={_name}
								afterClose={() => {
									//console.debug('DeleteApiKeyModal afterClose');
									fetchApiKeys();
									setBoolPoll(true);
								}}
								beforeOpen={() => {
									//console.debug('DeleteApiKeyModal beforeOpen');
									setBoolPoll(false);
								}}
								servicesBaseUrl={servicesBaseUrl}
							/>
						</Table.Cell>
					</Table.Row>;
				})}
			</Table.Body>
		</Table>
		<NewOrEditApiKeyModal
			afterClose={() => {
				//console.debug('NewOrEditApiKeyModal afterClose');
				fetchApiKeys();
				setBoolPoll(true);
			}}
			beforeOpen={() => {
				//console.debug('NewOrEditApiKeyModal beforeOpen');
				setBoolPoll(false);
			}}
			queryCollectionsGraph={queryCollectionsGraph}
			queryInterfacesGraph={queryInterfacesGraph}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
};
