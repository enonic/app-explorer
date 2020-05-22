//import _ from 'lodash';
import {
	Button, Dimmer, Divider, Dropdown, Form, Header, Icon, Loader, Modal,
	Pagination,	Popup, Table
} from 'semantic-ui-react';
import {
	Collection,
	MONTH_TO_HUMAN,
	DAY_OF_WEEK_TO_HUMAN
} from './Collection';
import {useInterval} from './utils/useInterval';


function rpad(s, w = 2, z = ' ') {
	s = s + '';
	return s.length >= w
		? s
		: s + new Array(w - s.length + 1).join(z);
}


function lpad(s, w = 2, z = ' ') {
	s = s + '';
	return s.length >= w ? s : new Array(w - s.length + 1).join(z) + s;
}


function zeroPad(s, w=2) {
	return lpad(s,w,'0');
}


function NewOrEditModal(props) {
	const {
		afterClose,
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

	const onClose = () => {
		setState({open: false});
		afterClose();
	}
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
			page: 1,
			pageStart: 0,
			pageEnd: 0,
			pageTotal: 1,
			total: 0
		},
		collectorOptions: [],
		column: 'displayName',
		contentTypeOptions: [],
		direction: 'ascending',
		fields: {},
		isLoading: true,
		page: 1,
		perPage: 10,
		siteOptions: [],
		sort: 'displayName ASC'/*,
		totalCount: 0*/
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
		page,
		perPage,
		sort,
		siteOptions,
		totalCount
	} = state;
	//console.debug({column, direction, sort});

	const {
		pageStart,
		pageEnd,
		pagesTotal,
		total
	} = collections;

	function fetchCollections({
		activePage = page,
		activePerPage = perPage,
		clickedColumn = column,
		newDirection = direction
	} = {}) {
		setState(prev => ({
			...prev,
			isLoading: true
		}));
		const newSort = `${clickedColumn} ${newDirection === 'ascending' ? 'ASC' : 'DESC'}`;
		/*console.debug('fetchCollections', {
			activePage,
			activePerPage,
			clickedColumn,
			newDirection,
			newSort
		});*/
		fetch(`${servicesBaseUrl}/collectionList?page=${activePage}&perPage=${activePerPage}&sort=${newSort}`)
			.then(response => response.json())
			.then(data => setState(prev => ({
				...prev,
				...data,
				column: clickedColumn,
				direction: newDirection,
				isLoading: false,
				page: activePage,
				perPage: activePerPage,
				sort: newSort
			})));
	} // fetchCollections

	function handlePaginationChange(e, {activePage}) {
		//console.debug({function: 'handlePaginationChange', activePage});
		fetchCollections({activePage})
	}

	function handlePerPageChange(e, {name, value}) {
		fetchCollections({activePerPage:value});
	}

	const handleSortGenerator = (clickedColumn) => () => {
	    const {
			//collections,
			column,
			direction
		} = state;
		/*console.debug('handleSort', {
			clickedColumn,
			//collections,
			column,
			direction
		});*/

	    if (column !== clickedColumn) {
			fetchCollections({
				clickedColumn,
				newDirection: 'ascending'
			});
			/*collections.hits = _.sortBy(collections.hits, [clickedColumn]);
	    	setState(prev => ({
				...prev,
				column: clickedColumn,
		        collections,
		        direction: 'ascending'
			}));*/
			return;
	    }

		fetchCollections({
			clickedColumn,
			newDirection: direction === 'ascending' ? 'descending' : 'ascending'
		});
		/*collections.hits = collections.hits.reverse();
	    setState(prev => ({
			...prev,
			collections,
			direction: direction === 'ascending' ? 'descending' : 'ascending'
	  	}));*/
	} // handleSortGenerator

	React.useEffect(() => fetchCollections(), []);

	/*useInterval(() => {
    	fetchCollections();
  	}, 1000);*/

	return <>
		<Header as='h1'>Collections</Header>
		<Dimmer.Dimmable dimmed={isLoading}>
			<Dimmer active={isLoading}><Loader size='massive'>Loading</Loader></Dimmer>
			<Table celled compact selectable sortable striped>
				<Table.Header>
					<Table.Row>
						{/* Width is X columns of total 16 */}
						<Table.HeaderCell>Edit</Table.HeaderCell>
						<Table.HeaderCell
							onClick={handleSortGenerator('displayName')}
							sorted={column === 'displayName' ? direction : null}
						>Name</Table.HeaderCell>
						<Table.HeaderCell>Documents</Table.HeaderCell>
						<Table.HeaderCell>Interfaces</Table.HeaderCell>
						<Table.HeaderCell>Schedule</Table.HeaderCell>
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
							<Table.Cell collapsing><NewOrEditModal
								afterClose={fetchCollections}
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
							/></Table.Cell>
							<Table.Cell collapsing>{displayName}</Table.Cell>
							<Table.Cell collapsing>{count}</Table.Cell>
							<Table.Cell collapsing>{interfaces.map((iface, i) => <>
								{i === 0 ? null : <br/>}
								<span style={{whitespace: 'nowrap'}}>{iface}</span>
							</>)}</Table.Cell>
							<Table.Cell>{doCollect
								? cron.map(({
									month,
									dayOfMonth,
									dayOfWeek,
									minute,
									hour
								}) => <pre>{`${rpad(MONTH_TO_HUMAN[month], 11)} dayOfMonth:${lpad(dayOfMonth)} ${DAY_OF_WEEK_TO_HUMAN[dayOfWeek]} ${zeroPad(hour)}:${zeroPad(minute)}`}</pre>)
								: 'Not scheduled'
							}</Table.Cell>
							<Table.Cell collapsing>
								<Button.Group>
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
				{totalCount
					? <Table.Footer>
						<Table.Row>
							<Table.HeaderCell></Table.HeaderCell>
							<Table.HeaderCell></Table.HeaderCell>
							<Table.HeaderCell>{totalCount}</Table.HeaderCell>
							<Table.HeaderCell></Table.HeaderCell>
							<Table.HeaderCell></Table.HeaderCell>
							<Table.HeaderCell></Table.HeaderCell>
						</Table.Row>
					</Table.Footer>
					: null
				}
			</Table>
			<Pagination
				attached='bottom'
				fluid
				size='mini'

				boundaryRange={1}
				siblingRange={1}

				ellipsisItem={null/*{content: <Icon name='ellipsis horizontal' />, icon: true}*/}
				firstItem={{content: <Icon name='angle double left' />, icon: true}}
				prevItem={{content: <Icon name='angle left' />, icon: true}}
				nextItem={{content: <Icon name='angle right' />, icon: true}}
				lastItem={{content: <Icon name='angle double right' />, icon: true}}

				activePage={page}
				totalPages={pagesTotal}

				onPageChange={handlePaginationChange}
			/>
			<p>Displaying {pageStart}-{pageEnd} of {total}</p>
			<Divider hidden/>
			<Form.Field>
				<Header as='h4'><Icon name='resize vertical'/> Per page</Header>
				<Dropdown
					defaultValue={perPage}
					fluid
					name='perPage'
					onChange={handlePerPageChange}
					options={[5,10,25,50,100].map(key => ({key, text: `${key}`, value: key}))}
					selection
				/>
			</Form.Field>
			<NewOrEditModal
				afterClose={fetchCollections}
				collectorOptions={collectorOptions}
				collectorsObj={collectorsObj}
				contentTypeOptions={contentTypeOptions}
				disabled={collectorOptions.length === 0}
				fields={fields}
				servicesBaseUrl={servicesBaseUrl}
				siteOptions={siteOptions}
			/>
		</Dimmer.Dimmable>
	</>;
} // Collections
