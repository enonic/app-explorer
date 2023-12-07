import type { IQueryBuilderOptions } from 'gql-query-builder-ts';

import { useWhenInitAsync } from '@seamusleahy/init-hooks';
import { mutation, query } from 'gql-query-builder-ts';
import { useManualQuery } from 'graphql-hooks';
import * as React from 'react';
import { COLLECTION_REPO_PREFIX } from '@enonic/explorer-utils';
import { useUpdateEffect } from '../../utils/useUpdateEffect';


declare module 'gql-query-builder-ts' {
	function query<Variables = any>(options: IQueryBuilderOptions | IQueryBuilderOptions[], adapter?: any, config?: any): {
		variables: Variables;
		query: string;
	};
	interface IMutationAdapter {
		mutationBuilder: () => {
			variables: any;
			query: string;
		};
		mutationsBuilder: (options: IQueryBuilderOptions[]) => {
			variables: any;
			query: string;
		};
	}
	function mutation<Variables = any>(options: IQueryBuilderOptions | IQueryBuilderOptions[], adapter?: IMutationAdapter, config?: any): {
		variables: Variables;
		query: string;
	};
}

interface DeleteCollectionVariables {
	_id: string
	deleteRepo: boolean
}

interface DeleteCollectionResponseData {
	deleteCollection: {
		_id: string
	}
}

export interface QueryInterfacesResponseData {
	queryInterfaces: {
		hits: {
			_name: string
			// collectionIds: string|string[]
		}[]
	}
}

export interface ListReposVariables {
	id: string
}

export interface ListReposResponseData {
	listRepos: {
		id: string
	}[]
}


const GQL_MUTATION_COLLECTION_DELETE = mutation<DeleteCollectionVariables>({
	operation: 'deleteCollection',
	fields: [
		'_id',
	],
	variables: {
		_id: {
			list: false,
			required: true,
			type: 'ID'
		},
		deleteRepo: {
			list: false,
			required: false,
			type: 'Boolean'
		}
	}
});


const GQL_QUERY_INTERFACES_WITH_COLLECTION = query({
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
			type: 'String'
		}
	},
});


const GQL_QUERY_LIST_REPOS = query<ListReposVariables>({
	operation: 'listRepos',
	variables: {
		id: {
			list: false,
			required: false,
			type: 'ID',
		}
	},
	fields: [
		'id'
	]
});


export default function useDeleteCollectionState({
	collectionId,
	collectionName,
	onClose
}: {
	collectionId: string
	collectionName: string
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
	}] = useManualQuery<DeleteCollectionResponseData,DeleteCollectionVariables>(GQL_MUTATION_COLLECTION_DELETE.query);

	const fetchDeleteCollectionAndClose = async () => {
		const {
			data: localDataDeleteCollection,
		} = await fetchDeleteCollection({
			variables: {
				_id: collectionId,
				deleteRepo
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

	const [fetchRepoList] = useManualQuery<ListReposResponseData, ListReposVariables>(
		GQL_QUERY_LIST_REPOS.query,
		{
			variables: {
				id: `${COLLECTION_REPO_PREFIX}${collectionName}`
			}
		}
	);
	const [hasRepo, setHasRepo] = React.useState<boolean>();
	const [deleteRepo, setDeleteRepo] = React.useState(false);

	//──────────────────────────────────────────────────────────────────────────
	// Init
	//──────────────────────────────────────────────────────────────────────────
	useWhenInitAsync(() => {
		fetchInterfacesWithCollection();
		fetchRepoList().then(({
			data: {
				listRepos
			}}) => {
			setHasRepo(listRepos.length > 0);
		});
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
		deleteRepo, setDeleteRepo,
		fetchDeleteCollectionAndClose,
		hasRepo,
		loading,
		loadingDeleteCollection,
		usedInInterfaces,
	};
}
