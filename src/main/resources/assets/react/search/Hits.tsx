// A utility for converting HTML strings into React components.
// Avoids the use of dangerouslySetInnerHTML and converts standard HTML elements,
// attributes and inline styles into their React equivalents.
//import ReactHtmlParser from 'react-html-parser';
import ReactJson from 'react-json-view'

import {
	//Header,
	List,
	Table
} from 'semantic-ui-react';

//import {toStr} from '../utils/toStr';


export type Hit = {
	_collectionName :string
	_documentTypeName :string
	_json :string
	_score :number
}

/*const forceMap = (str, fn) => {
	return (Array.isArray(str) ? str : [str]).map(fn);
}*/


export const Hits = ({
	hits = [],
	loading
}) => {
	/*console.debug(toStr({
		component: 'Hits',
		hits,
		loading
	}));*/
	if (loading) {
		return <div className="ui segment">
  			<div className="ui active inverted dimmer">
    			<div className="ui text loader">Searching...</div>
  			</div>
  			<p>&nbsp;<br/>&nbsp;<br/>&nbsp;</p>
		</div>;
	}
	return <List animated divided selection>
		{
			hits.map(({
				_collectionName,
				_documentTypeName,
				_highlight,
				_json,
				_score
			}, index) => <List.Item key={index}>
				<Table basic compact fixed selectable>
					<Table.Body>
      					<Table.Row>
							<Table.Cell width={3}><b>Collection Name</b></Table.Cell>
							<Table.Cell width={13}>{_collectionName}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell><b>DocumentType Name</b></Table.Cell>
							<Table.Cell>{_documentTypeName}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell><b>Score</b></Table.Cell>
							<Table.Cell>{_score}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell><b>Hightlight</b></Table.Cell>
							<Table.Cell><ReactJson
								enableClipboard={true}
								displayDataTypes={false}
								name={null}
								src={_highlight}
							/></Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell><b>JSON</b></Table.Cell>
							<Table.Cell><ReactJson
								enableClipboard={true}
								displayDataTypes={false}
								name={null}
								src={JSON.parse(_json)}
							/></Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table>
			</List.Item>)
		}
	</List>;
}; // Hits
