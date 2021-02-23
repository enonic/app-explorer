import getIn from 'get-value';
import {
	Button,
	Form,
	Header,
	//Icon,
	Table
} from 'semantic-ui-react';
import {
	setValue,
	DeleteItemButton,
	Form as EnonicForm,
	Input,
	InsertButton,
	List,
	MoveDownButton,
	MoveUpButton
} from 'semantic-ui-react-form';


const API_KEYS_PATH = 'apiKeys';


export const ApiCollector = (props) => {
	//console.debug('ApiCollector props', props);
	const {
		context,
		dispatch,
		//explorer,
		isFirstRun,
		path
	} = props;

	//console.debug('ApiCollector path', path);
	let initialValues = getIn(context.values, path);

	if (isFirstRun.current) {
		isFirstRun.current = false;
		if (initialValues) {
			if (initialValues[API_KEYS_PATH] && !Array.isArray(initialValues[API_KEYS_PATH])) {
				initialValues[API_KEYS_PATH] = [initialValues[API_KEYS_PATH]];
			}
		} else {
			initialValues = {
				[API_KEYS_PATH]: [{
					key: '',
					comment: ''
				}]
			};
			dispatch(setValue({path, value: initialValues}));
		}
	}
	//console.debug('ApiCollector initialValues', initialValues);


	return <EnonicForm
		initialValues={initialValues}
		onChange={(values) => {
			//console.debug('Collector onChange values', values);
			dispatch(setValue({path, value: values}));
		}}
	>
		<Form as='div'>
			<Form.Field>
				<List
					path={API_KEYS_PATH}
					render={(apiKeysArray) => {
						//console.debug('ApiCollector apiKeysArray', apiKeysArray);
						return <>
							<Header as='h4' content='API key(s)' dividing/>
							<Table celled compact selectable striped>
								<Table.Header>
									<Table.Row>
										<Table.HeaderCell collapsing>Key</Table.HeaderCell>
										<Table.HeaderCell collapsing>Comment</Table.HeaderCell>
									</Table.Row>
								</Table.Header>
								<Table.Body>{
									apiKeysArray.map(({
										key // eslint-disable-line no-unused-vars
										//comment
									}, index) => {
										const reactKey = `${API_KEYS_PATH}.${index}`;
										//console.debug('ApiCollector reactKey', reactKey);
										return <Table.Row key={reactKey}>
											<Table.Cell>
												<Input
													fluid
													path={`${reactKey}.key`}
												/>
											</Table.Cell>
											<Table.Cell>
												<Input
													fluid
													path={`${reactKey}.comment`}
												/>
											</Table.Cell>
											<Table.Cell collapsing>
												<Button.Group>
													<InsertButton
														index={index+1}
														path={API_KEYS_PATH}
														value={{
															key: '',
															comment: ''
														}}
													/>
													<MoveDownButton
														disabled={index + 1 >= apiKeysArray.length}
														index={index}
														path={API_KEYS_PATH}
													/>
													<MoveUpButton
														index={index}
														path={API_KEYS_PATH}
													/>
													<DeleteItemButton
														disabled={apiKeysArray.length <= 1}
														index={index}
														path={API_KEYS_PATH}
													/>
												</Button.Group>
											</Table.Cell>
										</Table.Row>;
									})
								}</Table.Body>
							</Table>
						</>;
					}}
				/>
			</Form.Field>
		</Form>
	</EnonicForm>;
};
