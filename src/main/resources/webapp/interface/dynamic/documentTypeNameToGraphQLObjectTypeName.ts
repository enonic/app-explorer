import {
	//camelize,
	ucFirst
} from '@enonic/js-utils';


export function documentTypeNameToGraphQLObjectTypeName(documentTypeName) {
	return `DocumentType_${ucFirst(documentTypeName)}`;
}
