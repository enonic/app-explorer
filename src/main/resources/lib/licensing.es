import {validateLicense, installLicense as install} from '/lib/license';

const subscriptionKey = 'enonic.platform.subscription';

const getLicenseDetails = (license) => {
    const params = {
        appKey: subscriptionKey,
    };
    if (license) {
        params.license = license;
    }

    return validateLicense(params);
}

export const isLicenseValid = (license) => {
    const licenseDetails = getLicenseDetails(license);

    return licenseDetails && !licenseDetails.expired;
}

export const getIssuedTo = () => {
    if (!isLicenseValid()) {
        return 'Unlicensed';
    }

    return 'Licensed to ' + getLicenseDetails().issuedTo;
}

export const installLicense = (license) => {
    if (!isLicenseValid(license)) {
        return false;
    }

    return install({
        license: license,
        appKey: subscriptionKey,
    });
}
