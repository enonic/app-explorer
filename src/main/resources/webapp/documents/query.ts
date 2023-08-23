import type {
	BooleanFilter,
	Filter,
	QueryDsl,
	// QueryNodeParams,
	SortDsl
} from '@enonic-types/lib-node';
import type { DocumentNode } from '/lib/explorer/types/Document';
import type { Request } from '../../types/Request';


import {
	COLLECTION_REPO_PREFIX,
	FieldPath,
	NodeType,
	Principal,
	Role
} from '@enonic/explorer-utils';
import {
	forceArray,
} from '@enonic/js-utils';
import { isBooleanFilter } from '@enonic/js-utils/storage/query/filter/isBooleanFilter';
import { startsWith } from '@enonic/js-utils/string/startsWith';
import { isString } from '@enonic/js-utils/value/isString';
import { toStr } from '@enonic/js-utils/value/toStr';
import { connect } from '/lib/explorer/repo/connect';
import { hasRole } from '/lib/xp/auth';
import { HTTP_RESPONSE_STATUS_CODES } from '../constants';
import authorize from './authorize';
import documentNodeToBodyItem from './documentNodeToBodyItem';


export type QueryRequest = Request<{
	returnDocument?: 'true'|'false'
}, {
	collectionName?: string
}>

interface QueryHit {
	id: string
	document: Record<string, unknown>
	// status: 200
	// Metadata:
	collection: string
	createdTime: Date | string
	documentType?: string
	language?: string
	modifiedTime?: Date | string // Optional, because may never have been modified
	stemmingLanguage?: string
	valid?: boolean // TODO: Can validation be skipped? If so it might be missing
}

interface QueryResponse {
	body?: { // Optional, because no body when auth fails
		error?: string
	}|{
		count: number
		hits: ({
			id: string
			error: string // When id in index, but get fails? Shouldn't happen.
			status: number
		}|QueryHit)[]
		total: number
	},
	contentType?: string // Not needed, when no content aka no body.
	status: number
}

function replaceShortcutsInFilter(filter: Filter): void {
	// log.debug('replaceShortcutsInFilter:%s', toStr(filter));
	if (filter['boolean']) {
		['must', 'mustNot', 'should'].forEach(clause => {
			if (filter['boolean'][clause]) {
				if (Array.isArray(filter['boolean'][clause])) {
					replaceShortcutsInFilters(filter['boolean'][clause]);
				} else {
					replaceShortcutsInFilter(filter['boolean'][clause]);
				}
			}
		}); // forEach clause
		return;
	}
	['exists', 'hasValue', 'notExists'].forEach(expression => {
		if (filter[expression]) {
			if (
				filter[expression].field
				&& startsWith(filter[expression].field,'_')
				&& !startsWith(filter[expression].field,'_id')
			) {
				filter[expression].field = filter[expression].field.replace(/^_/, `${FieldPath.META}.`)
			}
		}
		return;
	});
}

function replaceShortcutsInFilters(filters: Filter[]) {
	// log.debug('replaceShortcutsInFilters:%s', toStr(filters));
	for (let i = 0; i < filters.length; i++) {
		replaceShortcutsInFilter(filters[i]);
	} // for
}

function replaceShortcutsInQueryDslArray(dslArray: QueryDsl[]): void {
	for (let i = 0; i < dslArray.length; i++) {
		replaceShortcutsInQueryDsl(dslArray[i]);
	} // for
}

function replaceShortcutsInQueryDsl(dsl: QueryDsl): void {
	if (dsl['boolean']) {
		// log.debug('replaceShortcutsInQueryDsl boolean:%s', toStr(dsl['boolean']));
		['filter', 'must', 'mustNot', 'should'].forEach(clause => {
			if (dsl['boolean'][clause]) {
				if (Array.isArray(dsl['boolean'][clause])) {
					replaceShortcutsInQueryDslArray(dsl['boolean'][clause]);
				} else {
					replaceShortcutsInQueryDsl(dsl['boolean'][clause]);
				}
			}
		}); // forEach clause
		return;
	}
	['exists', 'in', 'like', 'pathMatch', 'range', 'term'].forEach(expression => {
		if (dsl[expression]) {
			// log.debug('replaceShortcutsInQueryDsl %s:%s', expression, toStr(dsl[expression]));
			if (
				dsl[expression].field
				&& startsWith(dsl[expression].field,'_')
				&& !startsWith(dsl[expression].field,'_id')
			) {
				dsl[expression].field = dsl[expression].field.replace(/^_/, `${FieldPath.META}.`);
			}
		}
		return;
	});
	['fulltext', 'ngram', 'stemmed'].forEach(expression => {
		if (dsl[expression]?.fields) {
			// log.debug('replaceShortcutsInQueryDsl %s:%s', expression, toStr(dsl[expression]));
			for (let i = 0; i < dsl[expression].fields.length; i++) {
				const field = dsl[expression].fields[i];
				if (
					startsWith(field,'_')
					&& !startsWith(field,'_id')
				) {
					dsl[expression].fields[i] = field.replace(/^_/, `${FieldPath.META}.`);
				}
			}
		}
		return;
	});
}

function replaceShortcutsInQuery(query: string|QueryDsl): void {
	if (isString(query)) {
		return;
	}
	if (query) {
		replaceShortcutsInQueryDsl(query);
	}
}

export default function query(
	request: QueryRequest
): QueryResponse {
	// log.debug('query request:%s', toStr(request));
	const {
		body: bodyJson,
		params: {
		// 	collection: collectionParam = '',
		// 	count: countParam = '10',
		// 	filters: filtersParam = '{}',
		// 	id: idParam,
		// 	query = '',
		// 	sort = 'score DESC',
		// 	start: startParam = '0'
			returnDocument: returnDocumentParam = 'false',
		} = {},
		pathParams: {
			collectionName = ''
		} = {}
	} = request;
	// log.debug('bodyJson:%s', bodyJson);

	let queryNodeParams: {
		// aggregations?: AggregationInput;
		// collection?: string
		// collections?: string[]
		count?: number
		// explain?: boolean;
		filters?: Filter | Filter[]
		// highlight?: Highlight;
		// id?: string|string[]
		query?: QueryDsl | string
		sort?: string | SortDsl | SortDsl[]
		start?: number
		// suggestions?: Record<string, TermSuggestion>;
	} = {};
	if (bodyJson) {
		try {
			queryNodeParams = JSON.parse(bodyJson)
		} catch (e) {
			log.error('Unable to JSON.parse:%s', bodyJson);
			return {
				body: {
					error: 'Failed to JSON.parse',
				},
				contentType: 'text/json;charset=utf-8',
				status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
			};
		}
	}
	// log.debug('queryNodeParams:%s', toStr(queryNodeParams));

	if (!collectionName) {
		return {
			body: {
				error: 'Missing required parameter collection!'
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
		};
	}

	if (!hasRole(Role.EXPLORER_READ)) {
		const maybeErrorResponse = authorize(request, collectionName);
		if (maybeErrorResponse.status !== 200 ) {
			return maybeErrorResponse;
		}
	}

	const {
		count = 10,
		filters = {
			boolean: {}
		},
		query,// = '',
		sort = 'score DESC',
		start = 0,
	} = queryNodeParams // as QueryNodeParams;
	// log.debug('filters:%s', toStr(filters));

	if (filters && !isBooleanFilter(filters)) {
		log.error('The root filter must be of type boolean! queryNodeParams:%s', toStr(queryNodeParams));
		return {
			body: {
				error: 'The root filter must be of type boolean!'
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.BAD_REQUEST
		};
	}

	if (!filters['boolean']) {
		filters['boolean'] = {};
	}
	if (!(filters as BooleanFilter).boolean.must) {
		(filters as BooleanFilter).boolean.must = [];
	} else if (!Array.isArray((filters as BooleanFilter).boolean.must)) {
		(filters as BooleanFilter).boolean.must = [(filters as BooleanFilter).boolean.must] as Filter[];
	}

	replaceShortcutsInFilters((filters as BooleanFilter).boolean.must as Filter[]);

	((filters as BooleanFilter).boolean.must as Filter[]).push({
		hasValue: {
			field: '_nodeType',
			values: [NodeType.DOCUMENT]
		}
	});
	//log.info(`idParam:${toStr(idParam)}`);
	// if (idParam) {
	// 	if (!filters.ids) {
	// 		//@ts-ignore
	// 		filters.ids = {};
	// 	}
	// 	if(!filters.ids.values) {
	// 		filters.ids.values = [];
	// 	}
	// 	forceArray(idParam).forEach((id) => {
	// 		filters.ids.values.push(id);

	// 	});
	// }
	// log.debug('filters:%s', toStr(filters));

	const safeCount = Math.max(1, // Don't allow < 1
		Math.min(100, // Don't allow > 100
			count
		)
	);
	// log.debug('count:%s', count);

	const boolReturnDocument = returnDocumentParam !== 'false'; // Fallsback to false if something invalid is provided

	const repoId = `${COLLECTION_REPO_PREFIX}${collectionName}`;
	//log.info(`repoId:${toStr(repoId)}`);

	const branchId = 'master'; // Deliberate hardcode
	const connectParams = {
		branch: branchId,
		principals: [Principal.EXPLORER_READ],
		repoId
	};
	//log.debug('connecting using:%s', toStr(connectParams));
	const readFromCollectionBranchConnection = connect(connectParams);
	//log.debug('connected using:%s', toStr(connectParams));

	replaceShortcutsInQuery(query);

	const queryParams = {
		count: safeCount,
		filters,
		query,
		sort,
		start
	};
	// log.debug('queryParams:%s', queryParams); // Without toStr for running jest
	// log.debug('queryParams:%s', toStr(queryParams));

	let queryRes: {
		count: number
		hits: {
			id: string
		}[]
		total: number
	};
	try {
		queryRes = readFromCollectionBranchConnection.query(queryParams);
		// log.debug('queryRes:%s', queryRes); // Without toStr for running jest
		// log.debug('queryRes:%s', toStr(queryRes));
	} catch (e) {
		let error = `Unknown error when quering in collectionName:${collectionName}!`;
		if (
			e.class === 'com.enonic.xp.web.WebException'
			&& e.message === `Repository with id [${repoId}] not found`
		) {
			error = `Repo for collectionName:${collectionName} not created yet!`
		}
		return {
			body: {
				error
			},
			contentType: 'text/json;charset=utf-8',
			status: HTTP_RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR
		}
	}

	const keys = queryRes.hits.map(({id}) => id);
	//log.info(`keys:${toStr(keys)}`);

	const getRes = readFromCollectionBranchConnection.get<DocumentNode>(...keys);
	// log.debug('getRes:%s', getRes); // Without toStr for running jest
	// log.info(`getRes:${toStr(getRes)}`);

	const body = {
		count: queryRes.count,
		hits: forceArray(getRes).map((documentNode) => {
			return documentNodeToBodyItem({
				documentNode,
				includeDocument: boolReturnDocument
			}) as QueryHit;
		}),
		total: queryRes.total
	};
	// log.debug('body:%s', toStr(body));

	return {
		body,
		contentType: 'text/json;charset=utf-8',
		status: HTTP_RESPONSE_STATUS_CODES.OK
	};
}
