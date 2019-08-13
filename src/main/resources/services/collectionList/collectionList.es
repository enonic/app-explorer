import {getSites} from '/lib/util/content/getSites';
import {getTypes} from '/lib/xp/content';
//import {assetUrl} from '/lib/xp/portal';

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


export function get() {
	const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });

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

	const collections = queryCollections({connection});
	let totalCount = 0;
	collections.hits = collections.hits.map(({
		collector,
		cron,
		displayName,
		doCollect = false,
		//_id: id,
		_name: name
	}) => {
		const count = getDocumentCount(name);
		if (count > 0) {
			totalCount += count;
		}
		return {
			collector,
			count,
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
			collections,
			collectorOptions,
			//collectors,
			contentTypeOptions,
			fields,
			siteOptions,
			totalCount
		},
		contentType: RT_JSON
	};
} // get
