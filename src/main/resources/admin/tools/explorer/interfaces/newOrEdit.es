import traverse from 'traverse';
import generateUuidv4 from 'uuid/v4';

//import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {isString} from '/lib/util/value';
import {assetUrl} from '/lib/xp/portal';

import {
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {query as queryCollections} from '/lib/explorer/collection/query';
import {getFields} from '/admin/tools/explorer/fields/getFields';
import {getFieldValues} from '/admin/tools/explorer/fields/getFieldValues';
import {query as getThesauri} from '/lib/explorer/thesaurus/query';
import {query as getStopWords} from '/lib/explorer/stopWords/query';


const ID_REACT_INTERFACE_CONTAINER = 'reactInterfaceContainer';


function convert({object, fields, recurse = true}) {
	traverse(object).forEach(function(value) { // Fat arrow destroys this
		const key = this.key;
		if (fields.includes(key)) { // Fields that should become array
			if (!value) {
				this.update([]);
			} else if (!Array.isArray(value)) { // Convert single value to array
				value = [value];
				if (recurse) {
					convert({object: value, fields, recurse}); // Recurse
				}
				this.update(value);
			} else if (Array.isArray(value)) {
				this.update(value.map(entry => {
					if (!isString(entry) && !entry.uuid4) {
						entry.uuid4 = generateUuidv4();
					}
					return entry;
				}));
			} // if isArray
		}
	}); // traverse
	return object;
}


export function newOrEdit({
	path
}) {
	const relPath = path.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g); //log.info(toStr({pathParts}));
	const action = pathParts[1];
	const interfaceName = pathParts[2];

	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_READ]
	});

	let initialValues;
	if (action === 'edit') {
		const node = connection.get(`/interfaces/${interfaceName}`)
		const name = node.name || '';
		const collections = node.collections ? forceArray(node.collections) : []
		const thesauri = node.thesauri ? forceArray(node.thesauri) : []
		const {
			facets = [],
			filters,
			query,
			stopWords,
			resultMappings,
			pagination
		} = node;
		initialValues = convert({
			object: {
				name,
				collections,
				filters,
				query,
				stopWords,
				resultMappings,
				facets,
				pagination,
				thesauri
			},
			fields: [
				'expressions',
				'facets',
				'fields',
				'must',
				'mustNot',
				'resultMappings',
				'stopWords',
				'thesauri',
				'values'
			]
		});
		//log.info(toStr({initialValues}));
	} // action === edit

	const fieldValuesArray = getFieldValues({connection}).hits;
	const fieldValuesObj = {};
	fieldValuesArray.forEach(({_path, displayName, field, value}) => {
		/*if (!fieldValuesObj[field]) {fieldValuesObj[field] = []}
		fieldValuesObj[field].push({
			label: displayName,
			value: _name,
			path: _path
		});*/
		if (!fieldValuesObj[field]) {fieldValuesObj[field] = {}}
		fieldValuesObj[field][value] = {
			label: displayName,
			path: _path
		};
	});

	const fieldsArray = getFields({connection}).hits.map(({displayName, key, _path}) => ({
		label: displayName,
		path: _path,
		value: key,
		values: fieldValuesObj[key]
	}));
	const fieldsObj = {};
	fieldsArray.forEach(({label, path, value, values}) => {
		fieldsObj[value] = {
			label, path, values
		};
	});
	//log.info(toStr({fieldsObj}));

	const stopWordOptions = getStopWords({connection}).hits.map(({displayName, name}) => ({
		key: name,
		text: displayName,
		value: name
	}));
	//log.info(toStr({stopWordOptions}));

	const propsObj = {
		action: `${TOOL_PATH}/interfaces/${action === 'edit' ? `update/${interfaceName}` : 'create'}`,
		collectionOptions: queryCollections({connection}).hits.map(({
			displayName: text,
			_name: key
		}) => ({
			key,
			text,
			value: key
		})),
		fields: fieldsObj,
		stopWordOptions,
		thesauriOptions: getThesauri({connection}).hits.map(({displayName, name}) => ({
			key: name,
			text: displayName,
			value: name
		})),
		initialValues
	};

	const propsJson = JSON.stringify(propsObj);

	return htmlResponse({
		bodyEnd: [
			`<script type='module' defer>
	import {Interface} from '${assetUrl({path: 'react/Interface.esm.js'})}'
	ReactDOM.render(
		React.createElement(Interface, JSON.parse('${propsJson}')),
		document.getElementById('${ID_REACT_INTERFACE_CONTAINER}')
	);
</script>`
		],
		main: `<h1 class="header ui">New/Edit Interface</h1>
<div id="${ID_REACT_INTERFACE_CONTAINER}"/>`,
		path,
		title: 'Create or edit interface'
	});
} // function newOrEdit
