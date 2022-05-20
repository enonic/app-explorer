import type {PopupContentProps} from 'semantic-ui-react';
import type {SemanticShorthandItem} from 'semantic-ui-react/src/generic.d';


import * as React from 'react';
import {
	Button, Header, Icon, Message, Modal, Popup//, PopupContent
} from 'semantic-ui-react';

import{GQL_MUTATION_FIELD_DELETE} from '../../../services/graphQL/mutations/fieldDeleteMutation';


export function DeleteModal(props :{
	_id :string
	_name :string
	afterClose ?:() => void
	beforeOpen ?:() => void
	disabled ?:boolean
	fieldCollections ?:Array<string>
	fieldDocumentTypes ?:Array<string>
	popupContent ?:SemanticShorthandItem<PopupContentProps> //typeof PopupContent
	servicesBaseUrl :string
}) {
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
		<Modal.Header
			as='h1'
			className='ui' // Too make it appear large
		>Delete Global field</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Name: {_name}</Header>
			{inUse ? <>
				<Header as='h3'>Used in:</Header>
				{fieldDocumentTypes.length
					? <>
						<Header as='h5'>Document types:</Header>
						<ul>{fieldDocumentTypes.sort().map((dT :string, i :number) => <li key={i}>{dT}</li>)}</ul>
					</>
					: null}
				{fieldCollections.length
					? <>
						<Header as='h5'>Collections:</Header>
						<ul>{fieldCollections.sort().map((c :string, i :number) => <li key={i}>{c}</li>)}</ul>
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
