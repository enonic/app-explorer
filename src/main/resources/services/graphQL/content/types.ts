import type {
	AggregationsResult,
	Content,
	FieldSortDsl,
	HighlightResult,
	QueryDsl,
} from '@enonic-types/core';
import type {
	Attachment,
	ContentType,
	Icon,
	Site,
	SortDirection,
} from '@enonic-types/lib-content';
import type {
	// BooleanFilter,
	Guillotine
} from '@enonic/js-utils/types/node/query/Filters.d';
import type { Highlight } from '@enonic-types/lib-explorer/GraphQL.d';

import type { AggregationArg } from '../types';
import type { ObjectType } from '../Glue';
import { GQL_UNIQ_TYPE } from '../constants';


export type AttachmentObjectType = Attachment & {
	url?: string;
}

export type IconWithUrl = Omit<Icon, 'data'> & {
	url: string;
}

export type ContentTypeObjectType = Omit<ContentType, 'form'|'icon'> & {
	_docCount?: number;
	formJson: string; // TODO Remove this in next major release?
	formAsJson: Record<string, unknown>;
	icon?: IconWithUrl;
	supertype?: ContentType['superType']; // TODO Remove this in next major release?
};

export interface SortContentTypes {
	direction?: SortDirection;
	field?: 'docCount'|'name';
}

export interface GetContentTypesArgs {
	branch?: 'master' | 'draft';
	names?: string[];
	sort?: SortContentTypes;
}

export interface GetSitesArgs {
	branch?: 'master' | 'draft';
	sitePaths?: string[];
	projectIds?: string[];
};

export type SiteObjectType = Pick<
	Site<Record<string, unknown>>,
	'_id'
	| '_name'
	| '_path'
	| 'displayName'
> & {
	_branch: 'master' | 'draft'
	_project: string;
	attachments: AttachmentObjectType[];
	[GQL_UNIQ_TYPE.QUERY_CONTENT_TYPES_GET]: ContentTypeObjectType[];
	[GQL_UNIQ_TYPE.QUERY_CONTENT_QUERY]: ObjectType<QueryContentsObjectType>;
}

export interface GetSitesObjectType {
	count: number;
	hits: SiteObjectType[];
	total: number;
}


type GuillotineFilter = Guillotine.BasicFilters | Guillotine.BooleanFilter

export interface QueryContentsArgs {
	aggregations?: AggregationArg[];
	branch?: 'master' | 'draft';
	contentTypes?: string[];
	count?: number;
	filters?: GuillotineFilter | GuillotineFilter[]
	highlight?: Highlight;
	projectId: string;
	query?: QueryDsl;
	sitePath?: string;
	start?: number;
	sort?: FieldSortDsl;
}

export type ContentObjectType = Omit<
	Content,
	'attachments' | 'data' | 'page' | 'publish' | 'workflow' | 'x'
> & {
	_branch: 'master' | 'draft';
	_highlight: HighlightResult;
	attachmentsAsJson: Content['attachments'];
	dataAsJson: Content['data'],
	pageAsJson: Content['page'],
	publishAsJson: Content['publish'],
	workflowAsJson: Content['workflow'],
	xAsJson: Content['x'],
}

export interface QueryContentsObjectType {
	aggregations: AggregationsResult;
	count: number;
	hits: ContentObjectType[];
	total: number;
}
