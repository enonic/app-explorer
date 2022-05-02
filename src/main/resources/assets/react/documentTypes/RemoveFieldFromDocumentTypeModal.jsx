import {
	Button,
	Icon,
	Loader,
	Modal
} from 'semantic-ui-react';

import {fetchHasField} from '../../../services/graphQL/fetchers/fetchHasField';
// import {ButtonDelete} from '../components/ButtonDelete';


export function RemoveFieldFromDocumentTypeModal({
	updateOrDeleteProperties,
	collectionsArr = [], // optional
	interfacesArr = [],  // optional
	onClose, // Required!
	servicesBaseUrl,
	modalState: {
		state: state, /*{
			active,
			enabled,
			includeInAllText,
			index,
			fulltext,
			max,
			min,
			name
			nGram,
			path,
			valueType,
		}*/
		open: open
	}
}) {
	const [isLoading, setIsLoading] = React.useState(true);
	const [fieldHasValueInDocumentsTotal, setFieldHasValueInDocumentsTotal] = React.useState(undefined);

	/*React.useEffect(() => {
		if(fieldHasValueInDocumentsTotal) {
			setIsLoading(false);
		}
	}, [fieldHasValueInDocumentsTotal]);*/

	// Made doOpen since onOpen doesn't get called consistently.
	const onMount = () => {
		setIsLoading(true);
		fetchHasField({
			handleData(data) {
				setFieldHasValueInDocumentsTotal(data.hasField.total);
				setIsLoading(false);
			},
			url: `${servicesBaseUrl}/graphQL` ,
			variables: {
				collections: collectionsArr,
				field: state.name,
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

	const isFieldInUse = fieldHasValueInDocumentsTotal > 0 || interfacesArr.length > 0 || collectionsArr.length > 0;

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={onClose}
		onMount={onMount}
		open={open}
		size='small'
	>
		<Modal.Header>{`Delete ${state.name}?`}</Modal.Header>
		<Modal.Content>
			<p>If there are any graphql clients out there, which use this field, deleting it will cause the very next query to throw an error!</p>
			<p>Deactivating a field is safe, and a better option, unless you are certain the field is not in use...</p>

			{isFieldInUse ?
				<>
					<p>This documentType is used by the following...</p>

					{interfacesArr.length ? <>
						<h4>Interfaces</h4>
						<ul>
							{interfacesArr.sort().map((c, i) => (
								<li key={i}>{c}</li>
							))}
						</ul>
					</>: null}

					{collectionsArr.length ? <>
						<h4>Collections</h4>
						<ul>
							{collectionsArr.sort().map((c, i) => (
								<li key={i}>{c}</li>
							))}
						</ul>
					</> : null}
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
			{state.active ?
				<Button
					color='blue'
					floated='left'
					onClick={() => {
						let next = state;
						next.active = false;
						updateOrDeleteProperties(state, state.index);
						onClose();
					}}>
						Deactivate
				</Button>
				: null
			}
			<Button onClick={() => onClose()}>Cancel</Button>
			<Button
				content='Delete'
				icon='trash alternate outline'
				color='red'
				disabled={isLoading}
				onClick={() => {
					// Delete the current field (on save)
					updateOrDeleteProperties(null, state.index);
					onClose();
				}}
			/>
		</Modal.Actions>
	</Modal>;
} // RemoveFieldFromDocumentTypeModal
