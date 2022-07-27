import {
	Accordion,
	Button,
	Dimmer,
	Icon,
	Loader,
	Modal,
	Placeholder,
	Popup
} from 'semantic-ui-react';
import {ResetButton} from '../../components/ResetButton';
import {SubmitButton} from '../../components/SubmitButton';
import {SynonymOptions} from './SynonymOptions';
import {SynonymLanguages} from './SynonymLanguages';
import {useNewOrEditSynonymState} from './useNewOrEditSynonymState';

//import Snowball from 'snowball';

/* Snowball languages
da: 'Danish',
nl: 'Dutch',
en: 'English',
fi: 'Finnish',
fr: 'French',
de: 'German',
hu: 'Hungarian',
it: 'Italian',
no: 'Norwegian',
pt: 'Portuguese',
ro: 'Romanian',
ru: 'Russian',
es: 'Spanish',
sv: 'Swedish',
tr: 'Turkish'
*/


export function NewOrEditSynonym({
	_id,
	afterClose = () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	beforeOpen = () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	//locales,
	servicesBaseUrl,
	thesaurusId,
} :{
	// Required
	servicesBaseUrl :string
	thesaurusId :string
	// Optional
	_id ?:string
	afterClose ?:() => void
	beforeOpen ?:() => void
}) {
	const {
		doClose,
		doOpen,
		interfaceOptions,
		isStateChanged,
		loading,
		open,
		resetState,
		setState,
		state,
		submit,
		thesaurusLanguages
	} = useNewOrEditSynonymState({
		afterClose,
		beforeOpen,
		servicesBaseUrl,
		thesaurusId
	});
	/*const fromStemmer = new Snowball('Norwegian');
	const toStemmer = new Snowball('English');*/
	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		size='fullscreen'
		trigger={_id ? <Popup
			content={`Edit synonym`}
			inverted
			trigger={<Button
				icon
				onClick={doOpen}
			><Icon color='blue' name='edit'/></Button>}/>
			: <Popup
				content={`New synonym`}
				inverted
				trigger={<Button
					icon
					onClick={doOpen}
				><Icon color='green' name='plus'/></Button>}/>
		}
	>
		<Modal.Header>{_id ? `Edit synonym ${_id}` : `New synonym`}</Modal.Header>
		{loading
			? <Dimmer.Dimmable dimmed>
				<Dimmer active inverted>
					<Loader size='large'>Loading</Loader>
				</Dimmer>
				<Placeholder>
					<Placeholder.Line length='short'/>
					<Placeholder.Paragraph>
						<Placeholder.Line length='very short'/>
						<Placeholder.Line length='full'/>
						<Placeholder.Line length='full'/>
					</Placeholder.Paragraph>
					<Placeholder.Paragraph>
						<Placeholder.Line length='very short'/>
						<Placeholder.Line length='full'/>
						<Placeholder.Line length='full'/>
					</Placeholder.Paragraph>
				</Placeholder>
			</Dimmer.Dimmable>
			: <Accordion
				defaultActiveIndex={[1]}
				exclusive={false}
				fluid
				panels={[{
					key: 0,
					title: 'Options',
					content: {
						content: (
							<SynonymOptions
								interfaceOptions={interfaceOptions}
								setState={setState}
								state={state}
							/>
						)
					}
				},{
					key: 1,
					title: 'Languages',
					content: {
						content: (
							<SynonymLanguages
								interfaceOptions={interfaceOptions}
								setState={setState}
								state={state}
								thesaurusLanguages={thesaurusLanguages}
							/>
						)
					}
				}]}
				styled
			/>
		}
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			<ResetButton
				isStateChanged={isStateChanged}
				onClick={resetState}
				secondary
			/>
			<SubmitButton
				isStateChanged={isStateChanged}
				onClick={submit}
			/>
		</Modal.Actions>
	</Modal>;
} // NewOrEditSynonym
