import {
	getIn,
	ErrorMessage,
	Field
} from 'formik';
import {
	Icon,
	Input as SemanticUiReactInput,
	Message
} from 'semantic-ui-react';


export const Input = (props) => {
	//console.debug('FormikSemanticUiReactInput props', props);
	const {
		label,
		name,
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name,
		...inputRest
	} = props;
	return <Field
		name={path}
		render={(props) => {
			//console.debug('Field.render props', props);
			const {
				field,
				form
			} = props;
			const {
				//name,
				//onBlur,
				//onChange,
				type = 'text',
				//value,
				...fieldRest
			} = field;
			const {
				errors
			} = form;
			const error = getIn(errors, path);
			//console.debug('Field.render error', error);
			return <>
				<SemanticUiReactInput
					{...inputRest}
					{...fieldRest}
					error={!!error}
					label={label}
					type={type}
				/>
				<ErrorMessage
					name={path}
					render={(string) => {
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
} // Input
