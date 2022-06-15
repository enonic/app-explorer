import {
	Collection,
	CollectionNode,
	CollectionNodeCreateParams,
	CollectionWithCron
} from '/lib/explorer/types/index.d';
import type {GraphQLField} from '../types.d';

//import {toStr} from '@enonic/js-utils';

import {
	NT_COLLECTION,
	PRINCIPAL_EXPLORER_WRITE,
	ROOT_PERMISSIONS_EXPLORER
} from '/lib/explorer/constants';
import {coerseCollectionType} from '/lib/explorer/collection/coerseCollectionType';
import {createDocumentType} from '/lib/explorer/documentType/createDocumentType';
import {exists} from '/lib/explorer/node/exists';
import {connect} from '/lib/explorer/repo/connect';
import {createOrModifyJobsFromCollectionNode} from '/lib/explorer/scheduler/createOrModifyJobsFromCollectionNode';
import {
	GraphQLBoolean,
	GraphQLID,
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';
//@ts-ignore
import {getUser} from '/lib/xp/auth';
//@ts-ignore
import {reference as referenceValue} from '/lib/xp/value';

import {
	GQL_INPUT_TYPE_COLLECTION_COLLECTOR_NAME,
	GQL_INPUT_TYPE_COLLECTION_CRON_NAME,
	GQL_TYPE_COLLECTION_NAME
} from '../constants';


export function generateCreateCollectionField({
	glue
}) :GraphQLField<
	{
		_name :string
		collector :string
		cron :string
		doCollect :string
		documentTypeId :string
		language :string
	},
	Partial<CollectionWithCron>,
	Collection
> {
	return {
		args: {
			_name: glue.getScalarType('_name'),
			collector: glue.getInputType(GQL_INPUT_TYPE_COLLECTION_COLLECTOR_NAME),
			cron: list(glue.getInputType(GQL_INPUT_TYPE_COLLECTION_CRON_NAME)),
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

			const nodeToBeCreated :CollectionNodeCreateParams = {
				_indexConfig: {default: 'byType'},
				_inheritsPermissions: false, // false is the default and the fastest, since it doesn't have to read parent to apply permissions.
				_name,
				_nodeType: NT_COLLECTION,
				_parentPath: '/collections',
				_permissions: ROOT_PERMISSIONS_EXPLORER,
				creator: getUser().key,
				createdTime: new Date(),
				language
			} /*as Partial<Omit<CollectionNode, 'collector'> & {
				collector :Partial<CollectionNode['collector']>
			}>;*/
			//log.debug(`nodeToBeCreated:${toStr(nodeToBeCreated)}`);

			if (collector) {
				const {
					name: collectorName,
					configJson
				} = collector;
				if (collectorName || configJson) { // TODO Can we really have collector config without collector name???
					nodeToBeCreated.collector = {} as CollectionNodeCreateParams['collector'];
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

			if (documentTypeId === '_new') {
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
			if (documentTypeId && !documentTypeId.startsWith('_')) {
				nodeToBeCreated.documentTypeId = referenceValue(documentTypeId);
			}
			//log.debug(`nodeToBeCreated:${toStr(nodeToBeCreated)}`);

			const createdNode = writeConnection.create(nodeToBeCreated) as CollectionNode;
			//log.debug(`createdNode:${toStr(createdNode)}`);

			if (createdNode) {
				writeConnection.refresh(); // So the data becomes immidiately searchable
				const createdNodeWithCron = JSON.parse(JSON.stringify(createdNode)) as CollectionWithCron;
				createdNodeWithCron.cron = cron;
				createdNodeWithCron.doCollect = doCollect;
				//log.debug(`createdNode:${toStr(createdNode)}`);
				createOrModifyJobsFromCollectionNode({
					connection: writeConnection,
					collectionNode: createdNodeWithCron,
					timeZone: 'GMT+02:00' // CEST (Summer Time)
					//timeZone: 'GMT+01:00' // CET
				});
			} else {
				throw new Error(`Something went wrong when trying to create collection ${_name}`);
			}

			return coerseCollectionType(createdNode);
		},
		type: glue.getObjectType(GQL_TYPE_COLLECTION_NAME)
	};
}
