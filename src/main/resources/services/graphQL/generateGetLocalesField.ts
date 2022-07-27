//import {toStr} from '@enonic/js-utils';

import {
	GraphQLString,
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
//import {getLocales as importedGetLocales} from '/lib/locales';
import {getLocales as importedGetLocales} from '../../lib/locales';

// https://en.wikipedia.org/wiki/ISO_639-2#Special_situations
// https://en.wikipedia.org/wiki/ISO_639-3#Special_codes
/*
Four codes are set aside in ISO 639-2 and ISO 639-3 for cases where none of the
specific codes are appropriate. These are intended primarily for applications
like databases where an ISO code is required regardless of whether one exists.

mis (uncoded languages, originally an abbreviation for 'miscellaneous') is
 intended for languages which have not (yet) been included in the ISO standard.

mul (multiple languages) is intended for cases where the data includes more than
 one language, and (for example) the database requires a single ISO code.

und (undetermined) is intended for cases where the language in the data has not
 been identified, such as when it is mislabeled or never had been labeled.
 It is not intended for cases such as Trojan where an unattested language has
 been given a name.

zxx (no linguistic content / not applicable) is intended for data which is not a
 language at all, such as animal calls.[13]

In addition, 520 codes in the range qaa–qtz are 'reserved for local use'.
For example, Rebecca Bettencourt assigns a code to constructed languages,
and new assignments are made upon request.[14]
The Linguist List uses them for extinct languages.
Linguist List has assigned one of them a generic value: qnp, unnamed proto-language.
This is used for proposed intermediate nodes in a family tree that have no name.
*/
const ISO_639_3_CODE_ZXX = 'zxx';
const ISO_639_3_CODE_ZXX_DISPLAY_NAME = 'no linguistic content';

export function generateGetLocalesField({
	glue
}) {
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
			return [{
				country: undefined,
				displayCountry: undefined,
				displayLanguage: undefined,
				displayName: ISO_639_3_CODE_ZXX_DISPLAY_NAME,
				displayVariant: undefined,
				language: undefined,
				tag: ISO_639_3_CODE_ZXX,
				variant: undefined,
			}].concat(importedGetLocales({
				locale,
				query
			}));
		},
		type: list(glue.addObjectType({
			name: 'Locale',
			fields: {
				country: { type: GraphQLString },
				displayCountry: { type: GraphQLString },
				displayLanguage: { type: GraphQLString },
				displayName: { type: GraphQLString },
				displayVariant: { type: GraphQLString },
				language: { type: GraphQLString }, // nonNull?
				tag: { type: nonNull(GraphQLString) },
				variant: { type: GraphQLString }
			}
		}))
	};
}
