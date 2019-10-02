import getIn from 'get-value';
import setIn from 'set-value';

import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
import {Input as EnonicInput} from 'semantic-ui-react-form/inputs/Input';

import {Hits} from './search/Hits';


//const forceArray = data => Array.isArray(data) ? data : [data];


export function Search(props) {
	const {
		collectionOptions = [],
		thesaurusOptions = [],
		servicesBaseUrl
	} = props;

	const [state, setState] = React.useState({
		cache: {},
		searchString: props.searchString || '',
		interfaceName: props.interfaceName || 'default'
	});

	const {
		cache,
		interfaceName,
		searchString
	} = state;
	//console.debug('Search interfaceName', interfaceName, 'searchString', searchString, 'cache', cache);

	function search({
		searchString
	} = {}) {
		if(!interfaceName || !searchString) {
			setState(prev => {
				const deref = JSON.parse(JSON.stringify(prev));
				deref.searchString = searchString;
				return deref;
			})
			return;
		}
		const uri = `${servicesBaseUrl}/search?interface=${interfaceName}&name=searchString&searchString=${searchString}`;
		//console.debug(uri);
		fetch(uri)
			.then(response => response.json())
			.then(data => setState(prev => {
				const deref = JSON.parse(JSON.stringify(prev));
				setIn(deref, `cache.${interfaceName}.${searchString}`, data);
				deref.searchString = searchString;
				return deref;
			}));
	}

	React.useEffect(() => search({searchString}), []);

	//const data = searchString && cache[interfaceName] && cache[interfaceName][searchString];
	const data = getIn(cache, `${interfaceName}.${searchString}`);
	const hits = data ? data.hits : [];
	//const synonyms = data && data.synonymsObj;
	const loading = searchString && !data;
	/*console.debug('Search', {
		//collections,
		hits,
		loading//,
		//thesauri
	});*/

	return <>
		<EnonicForm
			initialValues={{
				searchString
			}}
			onChange={({searchString}) => {
				//console.debug('onChange searchString', searchString);
				search({searchString});
			}}
		>
			<EnonicInput
				fluid
				icon='search'
				loading={false}
				path='searchString'
			/>
		</EnonicForm>
		<Hits
			hits={hits}
			loading={loading}
		/>
	</>;
} // function Search

/*

updateInterfaces() {
	this.setState({ isLoading: true });
	fetch(`${this.props.servicesBaseUrl}/interfaceList`)
		.then(response => response.json())
		.then(data => this.setState(prevState => {
			prevState.interfaceOptions = data.hits.map(({displayName: text, name: key}) => ({
				key,
				text,
				value: key
			}));
			if (prevState.interfaceName && !prevState.interfaceOptions.map(({key}) => key).includes(prevState.interfaceName)) {
				prevState.interfaceName = '';
			}
			if (!prevState.interfaceName && prevState.interfaceOptions.length) {
				prevState.interfaceName = prevState.interfaceOptions[0].key;
			}
			prevState.isLoading = false;
			return prevState;
		}));
} // updateInterfaces

<Dropdown
	fluid
	onChange={(ignored,{value}) => {
		//console.debug(value);
		this.setState({interfaceName: value});
	}}
	options={interfaceOptions}
	placeholder={interfaceOptions.length ? 'Please select an interface' : 'You must first configure an interface!'}
	search
	selection
	value={interfaceName}
/>

<Select
	label="Collections"
	multiple={true}
	name="collections"
	options={collectionOptions}
	value={collections}
/>

<Select
	label="Thesauri"
	multiple={true}
	name="thesauri"
	options={thesaurusOptions}
	value={thesauri}
/>

{synonyms ? <>
	<Header dividing text='Synonyms'/>
	<Table basic collapsing compact small very>
		<thead>
			<tr>
				<th>Thesaurus</th>
				<th>Score</th>
				<th>From</th>
				<th>To</th>
			</tr>
		</thead>
		<tbody>
			{Object.keys(synonyms).map((thesaurus, i) => Object.keys(synonyms[thesaurus]).map((from, j) => <tr className="middle aligned" key={`${i}.${j}`}>
				{j === 0 ? <td rowSpan={Object.keys(synonyms[thesaurus]).length}>{thesaurus}</td> : null}
				<td>{synonyms[thesaurus][from].score}</td>
				<td>{data.expand ? <Label basic mini text={from}/> : from}</td>
				<td><Labels mini>{forceArray(synonyms[thesaurus][from].to).map((t, k) => <Label basic key={k} text={t}/>)}</Labels></td>
			</tr>))}
		</tbody>
	</Table>
</> : null}

*/
