import type {Synonyms} from './index.d';


import ReactJson from 'react-json-view'
import {
	Accordion,
	Table
} from 'semantic-ui-react';


export function SynonymsAccordion({
	synonyms = []
} :{
	synonyms :Synonyms
}) {
	const panels = [{
		key: 0,
		title: 'Synonyms',
		content: {
			content: (
				<Table compact>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell content='Thesaurus'/>
							<Table.HeaderCell content='Score'/>
							<Table.HeaderCell content='Highlight'/>
							<Table.HeaderCell content='Synonyms'/>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{
							synonyms.map(({
								_highlight = {},
								_score,
								synonyms = [],
								thesaurusName
							}, i) => <Table.Row key={i}>
								<Table.Cell content={thesaurusName}/>
								<Table.Cell content={_score}/>
								<Table.Cell><ReactJson
									enableClipboard={false}
									displayArrayKey={false}
									displayDataTypes={false}
									displayObjectSize={false}
									indentWidth={2}
									name={null}
									quotesOnKeys={false}
									sortKeys={true}
									src={_highlight}
								/></Table.Cell>
								<Table.Cell><ReactJson
									enableClipboard={false}
									displayArrayKey={false}
									displayDataTypes={false}
									displayObjectSize={false}
									indentWidth={2}
									name={null}
									quotesOnKeys={false}
									sortKeys={true}
									src={synonyms}
								/></Table.Cell>
							</Table.Row>)
						}
					</Table.Body>
				</Table>
			)
		}
	}];
	return <Accordion
		defaultActiveIndex={[]}
		fluid
		panels={panels}
		styled
	/>;
}
