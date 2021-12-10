import {Modal} from "semantic-ui-react";
import {NewOrEditDocumentType} from "./NewOrEditDocumentType";

export function NewOrEditDocumentTypeModal({
	_id = undefined, // optional
	_name = undefined, // optional
	collectionsArr = [], // optional
	interfacesArr = [], // optional
	open = false,
	onClose = () => {},
	onMount = () => {},
	setModalState,
	servicesBaseUrl,
	documentTypes
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
