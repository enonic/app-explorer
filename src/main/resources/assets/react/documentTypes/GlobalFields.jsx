import getIn from 'get-value';
import {Radio, Table} from 'semantic-ui-react';
import {getEnonicContext} from 'semantic-ui-react-form/Context';
import {setValue} from 'semantic-ui-react-form';

import {Checkmark} from '../components/Checkmark';
import {Span} from '../components/Span';


export const GlobalFields = ({
	globalFields
}) => {
	const [context, dispatch] = getEnonicContext();

	const fields = getIn(context.values, 'fields');
	//console.debug('fields', fields);

	const selectedFields = {};
	fields.forEach(({fieldId}) => {
		selectedFields[fieldId] = true;
	});
	//console.debug('selectedFields', selectedFields);

	return <Table celled compact selectable singleLine striped>
		<Table.Header>
			<Table.Row>
				<Table.HeaderCell collapsing textAlign='center'>Add</Table.HeaderCell>
				<Table.HeaderCell>Name</Table.HeaderCell>
				<Table.HeaderCell collapsing>Value type</Table.HeaderCell>
				<Table.HeaderCell collapsing textAlign='center'>Min</Table.HeaderCell>
				<Table.HeaderCell collapsing textAlign='center'>Max</Table.HeaderCell>
				<Table.HeaderCell collapsing textAlign='center'>Indexing</Table.HeaderCell>
				<Table.HeaderCell collapsing textAlign='center'>Include in _allText</Table.HeaderCell>
				<Table.HeaderCell collapsing textAlign='center'>Fulltext</Table.HeaderCell>
				<Table.HeaderCell collapsing textAlign='center'>Ngram</Table.HeaderCell>
				<Table.HeaderCell collapsing textAlign='center'>Path</Table.HeaderCell>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{globalFields.filter(({_id}) => !selectedFields[_id]).map(({
				_id,
				enabled,
				fieldType,
				fulltext,
				includeInAllText,
				key,
				max,
				min,
				nGram,
				path
			}, i) => <Table.Row key={i}>
				<Table.Cell collapsing textAlign='center'><Radio
					checked={false}
					onClick={() => dispatch(setValue({path: `fields.${fields.length}`, value: {
						active: true,
						fieldId: _id
					}}))}
					toggle/></Table.Cell>
				<Table.Cell>{key}</Table.Cell>
				<Table.Cell collapsing><Span color='grey'>{fieldType}</Span></Table.Cell>
				<Table.Cell collapsing textAlign='center'><Span color='grey'>{min === 0 ? null : min}</Span></Table.Cell>
				<Table.Cell collapsing textAlign='center'><Span color='grey'>{max === 0 ? '∞' : max}</Span></Table.Cell>
				<Table.Cell textAlign='center'><Checkmark disabled checked={enabled} size='large'/></Table.Cell>
				<Table.Cell textAlign='center'>{enabled
					? <Checkmark disabled checked={includeInAllText} size='large'/>
					: null
				}</Table.Cell>
				<Table.Cell textAlign='center'>{enabled
					? <Checkmark disabled checked={fulltext} size='large'/>
					: null
				}</Table.Cell>
				<Table.Cell textAlign='center'>{enabled
					? <Checkmark disabled checked={nGram} size='large'/>
					: null
				}</Table.Cell>
				<Table.Cell textAlign='center'>{enabled
					? <Checkmark disabled checked={path} size='large'/>
					: null
				}</Table.Cell>
			</Table.Row>)}
		</Table.Body>
	</Table>;
};
