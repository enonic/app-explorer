import {
	Button, Header, Icon, Modal, Popup, Table
} from 'semantic-ui-react';


// NOTE: Must resolve transpile- and bundle- time.
import {GQL_MUTATION_DELETE_SYNONYM} from '../../../services/graphQL/synonym/mutationDeleteSynonym';


export function DeleteSynonym(props) {
	//console.debug('DeleteSynonym props', props);
	const {
		_id,
		afterClose = () => {},
		beforeOpen = () => {},
		from,
		servicesBaseUrl,
		to
	} = props;
	console.debug('DeleteSynonym id', _id);

	const [open, setOpen] = React.useState(false);

	function doClose() {
		setOpen(false); // This needs to be before unmount.
		afterClose(); // This could trigger render in parent, and unmount this Component.
	}

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		beforeOpen();
		setOpen(true);
	};

	const [state, setState] = React.useState({
		modalHeader: 'Delete synonym?',
		modalContentHeader: 'Do you really want to delete this synonym?',
		buttonDisabled: false,
		buttonIcon: 'trash alternate outline',
		buttonLoading: false,
		buttonText: 'Confirm Delete',
		buttonOnClick: () => {
			setState(prev => {
				const next = JSON.parse(JSON.stringify(prev));
				next.buttonDisabled = true;
				next.buttonLoading = true;
				return next;
			});
			//setButtonText('Deleting...');
			fetch(`${servicesBaseUrl}/graphQL`, {
				method: 'POST',
				headers: {
					'Content-Type':	'application/json'
				},
				body: JSON.stringify({
					query: GQL_MUTATION_DELETE_SYNONYM,
					variables: {
						_id
					}
				})
				//
			}).then(response => {
				//console.debug(response);
				if (response.status == 200) {
					setState(prev => {
						const next = JSON.parse(JSON.stringify(prev));
						next.modalHeader = 'Synonym deleted';
						next.modalContentHeader = '';
						next.buttonDisabled = false;
						next.buttonIcon = 'close';
						next.buttonLoading = false;
						next.buttonText = 'Click to close dialogue';
						next.buttonOnClick = () => {
							doClose();
						};
						return next;
					});
				} else {
					setState(prev => {
						const next = JSON.parse(JSON.stringify(prev));
						next.modalHeader = 'Failed to delete synonym!';
						next.modalContentHeader = '';
						next.buttonDisabled = false;
						next.buttonIcon = 'close';
						next.buttonLoading = false;
						next.buttonText = 'Click to close dialogue';
						next.buttonOnClick = () => {
							doClose();
						};
						return next;
					});
				}
			});
		}
	});

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		trigger={<Popup
			content='Delete synonym'
			inverted
			trigger={<Button
				icon
				onClick={doOpen}
			><Icon color='red' name='trash alternate outline'/></Button>}/>}
	>
		<Modal.Header>{state.modalHeader}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>{state.modalContentHeader}</Header>
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
				disabled={state.buttonDisabled}
				loading={state.buttonLoading}
				onClick={state.buttonOnClick}
				size='tiny'
			><Icon color='red' name={state.buttonIcon}/>{state.buttonText}</Button>
		</Modal.Content>
	</Modal>;
} // DeleteSynonym
