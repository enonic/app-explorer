//@ts-ignore
import {getMultipartStream} from '/lib/xp/portal';
//@ts-ignore
import {readText} from '/lib/xp/io';
//@ts-ignore
import {installLicense, getIssuedTo} from '/lib/licensing';


export function post(/*req*/) {
	const licenseStream = getMultipartStream('license');
	const license = readText(licenseStream);

	const licenseInstalled = installLicense(license);

	return {
		status: licenseInstalled ? 200 : 500,
		contentType: 'application/json',
		body: {
			licenseValid: licenseInstalled,
			licenseText: getIssuedTo()
		}
	};
}
