import type {NewOrEditDocumentTypeModalComponentParams} from './index.d';


//import * as React from 'react';
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
	open = false,
	onClose = () => {/**/},
	onMount = () => {/**/}
} :NewOrEditDocumentTypeModalComponentParams) {
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
			doClose={onClose}
			servicesBaseUrl={servicesBaseUrl}
			setModalState={setModalState}
			documentTypes={documentTypes}
		/>
	</Modal>;
} // NewOrEditDocumentTypeModal
