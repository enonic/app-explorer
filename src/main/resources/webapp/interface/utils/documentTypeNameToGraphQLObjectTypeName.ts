import {
	//camelize,
	ucFirst
} from '@enonic/js-utils';


export function documentTypeNameToGraphQLObjectTypeName(documentTypeName :string) {
	return `DocumentType_${ucFirst(documentTypeName)}`;
}
