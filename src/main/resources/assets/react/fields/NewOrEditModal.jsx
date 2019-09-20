import getIn from 'get-value';
import setIn from 'set-value';
import {
	Button, Form, Header, Icon, Modal, Popup
} from 'semantic-ui-react';

import {Checkbox} from '../semantic-ui/react/Checkbox';
import {Dropdown} from '../semantic-ui/react/Dropdown';
import {Input} from '../semantic-ui/react/Input';

import {EditValues} from './EditValues';


function required(value) {
	return value ? undefined : 'Required!';
}


const SCHEMA = {
	displayName: (value) => required(value),
	fieldType: (value) => required(value),
	instruction: (value) => required(value),
	key: (value) => required(value)
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
			ngram: true,
			path: false
		},
		onClose,
		servicesBaseUrl
	} = props;
	const editMode = !!initialValues.displayName;

	const [dirty, setDirty] = React.useState({});
	const [errors, setErrors] = React.useState({});
	const [open, setOpen] = React.useState(false);
	const [touched, setTouched] = React.useState({});
	const [values, setValues] = React.useState(JSON.parse(JSON.stringify(initialValues)));
	const {
		description,
		displayName,
		fieldType,
		key,
		instruction,
		decideByType,
		enabled,
		fulltext,
		includeInAllText,
		ngram,
		path
	} = values;

	const doClose = () => {
		setOpen(false); // This needs to be before unmount.
		onClose(); // This could trigger render in parent, and unmount this Component.
	}
	const onReset = () => {
		setDirty({});
		setErrors({});
		setTouched({});
		setValues(JSON.parse(JSON.stringify(initialValues)));
	};
	const onOpen = () => {
		onReset();
		setOpen(true);
	};
	function onValidate() {
		const errors = {};
		Object.entries(SCHEMA).forEach(([k,v]) => {
			errors[k] = v(getIn(values, k));
		})
		console.debug('onValidate errors', errors);
		setErrors(errors);
		setTouched({
			displayName: true,
			fieldType: true,
			instruction: true,
			key: true
		});
	}

	const callbacks = {
		getError: (name) => getIn(errors, name),
		getTouched: (name) => getIn(touched, name, false),
		getValue: (name) => getIn(values, name),
		setDirty: (name, value) => {
			const old = getIn(dirty, name, false);
			if (value === old) { return; } // No need to change state, or cause render
			setDirty(prev => {
				const deref = JSON.parse(JSON.stringify(prev)); // So render gets triggered. Object.is comparison algorithm.
				return setIn(deref, name, value);
			});
		},
		setError: (name, value) => {
			const old = getIn(errors, name);
			if (value === old) { return; } // No need to change state, or cause render
			setErrors(prev => {
				const deref = JSON.parse(JSON.stringify(prev)); // So render gets triggered. Object.is comparison algorithm.
				return setIn(deref, name, value);
			});
		},
		setTouched: (name, value) => {
			const old = getIn(touched, name);
			if (value === old) { return; } // No need to change state, or cause render
			setTouched(prev => {
				const deref = JSON.parse(JSON.stringify(prev)); // So render gets triggered. Object.is comparison algorithm.
				return setIn(deref, name, value);
			});
		},
		setValue: (name, value) => {
			const old = getIn(values, name);
			if (value === old) { return; } // No need to change state, or cause render
			setValues(prev => {
				const deref = JSON.parse(JSON.stringify(prev)); // So render gets triggered. Object.is comparison algorithm.
				return setIn(deref, name, value);
			});
		}
	};

	//console.debug('NewOrEditModal render', {props, dirty, errors, open, touched, values});
	//console.debug('NewOrEditModal render values', values);

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
				onClick={onOpen}
			><Icon color='blue' name='edit'/></Button>}/>
			: <Button
				circular
				color='green'
				disabled={disabled}
				icon
				onClick={onOpen}
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
			<Form autoComplete='off'>
				{editMode ? null : <Form.Field>
					<Input
						callbacks={callbacks}
						label={{basic: true, content: 'Key'}}
						name='key'
						validate={(value) => SCHEMA.key(value)}
					/>
				</Form.Field>}
				<Form.Field>
					<Input
						callbacks={callbacks}
						label={{basic: true, content: 'Display name'}}
						name='displayName'
						validate={(value) => SCHEMA.displayName(value)}
					/>
				</Form.Field>
				<Form.Field>
					<Input
						callbacks={callbacks}
						label={{basic: true, content: 'Description'}}
						name='description'
					/>
				</Form.Field>
				<Form.Field>
					<Dropdown
						callbacks={callbacks}
						fluid
						name='fieldType'
						options={[{
							key: 'text',
							text: 'Text',
							value: 'text'
						},{
							key: 'tag',
							text: 'Tag',
							value: 'tag'
						},{
							key: 'uri',
							text: 'Uri',
							value: 'uri'
						},{
							key: 'html',
							text: 'Html',
							value: 'html'
						},{
							key: 'base64',
							text: 'Base64 encoded data',
							value: 'base64'
						}]}
						placeholder='Jalla!'
						search
						selection
					/>
				</Form.Field>
				<Form.Field>
					<Dropdown
						callbacks={callbacks}
						fluid
						name='instruction'
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
							text: 'fulltext - Values are stored as ‘ngram’, ‘analyzed’ and also added to the _allText-field',
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
				{getIn(values, 'instruction') === 'custom' && <>
					<Form.Field>
						<Checkbox
							callbacks={callbacks}
							label='Decide by type'
							name='decideByType'
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							callbacks={callbacks}
							label='Enabled'
							name='enabled'
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							callbacks={callbacks}
							label='Ngram'
							name='ngram'
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							callbacks={callbacks}
							label='Fulltext'
							name='fulltext'
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							callbacks={callbacks}
							label='Include in _allText'
							name='includeInAllText'
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							callbacks={callbacks}
							label='Path'
							name='path'
							toggle
						/>
					</Form.Field>
				</>}
				<Button onClick={onValidate} type='button'>Validate</Button>
				<Button
					disabled={
						//Object.values(errors).some((v) => v)
						Object.entries(SCHEMA).some(([k,v]) => v(getIn(values, k)))
					}
					onClick={() => {
						const params = {
							description,
							displayName,
							fieldType,
							key,
							instruction,
							decideByType,
							enabled,
							fulltext,
							includeInAllText,
							ngram,
							path
						};
						//console.debug('params', params);
						fetch(`${servicesBaseUrl}/field${editMode ? 'Modify' : 'Create'}?json=${JSON.stringify(params)}`, {
							method: 'POST'
						}).then(response => {
							doClose();
						})
					}}
					type="submit">Submit</Button>
				<Button
					disabled={!Object.values(dirty).some((v) => v)}
					onClick={onReset}
					type="reset"
				>Reset</Button>
			</Form>
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
