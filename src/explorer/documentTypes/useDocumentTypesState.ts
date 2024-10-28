import type {
	DocumentTypeModal,
	DocumentTypesObj
} from './index.d';


import * as React from 'react';
import {fetchDocumentTypes} from '../fetchers/fetchDocumentTypes';
//import {fetchFields} from '../fetchers/fetchFields';
import {buildDocumentTypesObj} from './buildDocumentTypesObj';


export function getDefaultModalState(open = false) :DocumentTypeModal {
	return {
		_id: undefined,
		_name: undefined,
		open
	};
}


export function useDocumentTypesState({
	servicesBaseUrl
} :{
	servicesBaseUrl: string
}) {
	//const [globalFields, setGlobalFields] = React.useState([]);
	const [isLoading, setIsLoading] = React.useState(false);
	const [documentTypes, setDocumentTypes] = React.useState<DocumentTypesObj>({});
	const [currentDocumentTypeName, setCurrentDocumentTypeName] = React.useState('');
	const [editManagedDocumentTypeWarningModalOpen, setEditManagedDocumentTypeWarningModalOpen] = React.useState(false);


	// The modal state should be handled by newOrEditDocumentTypeModal
	const [newOrEditModalState, setNewOrEditModalState] = React.useState<DocumentTypeModal>(getDefaultModalState());

	const [showAllFields, setShowAllFields] = React.useState(true);
	//console.debug('DocumentTypes documentTypes', documentTypes);

	/*const globalFieldsObj = {};
	globalFields.forEach(({
		_id, key, fieldType,
		min, max,
		decideByType, enabled, fulltext, includeInAllText, nGram, path
	}) => {
		globalFieldsObj[_id] = {
			key, fieldType,
			min, max,
			decideByType, enabled, fulltext, includeInAllText, nGram, path
		};
	});*/
	//console.debug('DocumentTypes globalFieldsObj', globalFieldsObj);
	const memoizedUpdateState = React.useCallback(() => {
		setIsLoading(true);
		/*fetchFields({
			handleData: (data) => {
				setGlobalFields((data as any).queryFields.hits);
			},
			url: `${servicesBaseUrl}/graphQL`,
			variables: {
				includeSystemFields: false
			}
		});*/
		fetchDocumentTypes({
			handleData: (data) => {
				setDocumentTypes(buildDocumentTypesObj(data));
				setIsLoading(false);
			},
			url: `${servicesBaseUrl}/graphQL`
		});
	}, [
		servicesBaseUrl
	]);

	React.useEffect(() => {
		// By default, useEffect() runs both after the first render and after every update.
		// React guarantees the DOM has been updated by the time it runs the effects.
		// React defers running useEffect until after the browser has painted, so doing extra work is less of a problem.
		//console.debug('DocumentTypes useEffect');
		memoizedUpdateState();
	}, [
		memoizedUpdateState
	]); // Only re-run the effect if whatevers inside [] changes
	// An empty array [] means on mount and unmount. This tells React that your effect doesn’t depend on any values from props or state.
	// If you pass an empty array ([]), the props and state inside the effect will always have their initial values

	return {
		currentDocumentTypeName, setCurrentDocumentTypeName,
		documentTypes,
		editManagedDocumentTypeWarningModalOpen, setEditManagedDocumentTypeWarningModalOpen,
		isLoading,
		memoizedUpdateState,
		newOrEditModalState, setNewOrEditModalState,
		showAllFields, setShowAllFields
	};
}
