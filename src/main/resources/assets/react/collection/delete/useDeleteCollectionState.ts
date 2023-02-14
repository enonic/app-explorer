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
			//value:
		}
	},
});


export default function useDeleteCollectionState({
	collectionId,
}: {
	collectionId: string
}) {
	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [open, setOpen] = React.useState(false);
	const [usedInInterfaces, setUsedInInterfaces] = React.useState<string[]>([]);

	const [fetchInterfacesWithCollection,{
		// loading,
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
		setUsedInInterfaces(data.queryInterfaces.hits.map(({_name}) => _name));
	}, [data]);

	//──────────────────────────────────────────────────────────────────────────
	// Returns
	//──────────────────────────────────────────────────────────────────────────
	return {
		open, setOpen,
		usedInInterfaces,
	};
}
