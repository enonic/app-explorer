import {
	Button, Header, Icon, Message, Modal, Popup
} from 'semantic-ui-react';

import{GQL_MUTATION_FIELD_DELETE} from '../../../services/graphQL/field/mutationFieldDelete';


export function DeleteModal(props) {
	const {
		_id,
		_name,
		afterClose = () => {},
		beforeOpen = () => {},
		disabled = false,
		fieldCollections = [],
		fieldDocumentTypes = [],
		popupContent,
		servicesBaseUrl
	} = props;
	const [open, setOpen] = React.useState(false);
	/*const [referencedByRes, setReferencedByRes] = React.useState(false);

	React.useEffect(() => {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify({
				query: `query QueryReferencedBy(
  $_id: ID!
) {
  referencedBy(_id: $_id) {
    count
    hits {
      _id
      _name
      _nodeType
      _path
      _score
    }
    total
  }
}`,
				variables: {
					_id
				}
			})
		})
	}, []);*/

	const doClose = () => {
		setOpen(false);
		afterClose();
	};

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		beforeOpen();
		setOpen(true);
	};

	const inUse = fieldDocumentTypes.length || fieldCollections.length;

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		size='tiny'
		trigger={<Popup
			content={popupContent}
			trigger={<div style={{ display: "inline-block" }}>
				<Button
					icon
					disabled={disabled}
					onClick={doOpen}>
					<Icon color='red' name='trash alternate outline'/>
				</Button>
			</div>
			}/>}
	>
		<Modal.Header><Header as='h1'>Delete Global field</Header></Modal.Header>
		<Modal.Content>
			<Header as='h2'>Name: {_name}</Header>
			{inUse ? <>
				<Header as='h3'>Used in:</Header>
				{fieldDocumentTypes.length
					? <>
						<Header as='h5'>Document types:</Header>
						<ul>{fieldDocumentTypes.sort().map((dT, i) => <li key={i}>{dT}</li>)}</ul>
					</>
					: null}
				{fieldCollections.length
					? <>
						<Header as='h5'>Collections:</Header>
						<ul>{fieldCollections.sort().map((c, i) => <li key={i}>{c}</li>)}</ul>
					</>
					: null}
				<Message
					error
					icon
				>
					<Icon name='warning sign' />
					<Message.Content>You are not allowed to delete a global field that is in use.</Message.Content>
				</Message>
			</> : <p>Do you really want to delete the global field {_name}?</p>}
		</Modal.Content>
		<Modal.Actions>
			{inUse
				? <Button onClick={() => {setOpen(false);}}>Close</Button>
				: <>
					<Button onClick={doClose}>Cancel</Button>
					<Button
						icon
						onClick={() => {
							fetch(`${servicesBaseUrl}/graphQL`, {
								method: 'POST',
								headers: {
									'Content-Type':	'application/json'
								},
								body: JSON.stringify({
									query: GQL_MUTATION_FIELD_DELETE,
									variables: {
										_id
									}
								})
							}).then((/*response*/) => {
								//if (response.status === 200) {}
								doClose();
							});
						}}
						primary
					><Icon name='trash alternate outline'/> Confirm Delete</Button>
				</>
			}

		</Modal.Actions>
	</Modal>;
} // DeleteModal
