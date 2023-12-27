import type { HttpRequestHeader } from '/tasks/webcrawl/webcrawl.d';

import {
	Button,
	Form,
	Header,
	Icon,
	Input,
	Table
} from 'semantic-ui-react';
import {DeleteItemButton} from '../components/DeleteItemButton';
import {InsertButton} from '../components/InsertButton';
import {MoveDownButton} from '../components/MoveDownButton';
import {MoveUpButton} from '../components/MoveUpButton';


const BLACKLISTED_HEADERS = [
	'accept-charset',
	'accept-encoding',
	'access-control-request-headers',
	'access-control-request-method',
	'connection',
	'content-length',
	'cookie',
	'cookie2',
	'date',
	'dnt',
	'expect',
	'host',
	'keep-alive',
	'origin',
	// 'referer',
	'te',
	'trailer',
	'transfer-encoding',
	'user-agent', // Already set elsewhere
	'upgrade',
	'via'
];

const UNSUPPORTED_HEADERS = [
	'set-cookie',
	'set-cookie2',
];

export function HttpRequestHeaders({
	httpRequestHeaders,
	setHttpRequestHeaders,
}: {
	httpRequestHeaders: HttpRequestHeader[]
	setHttpRequestHeaders: (headers: HttpRequestHeader[]) => void
}) {
	if(!httpRequestHeaders || !Array.isArray(httpRequestHeaders) || !httpRequestHeaders.length) {
		return <Form.Field>
			<Button
				onClick={() => {
					setHttpRequestHeaders([{
						name: '',
						value: ''
					}]);
				}}
			>
				<Icon color='green' name='plus'/>Add http request header(s)
			</Button>
		</Form.Field>;
	}

	return <>
		<Header as='h4' content='HTTP request header(s)' dividing/>
		<Table celled compact selectable striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell width={8}>Name</Table.HeaderCell>
					<Table.HeaderCell width={8}>Value</Table.HeaderCell>
					<Table.HeaderCell collapsing></Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
			{
				httpRequestHeaders.map(({
					error,
					name,
					value
				}, index) => <Table.Row key={index}>
						<Table.Cell>
							<Form.Input
								error={error}
								fluid
								onChange={(_event,{value}) => {
									const deref = JSON.parse(JSON.stringify(httpRequestHeaders));
									const newName = value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
									const existingNames = httpRequestHeaders.map(({name}) => name);
									if (newName === 'user-agent') {
										deref[index].error = `'${newName}' can be set above.`;
									} else if (BLACKLISTED_HEADERS.includes(newName)) {
										deref[index].error = `'${newName}' is blacklisted.`;
									} else if (UNSUPPORTED_HEADERS.includes(newName)) {
										deref[index].error = `'${newName}' is unsupported.`;
									} else if (existingNames.includes(newName)) {
										deref[index].error = `The http client doesn't support repeated request headers.`;
									} else {
										delete(deref[index].error);
									}
									deref[index].name = newName;
									setHttpRequestHeaders(deref);
								}}
								value={name}
							/>
						</Table.Cell>
						<Table.Cell>
							<Input
								fluid
								onChange={(_event,{value}) => {
									const deref = JSON.parse(JSON.stringify(httpRequestHeaders));
									deref[index].value = value;
									setHttpRequestHeaders(deref);
								}}
								value={value}
							/>
						</Table.Cell>
						<Table.Cell collapsing>
							<Button.Group>
								<InsertButton
									array={httpRequestHeaders}
									insertAtIndex={index + 1}
									setArrayFunction={setHttpRequestHeaders}
									valueToInsert={{
										name: '',
										value: ''
									}}
								/>
								<MoveDownButton
									array={httpRequestHeaders}
									index={index}
									setArrayFunction={setHttpRequestHeaders}
								/>
								<MoveUpButton
									array={httpRequestHeaders}
									index={index}
									setArrayFunction={setHttpRequestHeaders}
								/>
								<DeleteItemButton
									array={httpRequestHeaders}
									disabled={false}
									index={index}
									setArrayFunction={setHttpRequestHeaders}
								/>
							</Button.Group>
						</Table.Cell>
				</Table.Row>)
			}
			</Table.Body>
		</Table>
	</>
}
