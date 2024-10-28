import * as React from 'react';
import {
	Header,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';
import RefreshButton from '../components/buttons/RefreshButton';
import Flex from '../components/Flex';
import {useApiKeysState} from './useApiKeysState';
import {DeleteApiKeyModal} from './DeleteApiKeyModal';
import {NewOrEditApiKeyModal} from './NewOrEditApiKeyModal';


export const ApiKeys = (props: {
	servicesBaseUrl: string
}) => {
	//console.debug('props', props);
	const {
		servicesBaseUrl
	} = props;

	const {
		apiKeys,
		isLoading,
		memoizedFetchApiKeys
	} = useApiKeysState({
		servicesBaseUrl
	});

	const [showAllFields, setShowAllFields] = React.useState(true);

	return <Flex
		className='mt-1rem'
		justifyContent='center'
	>
		<Flex.Item
			className='w-ma-fullExceptGutters w-fullExceptGutters-mobileDown w-mi-tabletExceptGutters-tabletUp'
			overflowX='overlay'
		>
			<Flex justifyContent='space-between'>
				<Flex.Item>
					<Segment className='button-padding'>
						<Radio
							label={"Show all fields"}
							checked={showAllFields}
							onChange={(
								_event: unknown,
								{checked}
							) => {
								setShowAllFields(checked);
							}}
							toggle
						/>
					</Segment>
				</Flex.Item>
				<Flex.Item>
					<RefreshButton
						onClick={memoizedFetchApiKeys}
						loading={isLoading}
					/>
				</Flex.Item>
			</Flex>
			<Header as='h1' disabled={isLoading}>API Keys</Header>
			<Table celled compact striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Name</Table.HeaderCell>
						{showAllFields ?
							<>
								<Table.HeaderCell>Collections</Table.HeaderCell>
								<Table.HeaderCell>Interfaces</Table.HeaderCell>
							</>
							: null}
						<Table.HeaderCell>{showAllFields ? 'Actions' : 'Edit'}</Table.HeaderCell>
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
							<Table.Cell>{_name}</Table.Cell>
							{
								showAllFields
									? <>
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
									</>
									: null
							}
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
								{
									showAllFields
										? <DeleteApiKeyModal
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
										: null
								}
							</Table.Cell>
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
