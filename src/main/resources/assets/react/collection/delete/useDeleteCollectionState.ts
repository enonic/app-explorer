import {useWhenInitAsync} from '@seamusleahy/init-hooks';
import * as gql from 'gql-query-builder';
import { useManualQuery } from 'graphql-hooks';
import * as React from 'react';
import {useUpdateEffect} from '../../utils/useUpdateEffect';


export interface QueryInterfacesResponseData {
	queryInterfaces: {
		hits: {
			_name: string
			// collectionIds: string|string[]
		}[]
	}
}

const GQL_MUTATION_COLLECTION_DELETE = gql.mutation({
	operation: 'deleteCollection',
	fields: [
		'_id',
	],
	variables: {
		_id: {
			list: false,
			required: true,
			type: 'ID',
			// value:
		}
	}
});


const GQL_QUERY_INTERFACES_WITH_COLLECTION = gql.query({
	operation: 'queryInterfaces',
	fields: [{
		hits: [
			'_name',
			// 'collectionIds'
		]
	}],
	variables: {
		query: {
			list: false,
			required: false,
			type: 'String',
			// value:
		}
	},
});


export default function useDeleteCollectionState({
	collectionId,
	onClose
}: {
	collectionId: string
	onClose: () => void
}) {
	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [usedInInterfaces, setUsedInInterfaces] = React.useState<string[]>([]);

	const [fetchDeleteCollection, {
		// data: dataDeleteCollection,
		// error: errorDeleteCollection,
		loading: loadingDeleteCollection,
	}] = useManualQuery(GQL_MUTATION_COLLECTION_DELETE.query);

	const fetchDeleteCollectionAndClose = async () => {
		const {
			data: localDataDeleteCollection,
		} = await fetchDeleteCollection({
			variables: {
				_id: collectionId
			}
		});
		// console.debug('dataDeleteCollection', dataDeleteCollection); // undefined
		// console.debug('errorDeleteCollection', errorDeleteCollection); // undefined
		// console.debug('loadingDeleteCollection', loadingDeleteCollection); // false
		// console.debug('localDataDeleteCollection', localDataDeleteCollection);
		if (localDataDeleteCollection) {
			onClose();
		}
	}

	const [fetchInterfacesWithCollection,{
		loading,
		// error,
		data
	}] = useManualQuery<QueryInterfacesResponseData>(GQL_QUERY_INTERFACES_WITH_COLLECTION.query, {
		variables: {
			query: `collectionIds = '${collectionId}'`
		}
	});

	//──────────────────────────────────────────────────────────────────────────
	// Init
	//──────────────────────────────────────────────────────────────────────────
	useWhenInitAsync(() => {
		fetchInterfacesWithCollection();
	});

	//──────────────────────────────────────────────────────────────────────────
	// Updates (not init)
	//──────────────────────────────────────────────────────────────────────────
	useUpdateEffect(() => {
		if (data) {
			setUsedInInterfaces(data.queryInterfaces.hits.map(({_name}) => _name));
		}
	}, [data]);

	//──────────────────────────────────────────────────────────────────────────
	// Returns
	//──────────────────────────────────────────────────────────────────────────
	return {
		fetchDeleteCollectionAndClose,
		loading,
		loadingDeleteCollection,
		usedInInterfaces,
	};
}
