import type {
	Attachment,
	Site,
} from '@enonic-types/lib-content';
import type { Glue } from '../Glue';

import { sortByProperty } from '@enonic/js-utils/array/sortBy';
import { toStr } from '@enonic/js-utils/value/toStr';
import {
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
	// @ts-ignore
} from '/lib/graphql';
import {
	query as queryContent,
} from '/lib/xp/content';
import {
	get as getContext,
	run as runInContext,
} from '/lib/xp/context';
import { serviceUrl } from '/lib/xp/portal';
import { list as listProjects } from '/lib/xp/project';
// @ts-ignore
import { getSites as gS } from '/lib/util/content/getSites';
import { GQL_UNIQ_TYPE } from '../constants';
import {
	type ContentTypeObjectType,
	type GetContentTypesArgs,
	getContentTypesResolver,
} from './addGetContentTypes';

const TRACE = false;

type AttachmentObjectType = Attachment & {
	url?: string;
}

type SiteObjectType = Pick<
	Site<Record<string, unknown>>,
	'_id'
	| '_name'
	| '_path'
	| 'displayName'
> & {
	_project: string;
	attachments: AttachmentObjectType[];
	[GQL_UNIQ_TYPE.QUERY_CONTENT_TYPES_GET]: ContentTypeObjectType[];
}

export function addGetSites({
	glue
}: {
	glue: Glue
}) {
	glue.addObjectType<AttachmentObjectType>({
		name: GQL_UNIQ_TYPE.OBJECT_ATTACHMENT,
		fields: {
			label: { type: GraphQLString }, // optional
			name: { type: nonNull(GraphQLString) },
			mimeType: { type: nonNull(GraphQLString) },
			size: { type: nonNull(GraphQLInt) },
			url: { type: GraphQLString }, // optional
		}
	});

	const SITE_OBJECT_TYPE = glue.addObjectType<SiteObjectType>({
		name: GQL_UNIQ_TYPE.OBJECT_SITE,
		// description:,
		fields: {
			_id: { type: glue.getScalarType('_id') },
			_name: { type: glue.getScalarType('_name') },
			_path: { type: glue.getScalarType('_path') },
			_project: { type: nonNull(GraphQLString) },
			displayName: { type: nonNull(GraphQLString) },
			attachments: { type: list(glue.getObjectType(GQL_UNIQ_TYPE.OBJECT_ATTACHMENT)) },
			[GQL_UNIQ_TYPE.QUERY_CONTENT_TYPES_GET]: {
				args: {
					sort: glue.getInputType(GQL_UNIQ_TYPE.INPUT_CONTENT_TYPES_SORT),
				},
				// @ts-expect-error
				resolve: (env: {
					args: GetContentTypesArgs;
					source: SiteObjectType;
				}) => {
					if (TRACE) log.info('env:%s', toStr(env));
					const {
						args: {
							sort: {
								field: sortField = 'docCount',
								direction: sortDirection = 'DESC',
							} = {}
						},
						source: {
							_path,
							_project,
						}
					} = env;
					if (TRACE) log.info('_path:%s', toStr(_path));
					const context = getContext();
					if (TRACE) log.info('context:%s', toStr(context));
					context.branch = 'master';
					context.repository = `com.enonic.cms.${_project}`;
					if (TRACE) log.info('modified context:%s', toStr(context));
					const contentQueryRes = runInContext(context, () => queryContent({
						aggregations: {
							type: {
								terms: {
									field: 'type',
									minDocCount: 1,
									// order: '_count desc', // Sort added elsewhere
									size: 1000,
								}
							}
						},
						count: 0,
						query: {
							boolean: {
								must: {
									pathMatch: {
										field: '_path',
										path: `/content${_path}`,
									}
								}
							}
						},
						start: 0,
					}));
					if (TRACE) log.info('contentQueryRes:%s', toStr(contentQueryRes));
					const {
						aggregations: {
							type: {
								buckets
							}
						}
					} = contentQueryRes;
					const keyToDocCount: Record<string, number> = {};
					env.args.names = [];
					for(const { docCount, key } of buckets) {
						env.args.names.push(key);
						keyToDocCount[key] = docCount;
					}
					if (TRACE) log.info('env.args.names:%s', toStr(env.args.names));
					if (TRACE) log.info('keyToDocCount:%s', toStr(keyToDocCount));
					const contentObjectTypes = getContentTypesResolver(env);
					if (TRACE) log.info('contentObjectTypes:%s', toStr(contentObjectTypes));
					let contentObjectTypesWithDocCount = contentObjectTypes.map(cOT => {
						cOT._docCount = keyToDocCount[cOT.name];
						return cOT;
					});
					if (TRACE) log.info('contentObjectTypesWithDocCount:%s', toStr(contentObjectTypesWithDocCount));
					if (sortField === 'docCount') {
						contentObjectTypesWithDocCount = sortByProperty(contentObjectTypesWithDocCount, '_docCount');
						if (sortDirection === 'DESC') {
							contentObjectTypesWithDocCount = contentObjectTypesWithDocCount.reverse();
						}
					}
					return contentObjectTypesWithDocCount;
				},
				type: list(glue.getObjectType(GQL_UNIQ_TYPE.OBJECT_CONTENT_TYPE)),
			},
		}
	});

	glue.addQuery({
		name: GQL_UNIQ_TYPE.QUERY_SITES_GET,
		args: {},
		resolve: (env: unknown) => {
			if (TRACE) log.info('env:%s', toStr(env));
			const sitesQueryRes = {
				count: 0,
				hits: [],
				total: 0
			}
			const context = getContext();
			if (TRACE) log.info('context:%s', toStr(context));
			context.branch = 'master';
			const projectIds = listProjects().map(({id}) => id);
			for (const projectId of projectIds) {
				context.repository = `com.enonic.cms.${projectId}`;
				if (TRACE) log.info('context:%s', toStr(context));
				const sitesInProject = gS({
					context
				});
				if (TRACE) log.info('sitesInProject:%s', toStr(sitesInProject));
				sitesQueryRes.count += sitesInProject.count;
				sitesQueryRes.total += sitesInProject.total;
				for (const hit of sitesInProject.hits) {
					hit._project = projectId;
					const newAttachments: AttachmentObjectType[] = [];
					const attachmentObject = (hit as SiteObjectType).attachments;
					for (const attachmentName in attachmentObject) {
						const attachment = attachmentObject[attachmentName];
						(attachment as AttachmentObjectType).url = runInContext(context, () => serviceUrl({
							service: 'attachment',
							params: {
								contentId: hit._id,
								name: attachmentName,
								project: projectId,
							}
						}));
						newAttachments.push(attachment);
					}
					hit.attachments = newAttachments;
					sitesQueryRes.hits.push(hit);
				}
			} // for projectIds
			if (TRACE) log.info('sites:%s', toStr(sitesQueryRes));
			return sitesQueryRes;
		},
		type: glue.addObjectType({
			name: GQL_UNIQ_TYPE.OBJECT_SITES_GET,
			// description:
			fields: {
				count: { type: glue.getScalarType('count') },
				hits: { type: list(SITE_OBJECT_TYPE) },
				total: { type: glue.getScalarType('total') }
			} // fields
		})
	});
}

/* Example query
{
	getSites {
		total
		count
		hits {
			_id
			_name
			_path
			_project
			displayName
		}
	}
}
*/
