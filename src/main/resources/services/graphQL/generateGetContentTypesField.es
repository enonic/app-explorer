//import {toStr} from '@enonic/js-utils';

import {
	GraphQLBoolean,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';
import {getTypes} from '/lib/xp/content';


export function generateGetContentTypesField({
	schemaGenerator
}) {
	const {
		createObjectType
	} = schemaGenerator;

	const CONTENT_TYPE_OBJECT_TYPE = createObjectType({
		name: 'ContentType',
		//description:,
		fields: {
			abstract: { type: nonNull(GraphQLBoolean) },
			allowChildContent: { type: nonNull(GraphQLBoolean) },
			description: { type: GraphQLString },
			displayName: { type: nonNull(GraphQLString) },
			final: { type: nonNull(GraphQLBoolean) },
			formJson: { type: nonNull(GraphQLString) },
			icon: { type: createObjectType({
				name: 'ContentTypeIcon',
				//description:,
				fields: {
					mimeType: { type: nonNull(GraphQLString) },
					modifiedTime: { type: nonNull(GraphQLString) }
				}
			})},
			name: { type: nonNull(GraphQLString) },
			supertype: { type: GraphQLString } // For some reason still says undefined?
		}
	});

	return {
		resolve: (/*env*/) => {
			//log.info(`env:${toStr(env)}`);
			const contentTypes = getTypes().map(({form, ...rest}) => ({
				//form,
				formJson: JSON.stringify(form),
				...rest
			}));
			//log.info(`contentTypes:${toStr(contentTypes)}`);
			return contentTypes;
		},
		type: list(CONTENT_TYPE_OBJECT_TYPE)
	};
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
