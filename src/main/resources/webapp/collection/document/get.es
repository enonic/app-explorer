import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';

import {
	COLLECTION_REPO_PREFIX,
	NT_DOCUMENT,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
//import {get as getCollection} from '/lib/explorer/collection/get';
import {connect} from '/lib/explorer/repo/connect';

import {respondWithHtml} from '/lib/explorer/api/v1/documents/documentation';

function respondWithJson({
	collectionName,
	count,
	filters,
	query,
	sort,
	start
}) {
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
	const readFromCollectionBranchConnection = connect({
		branch: branchId,
		principals: [PRINCIPAL_EXPLORER_READ],
		repoId
	});

	const queryParams = {
		count,
		filters,
		query,
		sort,
		start
	};
	//log.info(`queryParams:${toStr(queryParams)}`);

	const queryRes = readFromCollectionBranchConnection.query(queryParams);
	//log.info(`queryRes:${toStr(queryRes)}`);

	const keys = queryRes.hits.map(({id}) => id);
	//log.info(`keys:${toStr(keys)}`);

	const getRes = readFromCollectionBranchConnection.get(keys);
	//log.info(`getRes:${toStr(getRes)}`);

	const strippedRes = forceArray(getRes).map((node) => {
		// Not allowed to see any underscore fields (except _id, _name, _path)
		Object.keys(node).forEach((k) => {
			if (k === '_id' || k === '_name' || k === '_path') {
				// no-op
			} else if (k.startsWith('_')) {
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


export function get(request, collections = [], apiKey) {
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

	if (!forceArray(collections).includes(collectionName)) {
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
	const filters = JSON.parse(filtersParam);
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
		acceptHeader.startsWith('application/json') ||
		acceptHeader.startsWith('text/json')
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
			filters,
			query,
			sort,
			start
		});
	}
}
