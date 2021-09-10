import {Button, Icon, Modal, Popup} from 'semantic-ui-react';

import {NewOrEditDocumentType} from './NewOrEditDocumentType';

export function NewOrEditDocumentTypeModal({
	_id, // optional
	_name, // optional
	afterClose = () => {/*no-op*/},
	onOpen = () => {},
	servicesBaseUrl
}) {
	// TODO get name from id
	const [open, setOpen] = React.useState(false);
	const doClose = () => {
		setOpen(false);
		afterClose();
	};

	const header = _name ? `Edit document type ${_name}`: 'New document type';
	return <Modal
		closeIcon
		onClose={doClose}
		onOpen={onOpen}
		open={open}
		size='large'
		trigger={<Popup
			content={header}
			inverted
			trigger={_id ? <Button
				icon
				onClick={() => setOpen(true)}
			><Icon color='blue' name='edit'/></Button>
				: <Button
					circular
					color='green'
					icon
					onClick={() => setOpen(true)}
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
				doClose={doClose}
				servicesBaseUrl={servicesBaseUrl}
			/>
		</Modal.Content>
	</Modal>;
} // NewOrEditDocumentTypeModal
