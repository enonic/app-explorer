import getIn from 'get-value';
import setIn from 'set-value';
import {Button, Form, Header, Icon, Table} from 'semantic-ui-react';
import {
	setError,
	setSchema,
	setValue,
	setVisited,
	//ChildForm,
	DeleteItemButton,
	Form as EnonicForm,
	Input,
	InsertButton,
	List,
	MoveDownButton,
	MoveUpButton,
	SetValueButton
} from 'semantic-ui-react-form';

const DEFAULT_UA = 'Mozilla/5.0 (compatible; Enonic XP Explorer Collector Web crawler/1.0.0)';


function required(value) {
	return value ? undefined : 'Required!';
}

const EXCLUDES_PATH = 'excludes';

const SCHEMA = {
	baseUri: (v) => required(v)
};

export const Collector = (props) => {
	//console.debug('Collector props', props);
	const {
		context,
		dispatch,
		explorer,
		isFirstRun,
		path
	} = props;
	//console.debug('Collector context', context);

	let initialValues = getIn(context.values, path);
	//console.debug('Collector initialValues', initialValues);

	if (isFirstRun.current) {
			//console.debug('isFirstRun');
      isFirstRun.current = false;
			dispatch(setSchema({path, schema: SCHEMA}));
			// There are no changes, errors or visits yet!
			if (initialValues) {
				if (initialValues[EXCLUDES_PATH] && !Array.isArray(initialValues[EXCLUDES_PATH])) {
					initialValues[EXCLUDES_PATH] = [initialValues[EXCLUDES_PATH]];
				}
			} else {
				initialValues = {
					baseUri: ''
				};
				dispatch(setValue({path, value: initialValues}));
			}
  }


	return <EnonicForm
	  afterValidate={(dereffed) => {
			// console.debug('Collector afterValidate dereffed', dereffed);
			dispatch(setError({path, error: dereffed.errors}));
			dispatch(setVisited({path, value: dereffed.visited}));
		}}
		afterVisit={(dereffed) => {
			// console.debug('Collector afterVisit dereffed', dereffed);
			dispatch(setVisited({path, value: dereffed.visited}));
		}}
		initialValues={initialValues}
		onChange={(values) => {
			//console.debug('Collector onChange values', values);
			dispatch(setValue({path, value: values}));
		}}
		schema={SCHEMA}
	>
		<Form as='div'>
			<Form.Field>
				<Input
					fluid
					label='Uri'
					path='baseUri'
				/>
			</Form.Field>
			<Form.Field>
				<List
					path={EXCLUDES_PATH}
					render={(excludesArray) => {
						//console.debug('Collector excludesArray', excludesArray);
						if (excludesArray.length) {
							return <>
								<Header as='h4' content='Exclude pattern(s)' dividing/>
								<Table celled compact selectable striped>
									<Table.Header>
										<Table.Row>
											<Table.HeaderCell collapsing>Regular expression</Table.HeaderCell>
											<Table.HeaderCell collapsing>Actions</Table.HeaderCell>
										</Table.Row>
									</Table.Header>
									<Table.Body>{excludesArray.map((
										exclude = '',
										index
									) => {
										const key = `${EXCLUDES_PATH}.${index}`;
										//console.debug(key, exclude);
										return <Table.Row key={key}>
											<Table.Cell>
												<Input
													fluid
													path={key}
												/>
											</Table.Cell>
											<Table.Cell collapsing>
												<Button.Group>
													<InsertButton
														index={index+1}
														path={EXCLUDES_PATH}
														value=''
													/>
													<MoveDownButton
														disabled={index + 1 >= excludesArray.length}
														index={index}
														path={EXCLUDES_PATH}
													/>
													<MoveUpButton
														index={index}
														path={EXCLUDES_PATH}
													/>
													<DeleteItemButton
														index={index}
														path={EXCLUDES_PATH}
													/>
												</Button.Group>
											</Table.Cell>
										</Table.Row>;
									})}</Table.Body>
								</Table>
							</>;
						}
						return <Form.Field>
							<SetValueButton
								path={EXCLUDES_PATH}
								value={['']}
							>
								<Icon color='green' name='plus'/>Add exclude pattern(s)
							</SetValueButton>
						</Form.Field>
					}}
				/>
			</Form.Field>
			<Form.Field>
				<Input
					fluid
					label='Custom User-Agent'
					path='userAgent'
					placeholder={`Leave empty to use ${DEFAULT_UA}`}
				/>
			</Form.Field>
		</Form>
	</EnonicForm>;
} // Collector
