import type {
	DropdownItemProps,
	StrictDropdownProps
} from 'semantic-ui-react';
import type {Locales} from '../index.d';


//import {getIn} from '@enonic/js-utils';
import {Dropdown as SemanticUiReactDropdown} from 'semantic-ui-react';
//import {Flag} from 'semantic-ui-react';
/*import {
	Dropdown,
	getEnonicContext
} from '@enonic/semantic-ui-react-form';*/
import {capitalize} from '../utils/capitalize';


export function LanguageDropdown({
	language,
	locales = [],
	setLanguage,
	...rest
} :Omit<StrictDropdownProps,'onChange'|'options'|'value'> & {
	language :string
	setLanguage :(language :string) => void
	locales :Locales
}) {
	const options = locales.map(({
		country,
		//displayCountry,
		//displayLanguage,
		displayName,
		//displayVariant,
		//language,
		tag//,
		//variant
	}) => {
		const lcCountry = country ? country.toLowerCase() : undefined;
		const flag = lcCountry
			&& lcCountry !== '001'
			&& lcCountry !== 'ss'
			&& lcCountry !== '150'
			&& lcCountry !== 'dg'
			&& lcCountry !== 'gg'
			&& lcCountry !== 'im'
			&& lcCountry !== 'je'
			&& lcCountry !== 'sx'
			&& lcCountry !== '419'
			&& lcCountry !== 'ea'
			&& lcCountry !== 'ic'
			&& lcCountry !== 'bl'
			&& lcCountry !== 'mf'
			&& lcCountry !== 'bq'
			&& lcCountry !== 'cw'
			&& lcCountry !== 'xk'
			? lcCountry
			: undefined;
		return {
			flag,
			//image: { avatar: true, src: '/images/avatar/small/jenny.jpg' }
			key: tag,
			//text: `country:${country} displayCountry:${displayCountry} displayLanguage:${displayLanguage} displayName:${displayName} displayVariant:${displayVariant} language:${language} tag:${tag} variant:${variant}`,
			//text: `${displayName.replace(/\b\w/g, l => l.toUpperCase())} [${tag}]`, // Fails on å
			//text: `${displayName.replace(/(^|\s)\S/g, l => l.toUpperCase())} [${tag}]`,
			text: `${capitalize(displayName)} [${tag}]`,
			value: tag
		};
	}); // map
	const optionsWithANoneOption :Array<DropdownItemProps> = [{
		key: 'none',
		text: 'none'
	} as DropdownItemProps].concat(options);
	//console.debug('LanguageDropdown options', options);

	/*
	className='icon'
	button
	floating
	icon='world'
	labeled
	text='Select LAnguage'
	*/
	//return <Flag name={}/>
	return <SemanticUiReactDropdown
		clearable
		fluid
		placeholder='Select language'
		search
		selection
		{...rest}
		onChange={(_event,{value: newLanguage}) => setLanguage(newLanguage as string)}
		options={optionsWithANoneOption}
		value={language}
	/>;
} // LanguageDropdown
