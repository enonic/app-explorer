//import {toStr} from '@enonic/js-utils';

import {
	GraphQLString,
	list,
	newSchemaGenerator
} from '/lib/graphql';
//import {getLocales as importedGetLocales} from '/lib/locales';
import {getLocales as importedGetLocales} from '../../lib/locales';

const {
	createObjectType
} = newSchemaGenerator();


export const getLocales = {
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
}; // getLocales
