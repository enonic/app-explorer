import {Button, Icon, Input, Message, Modal} from 'semantic-ui-react';


const GQL_SCHEMA_DELETE = `mutation DeleteSchemaMutation($_id: String!) {
  deleteSchema(_id: $_id) {
    _id
  }
}`;


export function DeleteSchemaModal({
	_id,
	_name,
	afterClose = () => {},
	disabled = false,
	onOpen = () => {},
	servicesBaseUrl
}) {
	const [open, setOpen] = React.useState(false);
	const [deleteNameMatches, setDeleteNameMatches] = React.useState(false);
	const [typedSchemaName, setTypedSchemaName] = React.useState('');
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
		<Modal.Header>Delete schema {_name}</Modal.Header>
		<Modal.Content>
			<Input
				error={!deleteNameMatches}
				onChange={(event, {value}) => {
					//console.debug({name, value});
					setDeleteNameMatches(_name === value);
					setTypedSchemaName(value);
				}}
				placeholder='Please input name'
				value={typedSchemaName}
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
							query: GQL_SCHEMA_DELETE,
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
} // DeleteSchemaModal
