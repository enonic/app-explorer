import {Header, Segment} from 'semantic-ui-react';
import getIn from 'get-value';

import {getEnonicContext} from '../enonic/Context';
import {actions} from '../enonic/Form';


export function CollectorOptions(props) {
	//console.debug('CollectorOptions props', props);
	const {
		collectorsObj,
		contentTypeOptions,
		fields,
		siteOptions
	} = props;

	const [context, dispatch] = getEnonicContext();
	//console.debug('CollectorOptions context', context);
	const collectorName = getIn(context.values, 'collector.name');

	if (!collectorName) { return null; }

	if (!collectorsObj[collectorName]) { return <p>Collector {collectorName} NOT found!</p>; }

	return <Segment color='pink'>
		<Header as='h2' dividing content={collectorName} id='collector'/>
		{collectorsObj[collectorName]({
			actions,
			context,
			dispatch,
			explorer: {
				contentTypeOptions,
				fields,
				siteOptions
			}
		})}
	</Segment>;
} // function CollectorOptions
