import {Form, Header, Loader} from 'semantic-ui-react';
//import generateUuidv4 from 'uuid/v4';

import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';
import {Input} from 'semantic-ui-react-form/inputs/Input';

import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';

import {Facets} from './Facets';
import {QueryBuilder} from './query/QueryBuilder';
import {QueryFiltersBuilder} from './query/QueryFiltersBuilder';
import {ResultMappings} from './ResultMappings';


export function NewOrEditInterface(props) {
	const {
		collectionOptions,
		fieldsObj,
		id, // nullable
		onClose,
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
				type: 'string'
				//uuid4: generateUuidv4()
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
			//const {_name} = values;
			//console.debug('submit values', values);
			let url = `${servicesBaseUrl}/interface`;
			if (id) {
				url = `${url}Modify?id=${id}&json=${JSON.stringify(values)}`;
			} else {
				url = `${url}Create?json=${JSON.stringify(values)}`;
			}
			fetch(url, {
				method: 'POST'
			}).then(response => {
				if (response.status === 200) { onClose(); }
			})
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
			<QueryBuilder
				fieldsObj={fieldsObj}
				id='query'
				legend='Query'
				thesauriOptions={thesauriOptions}
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
			<ResultMappings
				fieldsObj={fieldsObj}
				id='resultmappings'
				legend='Result mapping(s)'
			/>
			<Facets
				fieldsObj={fieldsObj}
				id='facets'
				legend='Facet(s)'
			/>
			<Form.Field>
				<SubmitButton/>
				<ResetButton/>
			</Form.Field>
		</Form>
	</EnonicForm>;
} // function NewOrEditInterface
