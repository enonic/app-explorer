import {
	INDEX_CONFIG_N_GRAM,
	VALUE_TYPE_STRING
} from '@enonic/js-utils';
import {Button, Form, Icon, Modal, Popup} from 'semantic-ui-react';
import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
import {Input} from 'semantic-ui-react-form/inputs/Input';
import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';
//import {ValidateFormButton} from 'semantic-ui-react-form/buttons/ValidateFormButton';
//import {VisitAllButton} from 'semantic-ui-react-form/buttons/VisitAllButton';

import {GQL_MUTATION_FIELD_CREATE} from '../../../services/graphQL/mutations/fieldCreateMutation';
import {GQL_MUTATION_FIELD_UPDATE} from '../../../services/graphQL/mutations/fieldUpdateMutation';

import {mustStartWithALowercaseLetter} from '../utils/mustStartWithALowercaseLetter';
import {notDocumentMetaData} from '../utils/notDocumentMetaData';
import {notDoubleDot} from '../utils/notDoubleDot';
import {onlyLettersDigitsUnderscoresAndDots} from '../utils/onlyLettersDigitsUnderscoresAndDots';
import {notDoubleUnderscore} from '../utils/notDoubleUnderscore';
import {required} from '../utils/required';
import {EditFieldTable} from './EditFieldTable';


export function NewOrEditModal(props) {
	const {
		_id, // Props because not allowed to change
		afterClose = () => {},
		beforeOpen = () => {},
		disabled = false,
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
			[INDEX_CONFIG_N_GRAM]: true,
			path: false
		},
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
		size='large' // small becomes too narrow for field options table
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
		<Modal.Header
			as='h1'
			className='ui' // Too make it appear large
		>{editMode ? 'Edit': 'New'} field</Modal.Header>
		<EnonicForm
			initialValues={initialValues}
			onSubmit={(values) => {
				//console.debug('NewOrEditModal onSubmit values', values);
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
					<Form.Field>
						<Input
							disabled={editMode}
							label={{basic: true, content: 'Name'}}
							path='key'
						/>
					</Form.Field>
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
				<ResetButton secondary/>
				<SubmitButton primary><Icon name='save'/>Save</SubmitButton>
			</Modal.Actions>
		</EnonicForm>
	</Modal>;
} // NewOrEditModal
