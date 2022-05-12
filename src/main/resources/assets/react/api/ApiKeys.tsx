//import * as React from 'react';
import {
	Header,
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
		memoizedFetchApiKeys,
		setBoolPoll,
		setShowCollections,
		setShowInterfaces,
		showCollections,
		showInterfaces
	} = useApiKeysState({
		servicesBaseUrl
	});

	return <>
		<Segment basic style={{
			marginLeft: -14,
			marginTop: -14,
			marginRight: -14
		}}>
			<Table basic collapsing compact>
				<Table.Body>
					<Table.Row verticalAlign='middle'>
						<Table.Cell collapsing>
							<Radio
								label={"Show all fields"}
								checked={showCollections}
								onChange={(
									//@ts-ignore
									event :unknown,
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
				{apiKeys.map(({
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
								afterClose={() => {
									//console.debug('NewOrEditApiKeyModal afterClose');
									memoizedFetchApiKeys();
									setBoolPoll(true);
								}}
								apiKeys={apiKeys}
								beforeOpen={() => {
									//console.debug('NewOrEditApiKeyModal beforeOpen');
									setBoolPoll(false);
								}}
								initialValues={{
									collections,
									interfaces
								}}
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
									memoizedFetchApiKeys();
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
				memoizedFetchApiKeys();
				setBoolPoll(true);
			}}
			apiKeys={apiKeys}
			beforeOpen={() => {
				//console.debug('NewOrEditApiKeyModal beforeOpen');
				setBoolPoll(false);
			}}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
};
