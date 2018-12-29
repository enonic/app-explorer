//import {toStr} from '/lib/enonic/util';
import {NT_FIELD} from '/lib/enonic/yase/admin/constants';
import {createNode} from '/lib/enonic/yase/admin/createNode';
import {fieldsPage} from '/lib/enonic/yase/admin/routes/fields/fieldsPage';


export function handleFieldsPost({
	params: {
		key,
		displayName = `${key.charAt(0).toUpperCase()}${key.substr(1)}`,
		description = '',
		//iconUrl = '',
		instruction = 'type',
		decideByType = 'on',
		enabled = 'on',
		nGram = 'on',
		fulltext = 'on',
		includeInAllText = 'on',
		path,
		comment = ''
	},
	path: reqPath
}) {
	/*log.info(toStr({
		key,
		instruction,
		decideByType,
		enabled,
		nGram,
		fulltext,
		includeInAllText,
		path,
		comment
	}));*/
	const lcKey = key.toLowerCase();
	const node = createNode({
		_indexConfig: {default: 'byType'},
		_name: lcKey,
		_parentPath: '/fields',
		comment,
		description,
		displayName,
		key: lcKey,
		//iconUrl,
		indexConfig: instruction === 'custom' ? {
			decideByType: decideByType && decideByType === 'on',
			enabled: enabled && enabled === 'on',
			nGram: nGram && nGram === 'on',
			fulltext: fulltext && fulltext === 'on',
			includeInAllText: includeInAllText && includeInAllText === 'on',
			path: path && path === 'on'
		} : instruction,
		type: NT_FIELD
	});
	//log.info(toStr({node}));
	return fieldsPage({path: reqPath}, {
		messages: node
			? [`Field with key:${lcKey} created.`]
			: [`Something went wrong when trying to create field with key:${lcKey}.`],
		status: node ? 200 : 500
	});
} // function post
