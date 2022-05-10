import type {
	DocumentTypeField,
	DocumentTypeFields
} from '/lib/explorer/types/index.d';


export type DocumentTypeModal = {
	_id ?:string
	_name ?:string
	collectionsArr ?:Array<string>
	interfacesArr ?:Array<string>
	open :boolean
}

export type NewOrEditDocumentTypeState = {
	_name :string
	_versionKey ?:string
	addFields :boolean
	properties :DocumentTypeFields
}

export type AddOrEditLocalFieldModalState = {
	open :boolean,
	state? :{
		active :boolean,
		enabled :boolean,
		includeInAllText :boolean,
		index :any,
		fulltext :boolean,
		max :number,
		min :number,
		name :string,
		nGram :boolean,
		path :boolean,
		valueType :string
	}
}

export type UpdateOrDeletePropertiesFunction = (
	newValues :DocumentTypeField,
	index :number
) => void
