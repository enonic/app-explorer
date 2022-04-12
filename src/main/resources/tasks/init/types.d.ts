export interface NodeWithType {
	_id :string
	_nodeType :string
	_path :string
	type :string
}

export interface InterfaceNodeFilter {
	filter? :'exists'|'hasValue'|'notExists'
	params? :{
		field? :string
	}
}

export interface InterfaceNodeWithFilter {
	_id :string
	//_path :string
	filters: {
		must?: InterfaceNodeFilter | Array<InterfaceNodeFilter>
		mustNot?: InterfaceNodeFilter | Array<InterfaceNodeFilter>
		should?: InterfaceNodeFilter | Array<InterfaceNodeFilter>
	},
	query? :string
}

export interface InterfaceNodeWithQuery {
	_id :string
	//_path :string
	query :unknown
}

export interface InterfaceNodeWithResultMappings {
	_id :string
	//_path :string
	resultMappings :unknown
}

export interface InterfaceNodeWithFacets {
	_id :string
	//_path :string
	facets :unknown
}

export interface InterfaceNodeWithPagination {
	_id :string
	//_path :string
	pagination :unknown
}

export interface InterfaceNodeWithThesauri {
	_id :string
	//_path :string
	thesauri :unknown
}
