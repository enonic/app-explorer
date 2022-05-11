import type {QueryDocumentTypesHits} from '../../../services/graphQL/fetchers/fetchDocumentTypes';
import type {DocumentTypesObj} from './index.d';


export function buildDocumentTypesObj(hits :QueryDocumentTypesHits) {
	const documentTypes :DocumentTypesObj = {};
	for (let i = 0; i < hits.length; i++) {
		const {
			_name,
			_referencedBy: {
				hits: referencedByCollections
			},
			properties,
			...rest
		} = hits[i];
		const collections = {};
		const interfaceNames :Array<string> = [];
		let documentsInTotal = 0;
		referencedByCollections.forEach(({
			_name: collectionName,
			_nodeType,
			_hasField: {
				total: documentsWithNameInCollectionRepoTotal
			},
			_referencedBy: {
				//count
				hits: referencedByInterfaces
				//total
			}
		}) => {
			documentsInTotal += documentsWithNameInCollectionRepoTotal;
			if (_nodeType === 'com.enonic.app.explorer:collection' && !collections[collectionName]) {
				collections[collectionName] = {
					documentsTotal: documentsWithNameInCollectionRepoTotal
				};
				referencedByInterfaces.forEach(({
					_name: interfaceName,
					_nodeType: interfaceNodeType
				}) => {
					if (interfaceNodeType === 'com.enonic.app.explorer:interface' && !interfaceNames.includes(interfaceName)) {
						interfaceNames.push(interfaceName);
					}
				});
			}
		}); // forEach referencedByCollections
		const activeProperties = properties.filter(({active}) => active);
		const activePropertyNames = activeProperties.map(({name})=>name).sort();
		documentTypes[_name] = {
			_name,
			activeProperties,
			activePropertyNames,
			collectionNames: Object.keys(collections).sort(),
			collections,
			documentsInTotal,
			interfaceNames,
			...rest
		};
	} // for
	return documentTypes;
}
