//import _ from 'lodash';
import {
	Button, Dimmer, Header, Icon, Loader, Popup, Table
} from 'semantic-ui-react';
import {
	MONTH_TO_HUMAN,
	DAY_OF_WEEK_TO_HUMAN
} from './collection/SchedulingSegment';
import {DeleteCollectionModal} from './collection/DeleteCollectionModal';
import {NewOrEditCollectionModal} from './collection/NewOrEditCollectionModal';
import {useInterval} from './utils/useInterval';

const COLLECTIONS_GQL = `queryCollections(
	count: -1
) {
	total
	count
	page
	pageStart
	pageEnd
	pagesTotal
	hits {
		_id
		_name
		_path
		collector {
			name
			configJson
		}
		cron {
			month
			dayOfMonth
			dayOfWeek
			hour
			minute
		}
		doCollect
		documentCount
		interfaces
		language
		type
	}
}`;

const COLLECTORS_GQL = `queryCollectors {
	total
	count
	hits {
		_id
		_path
		_name
		appName
		collectTaskName
		configAssetPath
		displayName
		type
	}
}`;

const FIELDS_GQL = `queryFields {
	total
	count
	hits {
		#_id
		_name
		#_path
		#denyDelete
		#denyValues
		displayName
		#indexConfig
		#inResults
		#fieldType
		key
		#type
		values {
			#_id
			_name
			#_path
			displayName
			#field
			#fieldReference
			#type
			value
		}
	}
}`;

const LOCALES_GQL = `getLocales {
	country
	#displayCountry
	#displayLanguage
	displayName
	#displayVariant
	#language
	tag
	#variant
}`;

const TASKS_GQL = `queryTasks {
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
}`;

/*
${CONTENT_TYPES_GQL}
${SITES_GQL}
*/

const MOUNT_GQL = `{
	${COLLECTIONS_GQL}
	${COLLECTORS_GQL}
	${FIELDS_GQL}
	${LOCALES_GQL}
	${TASKS_GQL}
}`;

const UPDATE_GQL = `{
	${COLLECTIONS_GQL}
	${COLLECTORS_GQL}
	${FIELDS_GQL}
	${TASKS_GQL}
}`;

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


export function Collections(props) {
	const {
		collectorComponents,
		licenseValid,
		servicesBaseUrl,
		setLicensedTo,
		setLicenseValid
	} = props;

	const [locales, setLocales] = React.useState([]);
	const [queryCollectionsGraph, setQueryCollectionsGraph] = React.useState({});
	const [queryCollectorsGraph, setQueryCollectorsGraph] = React.useState({});
	const [tasks, setTasks] = React.useState([]);
	const [boolPoll, setBoolPoll] = React.useState(true);

	const [queryFieldsGraph, setQueryFieldsGraph] = React.useState({});
	//console.debug('queryFieldsGraph', queryFieldsGraph); // count, hits
	const fieldsObj = {};
	//const fieldsArray =
	queryFieldsGraph.hits ? queryFieldsGraph.hits.forEach(({
		displayName: fieldLabel,
		key,
		values
	}) => {
		const valuesObj = {};
		//const mappedValues =
		values ? values.forEach(({_name, displayName: valueLabel, value}) => {
			//console.debug('_name', _name);
			//console.debug('value', value);
			const valueKey = value || _name;
			//console.debug('valueKey', valueKey);
			valuesObj[valueKey] = {
				label: valueLabel
			};
			/*return {
				key: value,
				label: displayName
			};*/
		}) : [];
		fieldsObj[key] = {
			label: fieldLabel,
			values: valuesObj
		};
		/*return {
			key,
			label: displayName,
			values: mappedValues
		};*/
	}) : [];
	//console.debug('fieldsArray', fieldsArray);
	//console.debug('fieldsObj', fieldsObj);

	//console.debug('tasks', tasks);

	const collectionsTaskState = {};
	let anyTaskWithoutCollectionName = false;
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

	//console.debug('collectorComponents', collectorComponents);
	const intInitializedCollectorComponents = Object.keys(collectorComponents).length;
	//console.debug('intInitializedCollectorComponents', intInitializedCollectorComponents);

	//console.debug('queryCollectorsGraph', queryCollectorsGraph);
	let collectorOptions = queryCollectorsGraph.hits
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
		column: '_name',
		contentTypeOptions: [],
		direction: 'ascending',
		isLoading: false,//true,
		page: 1,
		perPage: 10,
		siteOptions: [],
		sort: '_name ASC'/*,
		totalCount: 0*/
	});
	//console.debug('Collections', {props, state});

	const {
		//collections,
		contentTypeOptions,
		column,
		direction,
		isLoading,
		page,
		perPage,
		//sort,
		siteOptions
	} = state;
	//console.debug({column, direction, sort});

	/*const {
		pageStart,
		pageEnd,
		pagesTotal = 1,
		total: totalNumberOfCollections
	} = collections;*/
	//console.debug('Collections totalNumberOfCollections', totalNumberOfCollections);

	function fetchOnMount() {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: MOUNT_GQL })
		})
			.then(res => res.json())
			.then(res => {
				//console.log(res);
				if (res && res.data) {
					setLocales(res.data.getLocales);
					setQueryCollectionsGraph(res.data.queryCollections);
					setQueryCollectorsGraph(res.data.queryCollectors);
					setQueryFieldsGraph(res.data.queryFields);
					setTasks(res.data.queryTasks);
				}
			});
	}

	function fetchOnUpdate() {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: UPDATE_GQL })
		})
			.then(res => res.json())
			.then(res => {
				//console.log(res);
				if (res && res.data) {
					setQueryCollectionsGraph(res.data.queryCollections);
					setQueryCollectorsGraph(res.data.queryCollectors);
					setQueryFieldsGraph(res.data.queryFields);
					setTasks(res.data.queryTasks);
				}
			});
	}

	function fetchCollections({
		activePage = page,
		activePerPage = perPage,
		clickedColumn = column,
		newDirection = direction
	} = {}) {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: `{${COLLECTIONS_GQL}}` })
		})
			.then(res => res.json())
			.then(res => {
				//console.log(res);
				if (res && res.data && res.data.queryCollections) {
					setQueryCollectionsGraph(res.data.queryCollections);
				}
			});
	} // fetchCollections

	function fetchTasks() {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: `{${TASKS_GQL}}` })
		})
			.then(res => res.json())
			.then(res => {
				//console.log(res);
				if (res && res.data && res.data.queryTasks) {
					setTasks(res.data.queryTasks);
				}
			});
	} // fetchTasks

	React.useEffect(() => fetchOnMount(), []); // Only once

	useInterval(() => {
		// This will continue to run as long as the Collections "tab" is open
		if (boolPoll) {
			fetchOnUpdate();
		}
	}, 2500);

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
							sorted={column === '_name' ? direction : null}
						>Name</Table.HeaderCell>
						<Table.HeaderCell>Collector</Table.HeaderCell>
						<Table.HeaderCell>Documents</Table.HeaderCell>
						<Table.HeaderCell>Language</Table.HeaderCell>
						<Table.HeaderCell>Interfaces</Table.HeaderCell>
						<Table.HeaderCell>Schedule</Table.HeaderCell>
						<Table.HeaderCell>Actions</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{queryCollectionsGraph.hits && queryCollectionsGraph.hits.map(({
						_id,
						_name,
						_path,
						collector,
						//collecting,
						documentCount,
						cron,
						doCollect,
						//id,
						interfaces,
						language = ''
					}, index) => {
						const key = `collection[${index}]`;

						const boolCollectorSelected = !!(collector && collector.name);
						//console.debug('boolCollectorSelected', boolCollectorSelected);
						const boolCollectorSelectedAndInitialized = boolCollectorSelected && collectorComponents[collector.name];
						//console.debug('boolCollectorSelectedAndInitialized', boolCollectorSelectedAndInitialized);

						const editEnabled = intInitializedCollectorComponents && (boolCollectorSelectedAndInitialized || !boolCollectorSelected);

						return <Table.Row key={key}>
							<Table.Cell collapsing><NewOrEditCollectionModal
								collectorOptions={collectorOptions}
								collectorComponents={collectorComponents}
								contentTypeOptions={contentTypeOptions}
								disabled={!editEnabled}
								initialValues={{
									_id,
									_name,
									_path,
									collector,
									cron,
									doCollect,
									language
								}}
								fields={fieldsObj}
								locales={locales}
								licenseValid={licenseValid}
								_name={_name}
								onClose={() => {
									fetchOnUpdate();
									setBoolPoll(true);
								}}
								onOpen={() => {
									setBoolPoll(false);
								}}
								servicesBaseUrl={servicesBaseUrl}
								setLicensedTo={setLicensedTo}
								setLicenseValid={setLicenseValid}
								siteOptions={siteOptions}
								totalNumberOfCollections={queryCollectionsGraph.total}
							/></Table.Cell>
							<Table.Cell collapsing>{_name}</Table.Cell>
							<Table.Cell collapsing>{collector && collector.name || ''}</Table.Cell>
							<Table.Cell collapsing>{documentCount}</Table.Cell>
							<Table.Cell collapsing>{language}</Table.Cell>
							<Table.Cell collapsing>{interfaces.map((iface, i) => <p key={i}>
								{i === 0 ? null : <br/>}
								<span style={{whitespace: 'nowrap'}}>{iface}</span>
							</p>)}</Table.Cell>
							<Table.Cell>{
								doCollect
									? cron.map(({
										month,
										dayOfMonth,
										dayOfWeek,
										minute,
										hour
									}, i) => <pre key={`${_name}.cron.${i}`}>{`${hour === '*' ? '**' : zeroPad(hour)}:${minute === '*' ? '**' : zeroPad(minute)} ${rpad(DAY_OF_WEEK_TO_HUMAN[dayOfWeek], 9)} in ${rpad(MONTH_TO_HUMAN[month], 11)} (dayOfMonth:${lpad(dayOfMonth)})`}</pre>)
									: 'Not scheduled'
							}</Table.Cell>
							<Table.Cell collapsing>
								<Button.Group>
									<Popup
										content={`Duplicate collection ${_name}`}
										inverted
										trigger={<Button icon onClick={() => {
											fetch(`${servicesBaseUrl}/collectionDuplicate?name=${_name}`, {
												method: 'POST'
											}).then(() => {
												fetchCollections();
											});
										}}><Icon color='blue' name='copy'/></Button>}/>
									{collector && collector.name
										? collectionsTaskState[_name]
											? {
												WAITING: <Popup
													content={`Collector is in waiting state`}
													inverted
													trigger={<Button disabled={!boolCollectorSelectedAndInitialized} icon><Icon color='yellow' name='pause'/></Button>}/>,
												RUNNING: <Popup
													content={`Stop collecting to ${_name}`}
													inverted
													trigger={<Button disabled={!boolCollectorSelectedAndInitialized} icon onClick={() => {
														fetch(`${servicesBaseUrl}/collectorStop?collectionName=${_name}`, {
															method: 'POST'
														}).then(() => {
															fetchTasks();
														});
													}}><Icon color='red' name='stop'/></Button>}/>,
												FINISHED: <Popup
													content={`Finished collecting to ${_name}`}
													inverted
													trigger={<Button disabled={!boolCollectorSelectedAndInitialized} icon><Icon color='green' name='checkmark'/></Button>}/>,
												FAILED: <Popup
													content={`Something went wrong while collecting to ${_name}`}
													inverted
													trigger={<Button disabled={!boolCollectorSelectedAndInitialized} icon><Icon color='red' name='warning'/></Button>}/>
											}[collectionsTaskState[_name]]
											: anyTaskWithoutCollectionName
												? <Popup
													content={`Some collector task is starting...`}
													inverted
													trigger={<Button disabled={!boolCollectorSelectedAndInitialized} icon loading><Icon color='yellow' name='question'/></Button>}/>
												: <Popup
													content={`Start collecting to ${_name}`}
													inverted
													trigger={<Button disabled={!boolCollectorSelectedAndInitialized} icon onClick={() => {
														fetch(`${servicesBaseUrl}/collectionCollect?name=${_name}`, {
															method: 'POST'
														}).then(() => {
															fetchTasks();
														});
													}}><Icon color={boolCollectorSelectedAndInitialized ? 'green' : 'grey'} name='cloud download'/></Button>}/>
										: <Button disabled={true} icon><Icon color='grey' name='cloud download'/></Button>
									}
									<DeleteCollectionModal
										_name={_name}
										onClose={() => {
											fetchCollections();
											setBoolPoll(true);
										}}
										onOpen={() => {
											setBoolPoll(false);
										}}
										servicesBaseUrl={servicesBaseUrl}
									/>
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
			<NewOrEditCollectionModal
				collectorOptions={collectorOptions}
				collectorComponents={collectorComponents}
				contentTypeOptions={contentTypeOptions}
				disabled={!intInitializedCollectorComponents}
				fields={fieldsObj}
				licenseValid={licenseValid}
				locales={locales}
				onClose={() => {
					fetchOnUpdate();
					setBoolPoll(true);
				}}
				onOpen={() => {
					setBoolPoll(false);
				}}
				servicesBaseUrl={servicesBaseUrl}
				setLicensedTo={setLicensedTo}
				setLicenseValid={setLicenseValid}
				siteOptions={siteOptions}
				totalNumberOfCollections={queryCollectionsGraph.total}
			/>
		</Dimmer.Dimmable>
	</>;
} // Collections
