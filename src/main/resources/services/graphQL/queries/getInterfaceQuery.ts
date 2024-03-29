//import {toStr} from '@enonic/js-utils';


export function getInterfaceQuery({
	_id
}) {
	//console.debug('getInterfaceQuery({_id:', _id, '})');
	const queryStr = `getInterface(
	_id: "${_id}"
) {
	_id
	_name
	_path
	_versionKey
	collectionIds
	fields {
		boost
		name
	}
	#stopWordIds
	stopWords
	synonymIds
}`;
	//console.debug('getInterfaceQuery({_id:', _id, '}) -->', queryStr);
	return queryStr;
}
