import {
	PRINCIPAL_EXPLORER_READ, RT_JSON
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query as getThesauri} from '/lib/explorer/thesaurus/query';


export const get = () => ({
	contentType: RT_JSON,
	body: getThesauri({
		connection: connect({
			principals: [PRINCIPAL_EXPLORER_READ]
		})
	})
});
