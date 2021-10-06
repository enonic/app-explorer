import {
	Button,
	Icon,
	Modal,
	Popup
} from 'semantic-ui-react';
import {DeleteItemButton} from 'semantic-ui-react-form/buttons/DeleteItemButton';

import {fetchHasField} from '../../../services/graphQL/fetchers/fetchHasField';


export function RemoveFieldFromDocumentTypeModal({
	afterClose = () => {
		//console.debug('RemoveFieldFromDocumentTypeModal default afterClose');
	},
	collections = [], // optional
	index,
	interfaces = [],  // optional
	disabled = false,
	name,
	beforeOpen = () => {
		//console.debug('RemoveFieldFromDocumentTypeModal default beforeOpen');
	},
	path,
	servicesBaseUrl
}) {
	//console.debug('collections', collections);
	//console.debug('interfaces', interfaces);
	//console.debug('name', name);
	// State
	const [open, setOpen] = React.useState(false);
	const [fieldHasValueInDocumentsTotal, setFieldHasValueInDocumentsTotal] = React.useState('...fetching count...');

	const doClose = () => {
		//console.debug('RemoveFieldFromDocumentTypeModal doClose');
		setOpen(false);
		afterClose();
	};

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		//console.debug('RemoveFieldFromDocumentTypeModal doOpen');
		beforeOpen();
		fetchHasField({
			handleData(data) {
				//console.debug('data', data);
				setFieldHasValueInDocumentsTotal(data.hasField.total);
			},
			url: `${servicesBaseUrl}/graphQL` ,
			variables: {
				collections,
				field: name,
				filters: {
					boolean: {
						must: {
							hasValue: {
								field: '_nodeType',
								values: [
									'com.enonic.app.explorer:document'
								]
							}
						}
					}
				}
			}
		});
		setOpen(true);
	};

	/*React.useEffect(() => {
		// This is run upon definition
		console.debug('RemoveFieldFromDocumentTypeModal useEffect');
	}, []);*/

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		size='large'
		trigger={<Popup
			content={`Delete field ${name}?`}
			inverted
			trigger={<Button disabled={disabled} icon onClick={doOpen}>
				<Icon color='red' name='alternate outline trash'/>
			</Button>}/>}
	>
		<Modal.Header>{`Remove field ${name}?`}</Modal.Header>
		<Modal.Content>
			<p>If there are any graphql clients out there, which use this field, deleting it will cause the very next query to throw an error!</p>
			<p>Deactivating a field is safe, and a better option, unless you are certain the field is not in use...</p>
			<p>This documentType is used by the following...</p>

			<h4>Interfaces</h4>
			<ul>{interfaces.sort().map((c, i) => <li key={i}>{c}</li>)}</ul>

			<h4>Collections</h4>
			<ul>{collections.sort().map((c, i) => <li key={i}>{c}</li>)}</ul>

			<h4>Documents</h4>
			<p>This field is present in {fieldHasValueInDocumentsTotal} documents!</p>
			<Button.Group>
				<DeleteItemButton
					index={index}
					negative
					path={path}
				><Icon color='white' name='alternate outline trash'/> Remove </DeleteItemButton>
				<Button.Or/>
				<Button icon onClick={doClose} positive> Cancel <Icon color='white' name='cancel'/></Button>
			</Button.Group>
		</Modal.Content>
	</Modal>;
} // RemoveFieldFromDocumentTypeModal
