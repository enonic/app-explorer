import * as React from 'react';
import {
	Button,
	Grid,
	Header,
	Icon,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';


import {useApiKeysState} from './useApiKeysState';
import {DeleteApiKeyModal} from './DeleteApiKeyModal';
import {NewOrEditApiKeyModal} from './NewOrEditApiKeyModal';


export const ApiKeys = (props :{
	servicesBaseUrl :string
}) => {
	//console.debug('props', props);
	const {
		servicesBaseUrl
	} = props;

	const {
		apiKeys,
		durationSinceLastUpdate,
		isLoading,
		memoizedFetchApiKeys
	} = useApiKeysState({
		servicesBaseUrl
	});

	const [showAllFields, setShowAllFields] = React.useState(false);

	return <>
		<Segment basic className="page">
			<Grid>
				<Grid.Column floated='left' width={3}>
					<Table basic collapsing compact>
						<Table.Body>
							<Table.Row verticalAlign='middle'>
								<Table.Cell collapsing>
									<Radio
										label={"Show all fields"}
										checked={showAllFields}
										onChange={(
											//@ts-ignore
											event :unknown,
											{checked}
										) => {
											setShowAllFields(checked);
										}}
										toggle
									/>
								</Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table>
				</Grid.Column>
				<Grid.Column floated='right' width={4}>
					<Button
						basic
						floated='right'
						color='blue'
						loading={isLoading}
						onClick={memoizedFetchApiKeys}><Icon className='refresh'/>Last updated: {durationSinceLastUpdate}</Button>
				</Grid.Column>
			</Grid>
		</Segment>
		<Header as='h1' disabled={isLoading}>API Keys</Header>
		<Table celled collapsing compact selectable sortable striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Edit</Table.HeaderCell>
					<Table.HeaderCell>Name</Table.HeaderCell>
					{showAllFields ?
						<>
							<Table.HeaderCell>Collections</Table.HeaderCell>
							<Table.HeaderCell>Interfaces</Table.HeaderCell>
							<Table.HeaderCell>Actions</Table.HeaderCell>
						</>
						: null}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{apiKeys.map(({
					_id,
					_name,
					collections,
					interfaces
				}) => {
					return <Table.Row disabled={isLoading} key={_name}>
						<Table.Cell collapsing>
							<NewOrEditApiKeyModal
								_id={_id}
								_name={_name}
								afterClose={() => {
									//console.debug('NewOrEditApiKeyModal afterClose');
									memoizedFetchApiKeys();
								}}
								apiKeys={apiKeys}
								disabled={isLoading}
								loading={isLoading}
								collections={collections}
								interfaces={interfaces}
								servicesBaseUrl={servicesBaseUrl}
							/>
						</Table.Cell>
						<Table.Cell collapsing>{_name}</Table.Cell>
						{showAllFields ?
							<>
								<Table.Cell>{collections.join(', ')}</Table.Cell>
								<Table.Cell>{interfaces.join(', ')}</Table.Cell>

								<Table.Cell collapsing>
									<DeleteApiKeyModal
										_id={_id}
										_name={_name}
										afterClose={() => {
											//console.debug('DeleteApiKeyModal afterClose');
											memoizedFetchApiKeys();
										}}
										disabled={isLoading}
										loading={isLoading}
										servicesBaseUrl={servicesBaseUrl}
									/>
								</Table.Cell>
							</>
							: null}
					</Table.Row>;
				})}
			</Table.Body>
		</Table>
		<NewOrEditApiKeyModal
			afterClose={() => {
				//console.debug('NewOrEditApiKeyModal afterClose');
				memoizedFetchApiKeys();
			}}
			apiKeys={apiKeys}
			disabled={isLoading}
			loading={isLoading}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
};
