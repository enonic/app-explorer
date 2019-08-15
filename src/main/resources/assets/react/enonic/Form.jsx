import {EnonicProvider} from './Context';

export function Form(props) {
	const {
		children,
		initialValues = {},
		SCHEMA = {}
	} = props;

	const [dirties, setDirties] = React.useState({});
	const [errors, setErrors] = React.useState({});
	const [touches, setTouches] = React.useState({});
	const [values, setValues] = React.useState(JSON.parse(JSON.stringify(initialValues)));

	function reset() {
		setDirties({});
		setErrors({});
		setTouches({});
		setValues(JSON.parse(JSON.stringify(initialValues)));
	}

	function validateSchema() {
		const errors = {};
		const touches = {};
		Object.entries(SCHEMA).forEach(([k,v]) => {
			errors[k] = v(getIn(values, k));
			touches[k] = true;
		})
		console.debug('validateSchema errors', errors, 'touches', touches);
		setErrors(errors);
		setTouches(touches);
	} // validateSchema

	const callbacks = {
		getError: (name) => getIn(errors, name),
		getTouched: (name) => getIn(touches, name, false),
		getValue: (name) => getIn(values, name),
		setDirty: (name, value) => {
			const old = getIn(dirties, name, false);
			if (value === old) { return; } // No need to change state, or cause render
			setDirties(prev => {
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
			const old = getIn(touches, name);
			if (value === old) { return; } // No need to change state, or cause render
			setTouches(prev => {
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

	const initialState = {what: 'ever'};
	const reducer = (state, action) => {
		return state;
	};
	return <EnonicProvider
		children={children}
		initialState={initialState}
		reducer={reducer}
	/>;
} // Form
