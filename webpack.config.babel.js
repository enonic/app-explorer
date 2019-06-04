/* eslint-disable no-console */
import {webpackServerSideJs} from '@enonic/webpack-server-side-js'

const WEBPACK_CONFIG = webpackServerSideJs({
	__dirname: __dirname,
	mode: 'development'
	//mode: 'production'
});

//console.log(`WEBPACK_CONFIG:${JSON.stringify(WEBPACK_CONFIG, null, 4)}`);
//process.exit();

export { WEBPACK_CONFIG as default };
