import type {
	Env,
	Glue,
} from '../Glue';

import { includes } from '@enonic/js-utils/array/includes';
import { toStr } from '@enonic/js-utils/value/toStr';
import {
	GraphQLBoolean,
	GraphQLString,
	Json as GraphQLJson,
	list,
	nonNull,
	//@ts-ignore
} from '/lib/graphql';
import {
	type Project,
	list as listProjects,
} from '/lib/xp/project';

import type {
	QueryContentsArgs,
	QueryContentsObjectType,
	GetSitesObjectType,
} from '../content/types';
import { getSitesResolver } from '../content/addGetSites';
import {
	getQueryContentsArgs,
	queryContentsResolver,
} from '../content/addQueryContents';
import { GQL_UNIQ_TYPE } from '../constants';

import type { ProjectObjectType } from './types';


const TRACE = false;

type ProjectInterim = Project & { projectSiteConfigAsJson: Project['siteConfig'] };


export function addListProjects({
	glue
}: {
	glue: Glue
}) {
	glue.addObjectType({
		name: GQL_UNIQ_TYPE.OBJECT_PROJECT_PERMISSION,
		fields: {
			author: { type: list(GraphQLJson) },
			contributor: { type: list(GraphQLJson) },
			editor: { type: list(GraphQLJson) },
			owner: { type: list(GraphQLJson) },
			viewer: { type: list(GraphQLJson) },
		}
	});

	glue.addObjectType({
		name: GQL_UNIQ_TYPE.OBJECT_PROJECT_READ_ACCESS,
		fields: {
			public: { type: nonNull(GraphQLBoolean) }
		}
	});

	const projectObjectType = glue.addObjectType<ProjectObjectType>({
		name: GQL_UNIQ_TYPE.OBJECT_PROJECT,
		fields: {
			description: { type: GraphQLString },
			displayName: { type: nonNull(GraphQLString) },
			id: { type: nonNull(GraphQLString) },
			language: { type: GraphQLString },
			parent: { type: GraphQLString },
			parents: { type: nonNull(list(nonNull(GraphQLString))) },
			permissions: { type: glue.getObjectType(GQL_UNIQ_TYPE.OBJECT_PROJECT_PERMISSION) },
			readAccess: { type: glue.getObjectType(GQL_UNIQ_TYPE.OBJECT_PROJECT_READ_ACCESS) },
			projectSiteConfigAsJson: { type: GraphQLJson },
			[GQL_UNIQ_TYPE.QUERY_SITES_GET]: {
				args: {
					// projectIds are populated from source
					sitePaths: list(GraphQLString)
				},
				type: glue.getObjectType<GetSitesObjectType>(GQL_UNIQ_TYPE.OBJECT_SITES_GET),
				// @ts-ignore
				resolve: (env: Env<GetSitesArgs, {}, ProjectObjectType>) => {
					const { args, context, source } = env;
					const { sitePaths } = args;
					const { id } = source;
					return getSitesResolver({
						args: {
							projectIds: [id],
							sitePaths,
						},
						context: {
							...context,
							projectId: id,
						},
						source
					});
				}
			},
			[GQL_UNIQ_TYPE.QUERY_CONTENT_QUERY]: {
				args: {
					...getQueryContentsArgs({ glue }),
					projectId: undefined,
				},
				type: glue.getObjectType<QueryContentsObjectType>(GQL_UNIQ_TYPE.OBJECT_CONTENT_QUERY_RESULT),
				// @ts-ignore
				resolve: (env: Env<QueryContentsArgs, {}, ProjectObjectType>) => {
					const { args, context: localContext, source } = env;
					const { projectId, ...restArgs } = args;
					const { id } = source;
					return queryContentsResolver<ProjectObjectType>({
						args: {
							...restArgs,
							projectId: id,
						},
						context: {
							...localContext,
							projectId: id,
						},
						source,
					});
				}
			}
		}
	});

	glue.addQuery<{
		ids?: string[];
	},{},ProjectObjectType>({
		args: {
			ids: list(GraphQLString),
		},
		name: GQL_UNIQ_TYPE.QUERY_PROJECT_LIST,
		resolve: (env) => {
			const { args, context: localContext } = env;
			if (TRACE) log.info('listProjectsResolver: localContext:%s', toStr(localContext));

			const {ids = []} = args;
			let projectList = listProjects() as ProjectInterim[];
			if (ids.length) {
				projectList = projectList.filter(({id}) => includes(ids, id));
			}
			for (const project of projectList) {
				project.projectSiteConfigAsJson = project.siteConfig;
				delete project.siteConfig;
			}
			if (TRACE) log.info('projectList:%s', toStr(projectList));
			return projectList as unknown[] as ProjectObjectType[];
		},
		type: list(projectObjectType),
	});
};
