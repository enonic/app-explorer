import type {License} from '../index.d';


import {
	Header, Grid, Icon, List
} from 'semantic-ui-react';
import {
	LICENSE_BSD_2_CLAUSE,
	LICENSE_BSD_3_CLAUSE,
	LICENSE_MIT,
	LICENSE_TEXT_BSD_2_CLAUSE,
	LICENSE_TEXT_BSD_3_CLAUSE,
	LICENSE_TEXT_MIT,
	NODE_MODULES,
} from '../constants';


export default function About({
	showWhichLicense, setShowWhichLicense,
}: {
	showWhichLicense: License
	setShowWhichLicense: React.Dispatch<React.SetStateAction<License>>
}) {
	return <>
		<Header as='h1' content='Licenses'/>
		<Grid columns={3} divided>
			<Grid.Row>
				<Grid.Column>
					<List animated divided relaxed selection>
						{NODE_MODULES.map(({
							description = LICENSE_MIT,
							header,
							href
						}, i) => <List.Item key={i}
							onMouseEnter={() => setShowWhichLicense(description as License)}
							onMouseLeave={() => setShowWhichLicense(undefined)}
						>
							<Icon color='red' size='large' aligned='middle' name='npm'/>
							<List.Content as='a' href={href}>
								<List.Header content={header}/>
								<List.Description content={description}/>
							</List.Content>
						</List.Item>)}
					</List>
				</Grid.Column>
				<Grid.Column>
					<pre>{showWhichLicense === LICENSE_MIT
						? LICENSE_TEXT_MIT
						: showWhichLicense === LICENSE_BSD_3_CLAUSE
							? LICENSE_TEXT_BSD_3_CLAUSE
							: showWhichLicense === LICENSE_BSD_2_CLAUSE
								? LICENSE_TEXT_BSD_2_CLAUSE
								: ''}</pre>
				</Grid.Column>
			</Grid.Row>
		</Grid>
	</>
}
