import type {StrictTableHeaderCellProps} from 'semantic-ui-react';
import type {
	ContentTypeOptions,
	SiteOptions
} from '/lib/explorer/types/Collector.d';
import type {CollectorComponents} from '../index.d';
import type {QueryCollectionsGraph} from './index.d';


import {COLON_SIGN} from '@enonic/js-utils';
import moment from 'moment';
import * as React from 'react';
import {useInterval} from '../utils/useInterval';


const COLLECTIONS_GQL = `queryCollections(
	perPage: -1
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
		documentCount
		#interfaces
		language
		documentTypeId
	}
}`;

const COLLECTORS_GQL = `queryCollectors {
	total
	count
	hits {
		appName
		collectTaskName
		configAssetPath
		displayName
	}
}`;

const FIELDS_GQL = `queryFields {
	total
	count
	hits {
		_name
		key
	}
}`;

const JOBS_GQL = `listScheduledJobs {
	collectionId
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
	displayName
	tag
}`;

const GQL_DOCUMENT_TYPES_QUERY = `queryDocumentTypes {
	hits {
		_id
		_name
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
	${GQL_DOCUMENT_TYPES_QUERY}
	${TASKS_GQL}
}`;

const UPDATE_GQL = `{
	${COLLECTIONS_GQL}
	${COLLECTORS_GQL}
	${FIELDS_GQL}
	${JOBS_GQL}
	${GQL_DOCUMENT_TYPES_QUERY}
	${TASKS_GQL}
}`;

export function useCollectionsState({
	collectorComponents,
	servicesBaseUrl
}: {
	collectorComponents :CollectorComponents
	servicesBaseUrl :string
}) {
	const [updatedAt, setUpdatedAt] = React.useState(moment());
	const [durationSinceLastUpdate, setDurationSinceLastUpdate] = React.useState('');

	const [jobsObj, setJobsObj] = React.useState({});
	const [locales, setLocales] = React.useState([]);
	const [queryCollectionsGraph, setQueryCollectionsGraph] = React.useState<QueryCollectionsGraph>({
		count: 0,
		hits: [],
		total: 0
	});
	const [queryCollectorsGraph, setQueryCollectorsGraph] = React.useState({
		count: 0,
		hits: [],
		total: 0
	});
	const [queryFieldsGraph, setQueryFieldsGraph] = React.useState({
		count: 0,
		hits: [],
		total: 0
	});
	const [documentTypes, setDocumentTypes] = React.useState([]);

	const [showCollector, setShowCollector] = React.useState(false);
	const [showDelete, setShowDelete] = React.useState(false);
	const [showDocumentCount/*, setShowDocumentCount*/] = React.useState(true);
	const [showLanguage, setShowLanguage] = React.useState(false);
	const [showInterfaces, setShowInterfaces] = React.useState(false);
	const [showDocumentType, setShowDocumentType] = React.useState(false);
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
	const collectorOptions = queryCollectorsGraph.hits
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
		} /*else { // Not collector nor reindex task
			console.debug('taskDescriptor', taskDescriptor);
		}*/
	});
	//console.debug('anyReindexTaskWithoutCollectionId',anyReindexTaskWithoutCollectionId);

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
	} as {
		column :string
		contentTypeOptions :ContentTypeOptions
		direction: StrictTableHeaderCellProps['sorted']
		isLoading :boolean
		siteOptions :SiteOptions
	});

	const {
		column,
		contentTypeOptions,
		direction,
		isLoading,
		siteOptions
	} = state;

	function setJobsObjFromArr(arr :Array<{
		collectionId :string
		enabled :boolean
		schedule :{
			type :string
			value :string
		}
	}>) {
		const obj={};
		arr.forEach(({
			collectionId,
			//collectionName,
			enabled,
			schedule: {
				type,
				//timeZone,
				value
			}
		}) => {
			if (type === 'CRON') {
				if(obj[collectionId]) {
					obj[collectionId].push({enabled, value});
				} else {
					obj[collectionId] = [{enabled, value}];
				}
			}
		});
		setJobsObj(obj);
	} // jobsObjFromArr

	const memoizedFetchOnMount = React.useCallback(() => {
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
					setDocumentTypes(res.data.queryDocumentTypes.hits);
					setTasks(res.data.queryTasks);
					setUpdatedAt(moment());
				} // if
			}); // then
	}, [
		servicesBaseUrl
	]);

	const memoizedFetchOnUpdate = React.useCallback(() => {
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
					setDocumentTypes(res.data.queryDocumentTypes.hits);
					setTasks(res.data.queryTasks);
					setUpdatedAt(moment());
				}
			});
	}, [
		servicesBaseUrl
	]);

	const memoizedFetchCollections = React.useCallback(() => {
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
	}, [
		servicesBaseUrl
	]);

	const memoizedFetchTasks = React.useCallback(() => {
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
	}, [
		servicesBaseUrl
	]);

	React.useEffect(() => memoizedFetchOnMount(), [
		memoizedFetchOnMount
	]); // Only once

	React.useEffect(() => {
		setDurationSinceLastUpdate(
			moment
				.duration(updatedAt.diff(moment()))
				.humanize()
		);
	}, [
		updatedAt
	]);

	useInterval(() => {
		setDurationSinceLastUpdate(
			moment
				.duration(updatedAt.diff(moment()))
				.humanize()
		);
	}, 5000);

	const shemaIdToName = {};
	documentTypes.forEach(({_id, _name}) => {
		shemaIdToName[_id] = _name;
	});

	return {
		anyReindexTaskWithoutCollectionId,
		anyTaskWithoutCollectionName,
		collectionsTaskState,
		collectorOptions,
		column,
		contentTypeOptions,
		direction,
		durationSinceLastUpdate,
		fieldsObj,
		intInitializedCollectorComponents,
		isLoading,
		jobsObj,
		locales,
		memoizedFetchCollections,
		memoizedFetchOnUpdate,
		memoizedFetchTasks,
		objCollectionsBeingReindexed,
		queryCollectionsGraph,
		shemaIdToName,
		setShowCollector,
		setShowDelete,
		setShowDocumentType,
		setShowInterfaces,
		setShowLanguage,
		setShowSchedule,
		showCollector,
		showDelete,
		showDocumentCount,
		showDocumentType,
		showInterfaces,
		showLanguage,
		showSchedule,
		siteOptions
	};
}
