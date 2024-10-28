import type {Locales} from '../../index.d';


import * as React from 'react';
import {Button, Form, Icon, Modal} from 'semantic-ui-react'
import {LanguageDropdown} from '../../collection/LanguageDropdown';


export function ExportThesaurusModal({
	allowedLocales,
	open,
	servicesBaseUrl,
	setExportDialogState,
	thesaurusName
} :{
	allowedLocales :Locales
	open :boolean
	servicesBaseUrl :string
	setExportDialogState :React.Dispatch<React.SetStateAction<{
		allowedLocales :Locales
		open: boolean
		thesaurusName :string
	}>>
	thesaurusName :string
}) {
	const [fromLanguage, setFromLanguage] = React.useState('');
	const [toLanguage, setToLanguage] = React.useState('');

	function reset() {
		setFromLanguage('');
		setToLanguage('');
	}

	function doClose() {
		reset();
		setExportDialogState({
			allowedLocales: [],
			open: false,
			thesaurusName: ''
		});
	}

	return <Modal
		closeIcon
		closeOnDimmerClick={true}
		onClose={doClose}
		open={open}
		size='tiny'
	>
		<Modal.Header content={`Export thesaurus ${thesaurusName}`}/>
		<Modal.Content>
			<Form>
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
			<Button onClick={doClose}>Cancel</Button>
			<Button onClick={reset} secondary type="reset">Reset</Button>
			<Button
				as='a'
				disabled={!fromLanguage || !toLanguage}
				icon
				href={`${servicesBaseUrl}/thesaurusExport?fromLanguage=${fromLanguage}&name=${thesaurusName}&toLanguage=${toLanguage}`}
				primary
			><Icon color='blue' name='download'/> Download</Button>
		</Modal.Actions>
	</Modal>;
}
