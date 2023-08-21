import MonacoEditor from "@monaco-editor/react";
import {
	Fragment,
	useState
} from 'react';
import {
	Button,
	Form,
	Grid,
	Segment,
} from 'semantic-ui-react';
import JSONC from 'tiny-jsonc';
import TypedReactJson from '../components/TypedReactJson';


const MONACO_FONT_SIZE = 14;
const MONACO_LINE_HEIGHT = 21; // 14px font-size + 7px line-height

const FILE_MATCH_ID_PATCH_DOCUMENT = 'patchDocument.json';
const FILE_MATCH_ID_CREATE_OR_UPDATE_DOCUMENTS = 'createOrUpdateDocuments.json';

const JSON_SCHEMA_PATCH_DOCUMENT = {
	// "fileMatch": ["*"],
	"fileMatch": [FILE_MATCH_ID_PATCH_DOCUMENT],
	"uri": "http://www.enonic.com/schemas/patchDocument.json",
	"schema": {
		"type": "object",
		"properties": {
			"document": {
				"type": "object",
				// By default any additional properties are allowed.
				// "properties": {} // shape of the documentType(s)
			},
			"documentType": {
				"type": "string"
			},
		},
		"additionalProperties": false,
		"required": ["document"]
	}
};

const JSON_SCHEMA_CREATE_OR_UPDATE_DOCUMENTS = {
	// "fileMatch": ["*"],
	"fileMatch": [FILE_MATCH_ID_CREATE_OR_UPDATE_DOCUMENTS],
	"uri": "http://www.enonic.com/schemas/createOrUpdateDocuments.json",
	"schema": {
		"type": "array",
		// "uniqueItems": false, // While it doesn't make sence, it's allow to make multiple identical documents in the same request.
		// List validation is useful for arrays of arbitrary length where each item matches the same schema.
		// For this kind of array, set the items keyword to a single schema that will be used to validate all of the items in the array.
		"items": {
			"type": "object",
			"properties": {
				"action": {
					"enum": [
						"create",
						"read",
						"update",
						"delete",
					]
				},
				"document": {
					"type": "object",
					// By default any additional properties are allowed.
					// "properties": {} // shape of the documentType(s)
				},
				"documentType": {
					"type": "string"
				},
				// "documentTypeId": {
				// 	"type": "string"
				// },
				"id": {
					"type": "string"
				},
				// "name": {
				// 	"type": "string"
				// },
				// "path": {
				// 	"type": "string"
				// },
			},
			"additionalProperties": false,
			"required": ["document"]
		}
	}
};

export default function Action({
	apiKey,
	data,
	comment,
	curl = '',
	headers = {},
	method = 'GET',
	pattern,
	parameters = {},
	responses = []
}: {
	apiKey: string,
	data?: {
		default: string // Record<string, unknown> | Record<string, unknown>[]
		examples: {
			comment: string
			example: Record<string, unknown> | Record<string, unknown>[]
			type: string
		}[]
		list: boolean,
		type: string
	}
	comment: string
	curl?: string
	headers?: Record<string, {
		value: string
		attributes: string
		description: string
	}>
	method: 'GET' | 'POST' | 'PUT' | 'DELETE'
	pattern: string
	parameters?: Record<string, {
		default?:
			| string | string[]
			| boolean | boolean[]
		description: string|JSX.Element
		list?: boolean
		required?: boolean
		type?: string
	}>
	responses?: {
		body?:
			| Record<string, unknown>
			| Record<string, unknown>[]
			| {
				message: string
			}
			| {
				message: string
			}[]
		// contentType: 'application/json;charset=UTF-8'
		status: number
	}[]
}) {
	const [requestState, setRequestState] = useState<Record<string, unknown>>();
	const [dataJsonString, setDataJsonString] = useState(data && data.default ? data.default : '');
	let restringifiedData;
	try {
		restringifiedData = JSON.stringify(JSONC.parse(dataJsonString), null, 4);
	} catch (e) {
		restringifiedData = '{}';
	}
	const [parameterState, setParameterState] = useState<
		Record<string,
			string | string[]
			| boolean | boolean[]
		>
	>(parameters
		? (() => {
			const state = {};
			Object.entries(parameters).forEach(([
				name, {
					list = false,
					default: value = list ? ['', ''] : '',
					// type = 'string'
				}
			]) => {
				state[name] = value;
			});
			return state;
		})()
		: {});
	// console.debug('parameterState', parameterState);
	const [responseState, setResponseState] = useState<{
		status: number,
		body: Record<string, unknown> | Record<string, unknown>[]
	}>();

	return <details className={`method-${method.toLocaleLowerCase()}`}>
		<summary><span>{method}</span> <b>{pattern}</b> {comment}</summary>
		<h3>Request</h3>
		{
			Object.keys(headers).length === 0
				? null
				: <>
					<h4>Headers</h4>
					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Value</th>
								<th>Attributes</th>
								<th>Description</th>
							</tr>
						</thead>
						<tbody>
							{Object.entries(headers).map(([name, { value, attributes, description }]) => <tr key={name}>
								<th>{name}</th>
								<td>{value}</td>
								<td>{attributes}</td>
								<td>{description}</td>
							</tr>)}
						</tbody>
					</table>
				</>
		}
		{
			Object.keys(parameters).length === 0
				? null
				: <>
					<h4>Parameters</h4>
					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Attributes</th>
								<th>Default</th>
								<th>Description</th>
							</tr>
						</thead>
						<tbody>
							{Object.entries(parameters).map(([
								name, {
									default: value = '',
									description,
									list = false,
									required = false,
									type = 'string'
								}
								]) => <tr key={name}>
								<th>{name}</th>
								<td>{required ? '!' : '?'}{type}{list ? '[]' : ''}</td>
								<td>{value.toString()}</td>
								<td>{description}</td>
							</tr>)}
						</tbody>
					</table>
					<Form>
						{Object.entries(parameters).map(([
							name, {
								default: value,
								description,
								list = false,
								required = false,
								type = 'string'
							}
							], i) => list
								? <Fragment key={i}>
									{(parameterState[name] as (string|boolean)[]).map((value, j) => <Form.Input
										defaultValue={value as string}
										key={`${name}-${j}`}
										label={`${name}[${j}]`}
										onChange={(e, { value }) => setParameterState(prev => {
											const next = { ...prev };
											next[name][j] = value;
											return next;
										})}
									/>)}
									<Button.Group>
										<Button
											icon={{ name: 'plus', color: 'green' }}
											onClick={() => setParameterState(prev => {
												const next = { ...prev };
												(next[name] as (string|boolean)[]).push('');
												return next;
											})}
										/>
										<Button
											icon={{ name: 'minus', color: 'red' }}
											onClick={() => setParameterState(prev => {
												const next = { ...prev };
												(next[name] as (string|boolean)[]).pop();
												return next;
											})}
										/>
									</Button.Group>
								</Fragment>
								: type === 'boolean'
									? <Form.Radio
										defaultChecked={value as boolean}
										key={name}
										label={name}
										onChange={(e, { checked }) => setParameterState(prev => {
											const next = { ...prev };
											next[name] = checked;
											return next;
										})}
										toggle
									/>
									: <Form.Input
										defaultValue={value as string}
										key={name}
										label={name}
										onChange={(e, { value }) => setParameterState(prev => {
											const next = { ...prev };
											next[name] = value;
											return next;
										})}
										required={required}
									/>
							) // map
						}
					</Form>
				</>
		}
		{
			data
				? <>
					<h4>Body</h4>
					<dt>Type</dt>
					<dd>{data.type}</dd>
					{data.examples.length
						? <>
							<h5>Examples</h5>
							<table>
								<thead>
									<tr>
										<th>Comment</th>
										<th>Type</th>
										<th>Body</th>
									</tr>
								</thead>
								<tbody>
									{data.examples.map(({
										comment,
										example,
										type
									},i) => <tr key={i}>
										<td>{comment}</td>
										<td><pre>{type}</pre></td>
										<td><pre>{JSON.stringify(example, null, 4)}</pre></td>
									</tr>)}
								</tbody>
							</table>
						</>
						: null
					}
					<Form>
						{/* <Form.TextArea
							defaultValue={dataJsonString}
							onChange={(e, { value }) => setDataJsonString(value as string)}
							rows={dataJsonString.split('\n').length}
						/> */}
						<MonacoEditor
							height={`${dataJsonString.split('\n').length * MONACO_LINE_HEIGHT}px`}
							language="json"
							onChange={(value) => {
								setDataJsonString(value);
							}}
							onMount={(editor, monaco) => {
								// monaco.languages.typescript.typescriptDefaults.setCompilerOptions({isolatedModules: true})
								monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
									allowComments: true,
									enableSchemaRequest: false, // uri's are fake
									// schemaRequest: 'ignore',
									schemaValidation: 'error', // The severity of problems from schema validation. If set to 'ignore', schema validation will be skipped. If not set, 'warning' is used.
									trailingCommas: 'ignore',
									validate: true,
									// schemas: data.list ? [JSON_SCHEMA_CREATE_OR_UPDATE_DOCUMENTS] : [JSON_SCHEMA_PATCH_DOCUMENT]
									schemas: [
										JSON_SCHEMA_CREATE_OR_UPDATE_DOCUMENTS,
										JSON_SCHEMA_PATCH_DOCUMENT
									]
								});
								// console.debug('MonacoEditor onMount data.list', data.list);
								const model = monaco.editor.createModel(
									dataJsonString, // value: string
									'json', // language?: string
									data.list // uri?: Uri
										? `internal://server/${FILE_MATCH_ID_CREATE_OR_UPDATE_DOCUMENTS}`
										: `internal://server/${FILE_MATCH_ID_PATCH_DOCUMENT}`
								);
								editor.setModel(model);
							}}
							options={{
								fontSize: MONACO_FONT_SIZE,
								minimap: {
									enabled: false
								},
								scrollBeyondLastLine: false,
								scrollbars: {
									vertical: 'hidden',
								}
							}}
						/>
					</Form>
				</>
				: null
		}

		<h4>cURL</h4>
		<pre>
			curl -X{method} "{document.location.href}{pattern}{
			Object.keys(parameterState).length
				? '?' + Object.entries(parameterState).map(([name, value]) => Array.isArray(value)
					? value.map(value => `${name}=${value}`).join('&')
					: `${name}=${value}`).join('&')
				: ''
		}" {curl}{
			dataJsonString.length
				? ` -d '${restringifiedData}'`
				: ''
		}
		</pre>

		<h4>Fetch</h4>
		<Form.Button
			content="Send request using fetch in this browser"
			onClick={() => {
				let url = `${document.location.href}${pattern}`;
				if (Object.keys(parameterState).length) {
					url += '?' + Object.entries(parameterState).map(([name, value]) => Array.isArray(value)
					? value.map(value => `${name}=${value}`).join('&')
					: `${name}=${value}`).join('&')
				}
				// console.debug('url', url);
				const fetchOptions = {
					method,
					headers: {
						authorization: `Explorer-Api-Key ${apiKey}`,
					}
				}
				const requestObjForState = {
					method,
					headers: {
						authorization: `Explorer-Api-Key ${apiKey}`,
					},
					url
				}
				if (dataJsonString.length) {
					fetchOptions['body'] = restringifiedData;
					requestObjForState['body'] = JSON.parse(restringifiedData);
				}
				// console.debug('fetchOptions', fetchOptions);
				setRequestState(requestObjForState);
				fetch(url, fetchOptions)
					.then(async res => {
						// console.debug('res', res);
						setResponseState({
							status: res.status,
							body: await res.json(),
						});
					});
			}}
		/>
		<div>
			<Grid columns='equal'>
				<Grid.Row>
					<Grid.Column>
						{
							requestState
							? <div>
								<h5>Fetch Request</h5>
								<Segment>
									<TypedReactJson
										enableClipboard={false}
										displayArrayKey={false}
										displayDataTypes={false}
										displayObjectSize={false}
										indentWidth={2}
										name={null}
										quotesOnKeys={false}
										sortKeys={true}
										src={requestState}
									/>
								</Segment>
							</div>
							: null
						}
					</Grid.Column>
					<Grid.Column>
						{
							responseState
							? <div>
								<h5>Fetch Response</h5>
								<Segment>
									<TypedReactJson
										enableClipboard={false}
										displayArrayKey={false}
										displayDataTypes={false}
										displayObjectSize={false}
										indentWidth={2}
										name={null}
										quotesOnKeys={false}
										sortKeys={true}
										src={responseState}
									/>
								</Segment>
							</div>
							: null
						}
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</div>

		{
			responses.length === 0
				? null
				: <>
					<h3>Responses</h3>
					<table>
						<thead>
							<tr>
								<th>Status</th>
								<th>Content-Type</th>
								<th>Body</th>
							</tr>
						</thead>
						<tbody>
							{responses.map(({
								body,
								status
							},i) => <tr key={i}>
								<th>{status}</th>
								<td>application/json;charset=UTF-8</td>
								<td><pre>{JSON.stringify(body, null, 4)}</pre></td>
							</tr>)}
						</tbody>
					</table>
				</>
		}
	</details>;
}
