import type {QueryDocumentTypesHits} from '../../../services/graphQL/fetchers/fetchDocumentTypes';
import type {DocumentTypeModal} from './index.d';


import {Modal} from "semantic-ui-react";
import {NewOrEditDocumentType} from "./NewOrEditDocumentType";

export function NewOrEditDocumentTypeModal({
	// Required
	documentTypes,
	servicesBaseUrl,
	setModalState,
	// Optional
	_id = undefined,
	_name = undefined,
	collectionsArr = [],
	interfacesArr = [],
	open = false,
	onClose = () => {},
	onMount = () => {}
} :{
	// Required
	documentTypes :QueryDocumentTypesHits
	servicesBaseUrl :string
	setModalState :React.Dispatch<React.SetStateAction<DocumentTypeModal>>
	// Optional
	_id ?:string
	_name ?:string
	collectionsArr :Array<string>
	interfacesArr :Array<string>
	open ?:boolean
	onClose ?:() => void
	onMount ?:() => void
}) {
	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={onClose}
		onMount={onMount}
		open={open}
		size='large'
	>
		<Modal.Header as='h1' className='ui'>{_name ? `Document type: ${_name}`: 'New document type'}</Modal.Header>
		<NewOrEditDocumentType
			_id={_id}
			_name={_name}
			collectionsArr={collectionsArr}
			interfacesArr={interfacesArr}
			doClose={onClose}
			servicesBaseUrl={servicesBaseUrl}
			setModalState={setModalState}
			documentTypes={documentTypes}
		/>
	</Modal>;
} // NewOrEditDocumentTypeModal
