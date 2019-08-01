//import traverse from 'traverse';
import serialize from 'serialize-javascript';

import {toStr} from '/lib/util';
import {getSites} from '/lib/util/content/getSites';
import {isSet} from '/lib/util/value';
import {getType, getTypes} from '/lib/xp/content';
import {assetUrl} from '/lib/xp/portal';

import {connect} from '/lib/explorer/repo/connect';
import {
	NT_COLLECTOR,
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';

import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {menu} from '/admin/tools/explorer/collections/menu';
import {query as queryCollectors} from '/lib/explorer/collector/query';
import {getFields} from '/admin/tools/explorer/fields/getFields';
import {getFieldValues} from '/admin/tools/explorer/fields/getFieldValues';


const ID_REACT_COLLECTION_CONTAINER = 'reactCollectionContainer';

/*function convert(node) {
	traverse(node).forEach(function(value) { // Fat arrow destroys this
		const key = this.key;
		//log.info(toStr({key}));
		if([
			'crawl',
			'download',
			'headers',
			'queryParams',
			'scrape',
			'scrapeExpression',
			'scrapeJson',
			'tags',
			'urls',
			'urlExpression'
			//'value' // Nope this will destroy headers[index].value
		].includes(key)) {
			if (!value) {
				this.update([]);
			} else if (!Array.isArray(value)) {
				const array = [value];
				convert(array); // Recurse
				this.update(array);
			}
		}
	});
}*/


export function newOrEdit({
	path
}) {
	const relPath = path.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g); //log.info(toStr({pathParts}));
	const action = pathParts[1];
	const collectionName = pathParts[2];
	let initialValues = {
		name: '',
		collector: {
			config: {},
			name: ''
		},
		cron: [{
			month: '*',
			dayOfMonth: '*',
			dayOfWeek: '*',
			minute: '*',
			hour: '*'
		}],
		doCollect: false
	};
	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_READ]
	});

	const collectorsAppToUri = {};
	const collectorOptions = queryCollectors({
		connection
	}).hits.map(({_name: application, displayName, configAssetPath}) => {
		const uri = assetUrl({
			application,
			path: configAssetPath
		});
		collectorsAppToUri[application] = uri;
		return {
			key: application,
			text: displayName,
			value: application
		};
	});
	//log.info(toStr({collectorsAppToUri}));
	let status = 200;
	const messages = [];
	if (!collectorOptions.length) {
		status = 500;
		messages.push(`There are no collectors installed!`);
		return {
			redirect: `${TOOL_PATH}/collections/list?${
				messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
			}&status=${status}`
		}
	}

	if (action === 'edit') {
		//log.info(toStr({collectionName}));

		const node = connection.get(`/collections/${collectionName}`);
		//log.info(toStr({node}));

		const {
			displayName,
			collector: {
				name: collectorName,
				configJson,
				config
			},
			cron = [{
				month: '*',
				dayOfMonth: '*',
				dayOfWeek: '*',
				minute: '*',
				hour: '*'
			}],
			doCollect
		} = node;
		//log.info(toStr({config, configJson}));

		const collector = {
			name: collectorName,
			config: configJson ? JSON.parse(configJson) : config
		};
		//log.info(toStr({collector}));

		if (!collectorsAppToUri[collector.name]) {
			status = 500;
			messages.push(`${collector.name} is currently not installed!`);
			return {
				redirect: `${TOOL_PATH}/collections/list?${
					messages.map(m => `messages=${encodeURIComponent(m)}`).join('&')
				}&status=${status}`
			}
		}


		//convert(collector); // TODO Surgeon specific
		if (collector.name === 'com.enonic.app.explorer.collector.surgeon' && collector.config.urls && !collector.config.urls.length) {
			collector.config.urls.push('');
		}
		//log.info(toStr({collector}));

		initialValues = {
			name: displayName,
			collector,
			cron,
			doCollect: isSet(doCollect) ? doCollect : true
		};
	}
	//log.info(toStr({initialValues}));

	const fieldValuesArray = getFieldValues({connection}).hits;
	const fieldValuesObj = {};
	fieldValuesArray.forEach(({
		_name: name,
		_path: path,
		displayName: label,
		field
	}) => {
		if (!fieldValuesObj[field]) {fieldValuesObj[field] = {}}
		fieldValuesObj[field][name] = {
			label,
			path
		};
	});

	const fieldsArr = getFields({connection}).hits.map(({
		_path: path,
		displayName: label,
		key: value
	}) => ({label, value, path}));
	const fieldsObj = {};
	fieldsArr.forEach(({label, path, value: field}) => {
		fieldsObj[field] = {
			label,
			path,
			values: fieldValuesObj[field]
		};
	});
	//log.info(toStr({fieldsObj}));

	const siteOptions = getSites({branch: 'master'}).hits
		.map(({_id: key, displayName: text}) => ({
			key,
			text,
			value: key
		}));
	//log.info(toStr({siteOptions}));

	//const siteType = getType('portal:site'); log.info(toStr({siteType}));
	const contentTypes = getTypes(); //log.info(toStr({contentTypes}));
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
	//log.info(toStr({contentTypeOptions}));

	const propsObj = {
		action: `${TOOL_PATH}/collections/${action === 'edit' ? `update/${collectionName}` : 'create'}`,
		collectorOptions,
		collectorsAppToUri,
		contentTypeOptions,
		fields: fieldsObj,
		siteOptions,
		TOOL_PATH,
		initialValues
	};
	//log.info(toStr({propsObj}));

	return htmlResponse({
		bodyBegin: [
			menu({path})
		],
		main: `<div id="${ID_REACT_COLLECTION_CONTAINER}"/>`,
		bodyEnd: [
			`<script type='module' defer>
	import {Collection} from '${assetUrl({path: 'react/Collection.esm.js'})}'
	const collectorsObj = {};
	${Object.entries(collectorsAppToUri).map(([a, u], i) => `import {Collector as Collector${i}} from '${u}';
	collectorsObj['${a}'] = Collector${i};`
	).join('\n')}
	const propsObj = eval(${serialize(propsObj)});
	propsObj.collectorsObj = collectorsObj;
	ReactDOM.render(
		React.createElement(Collection, propsObj),
		document.getElementById('${ID_REACT_COLLECTION_CONTAINER}')
	);
</script>`
		],
		path,
		title: 'Create or edit collection'
	});
}
