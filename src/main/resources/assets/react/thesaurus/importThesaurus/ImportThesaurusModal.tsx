import type {Task} from '/lib/explorer/types/'
import type {Locales} from '../../index.d';
import type {JSONResponse}  from '../../../../services/graphQL/fetchers/index.d';


import {
	TASK_STATE_FAILED,
	TASK_STATE_FINISHED,
	TASK_STATE_RUNNING,
	TASK_STATE_WAITING
} from '@enonic/js-utils';
import * as gql from 'gql-query-builder';
import * as React from 'react';
import {
	Button, Form, Grid, Input, Modal, Progress, Table
} from 'semantic-ui-react';
import {GQL_MUTATION_THESAURUS_IMPORT_NAME} from '../../../../services/graphQL/constants';
import {LanguageDropdown} from '../../collection/LanguageDropdown';
import {useInterval} from '../../utils/useInterval';


type FileWithLastModifiedDate = File & {
	lastModifiedDate :Date
}


export function ImportThesaurusModal({
	// Required
	allowedLocales,
	open,
	servicesBaseUrl,
	setImportDialogState,
	thesaurusId,
	thesaurusName,
	// Optional
	afterClose = () => {/**/}
} :{
	// Required
	allowedLocales :Locales
	open :boolean
	servicesBaseUrl :string
	setImportDialogState :React.Dispatch<React.SetStateAction<{
		allowedLocales :Locales
		open: boolean
		thesaurusId :string
		thesaurusName :string
	}>>
	thesaurusId :string
	thesaurusName :string
	// Optional
	afterClose ?:() => void
}) {
	const [file, setFile] = React.useState<FileWithLastModifiedDate>();
	const [fileContent, setFileContent] = React.useState<string>();
	const [filePreview, setFilePreview] = React.useState<string>();
	const [fromLanguage, setFromLanguage] = React.useState('');
	const [toLanguage, setToLanguage] = React.useState('');
	const [loading, setLoading] = React.useState(false);
	const [importTaskId, setImportTaskId] = React.useState<string>();
	const [importing, setImporting] = React.useState<boolean>(false);
	const [interval, setInterval] = React.useState<number>(1000);
	const [progress, setProgress] = React.useState<{
		error :boolean
		indicating :boolean
		label :string
		percent :number
		success :boolean
		total :number
		value :number
		warning :boolean
	}>({
		error: false,
		indicating: true,
		label: '',
		percent: 0,
		success: false,
		total: 1,
		value: 0,
		warning: false
	});

	React.useEffect(() => {
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setFileContent(reader.result as string);
			}
			reader.readAsText(file);
		} else {
			setFileContent(undefined);
		}
	}, [
		file
	]);

	React.useEffect(() => {
		if(fileContent) {
			const lines = fileContent.split(/\r?\n/);
			console.debug('lines', lines);
			const preview = [];
			for (let i = 0; i < 2; i++) {
				const line = lines.shift();
				if (line) {
					preview.push(line);
				}
			} // for
			console.debug('lines', lines);
			if (lines[lines.length - 1] === '') {
				lines.pop();
			}
			const lastLine = lines.pop();
			console.debug('lastLine', lastLine);
			if (lastLine) {
				preview.push('...');
				preview.push(lastLine);
			}
			setFilePreview(preview.join('\n'));
		} else {
			setFilePreview(undefined);
		}
	},[fileContent]);

	function reset() {
		setFile(undefined);
		setFromLanguage('');
		setToLanguage('');
	}

	function doClose() {
		reset();
		setImportDialogState({
			allowedLocales: [],
			open: false,
			thesaurusId: undefined,
			thesaurusName: ''
		})
		afterClose();
	}

	useInterval(() => {
		if (importing) {
			fetch(`${servicesBaseUrl}/graphQL`, {
				method: 'POST',
				headers: { // HTTP/2 uses lowercase header keys
					'content-type':	'application/json'
				},
				body: JSON.stringify(gql.query({
					operation: 'getTask',
					fields: [
						//'application',
						//'description',
						//'id',
						//'name',
						{
							progress: [
								'current',
								//'info',
								'infoObj',
								'total'
							]
						},
						//'startTime',
						'state',
						//'user'
					],
					variables: {
						taskId: {
							required: true,
							type: 'ID',
							value: importTaskId
						}
					}
				}))
			})
				.then(res => res.json() as JSONResponse<{getTask :Task<{
					currentTime :number
					message :string
					startTime :number
				}>}>)
				.then(({
					data: {
						getTask: {
							//application,
							//description,
							//id,
							//name,
							progress: {
								current,
								//info,
								infoObj: {
									currentTime,
									message,
									startTime
								},
								total
							},
							//startTime,
							state,
							//user
						}
					}
				}) => {
					const remainingCount = total - current;
					const percent = Math.floor(current / total * 10000)/100; // Keeping two decimals
					const durationMs = currentTime - startTime;
					const averageMs = current ? durationMs / current : durationMs;
					const remainingMs = (remainingCount * averageMs);
					const etaMs = currentTime + remainingMs;
					const error = state === TASK_STATE_FAILED;
					const success = state === TASK_STATE_FINISHED;
					const warning = state === TASK_STATE_WAITING;
					setProgress({
						error,
						indicating: state === TASK_STATE_RUNNING || warning,
						label: warning
							? 'Task state waiting!'
							: error
								? `Task failed!`
								: success
									? message
									: `${message} etaMs:${etaMs}`,
						percent,
						success,
						total: total,
						value: current,
						warning
					});
					if (success || error) {
						setLoading(false);
						setImporting(false);
						setInterval(5000);
					}
				})
		} // if migrateTaskId
	}, interval); // useInterval

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		onOpen={() => {
			// Unfortunately this doesn't get called, perhaps bug in semantic-ui-react...
			if (allowedLocales.length === 1) {
				setFromLanguage(allowedLocales[0].tag);
				setToLanguage(allowedLocales[0].tag);
			}
		}}
		open={open}
		size='large'
	>
		<Modal.Header>Import to thesaurus {thesaurusName}</Modal.Header>
		<Modal.Content>
			<Form>
				<Form.Field>
					<Input
						accept='text/csv'
						id='file'
						name='file'
						onChange={(event :React.ChangeEvent<HTMLInputElement>) => {
							//console.debug(event);
							setFile(event.target.files[0] as FileWithLastModifiedDate);
						}}
						type='file'
					/>
				</Form.Field>
				{file
					? <Table celled compact definition selectable striped>
						<Table.Body>
							<Table.Row>
								<Table.HeaderCell collapsing>Filename</Table.HeaderCell>
								<Table.Cell>{file.name}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.HeaderCell collapsing>Filetype</Table.HeaderCell>
								<Table.Cell>{file.type}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.HeaderCell collapsing>Size in bytes</Table.HeaderCell>
								<Table.Cell>{file.size}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.HeaderCell collapsing>Last modified date</Table.HeaderCell>
								<Table.Cell>{
									file.lastModifiedDate.toLocaleDateString()
								}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.HeaderCell collapsing>Preview</Table.HeaderCell>
								<Table.Cell>{
									filePreview ? <pre>{filePreview}</pre> /*.split(/\r?\n/).map((line, i) => <p key={i}>{line}</p>)*/ : ''
								}</Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table>
					: <p>Select a file to show details</p>
				}
				<Form.Field>
					<label>From language</label>
					<LanguageDropdown
						clearable={false}
						includeANoneOption={false}
						locales={allowedLocales}
						placeholder='Please select from language'
						language={fromLanguage}
						setLanguage={(value) => setFromLanguage(value as string)}
					/>
				</Form.Field>
				<Form.Field>
					<label>To language</label>
					<LanguageDropdown
						clearable={false}
						includeANoneOption={false}
						locales={allowedLocales}
						placeholder='Please select to language'
						language={toLanguage}
						setLanguage={(value) => setToLanguage(value as string)}
					/>
				</Form.Field>
			</Form>
			{importTaskId
				? <Progress
					error={progress.error}
					indicating={progress.indicating}
					label={progress.label}
					percent={progress.percent}
					progress='ratio'
					success={progress.success}
					total={progress.total}
					value={progress.value}
					warning={progress.warning}
				/>
				: null
			}
		</Modal.Content>
		<Modal.Actions>
			<Grid columns={3}>
				<Grid.Row>
					<Grid.Column textAlign='left'>
						<Button disabled={loading} onClick={doClose}>Cancel</Button>
					</Grid.Column>
					<Grid.Column textAlign='center'>
						<Button disabled={loading} onClick={reset} secondary type="reset">Reset</Button>
					</Grid.Column>
					<Grid.Column textAlign='right'>
						<Button
							disabled={!fromLanguage || !toLanguage || loading}
							content='Import'
							icon={{
								color: 'green',
								name: 'upload'
							}}
							loading={loading}
							onClick={() => {
								setLoading(true);
								fetch(`${servicesBaseUrl}/graphQL`, {
									body: JSON.stringify(gql.mutation({
										operation: GQL_MUTATION_THESAURUS_IMPORT_NAME,
										fields: ['taskId'],
										variables: {
											csv: {
												required: true,
												type: 'String',
												value: fileContent
											},
											fromLocale: {
												required: true,
												type: 'String',
												value: fromLanguage
											},
											thesaurusId: {
												required: true,
												type: 'ID',
												value: thesaurusId
											},
											toLocale: {
												required: true,
												type: 'String',
												value: toLanguage
											}
										}
									})),
									method: 'POST'
								})
									.then(response => response.json() as JSONResponse<{
										importThesaurus: {
											taskId :string
										}
									}>)
									.then(({
										data:{
											importThesaurus: {
												taskId
											}
										}
									}) => {
										//console.debug('taskId', taskId);
										setImportTaskId(taskId);
										setImporting(true);
										//setLoading(false);
										//doClose();
									});
							}}
							primary
							type='submit'
						/>
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</Modal.Actions>
	</Modal>;
} // Import
