import {installLicense, validateLicense} from '/lib/license';
//import {toStr} from '/lib/util';
import {readText} from '/lib/xp/io';
import {assetUrl, getMultipartStream, serviceUrl} from '/lib/xp/portal';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {query as queryCollections} from '/lib/explorer/collection/query';
import {connect} from '/lib/explorer/repo/connect';
import {query as getThesauri} from '/lib/explorer/thesaurus/query';

const ID_REACT_SEARCH_CONTAINER = 'reactSearchContainer';


export function toolPage(request) {
	//log.info(`request:${toStr(request)}`);
	const {
		method,
		path,
		params: {
			searchString = ''
		}
	} = request;

	let licenseDetails;
	let licenseValid;
	if (method === 'POST') {
		const licenseStream = getMultipartStream('license');
		const license = readText(licenseStream);
		licenseDetails = validateLicense({
			license,
			appKey: app.name
		});
		licenseValid = licenseDetails && !licenseDetails.expired;
		if (licenseValid) {
			installLicense({
				license,
				appKey: app.name
			});
		}
	} else {
		licenseDetails = validateLicense({appKey: app.name});
		licenseValid = licenseDetails && !licenseDetails.expired;
	}
	//log.info(`licenseDetails:${toStr(licenseDetails)}`);
	//log.info(`licenseValid:${toStr(licenseValid)}`);
	//const licenseText = licenseValid ? 'Licensed to ' + licenseDetails.issuedTo : null;
	//log.info(`licenseText:${toStr(licenseText)}`);

	//const connection = connect({principals: PRINCIPAL_EXPLORER_READ});
	//const collectionHits = queryCollections({connection}).hits;
	const propsObj = {
		/*collectionOptions: collectionHits.map(({displayName: label, _name: value}) => ({label, value})),
		initialValues: {
			collections: collectionHits.map(({_name}) => _name),
			thesauri: []
		},*/
		interfaceName: 'default',
		searchString,
		servicesBaseUrl: serviceUrl({
			service: 'whatever'
		}).replace('/whatever', '')//,
		//thesaurusOptions: getThesauri({connection}).hits.map(({displayName, name}) => ({label: displayName, value: name}))
	};
	log.info(`servicesBaseUrl:${propsObj.servicesBaseUrl}`);
	//log.info(toStr({propsObj}));
	const propsJson = JSON.stringify(propsObj);
	return htmlResponse({
		bodyEnd: [
			`<script type='module' defer>
	import {Search} from '${assetUrl({path: 'react/Search.esm.js'})}'
	ReactDOM.render(
		React.createElement(Search, JSON.parse('${propsJson}')),
		document.getElementById('${ID_REACT_SEARCH_CONTAINER}')
	);
</script>`],
		main: `<h1 class="ui header">Explorer</h1>
		${licenseValid ? '' : `<div class="ui warning message">
  <!--i class="close icon"></i-->
  <div class="header">
    No valid license found!
  </div>
  <form class='ui form' enctype="multipart/form-data" method='post'>
  	<div class="field">
  		<input name='license' type='file'/>
  	</div>
  		<button class='ui labeled icon button'><i class="upload icon"></i>Upload License</button>
  	</form>
</div>`}
<div id="${ID_REACT_SEARCH_CONTAINER}"/>`,
		path
	});
}
