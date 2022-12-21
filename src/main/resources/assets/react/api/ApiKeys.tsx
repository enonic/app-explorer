import * as React from 'react';
import {
	Button,
	Header,
	Icon,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';
import Flex from '../components/Flex';
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

	const [showAllFields, setShowAllFields] = React.useState(true);

	return <Flex
		justifyContent='center'>
		<Flex.Item
			className='w-ma-fullExceptGutters w-fullExceptGutters-mobileDown w-mi-tabletExceptGutters-tabletUp'
			overflowX='overlay'
		>
			<Flex justifyContent='space-between'>
				<Flex.Item>
					<Segment className='button'>
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
					</Segment>
				</Flex.Item>
				<Flex.Item>
					<Button
						basic
						color='blue'
						loading={isLoading}
						onClick={memoizedFetchApiKeys}><Icon className='refresh'/>Last updated: {durationSinceLastUpdate}</Button>
				</Flex.Item>
			</Flex>
			<Header as='h1' disabled={isLoading}>API Keys</Header>
			<Table celled compact selectable sortable striped>
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
									<Table.Cell><ul style={{
										listStyleType: 'none',
										margin: 0,
										padding: 0
									}}>
										{collections.map((collectionName, i) => <li key={i} style={{marginBottom: 3}}>{collectionName}</li>)}
									</ul></Table.Cell>
									<Table.Cell><ul style={{
										listStyleType: 'none',
										margin: 0,
										padding: 0
									}}>
										{interfaces.map((interfaceName, i) => <li key={i} style={{marginBottom: 3}}>{interfaceName}</li>)}
									</ul></Table.Cell>

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
		</Flex.Item>
	</Flex>;
};
