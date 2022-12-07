//import type {InterfaceField} from '/lib/explorer/types/index.d';
import type {DropdownItemProps} from 'semantic-ui-react/index.d';


export type FieldNameToValueTypes = Record<string, string[]>
export type FieldPathToValueOptions = Record<string, {
	text: string
	value: string
}[]>

export type GlobalFieldObject = Record<string, true>;

export type InterfaceNamesObj = Record<string, boolean>;

export type NewOrEditInterfaceProps = {
	// Required
	fieldNameToValueTypesState: FieldNameToValueTypes
	//fieldOptions :Array<DropdownItemProps>
	servicesBaseUrl :string
	stopWordOptions :Array<DropdownItemProps>
	thesauriOptions :Array<DropdownItemProps>
	// Optional
	_id ?:string
	//collectionIdToFieldKeys ?:Record<string,Array<string>>
	collectionOptions ?:Array<DropdownItemProps>
	doClose ?:() => void
	//globalFieldsObj ?:GlobalFieldObject
	interfaceNamesObj ?:InterfaceNamesObj
}
