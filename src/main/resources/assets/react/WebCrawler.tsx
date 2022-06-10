import type {CollectorProps} from '/lib/explorer/types/Collector.d';


import {forceArray} from '@enonic/js-utils';
import * as React from 'react';
import {
	Button,
	Form,
	Header,
	Icon,
	Input,
	Table
} from 'semantic-ui-react';
/*import {
	//setError,
	//setSchema,
	//setValue,
	//setVisited,
	//ChildForm,
	DeleteItemButton,
	Form as EnonicForm,
	Input,
	InsertButton,
	List,
	MoveDownButton,
	MoveUpButton,
	SetValueButton
} from '@enonic/semantic-ui-react-form';*/
import {DeleteItemButton} from './components/DeleteItemButton';
import {InsertButton} from './components/InsertButton';
import {MoveDownButton} from './components/MoveDownButton';
import {MoveUpButton} from './components/MoveUpButton';


/*type WebcrawlCollectorFormValues = {
	baseUri :string
	excludes ?:Array<string>
	userAgent ?:string
}*/


const DEFAULT_UA = 'Mozilla/5.0 (compatible; Enonic XP Explorer Collector Web crawler/1.0.0)';


export const Collector = ({
	collectorConfig,
	setCollectorConfig,
	//explorer,
	//isFirstRun
} :CollectorProps) => {
	console.debug('Collector collectorConfig', collectorConfig);

	const [baseUri, setBaseUri] = React.useState<string>(collectorConfig
		? (collectorConfig.baseUri || '')
		: ''
	);
	const [baseUriError, setBaseUriError] = React.useState<string>();
	const [excludesArray, setExcludesArray] = React.useState<Array<string>>(
		collectorConfig && collectorConfig.excludes ? forceArray(collectorConfig.excludes) : undefined
	);
	const [userAgent, setUserAgent] = React.useState<string>(collectorConfig
		? (collectorConfig.baseUri || '')
		: ''
	);

	React.useEffect(() => setBaseUriError(baseUri ? undefined : 'Uri is required!'),[
		baseUri
	]);

	React.useEffect(() => {
		setCollectorConfig({
			baseUri,
			excludes: excludesArray,
			userAgent
		});
	},[
		baseUri,
		excludesArray,,
		setCollectorConfig,
		userAgent
	]);

	/*React.useEffect(() => {
		//if (isFirstRun.current) {
		//console.debug('isFirstRun');
		//isFirstRun.current = false;
		// There are no changes, errors or visits yet!
		if (collectorConfig) {
			if (collectorConfig[EXCLUDES_PATH] && !Array.isArray(collectorConfig[EXCLUDES_PATH])) {
				collectorConfig[EXCLUDES_PATH] = [collectorConfig[EXCLUDES_PATH]];
				setCollectorConfig(collectorConfig);
			}
		} else {
			setCollectorConfig({
				baseUri: ''//,
				//excludes: [''],
				//userAgent: ''
			});
		}
		//}
	},[ // eslint-disable-line react-hooks/exhaustive-deps
		//collectorConfig, // This will change everytime setCollectorConfig is called...might cause loop?
		//isFirstRun,
		setCollectorConfig
	])*/

	return <Form>
		<Form.Input
			error={baseUriError}
			fluid
			label='Uri'
			onBlur={() => {
				if(!baseUri) {
					setBaseUriError('Uri is required!');
				}
			}}
			onChange={(_event,{value}) => setBaseUri(value)}
			value={baseUri}
		/>
		{excludesArray && Array.isArray(excludesArray) && excludesArray.length
			? <>
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
						return <Table.Row key={index}>
							<Table.Cell>
								<Input
									fluid
									onChange={(_event,{value}) => {
										const deref = JSON.parse(JSON.stringify(excludesArray));
										deref[index] = value;
										setExcludesArray(deref);
									}}
									value={exclude}
								/>
							</Table.Cell>
							<Table.Cell collapsing>
								<Button.Group>
									<InsertButton
										array={excludesArray}
										insertAtIndex={index + 1}
										setArrayFunction={setExcludesArray}
										valueToInsert=''
									/>
									<MoveDownButton
										array={excludesArray}
										index={index}
										setArrayFunction={setExcludesArray}
									/>
									<MoveUpButton
										array={excludesArray}
										index={index}
										setArrayFunction={setExcludesArray}
									/>
									<DeleteItemButton
										array={excludesArray}
										disabled={false}
										index={index}
										setArrayFunction={setExcludesArray}
									/>
								</Button.Group>
							</Table.Cell>
						</Table.Row>;
					})}</Table.Body>
				</Table>
			</>
			: <Form.Field>
				<Button
					onClick={() => {
						setExcludesArray(['']);
					}}
				>
					<Icon color='green' name='plus'/>Add exclude pattern(s)
				</Button>
			</Form.Field>
		}
		<Form.Input
			fluid
			label='Custom User-Agent'
			onChange={(_event,{value}) => setUserAgent(value)}
			placeholder={`Leave empty to use ${DEFAULT_UA}`}
			value={userAgent}
		/>
	</Form>;
} // Collector
