import * as React from 'react';
import {mustStartWithALowercaseLetter} from '../utils/mustStartWithALowercaseLetter';
import {notDoubleUnderscore} from '../utils/notDoubleUnderscore';
import {onlyLowercaseAsciiLettersDigitsAndUnderscores} from '../utils/onlyLowercaseAsciiLettersDigitsAndUnderscores';
import {required} from '../utils/required';
import {useUpdateEffect} from '../utils/useUpdateEffect';


const GQL_MUTATION_THESAURUS_CREATE = `mutation CreateThesaurusMutation(
  $_name: String!,
  $language: ThesaurusLanguageInput!
) {
  createThesaurus(
    _name: $_name,
    language: $language
  ) {
    _id
    _name
    _nodeType
    _path
    language {
      from
      to
    }
  }
}`;

const GQL_MUTATION_THESAURUS_UPDATE = `mutation UpdateThesaurusMutation(
  $_id: ID!,
  $_name: String!,
  $language: ThesaurusLanguageInput!
) {
  updateThesaurus(
    _id: $_id,
    _name: $_name,
    language: $language
  ) {
    _id
    _name
    _nodeType
    _path
    language {
      from
      to
    }
  }
}`;


export function useNewOrEditThesaurusState({
	_id,
	_name,
	doClose,
	language,
	servicesBaseUrl,
	thesaurusNames
} :{
	_id ?:string
	_name :string
	doClose :() => void
	language ?:{
		from :string
		to :string
	}
	servicesBaseUrl :string
	thesaurusNames :Array<string>
}) {
	//console.debug('_name:', _name, ' language:', language);
	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [name, setName] = React.useState<string>(''); // Changes onMount
	const [nameError, setNameError] = React.useState<false|string>(false);
	//const [/*nameVisited*/, setNameVisited] = React.useState(false);

	const [fromLanguage, setFromLanguage] = React.useState<string>(''); // Changes onMount
	const [fromLanguageError, setFromLanguageError] = React.useState<false|string>(false);
	const [fromLanguageVisited, setFromLanguageVisited] = React.useState(false);

	const [toLanguage, setToLanguage] = React.useState<string>(''); // Changes onMount
	const [toLanguageError, setToLanguageError] = React.useState<false|string>(false);
	const [toLanguageVisited, setToLanguageVisited] = React.useState(false);

	const [loading, setLoading] = React.useState(false);

	//──────────────────────────────────────────────────────────────────────────
	// Callbacks (only depend on props, not state)
	//──────────────────────────────────────────────────────────────────────────
	const mustBeUnique = React.useCallback((v :string) => {
		if (thesaurusNames.includes(v)) {
			return `Name must be unique: Name '${v}' is already in use!`;
		}
	}, [thesaurusNames]);

	const validateName = React.useCallback((nameToValidate :string) => {
		const newNameError = _id ? false : required(nameToValidate)
			|| mustStartWithALowercaseLetter(nameToValidate)
			|| onlyLowercaseAsciiLettersDigitsAndUnderscores(nameToValidate)
			|| notDoubleUnderscore(nameToValidate)
			|| mustBeUnique(nameToValidate);
		setNameError(newNameError);
		return !newNameError;
	}, [_id, mustBeUnique]);

	const validateFromLanguage = React.useCallback((langToValidate :string) => {
		//console.debug('validateFromLanguage', langToValidate);
		const e = required(langToValidate);
		setFromLanguageError(e);
		return !e;
	}, []);

	const validateToLanguage = React.useCallback((langToValidate :string) => {
		//console.debug('validateToLanguage', langToValidate);
		const e = required(langToValidate);
		setToLanguageError(e);
		return !e;
	}, []);

	const validateForm = React.useCallback(({
		name,
		language: {
			from,
			to
		}
	}) => {
		/*console.debug('validateForm', {
			name,
			language: {
				from,
				to
			}
		});*/
		const nameValid = validateName(name);
		const fromLanguageValid = validateFromLanguage(from);
		const toLanguageValid = validateToLanguage(to);
		return nameValid && fromLanguageValid && toLanguageValid;
	}, [
		validateName,
		validateFromLanguage,
		validateToLanguage
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Updates
	//──────────────────────────────────────────────────────────────────────────
	useUpdateEffect(() => {
		if (fromLanguageVisited) {
			validateFromLanguage(fromLanguage);
		}
	}, [fromLanguage, fromLanguageVisited, validateFromLanguage]);

	useUpdateEffect(() => {
		if (toLanguageVisited) {
			validateToLanguage(toLanguage);
		}
	}, [toLanguage, toLanguageVisited, validateToLanguage]);

	//──────────────────────────────────────────────────────────────────────────
	// Event callbacks
	//──────────────────────────────────────────────────────────────────────────
	const nameOnBlur = React.useCallback((currentName :string) => {
		//setNameVisited(true);
		validateName(currentName);
	}, [validateName]);

	const nameOnChange = React.useCallback((
		_event :React.ChangeEvent<HTMLInputElement>,
		{value: newName}
	) => {
		setName(newName);
		validateName(newName);
	}, [validateName]);

	const fromLanguageOnBlur = React.useCallback((currentFromLanguage :string) => {
		setFromLanguageVisited(true);
		validateFromLanguage(currentFromLanguage);
	}, [validateFromLanguage]);

	const toLanguageOnBlur = React.useCallback((currentToLanguage :string) => {
		setToLanguageVisited(true);
		validateToLanguage(currentToLanguage);
	}, [validateToLanguage]);

	function resetState() {
		//setNameVisited(false);
		setFromLanguageVisited(false);
		setToLanguageVisited(false);

		setName(_name);
		setFromLanguage(language && language.from ? language.from : ''); // triggers validateFromLanguage
		setToLanguage(language && language.to ? language.to : ''); // triggers validateToLanguage

		setNameError(false);
		setFromLanguageError(false);
		setToLanguageError(false);
	}

	function onSubmit() {
		setLoading(true);
		if (!validateForm({
			name,
			language: {
				from: fromLanguage,
				to: toLanguage
			}
		})) {
			setLoading(false);
			return;
		}
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify({
				query: _id ? GQL_MUTATION_THESAURUS_UPDATE : GQL_MUTATION_THESAURUS_CREATE,
				variables: {
					_id,
					_name: name, // TODO Support rename?
					language: {
						from: fromLanguage,
						to: toLanguage
					}
				}
			})
		}).then((response) => {
			if (response.status === 200) {
				doClose();
			}
			setLoading(false);
		});
	}

	//──────────────────────────────────────────────────────────────────────────

	return {
		errorCount: (nameError ? 1 : 0) + (fromLanguageError ? 1 : 0) + (toLanguageError ? 1 : 0),
		fromLanguage,
		fromLanguageError,
		fromLanguageOnBlur,
		loading,
		isStateChanged: name !== _name
			|| fromLanguage !== (language && language.from ? language.from : '')
			|| toLanguage !== (language && language.to ? language.to : ''),
		name,
		nameError,
		nameOnBlur,
		nameOnChange,
		onSubmit,
		resetState,
		setFromLanguage,
		setToLanguage,
		toLanguage,
		toLanguageError,
		toLanguageOnBlur
	};
}
