import type {SearchProps} from './useSearchState';
//import type {AnyObject} from '@enonic/js-utils/src/types';
//import type {Fields} from '/lib/explorer/types/Field.d';

/*import {
	getIn,
	setIn//,
	//ucFirst
} from '@enonic/js-utils';*/
import {Form} from 'semantic-ui-react';
//import traverse from 'traverse';

import {Hits} from './Hits';
import {Accordion} from './Accordion';
import {useSearchState} from './useSearchState';

//type CacheKey = `${InterfaceName}.${SearchString}`;
//type Cache = Record<CacheKey,SearchResult>;
//const forceArray = data => Array.isArray(data) ? data : [data];


export function Search(props: SearchProps) {
	const {
		boolOnChange, setBoolOnChange,
		loading, // setLoading,
		result, // setResult,
		search,
		searchString, setSearchString,
	} = useSearchState({
		fieldsProp: props.fields,
		interfaceNameProp: props.interfaceName,
		searchStringProp: props.searchString
	});
	const {
		//documentTypesAndFields = [],
		//collectionOptions = [],
		firstColumnWidth = 2,
		//thesaurusOptions = []
	} = props;
	//console.debug('documentTypesAndFields', documentTypesAndFields);
	//const [synonyms, setSynonyms] = React.useState([]);

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
						_event,
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
						_event,
						{checked}
					) => setBoolOnChange(checked)}
				/>
			</Form.Group>
		</Form>
		<Accordion
			locales={result.locales || []}
			profiling={result.profiling || []}
			synonyms={result.synonyms || []}
		/>
		<Hits
			firstColumnWidth={firstColumnWidth}
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
