import type {ApiKey} from '../../../types/ApiKey.d';


export type ApiKeyFormValues = {
	collections :Array<string>
	interfaces :Array<string>
	key ?:string
}


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
