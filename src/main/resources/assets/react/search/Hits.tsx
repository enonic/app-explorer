import type {AnyObject} from '@enonic/js-utils/src/types';
import type {SemanticWIDTHS} from 'semantic-ui-react';

// A utility for converting HTML strings into React components.
// Avoids the use of dangerouslySetInnerHTML and converts standard HTML elements,
// attributes and inline styles into their React equivalents.
//import ReactHtmlParser from 'react-html-parser';
import {TypedReactJson} from './TypedReactJson';

import {
	//Header,
	List,
	Table
} from 'semantic-ui-react';

//import {toStr} from '../utils/toStr';


export type Hit = {
	_collectionName :string
	_documentTypeName :string
	_json :AnyObject // used to be string
	_highlight :Record<string,Array<string>>
	_score :number
}

/*const forceMap = (str, fn) => {
	return (Array.isArray(str) ? str : [str]).map(fn);
}*/


export const Hits = ({
	firstColumnWidth = 2,
	hits = [],
	loading
} :{
	firstColumnWidth ?:1|2|3|4|5|6|7|8|9|10|11|12|13|14|15
	hits :Array<Hit>
	loading :boolean
}) => {
	const secondColumnWidth = 16 - firstColumnWidth as SemanticWIDTHS;
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
	return <List relaxed='very'>
		{
			hits.map(({
				_collectionName,
				_documentTypeName,
				_highlight,
				_json,
				_score
			}, index) => {
				return <List.Item key={index}>
					<Table compact definition fixed>
						<Table.Body>
							<Table.Row>
								<Table.Cell textAlign='right' width={firstColumnWidth}>Collection name</Table.Cell>
								<Table.Cell width={secondColumnWidth}>{_collectionName}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Cell textAlign='right'>DocumentType name</Table.Cell>
								<Table.Cell>{_documentTypeName}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Cell textAlign='right'>Score</Table.Cell>
								<Table.Cell>{_score}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Cell textAlign='right'>Hightlight</Table.Cell>
								<Table.Cell><TypedReactJson
									enableClipboard={true}
									displayArrayKey={false}
									displayDataTypes={false}
									displayObjectSize={false}
									indentWidth={2}
									name={null}
									quotesOnKeys={false}
									sortKeys={true}
									src={_highlight}
								/></Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Cell textAlign='right'>JSON</Table.Cell>
								<Table.Cell><TypedReactJson
									enableClipboard={true}
									displayArrayKey={false}
									displayDataTypes={false}
									displayObjectSize={false}
									indentWidth={2}
									name={null}
									quotesOnKeys={false}
									sortKeys={true}
									src={_json}
								/></Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table>
				</List.Item>;})
		}
	</List>;
}; // Hits
