import type {CollectionNode} from '/lib/explorer/types/Collection';
import type {Path as PathType} from '/lib/explorer/types/index.d';
import type {RepoConnection} from '/lib/xp/node';
import type {Glue} from '../Glue';


import {
	Path,
	Principal
} from '@enonic/explorer-utils';
// import {toStr} from '@enonic/js-utils';
import {connect} from '/lib/explorer/repo/connect';
import {exists} from '/lib/explorer/collection/exists';
import {coerseCollectionType} from '/lib/explorer/collection/coerseCollectionType';
import {get} from '/lib/explorer/collection/get';
import {create} from '/lib/explorer/node/create';
import {
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {reference} from '/lib/xp/value';
import {
	GQL_MUTATION_COLLECTION_COPY_NAME,
	GQL_TYPE_COLLECTION_NAME
} from '../constants';


export function addCollectionCopyMutation({
	glue
} :{
	glue: Glue
}) {
	return glue.addMutation<{
		_id: string
		toName: string
	}>({
		name: GQL_MUTATION_COLLECTION_COPY_NAME,
		args: {
			_id: glue.getScalarType('_id'),
			toName: nonNull(GraphQLString)
		},
		resolve(env) {
			// log.debug('env:%s', toStr(env));

			const {
				args: {
					_id,
					toName
				}
			} = env;
			// log.debug('_id:%s', _id);
			// log.debug('toName:%s', toName);

			const writeConnection = connect({principals: [Principal.EXPLORER_WRITE]}) as RepoConnection;

			// Get current collection
			const collectionNode = get({
				connection: writeConnection,
				key: _id
			}) as CollectionNode;
			// log.debug('collectionNode:%s', toStr(collectionNode));

			if (!collectionNode) {
				const msg = `CollectionCopyMutationResolver: Couldn't get CollectionNode with _id:${_id}!`
				log.error(msg);
				throw new Error(msg);
			}

			// Check that toName doesn't already exist
			if (exists({
				connection: writeConnection,
				name: toName
			})) {
				const msg = `CollectionCopyMutationResolver: CollectionNode with name${toName} already exists!`
				log.error(msg);
				throw new Error(msg);
			}

			delete collectionNode._id;
			collectionNode._name = toName;
			collectionNode.doCollect = false; // We're not copying the schedule so false makes sense.
			if (collectionNode.documentTypeId && !(collectionNode.documentTypeId as string).startsWith('_')) {
				collectionNode.documentTypeId = reference(collectionNode.documentTypeId as string);
			} else {
				delete(collectionNode.documentTypeId); // So it can be changed to "_none"
			}
			delete collectionNode.modifiedTime;
			delete collectionNode.modifier;

			let createdNode: CollectionNode;
			try {
				createdNode = create/*<CollectionNode>*/({
					_parentPath: Path.COLLECTIONS as PathType,
					...collectionNode
				}, {
					connection: writeConnection
				}) as CollectionNode;
			} catch (e) {
				const msg = `CollectionCopyMutationResolver: Something went wrong while trying to create collection:${toName}!`
				log.error(msg, e);
				throw new Error(msg);
			}
			// log.debug('createdNode:%s', toStr(createdNode));

			const collection = coerseCollectionType(createdNode);
			// log.debug('collection:%s', toStr(collection));

			return collection;
		},
		type: glue.getObjectType(GQL_TYPE_COLLECTION_NAME)
	});
}
