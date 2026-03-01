import { includes } from '@enonic/js-utils/array/includes';
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

import type {
	Env,
	Glue,
} from '../Glue';
import { GQL_UNIQ_TYPE } from '../constants';

import { getContentTypesResolver } from './addGetContentTypes';
import type {
	AttachmentObjectType,
	GetContentTypesArgs,
	GetSitesArgs,
	GetSitesObjectType,
	QueryContentsArgs,
	QueryContentsObjectType,
	SiteObjectType,
} from './types';
import {
	getQueryContentsArgs,
	queryContentsResolver,
} from './addQueryContents';


const TRACE = false;


export function getSitesResolver<
	CONTEXT extends object = Record<string, unknown>,
	SOURCE extends null | object = null
>(env: Env<GetSitesArgs, CONTEXT, SOURCE>): GetSitesObjectType {
	if (TRACE) log.info('env:%s', toStr(env));

	const { args, context: localContext } = env;
	if (TRACE) log.info('args:%s', toStr(args));
	if (TRACE) log.info('getSitesResolver: localContext:%s', toStr(localContext));

	const {
		branch = 'master',
		sitePaths = [],
		projectIds = []
	} = args;

	const sitesQueryRes: GetSitesObjectType = {
		count: 0,
		hits: [],
		total: 0
	}
	const context = getContext();
	if (TRACE) log.info('context:%s', toStr(context));
	context.branch = branch;
	let filteredProjectIds = listProjects().map(({id}) => id);
	if (projectIds.length) {
		filteredProjectIds = filteredProjectIds
			.filter((projectId) => includes(projectIds, projectId));
	}
	for (const projectId of filteredProjectIds) {
		context.repository = `com.enonic.cms.${projectId}`;
		if (TRACE) log.info('context:%s', toStr(context));
		let query;
		if (sitePaths.length) {
			query = {
				boolean: {
					must: {
						in: {
							field: '_path',
							values: sitePaths.map(sitePath => `/content${sitePath}`)
						}
					}
				}
			}
		}
		if (TRACE) log.info('query:%s', toStr(query));

		const sitesInProject = gS({
			context,
			query
		});
		if (TRACE) log.info('sitesInProject:%s', toStr(sitesInProject));

		sitesQueryRes.count += sitesInProject.count;
		sitesQueryRes.total += sitesInProject.total;
		for (const hit of sitesInProject.hits) {
			hit._branch = branch;
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
	} // for filteredProjectIds
	if (TRACE) log.info('sites:%s', toStr(sitesQueryRes));
	return sitesQueryRes;
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
			_branch: { type: nonNull(glue.getEnumType(GQL_UNIQ_TYPE.ENUM_PROJECT_BRANCH)) },
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
						// context: localContextFromSiteObject,
						source: {
							_branch = 'master',
							_path,
							_project,
						}
					} = env;
					if (TRACE) log.info('_path:%s', toStr(_path));
					const context = getContext();
					if (TRACE) log.info('context:%s', toStr(context));
					context.branch = _branch;
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
					env.args.branch = _branch;
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
			[GQL_UNIQ_TYPE.QUERY_CONTENT_QUERY]: {
				args: {
					...getQueryContentsArgs({ glue }),
					branch: undefined, // available in source
					projectId: undefined, // available in source
					sitePath: undefined, // available in source
				},
				type: glue.getObjectType<QueryContentsObjectType>(GQL_UNIQ_TYPE.OBJECT_CONTENT_QUERY_RESULT),
				// @ts-ignore
				resolve: (env: Env<QueryContentsArgs, ContextWithProjectId, SiteObjectType>) => {
					const { args, context: localContext, source } = env;
					// log.info('getSites.queryContents: args:%s', toStr(args));
					// log.info('getSites.queryContents: localContext:%s', toStr(localContext));
					const {
						sitePath,
						...restArgs
					} = args;
					const { _branch, _path, _project } = source;
					return queryContentsResolver<SiteObjectType>({
						args: {
							...restArgs,
							branch: _branch,
							projectId: _project,
							sitePath: _path
						},
						context: {
							...localContext,
							projectId: _project,
						},
						source,
					});
				}
			}
		}
	});

	glue.addQuery<GetSitesArgs>({
		name: GQL_UNIQ_TYPE.QUERY_SITES_GET,
		args: {
			// @ts-ignore TODO
			branch: glue.getEnumType(GQL_UNIQ_TYPE.ENUM_PROJECT_BRANCH),
			projectIds: list(GraphQLString),
			sitePaths: list(GraphQLString),
		},
		resolve: getSitesResolver,
		type: glue.addObjectType<GetSitesObjectType>({
			name: GQL_UNIQ_TYPE.OBJECT_SITES_GET,
			// description:
			fields: {
				count: { type: glue.getScalarType<number>('count') },
				hits: { type: list(SITE_OBJECT_TYPE) },
				total: { type: glue.getScalarType<number>('total') }
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
