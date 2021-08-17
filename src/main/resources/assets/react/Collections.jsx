import {
	COLON_SIGN,
	TASK_STATE_FAILED,
	//TASK_STATE_FINISHED,
	TASK_STATE_RUNNING,
	TASK_STATE_WAITING,
	lpad,
	rpad
} from '@enonic/js-utils';

import {parseExpression as parseCronExpression} from 'cron-parser';
import {
	Button, Dimmer, Header, Icon, Label, Loader, Popup, Progress, Radio,
	Segment, Table
} from 'semantic-ui-react';
import {
	MONTH_TO_HUMAN
} from './collection/SchedulingSegment';
import {DeleteCollectionModal} from './collection/DeleteCollectionModal';
import {NewOrEditCollectionModal} from './collection/NewOrEditCollectionModal';
import {useInterval} from './utils/useInterval';
import {Cron} from './utils/Cron';


const GQL_MUTATION_COLLECTIONS_REINDEX = `mutation ReindexMutation(
  $collectionIds: [String]!
) {
  reindexCollections(collectionIds: $collectionIds) {
    collectionId
    collectionName
    message
    schemaId
    taskId
  }
}`;

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
		#_nodeType
		_path
		collector {
			name
			configJson
		}
		documentCount
		interfaces
		language
		schemaId
		#type
	}
}`;

const COLLECTORS_GQL = `queryCollectors {
	total
	count
	hits {
		#_id
		#_name
		#_nodeType
		#_path
		appName
		collectTaskName
		configAssetPath
		displayName
		#type
	}
}`;

const FIELDS_GQL = `queryFields {
	total
	count
	hits {
		#_id
		_name
		#_nodeType
		#_path
		#denyDelete
		#deny
		#displayName
		#indexConfig
		#inResults
		#fieldType
		key
		#type
	}
}`;

const JOBS_GQL = `listScheduledJobs {
	collectionName
	enabled
	descriptor
	schedule {
  		timeZone
  		type
  		value
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

const GQL_SCHEMA_QUERY = `querySchema {
	hits {
		_id
		_name
		#_versionKey
	}
}`;

/*const GQL_QUERY_TASKS_GET = `query GetTasks(
  $appName: String
  $descriptor: String,
  $onlyRegisteredCollectorTasks: Boolean,
  $state: EnumTaskStates
) {
	queryTasks(
		appName: $appName
		name: $descriptor
		onlyRegisteredCollectorTasks: $onlyRegisteredCollectorTasks
		state: $state
	) {
		application
		description
		id
		name
		progress {
			current
			info # Can be JSON
			total
		}
		startTime
		state
		user
	}
}`;*/

const TASKS_GQL = `queryTasks {
	application
	description
	id
	name
	progress {
		current
		info # Can be JSON
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
	${JOBS_GQL}
	${LOCALES_GQL}
	${GQL_SCHEMA_QUERY}
	${TASKS_GQL}
}`;

const UPDATE_GQL = `{
	${COLLECTIONS_GQL}
	${COLLECTORS_GQL}
	${FIELDS_GQL}
	${JOBS_GQL}
	${GQL_SCHEMA_QUERY}
	${TASKS_GQL}
}`;


export function Collections(props) {
	const {
		collectorComponents,
		licenseValid,
		servicesBaseUrl,
		setLicensedTo,
		setLicenseValid
	} = props;

	const [boolPoll, setBoolPoll] = React.useState(true);
	const [jobsObj, setJobsObj] = React.useState({});
	const [locales, setLocales] = React.useState([]);
	const [queryCollectionsGraph, setQueryCollectionsGraph] = React.useState({});
	const [queryCollectorsGraph, setQueryCollectorsGraph] = React.useState({});
	const [queryFieldsGraph, setQueryFieldsGraph] = React.useState({});
	const [schema, setSchema] = React.useState([]);
	const [showCollector, setShowCollector] = React.useState(false);
	const [showDelete, setShowDelete] = React.useState(false);
	const [showDocumentCount, setShowDocumentCount] = React.useState(true);
	const [showLanguage, setShowLanguage] = React.useState(false);
	const [showInterfaces, setShowInterfaces] = React.useState(false);
	const [showSchema, setShowSchema] = React.useState(false);
	const [showSchedule, setShowSchedule] = React.useState(false);
	const [tasks, setTasks] = React.useState([]);

	const fieldsObj = {};
	queryFieldsGraph.hits ? queryFieldsGraph.hits.forEach(({
		//displayName: fieldLabel,
		key
	}) => {
		fieldsObj[key] = {
			label: key
		};
		/*return {
			key,
			label: displayName
		};*/
	}) : [];

	const collectorsObj = {};
	let collectorOptions = queryCollectorsGraph.hits
		? queryCollectorsGraph.hits.map(({
			appName,
			collectTaskName,
			//_name: key,
			displayName: text
		}) => {
			collectorsObj[`${appName}:${collectTaskName}`] = true;
			return {
				key: `${appName}:${collectTaskName}`,
				text,
				value: `${appName}:${collectTaskName}`
			};
		})
		: [];

	const collectionsTaskState = {};
	let anyTaskWithoutCollectionName = false;
	const objCollectionsBeingReindexed = {};
	let anyReindexTaskWithoutCollectionId = false;
	tasks.forEach(({
		name: taskDescriptor,
		progress: {
			current,
			info,
			total
		},
		state // WAITING | RUNNING | FINISHED | FAILED
	}) => {
		if (collectorsObj[taskDescriptor]) { // This is a collector task
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
		} else if (taskDescriptor === `com.enonic.app.explorer${COLON_SIGN}reindexCollection`) {
			try {
				const {collectionId} = JSON.parse(info);
				if (collectionId) {
					objCollectionsBeingReindexed[collectionId] = {
						current,
						//percent: Math.floor(current / total * 10000)/100, // Keeping two decimals,
						state,
						total
					};
				} else {
					anyReindexTaskWithoutCollectionId = true;
				}
			} catch (e) {
				anyReindexTaskWithoutCollectionId = true;
			}
		} else { // Not collector nor reindex task
			console.debug('taskDescriptor', taskDescriptor);
		}
	});

	const intInitializedCollectorComponents = Object.keys(collectorComponents).length;

	const [state/*, setState*/] = React.useState({
		column: '_name',
		contentTypeOptions: [],
		direction: 'ascending',
		isLoading: false,//true,
		page: 1,
		perPage: 10,
		siteOptions: [],
		sort: '_name ASC'
	});

	const {
		contentTypeOptions,
		column,
		direction,
		isLoading,
		siteOptions
	} = state;

	function setJobsObjFromArr(arr) {
		const obj={};
		arr.forEach(({
			collectionName,
			enabled,
			schedule: {
				type,
				//timeZone,
				value
			}
		}) => {
			if (type === 'CRON') {
				if(obj[collectionName]) {
					obj[collectionName].push({enabled, value});
				} else {
					obj[collectionName] = [{enabled, value}];
				}
			}
		});
		setJobsObj(obj);
	} // jobsObjFromArr

	function fetchOnMount() {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: MOUNT_GQL })
		})
			.then(res => res.json())
			.then(res => {
				if (res && res.data) {
					setLocales(res.data.getLocales);
					setQueryCollectionsGraph(res.data.queryCollections);
					setQueryCollectorsGraph(res.data.queryCollectors);
					setQueryFieldsGraph(res.data.queryFields);
					setJobsObjFromArr(res.data.listScheduledJobs);
					setSchema(res.data.querySchema.hits);
					setTasks(res.data.queryTasks);
				} // if
			}); // then
	} // fetchOnMount

	function fetchOnUpdate() {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: UPDATE_GQL })
		})
			.then(res => res.json())
			.then(res => {
				if (res && res.data) {
					setQueryCollectionsGraph(res.data.queryCollections);
					setQueryCollectorsGraph(res.data.queryCollectors);
					setQueryFieldsGraph(res.data.queryFields);
					setJobsObjFromArr(res.data.listScheduledJobs);
					setSchema(res.data.querySchema.hits);
					setTasks(res.data.queryTasks);
				}
			});
	}

	function fetchCollections() {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: `{${COLLECTIONS_GQL}}` })
		})
			.then(res => res.json())
			.then(res => {
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
			//GQL_QUERY_TASKS_GET
		})
			.then(res => res.json())
			.then(res => {
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

	const shemaIdToName = {};
	schema.forEach(({_id, _name}) => {
		shemaIdToName[_id] = _name;
	});

	return <>
		<Segment basic inverted style={{
			marginLeft: -14,
			marginTop: -14,
			marginRight: -14
		}}>
			<Table basic collapsing compact inverted>
				<Table.Body>
					<Table.Row verticalAlign='middle'>
						<Table.Cell collapsing>
							<Radio
								checked={showCollector}
								onChange={(ignored,{checked}) => {
									setShowCollector(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show collector</Label>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showDocumentCount}
								onChange={(ignored,{checked}) => {
									setShowDocumentCount(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show document count</Label>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showLanguage}
								onChange={(ignored,{checked}) => {
									setShowLanguage(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show language</Label>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showSchema}
								onChange={(ignored,{checked}) => {
									setShowSchema(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show schema</Label>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showInterfaces}
								onChange={(ignored,{checked}) => {
									setShowInterfaces(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show interfaces</Label>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showSchedule}
								onChange={(ignored,{checked}) => {
									setShowSchedule(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show schedule</Label>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showDelete}
								onChange={(ignored,{checked}) => {
									setShowDelete(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show delete</Label>
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
		</Segment>
		<Header as='h1'>Collections</Header>
		<Dimmer.Dimmable dimmed={isLoading}>
			<Dimmer active={isLoading}><Loader size='massive'>Loading</Loader></Dimmer>
			<Table celled collapsing compact selectable sortable striped>
				<Table.Header>
					<Table.Row>
						{/* Width is X columns of total 16 */}
						<Table.HeaderCell>Edit</Table.HeaderCell>
						<Table.HeaderCell
							onClick={null/*handleSortGenerator('displayName')*/}
							sorted={column === '_name' ? direction : null}
						>Name</Table.HeaderCell>
						{showCollector ? <Table.HeaderCell>Collector</Table.HeaderCell> : null}
						{showDocumentCount ? <Table.HeaderCell>Documents</Table.HeaderCell> : null}
						{showLanguage ? <Table.HeaderCell>Language</Table.HeaderCell> : null}
						{showSchema ? <Table.HeaderCell>Schema</Table.HeaderCell> : null}
						{showInterfaces ? <Table.HeaderCell>Interfaces</Table.HeaderCell> : null }
						{showSchedule ? <Table.HeaderCell>Schedule</Table.HeaderCell> : null }
						<Table.HeaderCell>Actions</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{queryCollectionsGraph.hits && queryCollectionsGraph.hits.map(({
						_id: collectionId,
						_name,
						_path,
						collector,
						documentCount,
						interfaces,
						language = '',
						schemaId = ''
					}, index) => {
						const key = `collection[${index}]`;
						const boolCollectorSelected = !!(collector && collector.name);
						const boolCollectorSelectedAndInitialized = boolCollectorSelected && collectorComponents[collector.name];
						const busy = anyReindexTaskWithoutCollectionId
						|| (
							objCollectionsBeingReindexed[collectionId]
							&& [TASK_STATE_RUNNING, TASK_STATE_WAITING].includes(objCollectionsBeingReindexed[collectionId].state)
						);
						const editEnabled = intInitializedCollectorComponents
							&& (boolCollectorSelectedAndInitialized || !boolCollectorSelected)
							&& !busy;
						const cron = jobsObj[_name]
							? jobsObj[_name].map(({value}) => {
								return new Cron(value).toObj();
							})
							: [new Cron('0 0 * * 0').toObj()]; // Default once a week
						const doCollect = jobsObj[_name] ? jobsObj[_name][0].enabled : false;
						return <Table.Row key={key}>
							<Table.Cell collapsing><NewOrEditCollectionModal
								collectorOptions={collectorOptions}
								collectorComponents={collectorComponents}
								contentTypeOptions={contentTypeOptions}
								disabled={!editEnabled}
								initialValues={{
									_id: collectionId,
									_name,
									_path,
									collector,
									cron,
									doCollect,
									language,
									schemaId
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
							{busy
								? <Table.Cell collapsing colspan={
									(showCollector ? 1 : 0)
									+ (showDocumentCount ? 1 : 0)
									+ (showLanguage ? 1 : 0)
									+ (showSchema ? 1 : 0)
									+ (showInterfaces ? 1 : 0)
									+ (showSchedule ? 1 : 0)
								}><Progress
										active
										progress='ratio'
										total={objCollectionsBeingReindexed[collectionId].total}
										value={objCollectionsBeingReindexed[collectionId].current}
									/>{'Reindexing...'}</Table.Cell>
								: <>
									{showCollector ? <Table.Cell collapsing>{collector && collector.name || ''}</Table.Cell> : null}
									{showDocumentCount ? <Table.Cell collapsing>{documentCount}</Table.Cell> : null}
									{showLanguage ? <Table.Cell collapsing>{language}</Table.Cell> : null}
									{showSchema ? <Table.Cell collapsing>{shemaIdToName[schemaId]}</Table.Cell> : null }
									{showInterfaces ? <Table.Cell collapsing>{interfaces.map((iface, i) => <p key={i}>
										{i === 0 ? null : <br/>}
										<span style={{whitespace: 'nowrap'}}>{iface}</span>
									</p>)}</Table.Cell> : null}
									{showSchedule ? <Table.Cell>{
										jobsObj[_name]
											? jobsObj[_name].map(({enabled, value}, i) => {
												const interval = parseCronExpression(value);
												const fields = JSON.parse(JSON.stringify(interval.fields)); // Fields is immutable
												return <pre key={`${_name}.cron.${i}`} style={{color:enabled ? 'auto' : 'gray'}}>
													{`${Cron.hourToHuman(fields.hour)}:${
														Cron.minuteToHuman(fields.minute)} ${
														Cron.dayOfWeekToHuman(fields.dayOfWeek)} in ${
														rpad(MONTH_TO_HUMAN[fields.month.length === 12 ? '*' : fields.month[0]], 11)} (dayOfMonth:${
														lpad(fields.dayOfMonth.length === 31 ? '*' : fields.dayOfMonth)})`}
												</pre>;
											})
											: 'Not scheduled'
									}</Table.Cell> : null}
								</>
							}

							<Table.Cell collapsing>
								<Button.Group>
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
													trigger={<Button disabled={!boolCollectorSelectedAndInitialized || busy} icon onClick={() => {
														fetch(`${servicesBaseUrl}/collectionCollect?name=${_name}`, {
															method: 'POST'
														}).then(() => {
															fetchTasks();
														});
													}}><Icon color={boolCollectorSelectedAndInitialized ? 'green' : 'grey'} name='cloud download'/></Button>}/>
										: <Button disabled={true} icon><Icon color='grey' name='cloud download'/></Button>
									}
									{anyReindexTaskWithoutCollectionId
										? <Popup
											content={`Some reindex task is starting...`}
											inverted
											trigger={<Button disabled={true} icon loading><Icon color='yellow' name='question'/></Button>}/>
										: <Popup
											content={
												objCollectionsBeingReindexed[collectionId]
												&& [TASK_STATE_RUNNING, TASK_STATE_WAITING].includes(objCollectionsBeingReindexed[collectionId].state)
													? `Collection is being reindexed...`
													: 'Start reindex'
											}
											inverted
											trigger={<Button
												disabled={
													objCollectionsBeingReindexed[collectionId]
													&& [TASK_STATE_RUNNING, TASK_STATE_WAITING].includes(objCollectionsBeingReindexed[collectionId].state) }
												icon
												onClick={() => {
													fetch(`${servicesBaseUrl}/graphQL`, {
														method: 'POST',
														headers: { 'Content-Type': 'application/json' },
														body: JSON.stringify({
															query: GQL_MUTATION_COLLECTIONS_REINDEX,
															variables: {
																collectionIds: [collectionId]
															}
														})
													})
														.then(res => res.json())
														.then(res => {
															log.debug(res);
														});
												}}
											>
												<Icon color={
													objCollectionsBeingReindexed[collectionId]
														? objCollectionsBeingReindexed[collectionId].state === TASK_STATE_FAILED
															? 'red'
															: [TASK_STATE_RUNNING, TASK_STATE_WAITING].includes(objCollectionsBeingReindexed[collectionId].state)
																? 'yellow'
																: 'green' // objCollectionsBeingReindexed[collectionId] === TASK_STATE_FINISHED
														: 'green'} name='recycle'/>
											</Button>}/>
									}
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
									{showDelete ?<DeleteCollectionModal
										_name={_name}
										disabled={busy}
										onClose={() => {
											fetchCollections();
											setBoolPoll(true);
										}}
										onOpen={() => {
											setBoolPoll(false);
										}}
										servicesBaseUrl={servicesBaseUrl}
									/> : null}
								</Button.Group>
							</Table.Cell>
						</Table.Row>;
					})}
				</Table.Body>
			</Table>
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
