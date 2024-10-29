import type {
	License,
	LicenseBsd2Clause,
	LicenseBsd3Clause,
	LicenseMit
} from './index.d';


export const ICON_STYLE = {
	float: 'left',
	margin: '0 7px 0 0'
};


export const LICENSE_BSD_2_CLAUSE :LicenseBsd2Clause = 'BSD 2-Clause';
export const LICENSE_BSD_3_CLAUSE :LicenseBsd3Clause = 'BSD 3-Clause';
export const LICENSE_MIT :LicenseMit = 'MIT';

export const NODE_MODULES :{
	description ?:License
	header: string
	href: string
}[] = [{
	header: 'cheerio',
	href: 'https://github.com/cheeriojs/cheerio/blob/main/LICENSE'
},{
	header: 'Classnames', // app-explorer
	href: 'https://github.com/JedWatson/classnames/blob/master/LICENSE'
},{
	header: 'cron-parser', // app-explorer
	href: 'https://github.com/harrisiirak/cron-parser/blob/master/LICENSE'
},{
	header: 'd3-dsv', // lib-explorer
	description: LICENSE_BSD_3_CLAUSE,
	href: 'https://github.com/d3/d3-dsv/blob/master/LICENSE'
},{
	header: 'deep-object-diff', // lib/app-explorer
	href: 'https://github.com/mattphillips/deep-object-diff/blob/main/LICENSE'
}/*,{
	header: 'diff', // lib/app-explorer // Listed as jsdiff below
	description: 'BSD 3-Clause',
	href: 'https://github.com/kpdecker/jsdiff/blob/master/LICENSE'
}*/,{
	header:'fast-deep-equal', // lib/app-explorer
	href: 'https://github.com/epoberezkin/fast-deep-equal/blob/master/LICENSE'
},{
	header: 'fnv-plus', // lib-explorer
	href: 'https://github.com/tjwebb/fnv-plus#license'
}/*,{ // Using semantic-ui now
	header: 'fomantic-ui-css', // app-explorer
	href: 'https://github.com/fomantic/Fomantic-UI-CSS/blob/master/package.json'
}*/,{
	header: 'GraphiQL', // app-explorer
	href: 'https://github.com/graphql/graphiql/blob/main/LICENSE'
},{
	header: 'GraphQL Query Builder', // app-explorer
	href: 'https://github.com/atulmy/gql-query-builder/blob/master/LICENSE'
},{
	header: 'human-object-diff', // lib-explorer
	href: 'https://github.com/Spence-S/human-object-diff/blob/master/LICENSE'
},{
	header: 'jsdiff', // diff lib/app-explorer
	href: 'https://github.com/kpdecker/jsdiff/blob/master/LICENSE',
	description: LICENSE_BSD_3_CLAUSE
},{
	header: 'jQuery', // app-explorer
	href: 'https://github.com/jquery/jquery/blob/master/LICENSE.txt'
},{
	header: 'jQuery tablesort', // app-explorer
	href: 'https://github.com/kylefox/jquery-tablesort/blob/master/LICENSE'
},{
	header: 'jsUri', // lib/app-explorer
	href: 'https://github.com/derek-watson/jsUri/blob/master/LICENSE'
},{
	header: 'Moment.js', // app-explorer
	href: 'https://github.com/moment/moment/blob/develop/LICENSE'
},{
	header: 'React and React-DOM', // app-explorer
	href: 'https://github.com/facebook/react/blob/master/LICENSE'
},{
	header: 'React DnD', // app-explorer
	href: 'https://github.com/react-dnd/react-dnd/blob/main/LICENSE'
},{
	header: 'React-gantt-antd', // app-explorer
	href: 'https://github.com/JSainsburyPLC/react-timelines/blob/master/LICENSE'
},{
	header: 'React HTML Parser', // app-explorer
	href: 'https://github.com/peternewnham/react-html-parser/blob/master/LICENSE.md'
},{
	header: 'React Router DOM', // app-explorer
	href: 'https://github.com/remix-run/react-router/blob/main/LICENSE.md'
},{
	header: 'react-semantic-ui-datepickers',
	href: 'https://github.com/arthurdenner/react-semantic-ui-datepickers/blob/develop/LICENSE'
},{
	header: 'react-semantic-ui-range',
	href: 'https://github.com/iozbeyli/react-semantic-ui-range/blob/master/LICENSE'
},{
	header: 'RJV react-json-view',
	href: 'https://github.com/mac-s-g/react-json-view/blob/master/LICENSE'
},{
	header: 'React HTML Parser',
	href: 'https://github.com/peternewnham/react-html-parser/blob/master/LICENSE.md'
},/*{
	header: 'react-scrollspy',
	href: 'https://github.com/makotot/react-scrollspy/blob/master/LICENSE'
},*/{
	header: 'robots-txt-guard',
	href: 'https://github.com/Woorank/robots-txt-guard/blob/master/LICENSE.md'
},{
	header: 'Semantic UI', // app-explorer
	href: 'https://github.com/Semantic-Org/Semantic-UI/blob/master/LICENSE.md'
},{
	header: 'Semantic UI React', // app-explorer
	href: 'https://github.com/jhudson8/react-semantic-ui/blob/master/LICENSE'
},{
	header: 'traverse',
	//description: 'MIT/X11',
	href: 'https://github.com/substack/js-traverse/blob/master/LICENSE'
},{
	header: 'URI.js', // lib-explorer
	href: 'https://github.com/garycourt/uri-js/blob/master/LICENSE',
	description: LICENSE_BSD_2_CLAUSE
}];


export const LICENSE_TEXT_MIT = `MIT License

	Permission is hereby granted, free  of charge, to any person obtaining
	a  copy  of this  software  and  associated  documentation files  (the
	"Software"), to  deal in  the Software without  restriction, including
	without limitation  the rights to  use, copy, modify,  merge, publish,
	distribute,  sublicense, and/or sell  copies of  the Software,  and to
	permit persons to whom the Software  is furnished to do so, subject to
	the following conditions:

	The  above  copyright  notice  and  this permission  notice  shall  be
	included in all copies or substantial portions of the Software.

	THE  SOFTWARE IS  PROVIDED  "AS  IS", WITHOUT  WARRANTY  OF ANY  KIND,
	EXPRESS OR  IMPLIED, INCLUDING  BUT NOT LIMITED  TO THE  WARRANTIES OF
	MERCHANTABILITY,    FITNESS    FOR    A   PARTICULAR    PURPOSE    AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE,  ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;


export const LICENSE_TEXT_BSD_3_CLAUSE = `The 3-clause BSD license

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of
conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.

3. Neither the name of Hamcrest nor the names of its contributors may be used to endorse
or promote products derived from this software without specific prior written
permission.


THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.`;


export const LICENSE_TEXT_BSD_2_CLAUSE = `The 2-clause BSD license

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of
conditions and the following disclaimer.

2. Neither the name of Hamcrest nor the names of its contributors may be used to endorse
or promote products derived from this software without specific prior written
permission.


THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.`;
