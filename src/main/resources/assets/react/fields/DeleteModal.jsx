import {
	Button, Header, Icon, Modal, Popup
} from 'semantic-ui-react';

import{GQL_MUTATION_FIELD_DELETE} from '../../../services/graphQL/field/mutationFieldDelete';

export function DeleteModal(props) {
	const {
		_id,
		_name,
		disabled,
		afterClose = () => {},
		beforeOpen = () => {},
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

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		size='small'
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
		<Modal.Header>Delete global field {_name}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete the global field {_name}?</Header>
		</Modal.Content>
		<Modal.Actions>
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
			><Icon color='white' name='trash alternate outline'/> Confirm Delete</Button>
		</Modal.Actions>
	</Modal>;
} // DeleteModal
