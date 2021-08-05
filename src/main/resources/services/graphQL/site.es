//import {toStr} from '@enonic/js-utils';

import {
	GraphQLInt,
	GraphQLString,
	list,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';
import {getSites as gS} from '/lib/util/content/getSites';

const {
	createObjectType
} = newSchemaGenerator();


const SITE_OBJECT_TYPE = createObjectType({
	name: 'Site',
	//description:,
	fields: {
		_id: { type: nonNull(GraphQLString) },
		_path: { type: nonNull(GraphQLString) },
		_name: { type: nonNull(GraphQLString) },
		displayName: { type: nonNull(GraphQLString) }
	}
});


export const getSites = {
	resolve: (/*env*/) => {
		//log.info(`env:${toStr(env)}`);
		const sites = gS({
			branch: 'master'
		});
		//log.info(`sites:${toStr(sites)}`);
		return sites;
	},
	type: createObjectType({
		name: 'GetSites',
		//description:
		fields: {
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			hits: { type: list(SITE_OBJECT_TYPE) }
		} // fields
	})
}; // getSites


/* Example query
{
	getSites {
		total
		count
		hits {
			_id
			_name
			_path
			displayName
		}
	}
}
*/
