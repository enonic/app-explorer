import {
	Button, Header, Icon, Modal, Table
} from 'semantic-ui-react';


export function DeleteSynonym(props) {
	//console.debug('DeleteSynonym props', props);
	const {
		id,
		from,
		onClose,
		servicesBaseUrl,
		thesaurusReference,
		to
	} = props;
	const [open, setOpen] = React.useState(false);
	function doOpen() { setOpen(true); }
	function doClose() {
		onClose();
		setOpen(false);
	}
	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		trigger={<Button
			compact
			onClick={() => setOpen(true)}
			size='tiny'><Icon color='red' name='trash alternate outline'/>Delete</Button>}
	>
		<Modal.Header>Delete synonym?</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete this synonym?</Header>
			<Table celled compact selectable sortable striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>From</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{from.map((v,i) => <Table.Row key={i}>
						<Table.HeaderCell>{v}</Table.HeaderCell>
					</Table.Row>)}
				</Table.Body>
			</Table>
			<Table celled compact selectable sortable striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>To</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{to.map((v,i) => <Table.Row key={i}>
						<Table.HeaderCell>{v}</Table.HeaderCell>
					</Table.Row>)}
				</Table.Body>
			</Table>
			<Button
				compact
				onClick={() => {
					fetch(`${servicesBaseUrl}/synonymDelete?id=${id}`, {
						method: 'DELETE'
					}).then(response => {
						doClose();
					})
				}}
				size='tiny'
			><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Content>
	</Modal>
} // DeleteSynonym
