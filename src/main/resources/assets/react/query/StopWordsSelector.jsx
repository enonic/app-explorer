import {Form, Header} from 'semantic-ui-react';
import {Dropdown} from '../semantic-ui/react/formik/Dropdown';


export const StopWordsSelector = ({
	// React
	multiple = true,
	placeholder = 'Stop words',

	// Formik
	fluid = true,
	search = true,
	selection = true,

	// Various
	name = 'stopWords',
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,

	...rest // options
}) => {
	return <>
		<Header as='h3' dividing id='stopwords'>Stop words</Header>
		<Form.Field>
			<Dropdown
				fluid={fluid}
				multiple={multiple}
				path={path}
				placeholder={placeholder}
				search={search}
				selection={selection}
				{...rest}
			/>
		</Form.Field>
	</>;
};
