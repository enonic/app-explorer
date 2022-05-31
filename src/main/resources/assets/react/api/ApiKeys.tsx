import * as React from 'react';
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
	} = useApiKeysState({
		servicesBaseUrl
	});

	const [showAllFields, setShowAllFields] = React.useState(false);

	return <>
		<Segment basic className="page">
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
		</Segment>
		<Header as='h1'>API Keys</Header>
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
											setBoolPoll(true);
										}}
										beforeOpen={() => {
											//console.debug('DeleteApiKeyModal beforeOpen');
											setBoolPoll(false);
										}}
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
