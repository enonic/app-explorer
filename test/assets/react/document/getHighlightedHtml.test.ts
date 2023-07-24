import {
	ELLIPSIS,
} from '@enonic/js-utils';
import {
	describe,
	expect,
	test
} from '@jest/globals';
import getHighlightedHtml from '../../../../src/main/resources/assets/react/document/getHighlightedHtml';
import {
    POST_TAG,
	PRE_TAG,
} from '../../../../src/main/resources/assets/react/document/constants';


const LORUM                                  = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
const LORUM_HIGHLIGHTED = `Lorem ${PRE_TAG}ipsum${POST_TAG} dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
const LORUM_SHORT_START = `Lorem ${PRE_TAG}ipsum${POST_TAG} dolor sit amet`;
const LORUM_SHORT_END = `${PRE_TAG}ipsum${POST_TAG} dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
const LORUM_SHORT_MIDDLE = `m ${PRE_TAG}ipsum${POST_TAG} d`;


describe('getHighlightedHtml', () => {
    
    test('returns fallback stripped to fragmentSize plus ELLIPSIS when _highlight is undefined', () => {
        expect(getHighlightedHtml({
            fallback: 'fallback',
            fieldPath: 'title',
            // _highlight: undefined,
            fragmentSize: 1,
        })).toEqual(`f${ELLIPSIS}`);
    });

    test('returns full fallback when fragmentSize larger than fallback when _highlight is undefined', () => {
        expect(getHighlightedHtml({
            fallback: 'fallback',
            fieldPath: 'title',
            // _highlight: undefined,
            fragmentSize: 8,
        })).toEqual('fallback');
    });

    test('returns highlight without ellipsis when strippedHighlight matches fallback', () => {
        expect(getHighlightedHtml({
            _highlight: {
                title: [
                    LORUM_HIGHLIGHTED
                ]
            },
            fallback: LORUM,
            fieldPath: 'title',
            // fragmentSize: 1 // Only used when _highlight is undefined
        })).toEqual(LORUM_HIGHLIGHTED);
    });

    test('returns highlight with ending ellipsis when strippedHighlight matches start of fallback', () => {
        expect(getHighlightedHtml({
            _highlight: {
                title: [
                    LORUM_SHORT_START
                ]
            },
            fallback: LORUM,
            fieldPath: 'title',
            // fragmentSize: 1 // Only used when _highlight is undefined
        })).toEqual(`${LORUM_SHORT_START}${ELLIPSIS}`);
    });

    test('returns highlight with starting ellipsis when strippedHighlight matches end of fallback', () => {
        expect(getHighlightedHtml({
            _highlight: {
                title: [
                    LORUM_SHORT_END
                ]
            },
            fallback: LORUM,
            fieldPath: 'title',
            // fragmentSize: 1 // Only used when _highlight is undefined
        })).toEqual(`${ELLIPSIS}${LORUM_SHORT_END}`);
    });

    test('returns highlight with surrounding ellipsis when strippedHighlight matches "middle" fallback', () => {
        expect(getHighlightedHtml({
            _highlight: {
                title: [
                    LORUM_SHORT_MIDDLE
                ]
            },
            fallback: LORUM,
            fieldPath: 'title',
            // fragmentSize: 1 // Only used when _highlight is undefined
        })).toEqual(`${ELLIPSIS}${LORUM_SHORT_MIDDLE}${ELLIPSIS}`);
    });

    test('returns (first found language) stemmed highlight', () => {
        expect(getHighlightedHtml({
            _highlight: {
                'title._stemmed_no': [
                    LORUM_HIGHLIGHTED
                ]
            },
            fallback: LORUM,
            fieldPath: 'title',
            // fragmentSize: 1 // Only used when _highlight is undefined
        })).toEqual(LORUM_HIGHLIGHTED);
    });

    test('returns shortened fallback when match not found in highlight', () => {
        expect(getHighlightedHtml({
            _highlight: {},
            fallback: 'fallback',
            fieldPath: 'title',
            fragmentSize: 1
        })).toEqual(`f${ELLIPSIS}`);
    });

}); // describe getHighlightedHtml