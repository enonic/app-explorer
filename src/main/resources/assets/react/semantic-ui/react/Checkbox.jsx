import {
	//Icon,
	Checkbox as SemanticUiReactCheckbox//,
	//Message
} from 'semantic-ui-react';


export function Checkbox(props = {}) {
	//console.debug('Checkbox props', props);

	const { // Props are read-only
		name,
		callbacks: { // State is lifted to anchestor via get and set callbacks.
			//getError,
			getTouched,
			getValue,
			setDirty,
			//setError,
			setTouched,
			setValue
		},
		//validate = () => undefined,
		//validateOnBlur = true,
		//validateOnChange = true,
		value = getValue(name),
		...rest // value
	} = props;

	function onBlur() {
		console.debug('Checkbox onBlur value', value);
		setTouched(name, true)
		//validateOnBlur && setError(name, validate(value));
	};

	function onChange(eventIgnored, {value: newValue}) {
		//console.debug('Checkbox onChange value', value, 'newValue', newValue);
		setDirty(name, newValue !== value);
		setTouched(name, true);
		//validateOnChange && setError(name, validate(newValue));
		setValue(name, newValue);
	};

	//const isTouched = getTouched(name);
	//console.debug('Input isTouched', isTouched);

	//const error = getError(name);
	//console.debug('Input error', error);

	//const hasError = !!error;
	//console.debug('Input hasError', hasError);

	return <>
		<SemanticUiReactCheckbox
			{...rest}
			checked={value}
			name={name}
			onBlur={onBlur}
			onChange={onChange}
		/>
	</>;
} // Checkbox
