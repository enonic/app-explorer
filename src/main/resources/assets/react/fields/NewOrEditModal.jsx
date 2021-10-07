import {VALUE_TYPE_STRING} from '@enonic/js-utils';
import {Button, Form, Icon, Modal, Popup} from 'semantic-ui-react';
import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
import {Input} from 'semantic-ui-react-form/inputs/Input';

import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';
//import {ValidateFormButton} from 'semantic-ui-react-form/buttons/ValidateFormButton';
//import {VisitAllButton} from 'semantic-ui-react-form/buttons/VisitAllButton';

import {GQL_MUTATION_FIELD_CREATE} from '../../../services/graphQL/field/mutationFieldCreate';
import {GQL_MUTATION_FIELD_UPDATE} from '../../../services/graphQL/field/mutationFieldUpdate';

import {mustStartWithALowercaseLetter} from '../utils/mustStartWithALowercaseLetter';
import {onlyLettersDigitsUnderscoresAndDots} from '../utils/onlyLettersDigitsUnderscoresAndDots';
import {notDoubleUnderscore} from '../utils/notDoubleUnderscore';
import {notDoubleDot} from '../utils/notDoubleDot';

import {EditFieldTable} from './EditFieldTable';


function notDocumentMetaData(value) {
	if (value === 'document_metadata') {
		return "Can't be document_metadata";
	} else if (value.startsWith('document_metadata.')) {
		return "Can't start with document_metadata.";
	}
	return undefined;
}


function required(value) {
	return value ? undefined : 'Required!';
}


export function NewOrEditModal(props) {
	const {
		_id, // Props because not allowed to change
		disabled = false,
		//field,
		initialValues = {
			description: '',
			fieldType: VALUE_TYPE_STRING,
			key: '',
			min: 0,
			max: 0,
			decideByType: true,
			enabled: true,
			fulltext: true,
			includeInAllText: true,
			nGram: true, // node._indexConfig.default.nGram uses uppercase G in nGram
			path: false
		},
		afterClose = () => {},
		beforeOpen = () => {},
		servicesBaseUrl,
		usedFieldKeysObj = {}
	} = props;
	const editMode = !!initialValues.key;

	const [open, setOpen] = React.useState(false);

	const doClose = () => {
		setOpen(false); // This needs to be before unmount.
		afterClose(); // This could trigger render in parent, and unmount this Component.
	};

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		beforeOpen();
		setOpen(true);
	};

	function mustBeUnique(v) {
		//console.debug(`mustBeUnique(${v}) usedFieldKeysObj:`, usedFieldKeysObj, ` usedFieldKeysObj[${v}]:`, usedFieldKeysObj[v]);
		if (usedFieldKeysObj[v]) {
			return `Name must be unique: Name '${v}' is already in use!`;
		}
	}

	const schema = {
		//fieldType: (value) => required(value), // No need to validate this as it has a default value
	};
	if (!_id) { // No need to validate key on edit, since key is uneditable...
		schema.key = (v) => required(v)
			|| mustStartWithALowercaseLetter(v)
			|| onlyLettersDigitsUnderscoresAndDots(v)
			|| notDoubleUnderscore(v)
			|| notDoubleDot(v)
			|| notDocumentMetaData(v)
			|| mustBeUnique(v);
	}

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		size='large'
		trigger={editMode ? <Popup
			content={`Edit field ${initialValues.key}`}
			inverted
			trigger={<Button
				icon
				disabled={disabled}
				onClick={doOpen}
			><Icon color='blue' name='edit'/></Button>}/>
			: <Button
				circular
				color='green'
				disabled={disabled}
				icon
				onClick={doOpen}
				size='massive'
				style={{
					bottom: 13.5,
					position: 'fixed',
					right: 13.5
				}}><Icon
					name='plus'
				/></Button>}
	>
		<Modal.Header>{editMode ? `Edit field ${initialValues.key}`: 'New field'}</Modal.Header>
		<EnonicForm
			initialValues={initialValues}
			onSubmit={(values) => {
				console.debug('NewOrEditModal onSubmit values', values);
				fetch(`${servicesBaseUrl}/graphQL`, {
					method: 'POST',
					headers: {
						'Content-Type':	'application/json'
					},
					body: JSON.stringify({
						query: _id ? GQL_MUTATION_FIELD_UPDATE : GQL_MUTATION_FIELD_CREATE,
						variables: {
							...values,
							_id
						}
					})
				}).then((response) => {
					if (response.status === 200) {
						doClose();
					}
				});
			}}
			schema={schema}
		>
			<Modal.Content>
				<Form autoComplete='off'>
					{editMode ? null : <Form.Field>
						<Input
							label={{basic: true, content: 'Name'}}
							path='key'
						/>
					</Form.Field>}

					<Form.Field>
						<Input
							label={{basic: true, content: 'Description'}}
							path='description'
						/>
					</Form.Field>
					<EditFieldTable/>
				</Form>
			</Modal.Content>
			<Modal.Actions>
				<Button onClick={doClose}>Cancel</Button>
				{/*<VisitAllButton/>*/}
				{/*<ValidateFormButton/>*/}
				<ResetButton secondary/>
				<SubmitButton primary><Icon name='save'/>Save</SubmitButton>
			</Modal.Actions>
		</EnonicForm>
	</Modal>;
} // NewOrEditModal
