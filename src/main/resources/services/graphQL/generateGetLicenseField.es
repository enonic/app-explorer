//import {toStr} from '@enonic/js-utils';

import {
	GraphQLBoolean,
	GraphQLString,
	nonNull
} from '/lib/graphql';
import {validateLicense} from '/lib/license';


export function generateGetLicenseField({
	schemaGenerator
}) {
	const {
		createObjectType
	} = schemaGenerator;
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
		type: createObjectType({
			name: 'License',
			//description:
			fields: {
				licensedTo: { type: nonNull(GraphQLString) },
				licenseValid: { type: nonNull(GraphQLBoolean) }
			}
		})
	};
}
