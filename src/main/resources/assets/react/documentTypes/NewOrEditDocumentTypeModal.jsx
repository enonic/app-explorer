import {Button, Icon, Modal, Popup} from 'semantic-ui-react';

import {NewOrEditDocumentType} from './NewOrEditDocumentType';

export function NewOrEditDocumentTypeModal({
	_id, // optional
	_name, // optional
	afterClose = () => {
		//console.debug('NewOrEditDocumentTypeModal default afterClose');
	},
	beforeOpen = () => {
		//console.debug('NewOrEditDocumentTypeModal default beforeOpen');
	},
	collections = [], // optional
	interfaces = [], // optional
	servicesBaseUrl
}) {
	// TODO get name from id
	const [open, setOpen] = React.useState(false);
	const doClose = () => {
		//console.debug('NewOrEditDocumentTypeModal doClose');
		setOpen(false);
		afterClose();
	};

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		//console.debug('NewOrEditDocumentTypeModal doOpen');
		beforeOpen();
		setOpen(true);
	};

	const header = _name ? `Edit document type ${_name}`: 'New document type';
	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		defaultOpen={false}
		onClose={doClose}
		open={open}
		size='large'
		trigger={<Popup
			content={header}
			inverted
			trigger={_id ? <Button
				icon
				onClick={doOpen}
			><Icon color='blue' name='edit'/></Button>
				: <Button
					circular
					color='green'
					icon
					onClick={() => doOpen}
					size='massive'
					style={{
						bottom: 13.5,
						position: 'fixed',
						right: 13.5
					}}><Icon
						name='plus'
					/></Button>}/>}
	>
		<Modal.Header>{header}</Modal.Header>
		<Modal.Content>
			<NewOrEditDocumentType
				_id={_id}
				collections={collections}
				interfaces={interfaces}
				doClose={doClose}
				servicesBaseUrl={servicesBaseUrl}
			/>
		</Modal.Content>
	</Modal>;
} // NewOrEditDocumentTypeModal
