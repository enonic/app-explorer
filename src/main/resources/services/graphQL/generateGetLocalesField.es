//import {toStr} from '@enonic/js-utils';

import {
	GraphQLString,
	list
} from '/lib/graphql';
//import {getLocales as importedGetLocales} from '/lib/locales';
import {getLocales as importedGetLocales} from '../../lib/locales';


export function generateGetLocalesField({
	schemaGenerator
}) {
	const {
		createObjectType
	} = schemaGenerator;
	return {
		args: {
			locale: GraphQLString,
			query: GraphQLString
		},
		resolve: (env) => {
			//log.info(`env:${toStr(env)}`);
			const {
				locale = undefined,
				query = ''
			} = env.args;
			return importedGetLocales({
				locale,
				query
			});
		},
		type: list(createObjectType({
			name: 'Locale',
			fields: {
				country: { type: GraphQLString },
				displayCountry: { type: GraphQLString },
				displayLanguage: { type: GraphQLString },
				displayName: { type: GraphQLString },
				displayVariant: { type: GraphQLString },
				language: { type: GraphQLString }, // nonNull
				tag: { type: GraphQLString }, // nonNull
				variant: { type: GraphQLString }
			}
		}))
	};
}
