import type { UserConfig } from 'vite'
import externalGlobals from 'rollup-plugin-external-globals';
import { visualizer } from 'rollup-plugin-visualizer';

export default {
	build: {
		copyPublicDir: false,
		lib: {
			entry: './WebCrawler.tsx',
			fileName: 'WebCrawler', // Name in package.json is required if option "build.lib.fileName" is not provided.
			// 'umd' is actually smaller than 'es' and makes sure WebCrawler exists on the window object.
			formats: ['umd'],
			name: 'WebCrawler', // Option "build.lib.name" is required when output formats include "umd" or "iife".
		},
		minify: 'esbuild',
		outDir: '../../../build/resources/main/assets/react',
	},
	define: {
		'process.env.NODE_ENV': JSON.stringify('production'),
	},
	plugins: [
		externalGlobals({
			react: 'React',
			'react-dom': 'ReactDOM'
		}),
		visualizer({
			filename: 'build/vite-stats-webcrawler-form.html',
		}) // should be the last one
	],
} satisfies UserConfig
