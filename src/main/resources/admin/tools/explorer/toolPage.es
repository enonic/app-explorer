import {installLicense, validateLicense} from '/lib/license';
//import {toStr} from '/lib/util';
import {readText} from '/lib/xp/io';
import {getMultipartStream} from '/lib/xp/portal';

import {htmlResponse} from '/admin/tools/explorer/htmlResponse';


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

	return htmlResponse({
		bodyEnd: [``],
		main: `${licenseValid ? '' : `<div class="ui warning message">
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
</div>`}`,
		path
	});
}
