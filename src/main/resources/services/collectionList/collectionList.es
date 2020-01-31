import getIn from 'get-value';

//import {toStr} from '/lib/util';
import {getSites} from '/lib/util/content/getSites';
import {getTypes} from '/lib/xp/content';
//import {assetUrl} from '/lib/xp/portal';
import {list as listTasks} from '/lib/xp/task';

import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getDocumentCount} from '/lib/explorer/collection/getDocumentCount';
import {query as queryCollections} from '/lib/explorer/collection/query';
import {usedInInterfaces} from '/lib/explorer/collection/usedInInterfaces';
import {query as queryCollectors} from '/lib/explorer/collector/query';
import {getFields} from '/lib/explorer/field/getFields';
import {getFieldValues} from '/lib/explorer/field/getFieldValues';


export function get({
	params: { // These are just passed on
		count,
		page,// = 1, // NOTE First index is 1 not 0
		perPage,// = 10,
		sort,// = 'displayName ASC',
		start// = 0
	}
}) {
	const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });

	const activeCollections = {};
	listTasks({
		state: 'RUNNING'
	}).forEach((runningTask) => {
		//log.info(`runningTask:${toStr(runningTask)}`);
		const maybeJson = getIn(runningTask, 'progress.info');
		if (maybeJson) {
			try {
				const info = JSON.parse(maybeJson);
				if (info.name) {
					activeCollections[info.name] = true;
				}
			} catch (e) {
				//no-op
			}
		}
	});
	//log.info(`activeCollections:${toStr(activeCollections)}`);

	//const collectors = {};
	const collectorOptions = queryCollectors({connection}).hits.map(({
		_name: application,
		displayName,
		configAssetPath
	}) => {
		/*collectors[application] = {
			displayName,
			uri: assetUrl({
				application,
				path: configAssetPath
			})
		};*/
		return {
			key: application,
			text: displayName,
			value: application
		};
	});

	const collections = queryCollections({
		connection,
		count,
		page,
		perPage,
		sort,
		start
	});
	//log.info(toStr({collections}));
	//let totalCount = 0;
	collections.hits = collections.hits.map(({
		collector,
		cron,
		displayName,
		doCollect = false,
		//_id: id,
		_name: name
	}) => {
		const documentCount = getDocumentCount(name);
		/*if (count > 0) {
			totalCount += documentCount;
		}*/
		return {
			collecting: !!activeCollections[name],
			collector,
			count: documentCount,
			cron: Array.isArray(cron) ? cron : [cron],
			displayName,
			doCollect,
			//id,
			interfaces: usedInInterfaces({connection, name}),
			name
		};
	});

	const contentTypeOptions = getTypes().map(({name: key, displayName: text, form}) => {
		/*if (text === 'displayName') {
			log.info(toStr({key, text, form}));
		}*/
		return {
			key,
			text,
			value: key,
			values: form.map(({
				//formItemType OptionSet
				name: key,
				label: text//,
				//options // OptionSet
			}) => {
				/*if (text === 'displayName') {
					log.info(toStr({key, text}));
				}*/
				return {
					key,
					text,
					value: key
				};
			})
		};
	});

	const fields = {};
	const fieldValues = {};
	getFieldValues({connection}).hits.forEach(({
		_name: name,
		_path: path,
		displayName: label,
		field
	}) => {
		if (!fieldValues[field]) {fieldValues[field] = {}}
		fieldValues[field][name] = {
			label,
			path
		};
	});
	getFields({connection}).hits.forEach(({
		_path: path,
		displayName: label,
		key: field
	}) => {
		fields[field] = {
			label,
			path,
			values: fieldValues[field]
		};
	});

	const siteOptions = getSites({branch: 'master'}).hits
		.map(({_id: key, displayName: text}) => ({
			key,
			text,
			value: key
		}));

	return {
		body: {
			params: {
				count,
				page,
				perPage,
				sort,
				start
			},
			collections,
			collectorOptions,
			//collectors,
			contentTypeOptions,
			fields,
			siteOptions/*,
			totalCount*/
		},
		contentType: RT_JSON
	};
} // get
