import type {Locales} from '../index.d';

//import {Dropdown as SemanticUiReactDropdown} from 'semantic-ui-react';
//import {Flag} from 'semantic-ui-react';
//@ts-ignore
import {Dropdown} from 'semantic-ui-react-form';
//@ts-ignore
import {getEnonicContext} from 'semantic-ui-react-form/Context';
import getIn from 'get-value';

import {capitalize} from '../utils/capitalize';


export function LanguageDropdown(props :{
	disabled ?:boolean
	locales :Locales
	name ?:string
	parentPath ?:string
	path ?:string
	value ?:string
}) {
	//console.debug('LanguageDropdown props', props);
	const {
		disabled = false,
		locales = [],
		name = 'language',
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name,
		value
	} = props;
	const [context/*, dispatch*/] = getEnonicContext();

	const language = value || getIn(context.values, path);
	//console.debug('LanguageDropdown language', language);

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
	return <Dropdown
		disabled={disabled}
		fluid
		options={options}
		path={path}
		placeholder='Select language'
		search
		selection
		value={language}
	/>;
} // LanguageDropdown
