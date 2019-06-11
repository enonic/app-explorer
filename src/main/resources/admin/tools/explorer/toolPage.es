//import {toStr} from '/lib/util';
import {serviceUrl} from '/lib/xp/portal';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {query as queryCollections} from '/lib/explorer/collection/query';
import {connect} from '/lib/explorer/repo/connect';
import {query as getThesauri} from '/lib/explorer/thesaurus/query';

const ID_REACT_SEARCH_CONTAINER = 'reactSearchContainer';


export function toolPage({
	path
}) {
	const connection = connect({principals: PRINCIPAL_EXPLORER_READ});
	const collectionHits = queryCollections({connection}).hits;
	const propsObj = {
		collectionOptions: collectionHits.map(({displayName: label, _name: value}) => ({label, value})),
		initialValues: {
			collections: collectionHits.map(({_name}) => _name),
			thesauri: []
		},
		serviceUrl: serviceUrl({
			service: 'search',
			params: {
				interface: 'helsebiblioteket' // TODO
			}
		}),
		thesaurusOptions: getThesauri({connection}).hits.map(({displayName, name}) => ({label: displayName, value: name}))
	};
	//log.info(toStr({propsObj}));
	const propsJson = JSON.stringify(propsObj);
	return htmlResponse({
		bodyEnd: [
			`<script type="text/javascript">
	ReactDOM.render(
		React.createElement(window.yase.Search, ${propsJson}),
		document.getElementById('${ID_REACT_SEARCH_CONTAINER}')
	);
</script>`],
		main: `<div id="${ID_REACT_SEARCH_CONTAINER}"/>`,
		path
	});
}
