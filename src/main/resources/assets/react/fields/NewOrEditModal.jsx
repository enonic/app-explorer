import {
	INDEX_CONFIG_TEMPLATE_NONE,
	INDEX_CONFIG_TEMPLATE_BY_TYPE,
	INDEX_CONFIG_TEMPLATE_FULLTEXT,
	INDEX_CONFIG_TEMPLATE_PATH,
	INDEX_CONFIG_TEMPLATE_MINIMAL
} from '@enonic/js-utils';

//import getIn from 'get-value';
import {
	Button, Form, Header, Icon, Modal, Popup, Segment
} from 'semantic-ui-react';

import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
//import {Checkbox} from 'semantic-ui-react-form/inputs/Checkbox';
import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';
import {Input} from 'semantic-ui-react-form/inputs/Input';

import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';
//import {ValidateFormButton} from 'semantic-ui-react-form/buttons/ValidateFormButton';
//import {VisitAllButton} from 'semantic-ui-react-form/buttons/VisitAllButton';

import {GQL_MUTATION_FIELD_CREATE} from '../../../services/graphQL/field/mutationFieldCreate';
import {GQL_MUTATION_FIELD_UPDATE} from '../../../services/graphQL/field/mutationFieldUpdate';

import {CustomInstructionOptions} from './CustomInstructionOptions';


function notDocumentMetaData(value) {
	if (value === 'document_metadata') {
		return "Can't be document_metadata";
	} else if (value.startsWith('document_metadata.')) {
		return "Can't start with document_metadata.";
	}
	return undefined;
}

function notStartWithUnderscore(value) {
	return value.startsWith('_') ? "Can't start with underscore!" : undefined;
}

function required(value) {
	return value ? undefined : 'Required!';
}


const SCHEMA = {
	fieldType: (value) => required(value),
	instruction: (value) => required(value),
	key: (value) => required(value)
		|| notStartWithUnderscore(value)
		|| notDocumentMetaData(value)
};


export function NewOrEditModal(props) {
	const {
		_id, // Props because not allowed to change
		disabled = false,
		//field,
		initialValues = {
			description: '',
			fieldType: 'any',
			key: '',
			min: 0,
			max: 0,
			instruction: INDEX_CONFIG_TEMPLATE_BY_TYPE,
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
	const editMode = !!initialValues.key;

	const [open, setOpen] = React.useState(false);

	const doClose = () => {
		setOpen(false); // This needs to be before unmount.
		onClose(); // This could trigger render in parent, and unmount this Component.
	};

	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		trigger={editMode ? <Popup
			content={`Edit field ${initialValues.key}`}
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
		<Modal.Header>{editMode ? `Edit field ${initialValues.key}`: 'New field'}</Modal.Header>
		<Modal.Content>
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
				schema={SCHEMA}
			>
				<Form autoComplete='off'>
					<Segment.Group>
						<Segment>
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
						</Segment>

						<Segment>
							<Header as='h3' content='Type'/>
							<Form.Field>
								<Dropdown
									fluid
									path='fieldType'
									options={[{
										key: 'any',
										text: 'Any', // Don't validate type
										value: 'any'
									},{
										key: 'string',
										text: 'String',
										value: 'string'
									},{
										key: 'text',
										text: 'Text',
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
										key: 'set',
										text: 'Set',
										value: 'set'
									},{
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
						</Segment>

						<Segment>
							<Header as='h3' content='Occurrences'/>
							<Form.Field>
								<Popup content='>0 means required' trigger={
									<Input
										fluid
										label={{basic: true, content: 'Min'}}
										min={0}
										path='min'
										type='number'
									/>
								}/>
							</Form.Field>
							<Form.Field>
								<Popup content='0 means infinite' trigger={
									<Input
										fluid
										label={{basic: true, content: 'Max'}}
										min={0}
										path='max'
										type='number'
									/>
								}/>

							</Form.Field>
						</Segment>

						<Segment>
							<Header as='h3' content='Indexing'/>
							<Form.Field>
								<Dropdown
									fluid
									path='instruction'
									options={[{
										key: INDEX_CONFIG_TEMPLATE_BY_TYPE,
										text: `${INDEX_CONFIG_TEMPLATE_BY_TYPE} (default) - Indexing is done based on type; e.g numeric values are indexed as both string and numeric.`,
										value: INDEX_CONFIG_TEMPLATE_BY_TYPE
									},{
										key: INDEX_CONFIG_TEMPLATE_MINIMAL,
										text: 'minimal - Value is indexed as a string-value only, no matter what type of data.',
										value: INDEX_CONFIG_TEMPLATE_MINIMAL
									},{
										key: INDEX_CONFIG_TEMPLATE_NONE,
										text: 'none - Value is not indexed.',
										value: INDEX_CONFIG_TEMPLATE_NONE
									},{
										key: INDEX_CONFIG_TEMPLATE_FULLTEXT,
										text: 'fulltext - Values are stored as ‘nGrm’, ‘analyzed’ and also added to the _allText-field',
										value: INDEX_CONFIG_TEMPLATE_FULLTEXT
									},{
										key: INDEX_CONFIG_TEMPLATE_PATH,
										text: 'path - Values are stored as ‘path’ type and applicable for the pathMatch-function',
										value: INDEX_CONFIG_TEMPLATE_PATH
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
						</Segment>

						<Segment>
							<SubmitButton/>
							<ResetButton/>
						</Segment>
					</Segment.Group>
					{/*<VisitAllButton/>*/}
					{/*<ValidateFormButton/>*/}
				</Form>
			</EnonicForm>
		</Modal.Content>
	</Modal>;
} // NewOrEditModal
