import type {
	Aggregations,
	Content,
	Filter,
	QueryDsl,
} from '@enonic-types/core';
import { toStr } from '@enonic/js-utils/value/toStr';

import { addAggregationInput } from '/lib/explorer/interface/graphql/aggregations/guillotine/input/addAggregationInput';
import { addFilterInput } from '/lib/explorer/interface/graphql/filters/guillotine/input/addFilterInput';
import { addInputTypeHighlight } from '/lib/explorer/interface/graphql/highlight/input/addInputTypeHighlight';
import { highlightGQLArgToEnonicXPQuery } from '/lib/explorer/interface/graphql/highlight/input/highlightGQLArgToEnonicXPQuery';

import type {
	Env,
	Glue,
	GraphQLArgs,
} from '../Glue';

import {
	DateTime as GraphQLDateTime,
	Json as GraphQLJson,
	GraphQLBoolean,
	GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
	// @ts-ignore
} from '/lib/graphql';
import {
	// createAggregation,
	createFilters
	// @ts-expect-error No types yet
} from '/lib/guillotine/util/factory';
import {
	type QueryContentParams,
	query as queryContent,
} from '/lib/xp/content';
import {
	get as getContext,
	run as runInContext,
} from '/lib/xp/context';

import {
	aggregationsArgToQuery,
	processAggregationsRes,
} from '../document/addQueryDocuments';
import type {
	ContextWithProjectId,
	ProjectObjectType,
} from '../project/types';
import {
	GQL_UNIQ_TYPE,
	GQL_TYPE_AGGREGATION_TERMS_NAME,
} from '../constants';
import type {
	ContentObjectType,
	QueryContentsArgs,
	QueryContentsObjectType,
	SiteObjectType
} from './types';

const TRACE = false;


export function queryContentsResolver<
	SOURCE extends null | ProjectObjectType | SiteObjectType = null,
	CONTEXT extends ContextWithProjectId = ContextWithProjectId,
>(env: Env<QueryContentsArgs, CONTEXT, SOURCE>): QueryContentsObjectType {
	const { args, context: localContext } = env;
	if (TRACE) log.info('queryContentsResolver: localContext:%s', toStr(localContext));
	const {
		aggregations: aggregationsArg = [],
		contentTypes = [],
		count = 10,
		filters: filtersArg,
		highlight: highlightArg,
		query,
		sitePath,
		start = 0,
		sort,
	} = args;
	const projectId = localContext.projectId || args.projectId;
	if (TRACE) log.info('query:%s', toStr(query));
	let modifiedQuery: QueryDsl | undefined = query;
	if (TRACE) log.info('modifiedQuery:%s', toStr(modifiedQuery));

	if (sitePath) {
		if (!modifiedQuery) modifiedQuery = {} as QueryDsl;
		if (!modifiedQuery['boolean']) modifiedQuery['boolean'] = {};
		if (!modifiedQuery['boolean']['must']) modifiedQuery['boolean']['must'] = [];
		if (!Array.isArray(modifiedQuery['boolean']['must'])) modifiedQuery['boolean']['must'] = [modifiedQuery['boolean']['must']];
		modifiedQuery['boolean']['must'].push({
			like: {
				field: "_path",
				value: `/content${sitePath}*`
			}
		});
	} // if sitePath
	if (TRACE) log.info('modifiedQuery:%s', toStr(modifiedQuery));

	const context = getContext();
	if (TRACE) log.info('initial context:%s', toStr(context));

	context.branch = 'master';
	context.repository = `com.enonic.cms.${projectId}`;
	if (TRACE) log.info('used context:%s', toStr(context));

	let filtersArray: Filter[];
	if (filtersArg) {
		// This works magically because fieldType is an Enum?
		filtersArray = createFilters(filtersArg);
		//log.debug('filtersArray:%s', toStr(filtersArray));
	}

	const contentQueryParams: QueryContentParams<Aggregations> = {
		aggregations: aggregationsArgToQuery({ aggregationsArg }),
		contentTypes,
		filters: (filtersArray ? filtersArray /* as BooleanFilter */ : null),
		highlight: highlightArg
			? highlightGQLArgToEnonicXPQuery({ highlightArg })
			: null,
		count,
		query: modifiedQuery,
		sort,
		start,
	};
	if (TRACE) log.info('contentQueryParams:%s', toStr(contentQueryParams));

	const contentQueryResult = runInContext(context, () => queryContent<Content<unknown>, Aggregations>(contentQueryParams));
	if (TRACE) log.info('contentQueryResult:%s', toStr(contentQueryResult));

	const {
		aggregations: list,
		// fieldValueCounts
	} = processAggregationsRes({
		// @ts-ignore
		aggregations: contentQueryResult.aggregations,
		fieldNameToPath: {} // TODO, huh?
	});

	return {
		aggregations: list,
		count: contentQueryResult.count,
		hits: contentQueryResult.hits.map(({
			_id,
			attachments,
			data,
			page,
			publish,
			workflow,
			x,
			...rest
		}) => ({
			_id,
			_highlight: contentQueryResult.highlight[_id] || null,
			attachmentsAsJson: attachments,
			dataAsJson: data,
			pageAsJson: page,
			publishAsJson: publish,
			workflowAsJson: workflow,
			xAsJson: x,
			...rest
		})),
		total: contentQueryResult.total
	};
}

export function getQueryContentsArgs({
	glue
}: {
	glue: Glue
}): GraphQLArgs<QueryContentsArgs> {
	return {
		aggregations: list(addAggregationInput({ glue })),
		contentTypes: list(GraphQLString),
		count: GraphQLInt,
		filters: list(addFilterInput({ glue })),
		highlight: addInputTypeHighlight({ glue }),
		projectId: nonNull(GraphQLString),
		sitePath: GraphQLString,
		// @ts-ignore
		query: glue.getInputType(GQL_UNIQ_TYPE.INPUT_QUERY_DSL),
		start: GraphQLInt,
		// @ts-ignore
		sort: glue.getInputType(GQL_UNIQ_TYPE.INPUT_FIELD_SORT_DSL),
	};
}

export function addQueryContents({
	glue
}: {
	glue: Glue
}) {
	glue.addQuery<QueryContentsArgs>({
		name: GQL_UNIQ_TYPE.QUERY_CONTENT_QUERY,
		args: getQueryContentsArgs({ glue }),
		resolve: queryContentsResolver,
		type: glue.addObjectType<QueryContentsObjectType>({
			name: GQL_UNIQ_TYPE.OBJECT_CONTENT_QUERY_RESULT,
			fields: {
				aggregations: {
					type: list(glue.getObjectType(GQL_TYPE_AGGREGATION_TERMS_NAME))
				},
				count: { type: nonNull(GraphQLInt) },
				hits: {
					type: list(glue.addObjectType<ContentObjectType>({
						name: GQL_UNIQ_TYPE.OBJECT_CONTENT,
						fields: {
							_highlight: { type: GraphQLJson },
							_id: { type: nonNull(GraphQLString) },
							_name: { type: nonNull(GraphQLString) },
							_path: { type: nonNull(GraphQLString) },
							_score: { type: nonNull(GraphQLFloat) },

							childOrder: { type: nonNull(GraphQLString) },
							createdTime: { type: nonNull(GraphQLDateTime) },
							creator: { type: nonNull(GraphQLString) },
							displayName: { type: nonNull(GraphQLString) },
							hasChildren: { type: nonNull(GraphQLBoolean) },
							language: { type: nonNull(GraphQLString) },
							modifiedTime: { type: GraphQLDateTime },
							modifier: { type: nonNull(GraphQLString) },
							owner: { type: nonNull(GraphQLString) },
							type: { type: nonNull(GraphQLString) },
							valid: { type: nonNull(GraphQLBoolean) },

							attachmentsAsJson: { type: nonNull(GraphQLJson) },
							dataAsJson: { type: nonNull(GraphQLJson) },
							pageAsJson: { type: nonNull(GraphQLJson) },
							publishAsJson:  { type: nonNull(GraphQLJson) },
							workflowAsJson:  { type: nonNull(GraphQLJson) },
							xAsJson: { type: nonNull(GraphQLJson) },
						}
					})),
				},
				total: { type: nonNull(GraphQLInt) },
			}
		})
	});
}
