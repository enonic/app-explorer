//import {toStr} from '/lib/util';
import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query as queryStopWords} from '/lib/explorer/stopWords/query';


export function get() {
	//log.info(`name:${name}`);
	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_READ]
	});
	const stopWordsRes = queryStopWords({connection});
	return {
		body: stopWordsRes,
		contentType: RT_JSON
	};
} // get
