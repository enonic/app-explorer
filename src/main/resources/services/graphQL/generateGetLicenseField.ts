//import {toStr} from '@enonic/js-utils';

import {
	GraphQLBoolean,
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
//@ts-ignore
import {validateLicense} from '/lib/license';


export function generateGetLicenseField({
	glue
}) {
	return {
		resolve: (/*env*/) => {
			//log.info(`env:${toStr(env)}`);
			const licenseDetails = validateLicense({appKey: app.name});
			const licenseValid = !!(licenseDetails && !licenseDetails.expired);
			const licensedTo = licenseDetails ? `Licensed to ${licenseDetails.issuedTo}` : 'Unlicensed';
			return {
				licensedTo,
				licenseValid
			};
		},
		type: glue.addObjectType({
			name: 'License',
			//description:
			fields: {
				licensedTo: { type: nonNull(GraphQLString) },
				licenseValid: { type: nonNull(GraphQLBoolean) }
			}
		})
	};
}
