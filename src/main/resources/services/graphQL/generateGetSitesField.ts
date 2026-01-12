import { toStr } from '@enonic/js-utils/value/toStr';

import {
	GraphQLString,
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import { get as getContext } from '/lib/xp/context';
import { list as listProjects } from '/lib/xp/project';
//@ts-ignore
import {getSites as gS} from '/lib/util/content/getSites';

const TRACE = false;

export function generateGetSitesField({
	glue
}) {
	const SITE_OBJECT_TYPE = glue.addObjectType({
		name: 'Site',
		// description:,
		fields: {
			_id: { type: glue.getScalarType('_id') },
			_name: { type: glue.getScalarType('_name') },
			_path: { type: glue.getScalarType('_path') },
			_project: { type: nonNull(GraphQLString) },
			displayName: { type: nonNull(GraphQLString) }
		}
	});
	return {
		resolve: (env: unknown) => {
			if (TRACE) log.info('env:%s', toStr(env));
			const sitesQueryRes = {
				count: 0,
				hits: [],
				total: 0
			}
			const context = getContext();
			if (TRACE) log.info('context:%s', toStr(context));
			context.branch = 'master';
			const projectIds = listProjects().map(({id}) => id);
			for (const projectId of projectIds) {
				context.repository = `com.enonic.cms.${projectId}`;
				if (TRACE) log.info('context:%s', toStr(context));
				const sitesInProject = gS({
					context
				});
				if (TRACE) log.info('sitesInProject:%s', toStr(sitesInProject));
				sitesQueryRes.count += sitesInProject.count;
				sitesQueryRes.total += sitesInProject.total;
				for (const hit of sitesInProject.hits) {
					hit._project = projectId;
					sitesQueryRes.hits.push(hit);
				}
			} // for projectIds
			if (TRACE) log.info('sites:%s', toStr(sitesQueryRes));
			return sitesQueryRes;
		},
		type: glue.addObjectType({
			name: 'GetSites',
			// description:
			fields: {
				count: { type: glue.getScalarType('count') },
				hits: { type: list(SITE_OBJECT_TYPE) },
				total: { type: glue.getScalarType('total') }
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
			_project
			displayName
		}
	}
}
*/
