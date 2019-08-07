import {
	getIn,
	ErrorMessage,
	Field
} from 'formik';
import {
	Icon,
	Dropdown as SemanticUiReactDropdown,
	Message
} from 'semantic-ui-react';


export const Dropdown = (props) => {
	//console.debug('FormikSemanticUiReactDropdown props', props);
	const {
		name,
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name,

		// fluid, multiple, onChange, options, placeholder, search, selection
		...dropdownRest
	} = props;
	//console.debug('FormikSemanticUiReactDropdown dropdownRest', dropdownRest);

	return <Field
		name={path}
		render={(props) => {
			//console.debug('FormikSemanticUiReactDropdown Field.render props', props);
			const {
				field,
				form: formik
			} = props;
			//console.debug('FormikSemanticUiReactDropdown Field.render formik', formik);
			const {
				//name,
				//onBlur,
				//onChange, // Also in dropdownRest!
				//value,
				...fieldRest
			} = field;
			//console.debug('FormikSemanticUiReactDropdown fieldRest', fieldRest);
			const {
				errors//,
				//touched
			} = formik;
			//console.debug('FormikSemanticUiReactDropdown Field.render formik.errors', errors);
			//console.debug('FormikSemanticUiReactDropdown Field.render formik.touched', touched);
			const error = getIn(errors, path);
			const boolError = !!error;
			const boolTouched = getIn(formik.touched, path, false);
			//console.debug('FormikSemanticUiReactDropdown touched', formik.touched, boolTouched);
			//console.debug('FormikSemanticUiReactDropdown error', error, boolError);
			return <>
				<SemanticUiReactDropdown
					{...fieldRest}
					{...dropdownRest}
					error={boolTouched && boolError}
				/>
				<ErrorMessage
					name={path}
					render={(string) => {
						// the render callback will only be called when the
						// field has been touched and an error exists and
						// subsequent updates.
						return <Message icon negative>
							<Icon name='warning'/>
							<Message.Content>
								<Message.Header>{path}</Message.Header>
								{string}
							</Message.Content>
						</Message>
					}}
				/>
			</>;
		}}
	/>; // Field

}
