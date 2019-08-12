import {
	Icon,
	Input as SemanticUiReactInput,
	Message
} from 'semantic-ui-react';


export function Input(props = {}) {
	//console.debug('Input props', props);

	const { // Props are read-only
		name,
		callbacks: { // State is lifted to anchestor via get and set callbacks.
			getTouched,
			getError,
			getValue,
			setDirty,
			setErrors,
			setTouched,
			setValues
		},
		validate = () => undefined,
		value = getValue(name),
		...rest // value
	} = props;

	function onBlur() {
		setTouched(name, true)
	};

	function onChange(eventIgnored, {value: newValue}) {
		//console.debug('Input onChange value', value);
		setDirty(name, newValue !== value);
		setErrors(name, validate(newValue));
		setTouched(name, true);
		setValues(name, newValue);
	};

	const isTouched = getTouched(name);
	//console.debug('Input isTouched', isTouched);

	const error = getError(name);
	//console.debug('Input error', error);

	const hasError = !!error;
	//console.debug('Input hasError', hasError);

	return <>
		<SemanticUiReactInput
			{...rest}
			error={hasError}
			name={name}
			onBlur={onBlur}
			onChange={onChange}
			value={value}
		/>
		{isTouched && error && <Message icon negative>
			<Icon name='warning'/>
			<Message.Content>
				<Message.Header>{name}</Message.Header>
				{error}
			</Message.Content>
		</Message>}
	</>;
} // Input
