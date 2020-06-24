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
import {UploadLicense} from './UploadLicense';
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
		//collectors,
		collectorComponents,
		collectorOptions,
		contentTypeOptions,
		disabled,
		fields,
		initialValues,
		licenseValid,
		name,
		servicesBaseUrl,
		setLicenseValid,
		siteOptions//,
		//totalNumberOfCollections
	} = props;
	//console.debug('NewOrEditModal totalNumberOfCollections', totalNumberOfCollections);
	const [state, setState] = React.useState({
		open: false
	});
	//console.debug('NewOrEditModal', {props, state});

	const onClose = () => {
		setState({open: false});
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
	>{licenseValid /*|| totalNumberOfCollections <= 3*/
			? <>
				<Modal.Header>{name ? `Edit collection ${name}`: 'New collection'}</Modal.Header>
				<Modal.Content>
					<Collection
						collectorComponents={collectorComponents}
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
			</>
			: <UploadLicense
				servicesBaseUrl={servicesBaseUrl}
				setLicenseValid={setLicenseValid}
			/>}
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
		queryCollectionsGraph = {},
		collectorComponents,
		licenseValid,
		queryCollectorsGraph = {},
		servicesBaseUrl,
		setLicenseValid,
		tasks, // []
		setTasks
	} = props;
	//console.debug('queryCollectorsGraph', queryCollectorsGraph);
	//console.debug('tasks', tasks);

	const collectionsTaskState = {};
	const anyTaskWithoutCollectionName = false;
	tasks.forEach(({
		progress: {info},
		state // WAITING | RUNNING | FINISHED | FAILED
	}) => {
		try {
			const {name} = JSON.parse(info);
			if (name) {
				collectionsTaskState[name] = state;
			} else {
				anyTaskWithoutCollectionName = true;
			}
		} catch (e) {
			anyTaskWithoutCollectionName = true;
		}
	});


	const collectorOptions = queryCollectorsGraph.hits
		? queryCollectorsGraph.hits.map(({
			_name: key,
			displayName: text
		}) => ({
			key,
			text,
			value: key
		}))
		: [];
	//console.debug('collectorOptions', collectorOptions);

	const [state, setState] = React.useState({
		/*collections: {
			//count: 0, // Unused?
			hits: [],
			page: 1,
			pageStart: 0,
			pageEnd: 0,
			pageTotal: 1,
			total: 0
		},*/
		column: 'displayName',
		contentTypeOptions: [],
		direction: 'ascending',
		fields: {},
		isLoading: false,//true,
		page: 1,
		perPage: 10,
		siteOptions: [],
		sort: 'displayName ASC'/*,
		totalCount: 0*/
	});
	//console.debug('Collections', {props, state});

	const {
		//collections,
		contentTypeOptions,
		column,
		direction,
		fields,
		isLoading,
		page,
		perPage,
		sort,
		siteOptions/*,
		totalCount No longer provided by the collectionList service*/
	} = state;
	//console.debug({column, direction, sort});

	/*const {
		pageStart,
		pageEnd,
		pagesTotal = 1,
		total: totalNumberOfCollections
	} = collections;*/
	//console.debug('Collections totalNumberOfCollections', totalNumberOfCollections);

	/*
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
		});
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
		});

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
			}));
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
	  	}));
	} // handleSortGenerator
	*/

	//React.useEffect(() => fetchCollections(), []); // Only once

	/*React.useEffect(() => {
		//console.debug('queryCollectionsGraph changed');
		fetchCollections()
	}, [queryCollectionsGraph]); // Whenever queryCollectionsGraph changes
	*/
	useInterval(() => { // This will continue to run as long as the Collections "tab" is open
		// NOTE Could possibly use active websocket instead of http request...
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
  			body: JSON.stringify({ query: `{ queryTasks {
				application
				description
				id
				name
				progress {
					current
					info
					total
				}
				startTime
				state
				user
			}}` })
		})
			.then(res => res.json())
  			.then(res => {
				//console.log(res);
				if (res && res.data && res.data.queryTasks) {
					setTasks(res.data.queryTasks);
				}
			});
  	}, 1000);

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
							onClick={null/*handleSortGenerator('displayName')*/}
							sorted={column === 'displayName' ? direction : null}
						>Name</Table.HeaderCell>
						<Table.HeaderCell>Documents</Table.HeaderCell>
						<Table.HeaderCell>Interfaces</Table.HeaderCell>
						<Table.HeaderCell>Schedule</Table.HeaderCell>
						<Table.HeaderCell>Actions</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{queryCollectionsGraph.hits && queryCollectionsGraph.hits.map(({
						collector,
						//collecting,
						documentCount,
						cron,
						doCollect,
						displayName,
						//id,
						interfaces,
						_name: name
					}, index) => {
						const key = `collection[${index}]`;

						const disabled = !(collector.name && collectorOptions.filter(({key}) => collector.name).length);

						return <Table.Row key={key}>
							<Table.Cell collapsing><NewOrEditModal
								collectorOptions={collectorOptions}
								collectorComponents={collectorComponents}
								contentTypeOptions={contentTypeOptions}
								disabled={disabled}
								initialValues={{
									name,
									collector,
									cron,
									doCollect
								}}
								fields={fields}
								licenseValid={licenseValid}
								name={name}
								servicesBaseUrl={servicesBaseUrl}
								setLicenseValid={setLicenseValid}
								siteOptions={siteOptions}
								totalNumberOfCollections={0/*totalNumberOfCollections*/}
							/></Table.Cell>
							<Table.Cell collapsing>{displayName}</Table.Cell>
							<Table.Cell collapsing>{documentCount}</Table.Cell>
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
								}) => <pre>{`${hour === '*' ? '**' : zeroPad(hour)}:${minute === '*' ? '**' : zeroPad(minute)} ${rpad(DAY_OF_WEEK_TO_HUMAN[dayOfWeek], 9)} in ${rpad(MONTH_TO_HUMAN[month], 11)} (dayOfMonth:${lpad(dayOfMonth)})`}</pre>)
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
												//fetchCollections()
											})
										}}><Icon color='blue' name='copy'/></Button>}/>
									{collectionsTaskState[name]
										? {
											WAITING: <Popup
												content={`Collector is in waiting state`}
												inverted
												trigger={<Button disabled={disabled} icon><Icon color='yellow' name='pause'/></Button>}/>,
											RUNNING: <Popup
												content={`Stop collecting to ${name}`}
												inverted
												trigger={<Button disabled={disabled} icon onClick={() => {
													fetch(`${servicesBaseUrl}/collectorStop?collectionName=${name}`, {
														method: 'POST'
													}).then(response => {
														//fetchCollections()
													})
												}}><Icon color='red' name='stop'/></Button>}/>,
											FINISHED: <Popup
												content={`Finished collecting to ${name}`}
												inverted
												trigger={<Button disabled={disabled} icon><Icon color='green' name='checkmark'/></Button>}/>,
											FAILED: <Popup
												content={`Something went wrong while collecting to ${name}`}
												inverted
												trigger={<Button disabled={disabled} icon><Icon color='red' name='warning'/></Button>}/>
										}[collectionsTaskState[name]]
										: anyTaskWithoutCollectionName
											? <Popup
												content={`Some collector task is starting...`}
												inverted
												trigger={<Button disabled={disabled} icon loading><Icon color='yellow' name='question'/></Button>}/>
											: <Popup
												content={`Start collecting to ${name}`}
												inverted
												trigger={<Button disabled={disabled} icon onClick={() => {
													fetch(`${servicesBaseUrl}/collectionCollect?name=${name}`, {
														method: 'POST'
													}).then(response => {
														//fetchCollections()
													})
												}}><Icon color='green' name='cloud download'/></Button>}/>
									}
									<DeleteModal name={name} onClose={null/*() => fetchCollections()*/} servicesBaseUrl={servicesBaseUrl}/>
								</Button.Group>
							</Table.Cell>
						</Table.Row>;
					})}
				</Table.Body>
				{/*totalCount
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
				*/}
			</Table>
			{/*<Pagination
				attached='bottom'
				fluid
				size='mini'

				boundaryRange={1}
				siblingRange={1}

				ellipsisItem={null}
				firstItem={{content: <Icon name='angle double left' />, icon: true}}
				prevItem={{content: <Icon name='angle left' />, icon: true}}
				nextItem={{content: <Icon name='angle right' />, icon: true}}
				lastItem={{content: <Icon name='angle double right' />, icon: true}}

				activePage={page}
				totalPages={pagesTotal}

				onPageChange={handlePaginationChange}
			/>
			<p>Displaying {pageStart}-{pageEnd} of {totalNumberOfCollections}</p>
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
			</Form.Field>*/}
			<NewOrEditModal
				collectorOptions={collectorOptions}
				collectorComponents={collectorComponents}
				contentTypeOptions={contentTypeOptions}
				disabled={collectorOptions.length === 0}
				fields={fields}
				licenseValid={licenseValid}
				servicesBaseUrl={servicesBaseUrl}
				setLicenseValid={setLicenseValid}
				siteOptions={siteOptions}
				totalNumberOfCollections={0/*totalNumberOfCollections*/}
			/>
		</Dimmer.Dimmable>
	</>;
} // Collections
