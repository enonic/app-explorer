import type {GraphQLObjectType} from '../../utils/index.d';
import type {Glue} from '../../utils/Glue';
import type {Hit} from './index.d';


//import {toStr} from '@enonic/js-utils';
import {GQL_INTERFACE_TYPE_DOCUMENT} from './constants';
import {addOutputFieldsSearchResultHit} from './addOutputFieldsSearchResultHit';


export function addInterfaceTypeDocument({
	documentTypeObjectTypes, // Just an empty obj, populated later
	glue,
} :{
	documentTypeObjectTypes :Record<string,GraphQLObjectType>
	glue :Glue
}) {
	return glue.addInterfaceType<Hit>({
		name: GQL_INTERFACE_TYPE_DOCUMENT,
		fields: addOutputFieldsSearchResultHit({glue}),
		typeResolver(node) {
			//log.debug('Document InterfaceType typeResolver node:%s', toStr(node));
			const {_documentType} = node;
			//log.debug('_documentTypeName:%s', _documentType);
			return documentTypeObjectTypes[_documentType]; // eslint-disable-line no-underscore-dangle
		}
	});
}
