import type {ApiKey} from '../../../types/ApiKey.d';


export type QueryApiKeysHit = {
	_id :string
	_name :string
	collections :ApiKey['collections']
	interfaces :ApiKey['interfaces']
}

export type QueryApiKeysHits = Array<QueryApiKeysHit>

export type QueryApiKeysGraph = {
	hits :QueryApiKeysHits
}

export type QueryCollectionsGraph = {
	hits :Array<{
		_name :string
	}>
}

export type QueryInterfacesGraph = {
	hits :Array<{
		_name :string
	}>
}
