import {Modal} from 'semantic-ui-react';

import {NewOrEditDocumentType} from './NewOrEditDocumentType';

export function NewOrEditDocumentTypeModal({
	_id, // optional
	_name, // optional
	collections = [], // optional
	interfaces = [], // optional
	onClose = () => {},
	onMount = () => {},
	open = false,
	servicesBaseUrl
}) {
	// TODO get name from id
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
			collections={collections}
			interfaces={interfaces}
			doClose={onClose}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</Modal>;
} // NewOrEditDocumentTypeModal
