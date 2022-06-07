//import type {InterfaceField} from '/lib/explorer/types/index.d';
import type {DropdownItemProps} from 'semantic-ui-react/index.d';


export type GlobalFieldObject = Record<string, true>;

export type InterfaceNamesObj = Record<string, boolean>;

export type NewOrEditInterfaceProps = {
	// Required
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
