import type {QueryFilters} from '/lib/explorer/types/index.d';
import type {Request} from '../../../types/Request';


import {
	array,
	forceArray,
	string//,
	//toStr
} from '@enonic/js-utils';

import {
	COLLECTION_REPO_PREFIX,
	NT_DOCUMENT,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/constants';
//import {get as getCollection} from '/lib/explorer/collection/get';
import {connect} from '/lib/explorer/repo/connect';

import {respondWithHtml} from './documentation';

const {includes: arrayIncludes} = array;
const {startsWith} = string;


export type GetRequest = Request<{
	id :string
	collection? :string
	count? :string
	filters? :string
	query? :string
	sort? :string
	start? :string
}, {
	collection :string
}>


function respondWithJson({
	collectionName,
	count,
	filters,
	query,
	sort,
	start
} :{
	collectionName :string
	count :number
	filters :QueryFilters
	query :string
	sort :string
	start :number
}) :{
	body :{
		message?: string
	} | any
	contentType :string
	status? :number
} {
	if (!collectionName) {
		return {
			body: {
				message: 'Missing required parameter collection!'
			},
			contentType: 'text/json;charset=utf-8',
			status: 400 // Bad Request
		};
	}

	const repoId = `${COLLECTION_REPO_PREFIX}${collectionName}`;
	//log.info(`repoId:${toStr(repoId)}`);

	const branchId = 'master'; // Deliberate hardcode
	const connectParams = {
		branch: branchId,
		principals: [PRINCIPAL_EXPLORER_READ],
		repoId
	};
	//log.debug('connecting using:%s', toStr(connectParams));
	const readFromCollectionBranchConnection = connect(connectParams);
	//log.debug('connected using:%s', toStr(connectParams));

	const queryParams = {
		count,
		filters,
		query,
		sort,
		start
	};
	//log.debug('queryParams:%s', toStr(queryParams));

	let queryRes :{
		count: number
		hits: Array<{
			id :string
		}>
		total: number
	};
	try {
		queryRes = readFromCollectionBranchConnection.query(queryParams);
		//log.debug('queryRes:%s', toStr(queryRes));
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
			status: 500
		}
	}

	const keys = queryRes.hits.map(({id}) => id);
	//log.info(`keys:${toStr(keys)}`);

	const getRes = readFromCollectionBranchConnection.get(...keys);
	//log.info(`getRes:${toStr(getRes)}`);

	const strippedRes = forceArray(getRes).map((node) => {
		// Not allowed to see any underscore fields (except _id, _name, _path)
		Object.keys(node).forEach((k) => {
			if (k === '_id' || k === '_name' || k === '_path') {
				// no-op
			} else if (startsWith(k, '_')) {
				delete node[k];
			}
		});
		return node;
	});
	//log.info(`strippedRes:${toStr(strippedRes)}`);

	return {
		body: strippedRes,
		contentType: 'text/json;charset=utf-8'
	};
} // respondWithJson


export function get(
	request :GetRequest,
	collections :Array<string> = []//,
	//apiKey :string
) {
	//log.info(`request:${toStr(request)}`);
	const {
		//body = "{}", // TypeError: Failed to execute 'fetch' on 'Window': Request with GET/HEAD method cannot have body.
		headers: {
			Accept: acceptHeader
		},
		params: {
			collection: collectionParam = '',
			count: countParam = '10',
			filters: filtersParam = '{}',
			id: idParam,
			query = '',
			sort = 'score DESC',
			start: startParam = '0'
		} = {},
		pathParams: {
			collection: collectionName = collectionParam
		} = {}
	} = request;

	if (!arrayIncludes(forceArray(collections), collectionName)) {
		log.error(`No access to collection:${collectionName}!`);
		return {
			body: {
				message: 'Bad Request'
			},
			contentType: 'text/json;charset=utf-8',
			status: 400 // Bad Request
		};
	}

	//log.info(`idParam:${toStr(idParam)}`);
	const filters = JSON.parse(filtersParam) as QueryFilters;
	if (!filters.boolean) {
		filters.boolean = {};
	}
	if (!filters.boolean.should) {
		filters.boolean.should = [];
	} else if (!Array.isArray(filters.boolean.should)) {
		filters.boolean.should = [filters.boolean.should];
	}
	filters.boolean.should.push({
		hasValue: {
			field: '_nodeType',
			values: [NT_DOCUMENT]
		}
	});
	filters.boolean.should.push({
		hasValue: {
			field: 'type',
			values: [NT_DOCUMENT]
		}
	});
	if (idParam) {
		if (!filters.ids) {
			//@ts-ignore
			filters.ids = {};
		}
		if(!filters.ids.values) {
			filters.ids.values = [];
		}
		forceArray(idParam).forEach((id) => {
			filters.ids.values.push(id);

		});
	}
	//log.info(`filters:${toStr(filters)}`);

	const count = Math.max(1, // Don't allow < 1
		Math.min(100, // Don't allow > 100
			parseInt(countParam, 10)
		)
	);
	//log.info(`count:${count}`);
	const start = parseInt(startParam, 10);

	if (
		startsWith(acceptHeader, 'application/json') ||
		startsWith(acceptHeader, 'text/json')
	) {
		return respondWithJson({
			count,
			collectionName,
			filters,
			query,
			sort,
			start
		});
	} else {
		return respondWithHtml({
			count,
			//filters,
			query,
			sort,
			start
		});
	}
}
