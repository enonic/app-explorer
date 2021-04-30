import getIn from 'get-value';
import {
	Button, Form, Header, Icon, Modal, Popup
} from 'semantic-ui-react';

import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';
import {Input} from 'semantic-ui-react-form/inputs/Input';

import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';
//import {ValidateFormButton} from 'semantic-ui-react-form/buttons/ValidateFormButton';
//import {VisitAllButton} from 'semantic-ui-react-form/buttons/VisitAllButton';

import {CustomInstructionOptions} from './CustomInstructionOptions';
import {EditValues} from './EditValues';


function notStartWithUnderscore(value) {
	return value.startsWith('_') ? "Can't start with underscore!" : undefined;
}

function required(value) {
	return value ? undefined : 'Required!';
}


const SCHEMA = {
	displayName: (value) => required(value),
	fieldType: (value) => required(value),
	instruction: (value) => required(value),
	key: (value) => required(value) || notStartWithUnderscore(value)
};


export function NewOrEditModal(props) {
	const {
		disabled = false,
		field,
		initialValues = {
			description: '',
			displayName: '',
			fieldType: 'text',
			key: '',
			instruction: 'type',
			decideByType: true,
			enabled: true,
			fulltext: true,
			includeInAllText: true,
			nGram: true, // node._indexConfig.default.nGram uses uppercase G in nGram
			path: false
		},
		onClose,
		servicesBaseUrl
	} = props;
	const editMode = !!initialValues.displayName;

	const [open, setOpen] = React.useState(false);

	const doClose = () => {
		setOpen(false); // This needs to be before unmount.
		onClose(); // This could trigger render in parent, and unmount this Component.
	}

	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		trigger={editMode ? <Popup
			content={`Edit field ${initialValues.displayName}`}
			inverted
			trigger={<Button
				icon
				disabled={disabled}
				onClick={() => setOpen(true)}
			><Icon color='blue' name='edit'/></Button>}/>
			: <Button
				circular
				color='green'
				disabled={disabled}
				icon
				onClick={() => setOpen(true)}
				size='massive'
				style={{
					bottom: 13.5,
					position: 'fixed',
					right: 13.5
				}}><Icon
					name='plus'
				/></Button>}
	>
		<Modal.Header>{editMode ? `Edit field ${initialValues.displayName}`: 'New field'}</Modal.Header>
		<Modal.Content>
			<EnonicForm
				initialValues={initialValues}
				onSubmit={(values) => {
					//console.debug('NewOrEditModal onSubmit values', values);
					fetch(`${servicesBaseUrl}/field${editMode ? 'Modify' : 'Create'}?json=${JSON.stringify(values)}`, {
						method: 'POST'
					}).then(response => {
						doClose();
					})
				}}
				schema={SCHEMA}
			>
				<Form autoComplete='off'>
					{editMode ? null : <Form.Field>
						<Input
							label={{basic: true, content: 'Name'}}
							path='key'
						/>
					</Form.Field>}
					<Form.Field>
						<Input
							label={{basic: true, content: 'Display name'}}
							path='displayName'
						/>
					</Form.Field>
					<Form.Field>
						<Input
							label={{basic: true, content: 'Description'}}
							path='description'
						/>
					</Form.Field>
					<Form.Field>
						<Dropdown
							fluid
							path='fieldType'
							options={[{
								key: 'text',
								text: 'Text', // String?
								value: 'text'
							},{
								key: 'boolean',
								text: 'Boolean',
								value: 'boolean'
							},{
								key: 'double', // float
								text: 'Double (Double-precision 64-bit IEEE 754 floating point.)',
								value: 'double'
							},{
								key: 'long', // int
								text: 'Long (64-bit two’s complement integer.)',
								value: 'long'
							},{
								key: 'geoPoint',
								text: 'GeoPoint',
								value: 'geoPoint'
							},{
								key: 'instant',
								text: 'Instant - An ISO-8601-formatted instant (e.g \'2011-12-03T10:15:30Z\')',
								value: 'instant'
							},{
								key: 'localDate',
								text: 'LocalDate - A ISO local date-time string (e.g \'2011-12-03\')',
								value: 'localDate'
							},{
								key: 'localDateTime',
								text: 'LocalDateTime - A local date-time string (e.g \'2007-12-03T10:15:30\')',
								value: 'localDateTime'
							},{
								key: 'localTime',
								text: 'LocalTime - A ISO local date-time string (e.g \'10:15:30\')',
								value: 'localTime'
							},/*{
								key: 'reference',
								text: 'Reference',
								value: 'reference'
							},*/{
								key: 'tag',
								text: 'Tag', // deprecate?
								value: 'tag'
							},{
								key: 'uri',
								text: 'Uri', // deprecate?
								value: 'uri'
							},{
								key: 'html',
								text: 'HTML', // deprecate?
								value: 'html'
							},/*{
								key: 'xml',
								text: 'XML',
								value: 'xml'
							},*/{
								key: 'base64',
								text: 'Base64 encoded data', // deprecate?
								value: 'base64'
							}]}
							search
							selection
						/>
					</Form.Field>
					<Form.Field>
						<Dropdown
							fluid
							path='instruction'
							options={[{
								key: 'type',
								text: 'type (default) - Indexing is done based on type; e.g numeric values are indexed as both string and numeric.',
								value: 'type'
							},{
								key: 'minimal',
								text: 'minimal - Value is indexed as a string-value only, no matter what type of data.',
								value: 'minimal'
							},{
								key: 'none',
								text: 'none - Value is not indexed.',
								value: 'none'
							},{
								key: 'fulltext',
								text: 'fulltext - Values are stored as ‘nGrm’, ‘analyzed’ and also added to the _allText-field',
								value: 'fulltext'
							},{
								key: 'path',
								text: 'path - Values are stored as ‘path’ type and applicable for the pathMatch-function',
								value: 'path'
							},{
								key: 'custom',
								text: 'custom - use settings below',
								value: 'custom'
							}]}
							search
							selection
						/>
					</Form.Field>
					<CustomInstructionOptions/>
					<SubmitButton/>
					<ResetButton/>
					{/*<VisitAllButton/>*/}
					{/*<ValidateFormButton/>*/}
				</Form>
			</EnonicForm>
			{editMode && <>
				<Header as='h2' content='Values'/>
				<EditValues
					field={field}
					servicesBaseUrl={servicesBaseUrl}
				/>
			</>}
		</Modal.Content>
	</Modal>;
} // NewOrEditModal
