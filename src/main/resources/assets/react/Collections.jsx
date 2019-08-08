import _ from 'lodash';
import {
	Button, Header, Icon, Loader, Modal, Table
} from 'semantic-ui-react';
import {Collection} from './Collection';


function NewOrEditModal(props) {
	const {
		//collectors,
		collectorsObj,
		collectorOptions,
		contentTypeOptions,
		disabled,
		fields,
		initialValues,
		name,
		servicesBaseUrl,
		siteOptions
	} = props;
	const [state, setState] = React.useState({
		open: false
	});
	//console.debug('NewOrEditModal', {props, state});

	const onClose = () => setState({open: false});
	const onOpen = () => setState({open: true});

	return <Modal
		closeIcon
		onClose={onClose}
		open={state.open}
		size='fullscreen'
		trigger={name ? <Button
			compact
			disabled={disabled}
			onClick={onOpen}
			size='tiny'
		><Icon color='blue' name='edit'/>Edit</Button>
			: <Button
				circular
				color='green'
				disabled={disabled}
				icon
				onClick={onOpen}
				size='massive'
				style={{
					bottom: 13.5,
					position: 'fixed',
					right: 13.5
				}}><Icon
					name='plus'
				/></Button>}
	>
		<Modal.Header>{name ? `Edit collection ${name}`: 'New collection'}</Modal.Header>
		<Modal.Content>
			<Collection
				collectorsObj={collectorsObj}
				collectorOptions={collectorOptions}
				contentTypeOptions={contentTypeOptions}
				fields={fields}
				initialValues={initialValues}
				mode={name ? 'modify' : 'create'}
				onClose={onClose}
				servicesBaseUrl={servicesBaseUrl}
				siteOptions={siteOptions}
			/>
		</Modal.Content>
	</Modal>;
} // NewOrEditModal


function DeleteModal(props) {
	const {
		name,
		onClose,
		servicesBaseUrl
	} = props;
	const [state, setState] = React.useState({
		open: false
	});
	//console.debug('DeleteModal', {props, state});

	return <Modal
		closeIcon
		onClose={() => setState({open: false})}
		open={state.open}
		trigger={<Button
			compact
			onClick={() => setState({open: true})}
			size='tiny'><Icon color='red' name='trash alternate outline'/>Delete</Button>}
	>
		<Modal.Header>Delete collection {name}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete {name}?</Header>
			<Button
				compact
				onClick={() => {
					fetch(`${servicesBaseUrl}/collectionDelete?name=${name}`, {
						method: 'DELETE'
					}).then(response => {
						//if (response.status === 200) {}
						setState({open: false});
						onClose();
					})
				}}
				size='tiny'
			><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Content>
	</Modal>;
} // DeleteModal


export function Collections(props) {
	const {
		collectorsObj,
		servicesBaseUrl,
		TOOL_PATH
	} = props;

	const [state, setState] = React.useState({
		collections: {
			count: 0,
			hits: [],
			total: 0
		},
		collectorOptions: [],
		column: 'name',
		contentTypeOptions: [],
		direction: 'ascending',
		fields: {},
		isLoading: true,
		siteOptions: [],
		totalCount: 0
	});
	//console.debug('Collections', {props, state});

	const {
		collections,
		collectorOptions,
		contentTypeOptions,
		column,
		direction,
		fields,
		isLoading,
		siteOptions,
		totalCount
	} = state;

	function fetchCollections() {
		setState(prev => ({
			...prev,
			isLoading: true
		}));
		fetch(`${servicesBaseUrl}/collectionList`)
			.then(response => response.json())
			.then(data => setState(prev => ({
				...prev,
				...data,
				isLoading: false
			})));
	} // fetchCollections

	const handleSortGenerator = (clickedColumn) => () => {
	    const {
			collections,
			column,
			direction
		} = state;
		/*console.debug('handleSort', {
			clickedColumn,
			collections,
			column,
			direction
		});*/

	    if (column !== clickedColumn) {
			collections.hits = _.sortBy(collections.hits, [clickedColumn]);
	    	setState(prev => ({
				...prev,
				column: clickedColumn,
		        collections,
		        direction: 'ascending'
			}));
			return;
	    }

		collections.hits = collections.hits.reverse();
	    setState(prev => ({
			...prev,
			collections,
			direction: direction === 'ascending' ? 'descending' : 'ascending'
	  	}));
	} // handleSortGenerator

	React.useEffect(() => fetchCollections(), []);

	return <>
		<Header as='h1'>Collections</Header>
		{isLoading
			? <Loader active inverted>Loading</Loader>
			: <Table celled collapsing compact selectable singleLine sortable striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell
							onClick={handleSortGenerator('name')}
							sorted={column === 'name' ? direction : null}
						>Name</Table.HeaderCell>
						<Table.HeaderCell
							onClick={handleSortGenerator('documents')}
							sorted={column === 'documents' ? direction : null}
						>Documents</Table.HeaderCell>
						<Table.HeaderCell
							onClick={handleSortGenerator('schedule')}
							sorted={column === 'schedule' ? direction : null}
						>Schedule</Table.HeaderCell>
						<Table.HeaderCell
							onClick={handleSortGenerator('interfaces')}
							sorted={column === 'interfaces' ? direction : null}
						>Interfaces</Table.HeaderCell>
						<Table.HeaderCell>Actions</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{collections.hits.map(({
						collector,
						count,
						cron,
						doCollect,
						displayName,
						//id,
						interfaces,
						name
					}, index) => {
						const key = `collection[${index}]`;

						const disabled = !(collector.name && collectorOptions.filter(({key}) => collector.name).length);

						return <Table.Row key={key}>
							<Table.Cell>{displayName}</Table.Cell>
							<Table.Cell>{count}</Table.Cell>
							<Table.Cell>{doCollect ? JSON.stringify(cron) : 'Not scheduled'}</Table.Cell>
							<Table.Cell>{interfaces}</Table.Cell>
							<Table.Cell>
								<NewOrEditModal
									collectorOptions={collectorOptions}
									collectorsObj={collectorsObj}
									contentTypeOptions={contentTypeOptions}
									disabled={disabled}
									initialValues={{
										name,
										collector,
										cron,
										doCollect
									}}
									fields={fields}
									name={name}
									servicesBaseUrl={servicesBaseUrl}
									siteOptions={siteOptions}
								/>
								<Button compact onClick={() => {
									fetch(`${servicesBaseUrl}/collectionDuplicate?name=${name}`, {
										method: 'POST'
									}).then(response => {
										fetchCollections()
									})
								}} size='tiny'><Icon color='blue' name='copy'/>Duplicate</Button>
								<Button as='a' compact disabled={disabled} href={`${TOOL_PATH}/collections/collect/${name}`} size='tiny'><Icon color='green' name='cloud download'/>Collect</Button>
								<Button as='a' compact disabled={disabled} href={`${TOOL_PATH}/collections/stop/${name}`} size='tiny'><Icon color='red' name='stop'/>Stop</Button>
								<DeleteModal name={name} onClose={() => fetchCollections()} servicesBaseUrl={servicesBaseUrl}/>
							</Table.Cell>
						</Table.Row>;
					})}
				</Table.Body>
				<Table.Footer>
					<Table.Row>
						<Table.HeaderCell></Table.HeaderCell>
						<Table.HeaderCell>{totalCount}</Table.HeaderCell>
						<Table.HeaderCell></Table.HeaderCell>
						<Table.HeaderCell></Table.HeaderCell>
						<Table.HeaderCell></Table.HeaderCell>
					</Table.Row>
				</Table.Footer>
			</Table>
		}
		<NewOrEditModal
			collectorOptions={collectorOptions}
			collectorsObj={collectorsObj}
			contentTypeOptions={contentTypeOptions}
			disabled={collectorOptions.length === 0}
			fields={fields}
			servicesBaseUrl={servicesBaseUrl}
			siteOptions={siteOptions}
		/>
	</>;
} // Collections
