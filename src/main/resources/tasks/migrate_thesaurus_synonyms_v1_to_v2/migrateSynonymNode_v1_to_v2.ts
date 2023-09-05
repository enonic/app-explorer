// Rememeber that migrations should not depend on files that changes,
// or the migration may fail due to those changes.


import type {SynonymNode as SynonymNodeV1} from '/lib/explorer/synonym/Synonym_v1';
import type {
	SynonymNodeModifyParams as SynonymNodeV2ModifyParams,
	Write_SynonymNode_Languages,
	Write_SynonymNode_LanguagesSynonymObject,
} from '/lib/explorer/synonym/Synonym_v2';

import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';
import { includes as arrayIncludes } from '@enonic/js-utils/array/includes';
import {buildSynonymIndexConfig} from '/lib/explorer/synonym/buildSynonymIndexConfig';
import {getUser} from '/lib/xp/auth';
import {reference as referenceValue} from '/lib/xp/value';


function intersect({
	a,
	b
} :{
	a :Array<string>,
	b :Array<string>
}) {
	const inBoth = [];
	const notInA = [];
	const notInB = [];

	for (let i = 0; i < a.length; i++) {
		const itemInA = a[i];
		if (arrayIncludes(b, itemInA)) {
			inBoth.push(itemInA);
		} else {
			notInB.push(itemInA);
		}
	}

	// At this point we have found the intersection of A and B.
	// So what's left to do is to "keep" what's not in the intersection...
	for (let i = 0; i < b.length; i++) {
		const itemInB = b[i];
		if (!arrayIncludes(inBoth, itemInB)) {
			notInA.push(itemInB);
		}
	}

	return {
		inBoth,
		notInA,
		notInB
	};
}


export function migrateSynonymNode_v1_to_v2({
	fromLocale,
	synonymNode_v1,
	thesaurusId,
	toLocale
} :{
	fromLocale :string
	synonymNode_v1 :SynonymNodeV1
	thesaurusId :string
	toLocale :string
}): SynonymNodeV2ModifyParams {
	const {
		from,
		to,
		//thesaurusReference // Applied in migration model 9, might not be there for data toolbox imported nodes...
	} = synonymNode_v1;

	const synonymNode_v2: SynonymNodeV2ModifyParams = JSON.parse(JSON.stringify(synonymNode_v1));
	delete (synonymNode_v2 as unknown as SynonymNodeV1).from;
	delete (synonymNode_v2 as unknown as SynonymNodeV1).to;
	delete (synonymNode_v2 as unknown as {displayName :string}).displayName; // Data toolbox imported ones might have this...
	//synonymNode_v2._name = synonymNode_v2._id; // This might cause collision... so let's not care about that.
	synonymNode_v2.comment = '';
	synonymNode_v2.enabled = true;
	synonymNode_v2.disabledInInterfaces = [];

	let bothArr = [];
	let cleanedFromArr = forceArray(from);
	let cleanedToArr = forceArray(to);
	if (toLocale === fromLocale) {
		const {
			inBoth,
			notInA,
			notInB
		} = intersect({
			a: cleanedFromArr,
			b: cleanedToArr
		});
		bothArr = inBoth;
		cleanedFromArr = notInB;
		cleanedToArr = notInA;
	} // toLocale === fromLocale

	const languages :Write_SynonymNode_Languages = {
		[fromLocale]: {
			both: [],
			comment: '',
			enabled: true,
			disabledInInterfaces: [],
			from: cleanedFromArr.map((synonym) => ({
				comment: '',
				enabled: true,
				disabledInInterfaces: [],
				synonym
			})),
			to: []
		}
	};
	const t: Write_SynonymNode_LanguagesSynonymObject[] = cleanedToArr.map((synonym) => ({
		comment: '',
		enabled: true,
		disabledInInterfaces: [],
		synonym
	}));
	if (toLocale === fromLocale) {
		languages[toLocale].both = bothArr.map((synonym) => ({
			comment: '',
			enabled: true,
			disabledInInterfaces: [],
			synonym
		}));
		languages[toLocale].to = t;
	} else {
		languages[toLocale] = {
			both: [],
			comment: '',
			enabled: true,
			disabledInInterfaces: [],
			from: [],
			to: t
		};
	}
	synonymNode_v2.languages = languages;
	synonymNode_v2.modifiedTime = new Date();
	synonymNode_v2.modifier = getUser().key;
	synonymNode_v2.nodeTypeVersion = 2;
	synonymNode_v2.thesaurusReference = referenceValue(thesaurusId);
	synonymNode_v2._indexConfig = buildSynonymIndexConfig({
		partialSynonymNode: synonymNode_v2
	});
	/*if (bothArr.length) {
		log.debug('synonymNode_v2:%s', toStr(synonymNode_v2));
	}*/
	return synonymNode_v2;
}
