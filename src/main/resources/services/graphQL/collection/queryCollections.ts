import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getDocumentCount} from '/lib/explorer/collection/getDocumentCount';
import {query as qC} from '/lib/explorer/collection/query';
import {usedInInterfaces} from '/lib/explorer/collection/usedInInterfaces';


export function queryCollections({
	//count, // Preferring perPage for now
	page,
	perPage,
	query,
	sort/*,
	start*/ // Preferring page for now
} :{
	page ?:string//number
	perPage ?:string//number
	query ?:string
	sort ?:string
} = {}) {
	//log.info(`count:${toStr(count)}`);
	//log.info(`page:${toStr(page)}`);
	//log.info(`perPage:${toStr(perPage)}`);
	//log.info(`sort:${toStr(sort)}`);
	const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const qr = qC({
		connection,
		//count,
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
			collector,
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
