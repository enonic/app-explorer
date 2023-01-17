import type {License} from '../index.d';


import {
	Header,
	Icon,
	List,
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
import Flex from '../components/Flex';


export default function About({
	showWhichLicense, setShowWhichLicense,
}: {
	showWhichLicense: License
	setShowWhichLicense: React.Dispatch<React.SetStateAction<License>>
}) {
	return <Flex
		className='mt-1rem'
		justifyContent='center'
	>
		<Flex.Item
			className={[
				'w-ma-fullExceptGutters',
				'w-mi-tabletExceptGutters-tabletUp',
				'w-mi-computerExceptGutters-computerUp',
				'w-mi-largeExceptGutters-largeUp',
				// 'w-mi-widescreenExceptGutters-widescreenUp',
				'w-fullExceptGutters-mobileDown',
			].join(' ')}
			overflowX='overlay'
			overflowY={false}
		>
			<Header as='h1' content='Licenses'/>
			<Flex
				justifyContent='space-between'
				gap
				marginBottom
			>
				<Flex.Item>
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
				</Flex.Item>
				<Flex.Item>
					<pre>{showWhichLicense === LICENSE_MIT
						? LICENSE_TEXT_MIT
						: showWhichLicense === LICENSE_BSD_3_CLAUSE
							? LICENSE_TEXT_BSD_3_CLAUSE
							: showWhichLicense === LICENSE_BSD_2_CLAUSE
								? LICENSE_TEXT_BSD_2_CLAUSE
								: ''}</pre>
				</Flex.Item>
			</Flex>
		</Flex.Item>
	</Flex>
}
