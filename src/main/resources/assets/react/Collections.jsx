import {
	lpad,
	rpad
} from '@enonic/js-utils';

import {parseExpression as parseCronExpression} from 'cron-parser';
import {
	Button, Dimmer, Header, Icon, Loader, Popup, Table
} from 'semantic-ui-react';
import {
	MONTH_TO_HUMAN
} from './collection/SchedulingSegment';
import {DeleteCollectionModal} from './collection/DeleteCollectionModal';
import {NewOrEditCollectionModal} from './collection/NewOrEditCollectionModal';
import {useInterval} from './utils/useInterval';
import {Cron} from './utils/Cron';

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
	${JOBS_GQL}
	${LOCALES_GQL}
	${TASKS_GQL}
}`;

const UPDATE_GQL = `{
	${COLLECTIONS_GQL}
	${COLLECTORS_GQL}
	${FIELDS_GQL}
	${JOBS_GQL}
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

	const [locales, setLocales] = React.useState([]);
	const [queryCollectionsGraph, setQueryCollectionsGraph] = React.useState({});
	const [queryCollectorsGraph, setQueryCollectorsGraph] = React.useState({});
	const [jobsObj, setJobsObj] = React.useState({});
	const [tasks, setTasks] = React.useState([]);
	const [boolPoll, setBoolPoll] = React.useState(true);

	const [queryFieldsGraph, setQueryFieldsGraph] = React.useState({});
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

	const intInitializedCollectorComponents = Object.keys(collectorComponents).length;

	let collectorOptions = queryCollectorsGraph.hits
		? queryCollectorsGraph.hits.map(({
			appName,
			collectTaskName,
			//_name: key,
			displayName: text
		}) => ({
			key: `${appName}:${collectTaskName}`,
			text,
			value: `${appName}:${collectTaskName}`
		}))
		: [];

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
						<Table.HeaderCell>Schema</Table.HeaderCell>
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
						documentCount,
						interfaces,
						language = '',
						schemaId = ''
					}, index) => {
						const key = `collection[${index}]`;
						const boolCollectorSelected = !!(collector && collector.name);
						const boolCollectorSelectedAndInitialized = boolCollectorSelected && collectorComponents[collector.name];
						const editEnabled = intInitializedCollectorComponents && (boolCollectorSelectedAndInitialized || !boolCollectorSelected);
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
									_id,
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
							<Table.Cell collapsing>{collector && collector.name || ''}</Table.Cell>
							<Table.Cell collapsing>{documentCount}</Table.Cell>
							<Table.Cell collapsing>{language}</Table.Cell>
							<Table.Cell collapsing>{schemaId}</Table.Cell>
							<Table.Cell collapsing>{interfaces.map((iface, i) => <p key={i}>
								{i === 0 ? null : <br/>}
								<span style={{whitespace: 'nowrap'}}>{iface}</span>
							</p>)}</Table.Cell>
							<Table.Cell>{
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
