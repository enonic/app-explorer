import {
	Button,
	Icon,
	Loader,
	Modal
} from 'semantic-ui-react';
import {getEnonicContext} from 'semantic-ui-react-form/Context';
import {deleteItem} from 'semantic-ui-react-form/actions';

import {fetchHasField} from '../../../services/graphQL/fetchers/fetchHasField';
// import {ButtonDelete} from '../components/ButtonDelete';


export function RemoveFieldFromDocumentTypeModal({
	documentTypeName,
	collectionsArr = [], // optional
	interfacesArr = [],  // optional
	onClose, // Required!
	servicesBaseUrl,
	active = true, //Should get its active state from prop
	state: {
		global,
		index,
		name,
		open,
		path
	}
}) {
	//console.debug('collectionsArr', collectionsArr);
	//console.debug('interfacesArr', interfacesArr);
	//console.debug('name', name);
	const [isLoading, setIsLoading] = React.useState(true);
	const [fieldHasValueInDocumentsTotal, setFieldHasValueInDocumentsTotal] = React.useState(undefined);
	// console.debug('fieldHasValueInDocumentsTotal', fieldHasValueInDocumentsTotal);

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
				setFieldHasValueInDocumentsTotal(data.hasField.total);
				setIsLoading(false);
			},
			url: `${servicesBaseUrl}/graphQL` ,
			variables: {
				collections: collectionsArr,
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
			? `Remove ${name} from ${documentTypeName}`
			: `Delete ${name}?`}
		</Modal.Header>
		<Modal.Content>
			{global ? null : <>
				<p>If there are any graphql clients out there, which use this local field, deleting it will cause the very next query to throw an error!</p>
				<p>Deactivating a field is safe, and a better option, unless you are certain the field is not in use...</p>
			</>}
			{fieldHasValueInDocumentsTotal > 0 ?
				<>
					<p>This documentType is used by the following...</p>

					<h4>Interfaces</h4>
					{interfacesArr.length ? (
						<ul>
							{interfacesArr.sort().map((c, i) => (
								<li key={i}>{c}</li>
							))}
						</ul>
					) : "none"}

					<h4>Collections</h4>
					{collectionsArr.length ? (
						<ul>
							{collectionsArr.sort().map((c, i) => (
								<li key={i}>{c}</li>
							))}
						</ul>
					) : "none"}
				</>
				: null}

			{isLoading ?
				<Loader active inline /> : <>
					{fieldHasValueInDocumentsTotal > 0 ? <>
						<h4>Documents</h4>
						<p>This field is present in {fieldHasValueInDocumentsTotal} documents!</p>
					</> : null}
				</>
			}
		</Modal.Content>
		<Modal.Actions>
			{active && !global ?
				<Button
					color='blue'
					floated='left'
					onClick={() => {
						//TODO Deactivate field here
						onClose();
					}}>
						Deactivate
				</Button>
				: null
			}
			<Button onClick={() => onClose()}>Cancel</Button>
			<Button
				icon='true'
				color='red'
				disabled={isLoading}
				onClick={() => {
					dispatch(deleteItem({
						index,
						path
					}));
					onClose();
				}}>
				<Icon color='white' name='trash alternate outline'/>
				{global ? 'Remove': 'Delete'}
			</Button>
		</Modal.Actions>
	</Modal>;
} // RemoveFieldFromDocumentTypeModal
