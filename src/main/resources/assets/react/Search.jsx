import getIn from 'get-value';
import setIn from 'set-value';

import {Form} from 'semantic-ui-react';

import {Hits} from './search/Hits';


//const forceArray = data => Array.isArray(data) ? data : [data];


export function Search(props) {
	const {
		//collectionOptions = [],
		interfaceName = 'default',
		//thesaurusOptions = [],
		servicesBaseUrl
	} = props;
	//console.debug('Search interfaceName', interfaceName);

	const [boolOnChange, setBoolOnChange] = React.useState(false);
	//console.debug('Search boolOnChange', boolOnChange);

	const [loading, setLoading] = React.useState(false);
	//console.debug('Search loading', loading);

	const [searchString, setSearchString] = React.useState(props.searchString || '');
	//console.debug('Search searchString', searchString);

	const [cache, setCache] = React.useState({});
	//console.debug('Search cache', cache);

	const [result, setResult] = React.useState({
		count: 0,
		hits: [],
		total: 0
	});
	//console.debug('Search result', result);

	function search(ss) {
		if(!ss) {
			setResult({
				count: 0,
				hits: [],
				total: 0
			});
			return;
		}
		const cachedResult = getIn(cache, `${interfaceName}.${ss}`);
		if (cachedResult) {
			setResult(cachedResult);
			return;
		}
		setLoading(true);
		const uri = `${servicesBaseUrl}/search?interface=${interfaceName}&name=searchString&searchString=${ss}`;
		//console.debug(uri);
		fetch(uri)
			.then(response => response.json())
			.then(aResult => {
				setCache(prev => {
					const deref = JSON.parse(JSON.stringify(prev));
					setIn(deref, `${interfaceName}.${ss}`, aResult);
					return deref;
				});
				setResult(aResult);
				setLoading(false);
			});
	}

	React.useEffect(() => search(searchString), []);

	// NOTE: If you hold a key down, onKeyDown and onKeyPress happens multiple times!

	return <>
		<Form>
			<Form.Group widths='equal'>
				<Form.Input
					fluid
					icon='search'
					loading={false}
					onKeyUp={(event) => {
						//console.debug('onKeyUp event.which',event.which);
						if(event.which == 10 || event.which == 13) {
							//console.debug('onKeyUp searchString',searchString);
							search(searchString);
						}
					}}
					onChange={(ignored,{value}) => {
						//console.debug('onChange value',value);
						setSearchString(value);
						if (boolOnChange) {
							search(value);
						}
					}}
				/>
				<Form.Checkbox
					checked={boolOnChange}
					label='On change?'
					onChange={(ignored,{checked})=>setBoolOnChange(checked)}
				/>
			</Form.Group>
		</Form>
		<Hits
			hits={result.hits}
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
