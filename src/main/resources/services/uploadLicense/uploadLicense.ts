import type {
	Request,
	Response
} from '@enonic-types/core';


//import {toStr} from '@enonic/js-utils';
//@ts-ignore
//import {getMultipartStream} from '/lib/xp/portal';
//@ts-ignore
//import {readText} from '/lib/xp/io';
//@ts-ignore
import {installLicense, getIssuedTo} from '/lib/licensing';


export function post(req: Request): Response<{
	body: {
		licenseValid: boolean
		licenseText: string
	}
}> {
	//log.info('req:%s', toStr(req));

	//const licenseStream = getMultipartStream('license');
	//const license :string = readText(licenseStream);
	const license = req.body;

	const licenseInstalled: boolean = installLicense(license);

	return {
		status: licenseInstalled ? 200 : 500,
		contentType: 'application/json',
		body: {
			licenseValid: licenseInstalled,
			licenseText: getIssuedTo()
		}
	};
}
