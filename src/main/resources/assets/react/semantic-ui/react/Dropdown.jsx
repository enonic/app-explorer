import {
	Icon,
	Dropdown as SemanticUiReactDropdown,
	Message
} from 'semantic-ui-react';


export function Dropdown(props = {}) {
	//console.debug('Dropdown props', props);

	const { // Props are read-only
		name,
		callbacks: { // State is lifted to anchestor via get and set callbacks.
			getError,
			getTouched,
			getValue,
			setDirty,
			setError,
			setTouched,
			setValue
		},
		validate = () => undefined,
		validateOnBlur = true,
		validateOnChange = true,
		value = getValue(name),
		...rest // value
	} = props;

	function onBlur() {
		setTouched(name, true)
		validateOnBlur && setError(name, validate(value));
	};

	function onChange(eventIgnored, {value: newValue}) {
		//console.debug('Dropdown onChange value', value, 'newValue', newValue);
		setDirty(name, newValue !== value);
		setTouched(name, true);
		validateOnChange && setError(name, validate(newValue));
		setValue(name, newValue);
	};

	const isTouched = getTouched(name);
	//console.debug('Input isTouched', isTouched);

	const error = getError(name);
	//console.debug('Input error', error);

	const hasError = !!error;
	//console.debug('Input hasError', hasError);

	return <>
		<SemanticUiReactDropdown
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
} // Dropdown
