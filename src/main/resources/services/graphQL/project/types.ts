import type { Project } from '/lib/xp/project';

import type { GetSitesObjectType } from '../content/addGetSites';
import type { QueryContentsObjectType } from '../content/addQueryContents';
import type { ObjectType } from '../Glue';
import { GQL_UNIQ_TYPE } from '../constants';


export type ProjectObjectType = Omit<Partial<Project>, 'siteConfig'> & {
	projectSiteConfigAsJson: Project['siteConfig'];
	[GQL_UNIQ_TYPE.QUERY_SITES_GET]: ObjectType<GetSitesObjectType>;
	// {
	// 	type: ObjectType<GetSitesObjectType>;
	// 	// resolve: typeof getSitesResolver;
	// };
	[GQL_UNIQ_TYPE.QUERY_CONTENT_QUERY]: ObjectType<QueryContentsObjectType>;
};

export interface ContextWithProjectId {
	projectId?: string;
}
