import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query} from '/lib/explorer/collector/query';


export function queryCollectors() {
	const collectorsReq = query({
		connection: connect({ principals: [PRINCIPAL_EXPLORER_READ] })
	});
	//log.debug(`collectorsReq:${toStr({collectorsReq})}`);
	return collectorsReq;
}
