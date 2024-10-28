// import { resolve } from 'path';
import type { UserConfig } from 'vite'
// import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';

export default {
	build: {
		copyPublicDir: false,
		// lib: {
		// 	entry: './WebCrawler.tsx',
		// 	entry: {
		// 		WebCrawler: resolve(__dirname, 'src/main/resources/assets/react/WebCrawler.tsx'),
		// 	},
			// fileName: 'WebCrawler',
		// 	formats: [
		// 		'es',
		// 		// 'umd' // This make sure WebCrawler exists on the window object.
		// 	],
		// 	name: 'WebCrawler', // Option "build.lib.name" is required when output formats include "umd" or "iife".
		// },
		// minify: 'esbuild',
		outDir: '../../../build/resources/main/assets/react',
		rollupOptions: {
			external: [
				// 'lodash',
				// 'moment',
				'react',
				'react-dom',
				// 'react/jsx-runtime'
				// 'semantic-ui-react'
			],
			input: 'src/webcrawler/form/WebCrawler.tsx',
			output: {
				entryFileNames: '[name].esm.js',
				format: 'esm',
				globals: {
					'react': 'React',
					'react-dom': 'ReactDOM'
				},
			}
		}
	},
	define: {
		'process.env.NODE_ENV': JSON.stringify('production'),
	},
	plugins: [
		// react()
		visualizer({
			filename: 'build/vite-stats-webcrawler-form.html',
		}) // should be the last one
	],
} satisfies UserConfig
