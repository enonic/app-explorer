import type {
	DocumentType,
	DocumentTypeField,
	DocumentTypeFields
} from '/lib/explorer/types/index.d';


export type DocumentTypesComponentParams = {
	servicesBaseUrl :string
}

export type NewOrEditDocumentTypeModalComponentParams = {
	// Required
	documentTypes :DocumentTypesObj
	servicesBaseUrl :string
	setModalState :React.Dispatch<React.SetStateAction<DocumentTypeModal>>
	// Optional
	_id ?:string
	_name ?:string
	open ?:boolean
	onClose ?:() => void
	onMount ?:() => void
}

export type NewOrEditDocumentTypeComponentParams = {
	// Required
	documentTypes :DocumentTypesObj
	servicesBaseUrl :string
	setModalState :React.Dispatch<React.SetStateAction<DocumentTypeModal>>
	// Optional
	_id ?:string
	_name ?:string
	doClose ?:() => void
}

export type DocumentTypesObj = Record<string, Omit<
	DocumentType, 'properties'
> & {
	activeProperties :DocumentType['properties']
	activePropertyNames :Array<string>
	collectionsNames :Array<string>
	collections :Array<{
		name :string
		docCount :number
	}>
	documentsInTotal :number
}>

export type DocumentTypeModal = {
	_id ?:string
	_name ?:string
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
		index :number,
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
