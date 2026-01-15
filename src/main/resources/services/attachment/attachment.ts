import { toStr } from '@enonic/js-utils/value/toStr';
import {
	getAttachmentStream,
	get as getContentByKey,
} from '/lib/xp/content';
import {
	get as getContext,
	run as runInContext,
} from '/lib/xp/context';

const TRACE = false;

export function get({
	params: {
		contentId,
		name,
		project,
	}
}) {
	const context = getContext();
	if (TRACE) log.info('context:%s', toStr(context));
	context.branch = 'master'; // Only show published content?
	context.repository = `com.enonic.cms.${project}`;
	if (TRACE) log.info('modified context:%s', toStr(context));
	const content = runInContext(context, () => getContentByKey({key: contentId}));
	const {
		mimeType
	} = content.attachments[name];
	if (TRACE) log.info('mimeType:%s', toStr(mimeType));
	const stream = runInContext(
		context, () => getAttachmentStream({
			key: contentId,
			name,
		})
	);
	return {
		contentType: mimeType,
		body: stream,
	};
}
