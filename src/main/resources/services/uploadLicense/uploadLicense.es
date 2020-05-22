import {getMultipartStream} from '/lib/xp/portal';
import {readText} from '/lib/xp/io';
import {installLicense, validateLicense} from '/lib/license';


export function post(req) {
	const licenseStream = getMultipartStream('license');
	const license = readText(licenseStream);

	const licenseDetails = validateLicense({
		license,
		appKey: app.name
	});
	const isValid = licenseDetails && !licenseDetails.expired;
	if (isValid) {
		installLicense({
			license,
			appKey: app.name
		});
	}

	return {
		status: isValid ? 200 : 500,
		contentType: 'application/json',
		body: {
			licenseValid: !!isValid,
			licenseText: isValid ? 'Licensed to ' + licenseDetails.issuedTo : null
		}
	};
}
