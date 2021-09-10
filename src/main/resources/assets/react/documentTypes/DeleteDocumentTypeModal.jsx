import {Button, Icon, Input, Message, Modal} from 'semantic-ui-react';

import {GQL_MUTATION_DELETE_DOCUMENT_TYPE} from '../../../services/graphQL/documentType/mutationDeleteDocumentType';


export function DeleteDocumentTypeModal({
	_id,
	_name,
	afterClose = () => {},
	disabled = false,
	onOpen = () => {},
	servicesBaseUrl
}) {
	const [open, setOpen] = React.useState(false);
	const [deleteNameMatches, setDeleteNameMatches] = React.useState(false);
	const [typedDocumentTypeName, setTypedDocumentTypeName] = React.useState('');
	return <Modal
		closeIcon
		onClose={() => {
			setOpen(false);
			afterClose();
		}}
		onOpen={onOpen}
		open={open}
		trigger={<Button
			compact
			disabled={disabled}
			icon
			onClick={() => setOpen(true)}
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
								setOpen(false);
								afterClose();
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
