import {Button, Icon, Input, Message, Modal} from 'semantic-ui-react';

import {GQL_MUTATION_DELETE_DOCUMENT_TYPE} from '../../../services/graphQL/documentType/mutationDeleteDocumentType';


export function DeleteDocumentTypeModal({
	_id,
	_name,
	afterClose = () => {
		//console.debug('DeleteDocumentTypeModal default afterClose');
	},
	disabled = false,
	beforeOpen = () => {
		//console.debug('DeleteDocumentTypeModal default beforeOpen');
	},
	servicesBaseUrl
}) {
	const [open, setOpen] = React.useState(false);
	const [deleteNameMatches, setDeleteNameMatches] = React.useState(false);
	const [typedDocumentTypeName, setTypedDocumentTypeName] = React.useState('');

	const doClose = () => {
		//console.debug('DeleteDocumentTypeModal default doClose');
		setOpen(false);
		afterClose();
	};

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		//console.debug('DeleteDocumentTypeModal default doOpen');
		beforeOpen();
		setOpen(true);
	};

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		trigger={<Button
			compact
			disabled={disabled}
			icon
			onClick={doOpen}
			size='tiny'
			type='button'
		><Icon color='red' name='trash alternate outline'/></Button>}
	>
		<Modal.Header>Delete document type {_name}</Modal.Header>
		<Modal.Content>
			<Input
				error={!deleteNameMatches}
				onChange={(event, {value}) => {
					//console.debug({name, value});
					setDeleteNameMatches(_name === value);
					setTypedDocumentTypeName(value);
				}}
				placeholder='Please input name'
				value={typedDocumentTypeName}
			/>
			{deleteNameMatches ? <Button
				compact
				onClick={() => {
					fetch(`${servicesBaseUrl}/graphQL`, {
						method: 'POST',
						headers: {
							'Content-Type':	'application/json'
						},
						body: JSON.stringify({
							query: GQL_MUTATION_DELETE_DOCUMENT_TYPE,
							variables: {
								_id
							}
						})
					})
						.then(response => {
							if (response.status === 200) {
								doClose();
							}
						});
				}}
				type='button'
			><Icon color='red' name='trash alternate outline'/>Delete</Button> : <Message
				icon='warning sign'
				header='Error'
				content="Name doesn't match!"
				negative
			/>}
		</Modal.Content>
	</Modal>;
} // DeleteDocumentTypeModal
