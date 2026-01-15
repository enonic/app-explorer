import { toStr } from '@enonic/js-utils/value/toStr';
import {
	getType
} from '/lib/xp/content';
// import {
// 	get as getContext,
// 	run as runInContext,
// } from '/lib/xp/context';


const TRACE = false;


export function get({
	params: {
		type: typeName,
	}
}) {
	// const context = getContext();
	// if (TRACE) log.info('context:%s', toStr(context));
	const type = getType(typeName);
	if (TRACE) log.info('type:%s', toStr(type));

	const {
		icon: {
			data,
			mimeType,
		}
	} = type;
	if (TRACE) log.info('mimeType:%s', toStr(mimeType));
	return {
		contentType: mimeType,
		body: data,
	};
}
