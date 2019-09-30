import {Form, Header, Loader} from 'semantic-ui-react';
import generateUuidv4 from 'uuid/v4';

import {Form as EnonicForm} from '../enonic/Form';
import {Dropdown} from '../enonic/Dropdown';
import {Input} from '../enonic/Input';

import {ResetButton} from '../enonic/ResetButton';
import {SubmitButton} from '../enonic/SubmitButton';

import {QueryFiltersBuilder} from './query/QueryFiltersBuilder';


export function NewOrEditInterface(props) {
	const {
		collectionOptions,
		fieldsObj,
		id, // nullable
		name, // nullable
		servicesBaseUrl,
		stopWordOptions,
		thesauriOptions
	} = props;
	//console.debug('NewOrEditInterface stopWordOptions', stopWordOptions);
	//console.debug('NewOrEditInterface thesauriOptions', thesauriOptions);

	//const [isLoading, setLoading] = React.useState(!!id);
	const [state, setState] = React.useState({
		initialValues: {
			collections: [],
			displayName: '',
			facets: [],
			filters: {},
			name: '',
			//query,
			resultMappings: [{
				field: '',
				highlight: false,
				join: true,
				lengthLimit: '',
				separator: ' ',
				to: '',
				uuid4: generateUuidv4()
			}],
			stopWords: [],
			thesauri: []
		},
		isLoading: !!id
	});

	React.useEffect(() => {
		if (!id) {return;}
		fetch(`${servicesBaseUrl}/interfaceGet?id=${id}`)
			.then(response => response.json())
			.then(data => {
				setState(prev => {
					const deref = JSON.parse(JSON.stringify(prev));
					deref.isLoading = false;
					deref.initialValues = data;
					return deref;
				})
			});
	}, []);

	const {initialValues, isLoading} = state;

	return isLoading ? <Loader active inverted>Loading</Loader> : <EnonicForm
		initialValues={initialValues}
		onSubmit={(values) => {
			console.debug('submit values', values);
			/*
				fetch(`${servicesBaseUrl}/interface${id ? 'Modify' : 'Create'}?json=${JSON.stringify(values)}${name ? `&name=${name}` : ''}`, {
					method: 'POST'
				}).then(response => {
					if (response.status === 200) { doClose(); }
				})
			*/
		}}
	>
		<Form as='div'>
			<Form.Field>
				<Input
					fluid
					label={{basic: true, content: 'Name'}}
					path='name'
					placeholder='Please input name'
				/>
			</Form.Field>
			<Header as='h2' content='Collection(s)' dividing id='collections'/>
			<Form.Field>
				<Dropdown
					multiple={true}
					options={collectionOptions}
					path='collections'
					placeholder='Please select one or more collections...'
					selection
				/>
			</Form.Field>
			<QueryFiltersBuilder
				fieldsObj={fieldsObj}
			/>
			<Header as='h3' content='Stop words' dividing id='stopwords'/>
			<Dropdown
				fluid
				multiple={true}
				options={stopWordOptions}
				path='stopWords'
				search
				selection
			/>
			<Form.Field>
				<SubmitButton/>
				<ResetButton/>
			</Form.Field>
		</Form>
	</EnonicForm>;
} // function NewOrEditInterface
