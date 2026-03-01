import type { Glue } from '../Glue';

import { includes } from '@enonic/js-utils/array/includes';
import { toStr } from '@enonic/js-utils/value/toStr';
import {
	GraphQLBoolean,
	GraphQLInt,
	Json as GraphQLJson,
	GraphQLString,
	list,
	nonNull
	// @ts-ignore
} from '/lib/graphql';
import { getTypes } from '/lib/xp/content';
import {
	get as getContext,
	run as runInContext,
} from '/lib/xp/context';
import { serviceUrl } from '/lib/xp/portal';

import { GQL_UNIQ_TYPE } from '../constants';

import type {
	ContentTypeObjectType,
	GetContentTypesArgs,
	IconWithUrl,
} from './types';


const TRACE = false;

interface GetContentTypesEnv {
	args: GetContentTypesArgs;
}

export function getContentTypesResolver(env: GetContentTypesEnv) {
	if (TRACE) log.info('env:%s', toStr(env));
	const {
		args: {
			branch = 'master',
			names,
			sort: {
				direction: sortDirection = 'ASC',
				field: sortField = 'name',
			} = {}
		}
	} = env;

	const context = getContext();
	if (TRACE) log.info('context:%s', toStr(context));

	context.branch = branch;
	if (TRACE) log.info('modified context:%s', toStr(context));

	let contentTypes = getTypes();
	if (names) {
		contentTypes = contentTypes.filter(({name}) => includes(names, name));
	}
	if (!(sortField === 'name' && sortDirection === 'ASC')) {
		if (sortField === 'name' && sortDirection === 'DESC') {
			contentTypes = contentTypes.reverse();
		}
		// Sorting on _docCount is done in addGetSites
	}
	const contentObjects = contentTypes.map(({ form, icon, name, ...rest }) => ({
		icon: icon ? ({
			mimeType: icon.mimeType,
			modifiedTime: icon.modifiedTime,
			url: runInContext(context, () => serviceUrl({
				service: 'icon',
				params: {
					type: name
				},
			}))
		}) : null,

		// TODO Remove this in next major release?
		formJson: JSON.stringify(form),

		formAsJson: form,
		name,
		...rest
	}) as unknown as ContentTypeObjectType);
	if (TRACE) log.info('contentObjects:%s', toStr(contentObjects));
	return contentObjects;
}

export function addGetContentTypes({
	glue
}: {
	glue: Glue
}) {
	glue.addObjectType<IconWithUrl>({
		name: GQL_UNIQ_TYPE.OBJECT_CONTENT_TYPE_ICON,
		// description:,
		fields: {
			mimeType: { type: nonNull(GraphQLString) },
			modifiedTime: { type: nonNull(GraphQLString) },
			url: { type: nonNull(GraphQLString) },
		}
	});

	glue.addObjectType<ContentTypeObjectType>({
		name: GQL_UNIQ_TYPE.OBJECT_CONTENT_TYPE,
		// description:,
		fields: {
			_docCount: { type: GraphQLInt },
			abstract: { type: nonNull(GraphQLBoolean) },
			allowChildContent: { type: nonNull(GraphQLBoolean) },
			description: { type: GraphQLString },
			displayName: { type: nonNull(GraphQLString) },
			displayNameExpression: { type: GraphQLString }, // TODO nonNull?
			modifiedTime: { type: GraphQLString }, // TODO nonNull?
			final: { type: nonNull(GraphQLBoolean) },

			// TODO Remove this in next major release?
			formJson: { type: nonNull(GraphQLString) },

			formAsJson: { type: nonNull(GraphQLJson) },
			icon: { type: glue.getObjectType(
					GQL_UNIQ_TYPE.OBJECT_CONTENT_TYPE_ICON,
			)},
			name: { type: nonNull(GraphQLString) },
			supertype: { type: GraphQLString }, // TODO Remove this in next major release?
			superType: { type: GraphQLString } // I think this is optional
		}
	});

	glue.addInputType({
		name: GQL_UNIQ_TYPE.INPUT_CONTENT_TYPES_SORT,
		fields: {
			field: { type: glue.getEnumType(GQL_UNIQ_TYPE.ENUM_CONTENT_TYPES_SORT_FIELD) },
			direction: { type: glue.getEnumType(GQL_UNIQ_TYPE.ENUM_SORT_DIRECTION) },
		},
	});

	glue.addQuery<GetContentTypesArgs>({
		name: GQL_UNIQ_TYPE.QUERY_CONTENT_TYPES_GET,
		args: {
			// @ts-ignore TODO
			branch: glue.getEnumType(GQL_UNIQ_TYPE.ENUM_PROJECT_BRANCH),
			names: list(GraphQLString),
			// @ts-ignore TODO
			sort: glue.getInputType(GQL_UNIQ_TYPE.INPUT_CONTENT_TYPES_SORT),
		},
		resolve: getContentTypesResolver,
		type: list(glue.getObjectType(GQL_UNIQ_TYPE.OBJECT_CONTENT_TYPE)),
	});
} // generateGetContentTypesField

/* Example query
{
	getContentTypes {
		abstract
		allowChildContent
		description
		displayName
		final
		formJson
		icon {
			mimeType
			modifiedTime
		}
		name
		#superType
	}
}
*/
