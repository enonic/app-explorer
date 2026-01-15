import type { Glue } from '../Glue';

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
import { GQL_UNIQ_TYPE } from '../constants';

const TRACE = false;

type ProjectInterim = Project & { projectSiteConfigAsJson: Project['siteConfig'] };

type ProjectObjectType = Omit<Partial<Project>, 'siteConfig'> & {
	projectSiteConfigAsJson: Project['siteConfig']
};

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
		}
	});

	glue.addQuery<{},{},ProjectObjectType>({
		args: {},
		name: GQL_UNIQ_TYPE.QUERY_PROJECT_LIST,
		resolve: () => {
			const projectList = listProjects() as ProjectInterim[];
			for (const project of projectList) {
				project.projectSiteConfigAsJson = project.siteConfig;
				delete project.siteConfig;
			}
			if (TRACE) log.info('projectList:%s', toStr(projectList));
			return projectList as ProjectObjectType[];
		},
		type: list(projectObjectType),
	});
};
