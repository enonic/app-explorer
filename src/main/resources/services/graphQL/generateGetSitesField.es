//import {toStr} from '@enonic/js-utils';

import {
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';
import {getSites as gS} from '/lib/util/content/getSites';


export function generateGetSitesField({
	GQL_TYPE_COUNT,
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	//GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,
	GQL_TYPE_TOTAL,
	schemaGenerator
}) {
	const {
		createObjectType
	} = schemaGenerator;
	const SITE_OBJECT_TYPE = createObjectType({
		name: 'Site',
		//description:,
		fields: {
			_id: { type: GQL_TYPE_ID },
			_name: { type: GQL_TYPE_NAME },
			_path: { type: GQL_TYPE_PATH },
			displayName: { type: nonNull(GraphQLString) }
		}
	});
	return {
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
				count: { type: GQL_TYPE_COUNT },
				hits: { type: list(SITE_OBJECT_TYPE) },
				total: { type: GQL_TYPE_TOTAL }
			} // fields
		})
	};
}

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
