//import {toStr} from '@enonic/js-utils';

import {
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';
import {getSites as gS} from '/lib/util/content/getSites';


export function generateGetSitesField({
	glue
}) {
	const SITE_OBJECT_TYPE = glue.addObjectType({
		name: 'Site',
		//description:,
		fields: {
			_id: { type: glue.scalarTypes._id },
			_name: { type: glue.scalarTypes._name },
			_path: { type: glue.scalarTypes._path },
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
		type: glue.addObjectType({
			name: 'GetSites',
			//description:
			fields: {
				count: { type: glue.scalarTypes.count },
				hits: { type: list(SITE_OBJECT_TYPE) },
				total: { type: glue.scalarTypes.total }
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
