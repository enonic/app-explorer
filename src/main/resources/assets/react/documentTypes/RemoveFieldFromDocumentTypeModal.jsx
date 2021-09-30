import {
	Button,
	Icon,
	Modal,
	Popup
} from 'semantic-ui-react';
import {fetchHasField} from '../../../services/graphQL/fetchers/fetchHasField';

export function RemoveFieldFromDocumentTypeModal({
	afterClose = () => {
		//console.debug('RemoveFieldFromDocumentTypeModal default afterClose');
	},
	collections = [], // optional
	disabled = false,
	name,
	beforeOpen = () => {
		//console.debug('RemoveFieldFromDocumentTypeModal default beforeOpen');
	},
	servicesBaseUrl
}) {
	//console.debug('collections', collections);
	//console.debug('name', name);
	// State
	const [open, setOpen] = React.useState(false);

	const doClose = () => {
		//console.debug('RemoveFieldFromDocumentTypeModal doClose');
		setOpen(false);
		afterClose();
	};

	const doOpen = () => {
		//console.debug('RemoveFieldFromDocumentTypeModal doOpen');
		beforeOpen();
		fetchHasField({
			handleData(data) {
				console.debug('data', data);
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
		onClose={doClose}
		onOpen={() => {
			//console.debug('RemoveFieldFromDocumentTypeModal onOpen');
		}}
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
		</Modal.Content>
	</Modal>;
} // RemoveFieldFromDocumentTypeModal
