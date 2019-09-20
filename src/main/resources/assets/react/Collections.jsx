import _ from 'lodash';
import {
	Button, Header, Icon, Modal, Popup, Table
} from 'semantic-ui-react';
import {Collection} from './Collection';
import {useInterval} from './utils/useInterval';


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
		size='large'
		trigger={name ? <Popup
			content={`Edit collection ${name}`}
			inverted
			trigger={<Button
				icon
				disabled={disabled}
				onClick={onOpen}
			><Icon color='blue' name='edit'/></Button>}/>
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
		trigger={<Popup
			content={`Delete collection ${name}`}
			inverted
			trigger={<Button
				icon
				onClick={() => setState({open: true})}><Icon color='red' name='trash alternate outline'/></Button>}/>}
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
			><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Content>
	</Modal>;
} // DeleteModal


export function Collections(props) {
	const {
		collectorsObj,
		servicesBaseUrl
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

	useInterval(() => {
    	fetchCollections();
  	}, 1000);

	return <>
		<Header as='h1'>Collections</Header>
		<Table celled collapsing compact selectable singleLine sortable striped>
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
					collecting,
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
							<Button.Group>
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
								<Popup
									content={`Duplicate collection ${name}`}
									inverted
									trigger={<Button icon onClick={() => {
										fetch(`${servicesBaseUrl}/collectionDuplicate?name=${name}`, {
											method: 'POST'
										}).then(response => {
											fetchCollections()
										})
									}}><Icon color='blue' name='copy'/></Button>}/>
								{collecting
									? <Popup
										content={`Stop collecting to ${name}`}
										inverted
										trigger={<Button disabled={disabled} icon onClick={() => {
											fetch(`${servicesBaseUrl}/collectorStop?collectionName=${name}`, {
												method: 'POST'
											}).then(response => {
												fetchCollections()
											})
										}}><Icon color='red' name='stop'/></Button>}/>
									: <Popup
										content={`Start collecting to ${name}`}
										inverted
										trigger={<Button disabled={disabled} icon onClick={() => {
											fetch(`${servicesBaseUrl}/collectionCollect?name=${name}`, {
												method: 'POST'
											}).then(response => {
												fetchCollections()
											})
										}}><Icon color='green' name='cloud download'/></Button>}/>
								}
								<DeleteModal name={name} onClose={() => fetchCollections()} servicesBaseUrl={servicesBaseUrl}/>
							</Button.Group>
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
