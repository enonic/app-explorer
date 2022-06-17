import type {
	AnyObject,
	DocumentNode
} from '/lib/explorer/types/index.d';
import type {Highlight} from '../highlight/input/index.d';
import type {HighlightArray} from '../highlight/output/index.d';



import {
	getIn//,
	//toStr
} from '@enonic/js-utils';
import {
	COLLECTION_REPO_PREFIX,
	FIELD_PATH_META,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/constants';
import {connect} from '/lib/explorer/repo/connect';
import {multiConnect} from '/lib/explorer/repo/multiConnect';
import {washDocumentNode} from '../utils/washDocumentNode';
import {getInterfaceInfo} from './getInterfaceInfo';
import {makeQueryParams} from './makeQueryParams';
import {queryResHighlightObjToArray} from '../highlight/output/queryResHighlightObjToArray';


export type GraphQLContext = {
	interfaceName :string
}

export type SearchResolverArgs = {
	aggregations ?:Array<AnyObject> // TODO?
	count ?:number
	filters ?:Array<AnyObject> // TODO?
	highlight ?:Highlight
	searchString :string
	start ?:number
}

export type SearchResolverEnv = {
	args :SearchResolverArgs
	context :GraphQLContext
}

export type Hit = {
	_collection :string
	//_collector ?:string  // from FIELD_PATH_META
	//_collectorVersion ?:string  // from FIELD_PATH_META
	_createdTime ?:string // from FIELD_PATH_META
	_documentType ?:string // from FIELD_PATH_META
	_highlight ?:HighlightArray
	//_json :string
	_json :DocumentNode
	_modifiedTime ?:string // from FIELD_PATH_META
	//_language ?:string // from FIELD_PATH_META
	_score :number
	//_stemmingLanguage ?:string // from FIELD_PATH_META
}

export function searchResolver({
	args: {
		aggregations: aggregationsArg,
		count, // ?:number
		filters: filtersArg,
		highlight: highlightArg,
		searchString = '', // :string
		start // ?:number
	},
	context: {
		interfaceName
	}
} :SearchResolverEnv) {
	//log.debug('aggregationsArg:%s', toStr(aggregationsArg));
	//log.debug('filtersArg:%s', toStr(filtersArg));
	//log.debug('highlightArg:%s', toStr(highlightArg));
	//log.debug('interfaceName:%s searchString:%s', interfaceName, searchString);

	const {
		collectionNameToId,
		fields,
		stopWords
	} = getInterfaceInfo({
		interfaceName
	});
	const multiRepoReadConnection = multiConnect({
		principals: [PRINCIPAL_EXPLORER_READ],
		sources: Object.keys(collectionNameToId).map((collectionName) => ({
			repoId: `${COLLECTION_REPO_PREFIX}${collectionName}`,
			branch: 'master', // NOTE Hardcoded
			principals: [PRINCIPAL_EXPLORER_READ]
		}))
	});

	const queryParams = makeQueryParams({
		aggregationsArg,
		count,
		fields,
		filtersArg,
		highlightArg,
		searchString,
		start,
		stopWords
	});
	//log.debug('queryParams:%s', toStr(queryParams));

	//@ts-ignore filters type supports array too
	const queryRes = multiRepoReadConnection.query(queryParams);
	//log.debug('queryRes:%s', toStr(queryRes));
	//log.debug('queryRes.aggregations:%s', toStr(queryRes.aggregations));

	const rv = {
		aggregationsAsJson: queryRes.aggregations, // GraphQL automatically converts to JSON
		count: queryRes.count,
		hits: queryRes.hits.map(({
			branch,
			highlight: highlightObj,
			id,
			repoId,
			score
		}) => {
			const collectionName = repoId.replace(COLLECTION_REPO_PREFIX, '');
			const collectionNode = connect({
				branch,
				principals: [PRINCIPAL_EXPLORER_READ],
				repoId
			}).get<DocumentNode>(id);
			//log.debug('collectionNode:%s', toStr(collectionNode));

			const washedNode = washDocumentNode(collectionNode);
			//log.debug('washedNode:%s', toStr(washedNode));

			const hit :Hit = {
				_collection: collectionName,
				_createdTime: getIn(collectionNode, [FIELD_PATH_META, 'createdTime'], undefined),
				_documentType: getIn(collectionNode, [FIELD_PATH_META, 'documentType'], undefined),
				_highlight: queryResHighlightObjToArray({highlightObj}),
				_json: washedNode,
				_modifiedTime: getIn(collectionNode, [FIELD_PATH_META, 'modifiedTime'], undefined),
				_score: score
			}
			//log.debug('hit:%s', toStr(hit));

			return hit;
		}),
		total: queryRes.total
	};
	return rv
}
