import type { Filter } from '@enonic-types/core';
import type { Guillotine } from '@enonic/js-utils/types/node/query/Filters.d';
import type { AggregationArg } from '../types';


import { forceArray } from '@enonic/js-utils/array/forceArray';
// import { toStr } from '@enonic/js-utils/value/toStr';
import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getDocumentCount} from '/lib/explorer/collection/getDocumentCount';
import {query as qC} from '/lib/explorer/collection/query';
import {usedInInterfaces} from '/lib/explorer/collection/usedInInterfaces';
import {
	createAggregation,
	createFilters,
	// @ts-expect-error No types yet
} from '/lib/guillotine/util/factory';
import {getManagedDocumentTypes} from '../collector/addGetManagedDocumentTypes';


type GuillotineFilter = Guillotine.BasicFilters | Guillotine.BooleanFilter


export function queryCollections({
	aggregations: aggregationsArg,
	//count, // Preferring perPage for now
	filters: filtersArg,
	page,
	perPage,
	query,
	sort/*,
	start*/ // Preferring page for now
} :{
	aggregations?: AggregationArg[]
	filters?: GuillotineFilter | GuillotineFilter[]
	page?: string//number
	perPage?: string//number
	query?: string
	sort?: string
} = {}) {
	// log.info(`count:${toStr(count)}`);
	// log.info(`page:${toStr(page)}`);
	// log.info(`perPage:${toStr(perPage)}`);
	// log.info(`sort:${toStr(sort)}`);

	const aggregations = {};
	if (aggregationsArg) {
		forceArray(aggregationsArg).forEach((aggregationArg) => {
			createAggregation(aggregations, aggregationArg)
		});
	}
	// log.debug('aggregations:%s', toStr(aggregations));

	// let filters;
	let filtersArray: Filter[] = [];
	if (filtersArg) {
		// log.info('filtersArg:%s', toStr(filtersArg));
		filtersArray = createFilters(filtersArg);
		// log.info('filtersArray:%s', toStr(filtersArray));
	}

	const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const qr = qC({
		aggregations,
		connection,
		//count,
		filters: filtersArray,
		page,
		perPage,
		query,
		sort/*,
		start*/
	});
	//log.info(`collectionsRes:${toStr(collectionsRes)}`);

	/*const activeCollections = {};
	listTasks({
		state: 'RUNNING'
	}).forEach((runningTask) => {
		//log.info(`runningTask:${toStr(runningTask)}`);
		const maybeJson = getIn(runningTask, 'progress.info');
		if (maybeJson) {
			try {
				const info = JSON.parse(maybeJson);
				if (info.name) {
					activeCollections[info.name] = true;
				}
			} catch (e) {
				//no-op
			}
		}
	});*/
	//log.info(`activeCollections:${toStr(activeCollections)}`);
	const rv = {
		aggregationsAsJson: qr.aggregations,
		count: qr.count,
		page: qr.page,
		pageEnd: qr.pageEnd,
		pageStart: qr.pageStart,
		pagesTotal: qr.pagesTotal,
		total: qr.total,
		hits: qr.hits.map(({
			_id,
			_name,
			_nodeType,
			_path,
			_score,
			collector,
			language = '',
			documentTypeId//,
			//type
		}) => ({
			_id,
			_name,
			_nodeType,
			_path,
			_score,
			//collecting: !!activeCollections[_name],
			collector: collector ? {
				...collector,
				managedDocumentTypes: getManagedDocumentTypes(collector.name)
			} : collector,
			documentCount: getDocumentCount(_name), // TODO this should live in own graphql resolver
			interfaces: usedInInterfaces({connection, name: _name}), // TODO this should live in own graphql resolver
			language,
			documentTypeId//,
			//type
		}))
	};
	//log.info(`mapped collectionsRes:${toStr(rv)}`);
	return rv;
}
