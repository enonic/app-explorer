//import {toStr} from '@enonic/js-utils';

import {
	NT_COLLECTION,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {createDocumentType} from '/lib/explorer/documentType/createDocumentType';
import {exists} from '/lib/explorer/node/exists';
import {connect} from '/lib/explorer/repo/connect';
import {createOrModifyJobsFromCollectionNode} from '/lib/explorer/scheduler/createOrModifyJobsFromCollectionNode';
import {
	GraphQLBoolean,
	GraphQLID,
	GraphQLString,
	list
} from '/lib/graphql';
import {getUser} from '/lib/xp/auth';
import {reference} from '/lib/xp/value';

//import {GQL_TYPE_NAME} from '../types';

import {coerseCollectionType} from '/lib/explorer/collection/coerseCollectionType';
/*import {
	GQL_INPUT_TYPE_COLLECTOR,
	GQL_INPUT_TYPE_CRON,
	GQL_TYPE_COLLECTION
} from './types';*/

export function generateCreateCollectionField({
	GQL_TYPE_NAME,
	GQL_INPUT_TYPE_COLLECTOR,
	GQL_INPUT_TYPE_CRON,
	GQL_TYPE_COLLECTION
}) {
	return {
		args: {
			_name: GQL_TYPE_NAME,
			collector: GQL_INPUT_TYPE_COLLECTOR,
			cron: list(GQL_INPUT_TYPE_CRON),
			doCollect: GraphQLBoolean,
			documentTypeId: GraphQLID, // NOTE NOT nonNull
			language: GraphQLString
		},
		resolve({
			args: {
				_name, // nonNull
				collector, // optional
				cron,
				doCollect,
				documentTypeId, // optional
				language // optional
			}
		}) {
			//log.debug(`_name:${toStr(_name)}`);
			//log.debug(`collector:${toStr(collector)}`);
			//log.debug(`cron:${toStr(cron)}`);
			//log.debug(`doCollect:${toStr(doCollect)}`);
			//log.debug(`documentTypeId:${toStr(documentTypeId)}`);

			const nodeToBeCreated = {
				_indexConfig: {default: 'byType'},
				_inheritsPermissions: true,
				_name,
				_nodeType: NT_COLLECTION,
				_parentPath: '/collections',
				_permissions: [],
				creator: getUser().key,
				createdTime: new Date(),
				language
			};
			//log.debug(`nodeToBeCreated:${toStr(nodeToBeCreated)}`);

			if (collector) {
				const {
					name: collectorName,
					configJson
				} = collector;
				if (collectorName || configJson) {
					nodeToBeCreated.collector = {};
				}
				if (collectorName) {
					nodeToBeCreated.collector.name = collectorName;
				}
				if (configJson) {
					nodeToBeCreated.collector.configJson = configJson;
					nodeToBeCreated.collector.config = JSON.parse(configJson);
				}
			}
			//log.debug(`nodeToBeCreated:${toStr(nodeToBeCreated)}`);

			const writeConnection = connect({
				principals: [PRINCIPAL_EXPLORER_WRITE]
			});

			if (!documentTypeId) {
				// Create DocumentType With CollectionName pluss some integer if already existing
				let documentTypeName = _name;
				let i = 0;
				while (exists({
					connection: writeConnection,
					_parentPath: '/documentTypes',
					_name: documentTypeName
				})) {
					i++;
					documentTypeName = `${_name}_${i}`; // /^[a-z][a-zA-Z0-9_]*$/
				}
				const createdDocumentTypeNode = createDocumentType({_name: documentTypeName});
				//log.debug(`createdDocumentTypeNode:${toStr(createdDocumentTypeNode)}`);
				documentTypeId = createdDocumentTypeNode._id;
			}
			nodeToBeCreated.documentTypeId = reference(documentTypeId);
			//log.debug(`nodeToBeCreated:${toStr(nodeToBeCreated)}`);

			const createdNode = writeConnection.create(nodeToBeCreated);
			//log.debug(`createdNode:${toStr(createdNode)}`);

			if (createdNode) {
				writeConnection.refresh(); // So the data becomes immidiately searchable
				createdNode.cron = cron;
				createdNode.doCollect = doCollect;
				//log.debug(`createdNode:${toStr(createdNode)}`);
				createOrModifyJobsFromCollectionNode({
					connection: writeConnection,
					collectionNode: createdNode,
					timeZone: 'GMT+02:00' // CEST (Summer Time)
					//timeZone: 'GMT+01:00' // CET
				});
			} else {
				throw new Error(`Something went wrong when trying to create collection ${_name}`);
			}

			return coerseCollectionType(createdNode);
		},
		type: GQL_TYPE_COLLECTION
	};
}
