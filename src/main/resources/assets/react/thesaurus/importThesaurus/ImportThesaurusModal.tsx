import type {Locales} from '../../index.d';


import * as React from 'react';
import {
	Button, Form, Grid, Input, Modal, Table
} from 'semantic-ui-react';
import {LanguageDropdown} from '../../collection/LanguageDropdown';


type FileWithLastModifiedDate = File & {
	lastModifiedDate :Date
}


export function ImportThesaurusModal({
	// Required
	allowedLocales,
	open,
	servicesBaseUrl,
	setImportDialogState,
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
		thesaurusName :string
	}>>
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
			thesaurusName: ''
		})
		afterClose();
	}

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
								const body = new FormData();
								//console.debug('fileInput', fileInput);
								body.append('file', file); // binary

								// These do not become part of the url in the query string,
								// but they end up in request.params on the serverside :)
								//body.append('fileContent', fileContent); // string //
								body.append('fromLanguage', fromLanguage);
								body.append('thesaurusName', thesaurusName);
								body.append('toLanguage', toLanguage);
								fetch(`${servicesBaseUrl}/thesaurusImport`, {
									body,
									headers: {
										//'Content-type': 'multipart/form-data' // Automatically set
									},
									method: 'POST'
								})
									.then(response => response.json())
									.then((data) => {
										console.debug('data', data);
										setLoading(false);
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
