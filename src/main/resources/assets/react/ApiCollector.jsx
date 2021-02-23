import getIn from 'get-value';
import {
	Button,
	Form,
	Header,
	//Icon,
	Input,
	Radio,
	Table
} from 'semantic-ui-react';
import {
	setValue,
	DeleteItemButton,
	Form as EnonicForm,
	Input as EnonicInput,
	InsertButton,
	List,
	MoveDownButton,
	MoveUpButton
} from 'semantic-ui-react-form';


const API_KEYS_PATH = 'apiKeys';

function makeKey({
	characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
	length = 32
} = {}) {
	let result = '';
	const charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

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
					comment: '',
					dateTime: new Date(Date.now()).toISOString(),
					hashed: false,
					key: makeKey()
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
										<Table.HeaderCell collapsing>Date</Table.HeaderCell>
										<Table.HeaderCell collapsing>Key</Table.HeaderCell>
										<Table.HeaderCell collapsing>Hashed</Table.HeaderCell>
										<Table.HeaderCell collapsing></Table.HeaderCell>
									</Table.Row>
								</Table.Header>
								<Table.Body>{
									apiKeysArray.map(({
										//comment = '',
										dateTime = new Date(Date.now()).toISOString(),
										hashed = false,
										key = makeKey() // eslint-disable-line no-unused-vars
									}, index) => {
										const reactKey = `${API_KEYS_PATH}.${index}`;
										//console.debug('ApiCollector reactKey', reactKey);
										return <React.Fragment key={reactKey}>
											<Table.Row>
												<Table.Cell>
													<Input
														disabled={true}
														value={dateTime}
													/>
												</Table.Cell>
												<Table.Cell>
													<Input
														disabled={true}
														value={key}
													/>
												</Table.Cell>
												<Table.Cell>
													<Radio
														checked={hashed}
														readOnly={true}
														toggle
													/>
												</Table.Cell>
												<Table.Cell collapsing rowSpan={2}>
													<Button.Group>
														<InsertButton
															index={index+1}
															path={API_KEYS_PATH}
															value={{
																comment: '',
																dateTime: new Date(Date.now()).toISOString(),
																hashed: false,
																key: makeKey()
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
											</Table.Row>
											<Table.Row>
												<Table.Cell colSpan={3}>
													<EnonicInput
														fluid
														path={`${reactKey}.comment`}
														placeholder='Comment'
													/>
												</Table.Cell>
											</Table.Row>
										</React.Fragment>;
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
