import {
	Button,
	Loader,
	Modal
} from 'semantic-ui-react';
import {getEnonicContext} from 'semantic-ui-react-form/Context';
import {deleteItem} from 'semantic-ui-react-form/actions';

import {fetchHasField} from '../../../services/graphQL/fetchers/fetchHasField';
import {ButtonDelete} from '../components/ButtonDelete';


export function RemoveFieldFromDocumentTypeModal({
	collections = [], // optional
	interfaces = [],  // optional
	onClose, // Required!
	servicesBaseUrl,
	state: {
		global,
		index,
		name,
		open,
		path
	}
}) {
	//console.debug('collections', collections);
	//console.debug('interfaces', interfaces);
	//console.debug('name', name);
	const [isLoading, setIsLoading] = React.useState(true);
	const [fieldHasValueInDocumentsTotal, setFieldHasValueInDocumentsTotal] = React.useState(undefined);
	console.debug('fieldHasValueInDocumentsTotal', fieldHasValueInDocumentsTotal);

	/*React.useEffect(() => {
		if(fieldHasValueInDocumentsTotal) {
			setIsLoading(false);
		}
	}, [fieldHasValueInDocumentsTotal]);*/

	// Made doOpen since onOpen doesn't get called consistently.
	const onMount = () => {
		//console.debug('RemoveFieldFromDocumentTypeModal doOpen');
		setIsLoading(true);
		fetchHasField({
			handleData(data) {
				//console.debug('data', data);
				setFieldHasValueInDocumentsTotal(data.hasField.total);
				setIsLoading(false);
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
	};

	const [context, dispatch] = getEnonicContext(); // eslint-disable-line no-unused-vars

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={onClose}
		onMount={onMount}
		open={open}
		size='small'
	>
		<Modal.Header>{global
			? `Remove override of global field ${name}`
			: `Delete local field ${name}?`}
		</Modal.Header>
		<Modal.Content>
			{global ? null : <>
				<p>If there are any graphql clients out there, which use this local field, deleting it will cause the very next query to throw an error!</p>
				<p>Deactivating a field is safe, and a better option, unless you are certain the field is not in use...</p>
			</>}
			<p>This documentType is used by the following...</p>

			<h4>Interfaces</h4>
			<ul>{interfaces.sort().map((c, i) => <li key={i}>{c}</li>)}</ul>

			<h4>Collections</h4>
			<ul>{collections.sort().map((c, i) => <li key={i}>{c}</li>)}</ul>

			<h4>Documents</h4>
			<p>This field is present in {isLoading ? <Loader active inline /> : fieldHasValueInDocumentsTotal} documents!</p>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={() => onClose()}>Cancel</Button>
			<ButtonDelete
				content={global ? `Confirm remove override of global field ${name}` : `Confirm delete local field ${name}`}
				disabled={isLoading}
				onClick={() => {
					dispatch(deleteItem({
						index,
						path
					}));
					onClose();
				}}
			/>
		</Modal.Actions>
	</Modal>;
} // RemoveFieldFromDocumentTypeModal
