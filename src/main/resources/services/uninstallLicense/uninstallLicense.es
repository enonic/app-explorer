import {uninstallLicense} from '/lib/license';


export function get() {
	const licenseUninstalled = uninstallLicense({appKey: app.name});
	return {
		status: 200,
		contentType: 'application/json',
		body: {
			licenseUninstalled
		}
	}; // response
} // get
