// import {toStr} from '@enonic/js-utils';

import {
	GraphQLBoolean,
	GraphQLString,
	nonNull
	// @ts-expect-error no types
} from '/lib/graphql';
import {isLicenseValid, getIssuedTo} from '/lib/licensing';


export function generateGetLicenseField({
	glue
}) {
	return {
		resolve: (
			// env
		) => {
			// log.debug('env:%s', toStr(env));
			return {
				licensedTo: getIssuedTo(),
				licenseValid: isLicenseValid()
			};
		},
		type: glue.addObjectType({
			name: 'License',
			// description:
			fields: {
				licensedTo: { type: nonNull(GraphQLString) },
				licenseValid: { type: nonNull(GraphQLBoolean) }
			}
		})
	};
}
