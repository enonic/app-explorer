import {
	validateLicense,
	installLicense as install
	// @ts-expect-error no types
} from '/lib/license';


type InstallLicenseParams = {
	appKey: string
	license: string
	publicKey?: string
}

type LicenseDetailsObject = {
	expired: boolean
	issuedTo: string
}

type ValidateLicenseParams = {
	appKey?: string
	license?: string
}


const typedValidateLicense = (params: ValidateLicenseParams): LicenseDetailsObject => validateLicense(params);
const typedInstallLicense = (params: InstallLicenseParams): boolean => install(params);


const subscriptionKey = 'enonic.platform.subscription';


const getLicenseDetails = (license?: string) => {
	const params: ValidateLicenseParams = {
		appKey: subscriptionKey,
	};
	if (license) {
		params.license = license;
	}

	return typedValidateLicense(params);
}


export const isLicenseValid = (license?: string) => {
	const licenseDetails = getLicenseDetails(license);

	return licenseDetails && !licenseDetails.expired;
}


export const getIssuedTo = () => {
	if (!isLicenseValid()) {
		return 'Unlicensed';
	}

	return 'Licensed to ' + getLicenseDetails().issuedTo;
}


export const installLicense = (license: string) => {
	if (!isLicenseValid(license)) {
		return false;
	}

	return typedInstallLicense({
		license: license,
		appKey: subscriptionKey,
	});
}
