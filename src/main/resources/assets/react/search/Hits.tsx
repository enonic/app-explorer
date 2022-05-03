import ReactHtmlParser from 'react-html-parser';

import {Header, List} from 'semantic-ui-react';

//import {toStr} from '../utils/toStr';


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
				text,
				title,
				href: uri//,
				//source,
				//informationType,
				//language
			}, index) => <List.Item key={index}>
				<a href={uri}>
					<Header>{ReactHtmlParser(title)}</Header>
					<p>{uri}</p>
				</a>
				<p dangerouslySetInnerHTML={{__html: text}}/>
				{/*<Labels mini>
					{forceMap(source, ({displayName}, i) =>
						<Label basic pointing key={`source${i}`}><Icon className='database'/>{displayName}</Label>)}
					{forceMap(informationType, ({displayName}, i) =>
						<Label basic pointing key={`informationType${i}`}><Icon className='sitemap'/>{displayName}</Label>)}
					{forceMap(language, ({displayName}, i) =>
						<Label basic pointing key={`language${i}`}><Icon className='font'/>{displayName}</Label>)}
				</Labels>*/}
			</List.Item>)
		}
	</List>;
}; // Hits
