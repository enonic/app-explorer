//import type {Fields} from '/lib/explorer/types/Field.d';
import type {Hit} from './search/Hits';

import {
	getIn,
	setIn//,
	//ucFirst
} from '@enonic/js-utils';
import * as React from 'react';
import {Form} from 'semantic-ui-react';
//import traverse from 'traverse';

import {Hits} from './search/Hits';


type InterfaceName = string;
type SearchString = string;
type CacheKey = `${InterfaceName}.${SearchString}`;
type SearchResult = {
	count :number
	hits :Array<Hit>
	total :number
}
type Cache = Record<CacheKey,SearchResult>;


//const forceArray = data => Array.isArray(data) ? data : [data];

const SEARCH_QUERY = `query SearchQuery(
	$searchString: String!
	$count: Int
	$start: Int
) {
	search(
		count: $count
		highlight: {
			numberOfFragments: 1
			postTag: "</b>"
			preTag: "<b>"
			properties: {
				_alltext: {}
			}
		}
		searchString: $searchString
		start: $start
	) {
		count
		total
		hits {
			_collectionName
			_documentTypeName
			_highlight {
				_alltext
			}
			_json
			_score
		}
	}
}`;


export function Search(props :{
	//documentTypesAndFields ?:Record<string,Fields>
	interfaceName ?:InterfaceName
	searchString ?:SearchString
}) {

	const {
		//documentTypesAndFields = [],
		//collectionOptions = [],
		interfaceName = 'default',
		//thesaurusOptions = []
	} = props;
	//console.debug('documentTypesAndFields', documentTypesAndFields);
	//console.debug('Search interfaceName', interfaceName);

	const [boolOnChange, setBoolOnChange] = React.useState(false);
	//console.debug('Search boolOnChange', boolOnChange);

	const [loading, setLoading] = React.useState(false);
	//console.debug('Search loading', loading);

	const [searchString, setSearchString] = React.useState(props.searchString || '');
	//console.debug('Search searchString', searchString);

	const [cache, setCache] = React.useState({} as Cache);
	//console.debug('Search cache', cache);

	const [result, setResult] = React.useState({
		count: 0,
		hits: [],
		total: 0
	} as SearchResult);
	//console.debug('Search result', result);

	function search(ss :string) {
		if(!ss) {
			setResult({
				count: 0,
				hits: [],
				total: 0
			});
			return;
		}
		const cachedResult = getIn(
			cache,
			`${interfaceName}.${ss}`
		) as SearchResult;
		if (cachedResult) {
			setResult(cachedResult);
			return;
		}
		setLoading(true);
		const uri = `./explorer/api/v1/interface/${interfaceName}`;
		//console.debug(uri);
		fetch(uri, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				query: SEARCH_QUERY,
				variables: {
					//count: 10,
					searchString: ss//,
					//start: 0
				}
			})
		})
			.then(response => response.json())
			.then(aResult => {
				//console.debug(aResult);
				if (aResult && aResult.data && aResult.data.search) {
					setCache(prev => {
						const deref = JSON.parse(JSON.stringify(prev));
						setIn(deref, `${interfaceName}.${ss}`, aResult.data.search);
						return deref;
					});
					setResult(aResult.data.search);
				}
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
					onKeyUp={(event :{
						which :number
					}) => {
						//console.debug('onKeyUp event.which',event.which);
						if(event.which == 10 || event.which == 13) {
							//console.debug('onKeyUp searchString',searchString);
							search(searchString);
						}
					}}
					onChange={(
						//@ts-ignore
						ignored,
						{value}
					) => {
						//console.debug('onChange value',value);
						setSearchString(value);
						if (boolOnChange) {
							search(value);
						}
					}}
				/>
				<Form.Checkbox
					checked={boolOnChange}
					label='Search on every input change?'
					onChange={(
						//@ts-ignore
						ignored,
						{checked}
					)=>setBoolOnChange(checked)}
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
