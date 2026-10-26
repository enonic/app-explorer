import type { Plugin } from 'rolldown';

import { createHash } from 'crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { createRequire } from 'module';
import { basename, dirname, extname, join, relative } from 'path/posix';
import { compile } from 'sass';


const require = createRequire(import.meta.url);


export function copyWithHash({
	context,
	manifest,
	outDir,
	patterns,
	sourcemap,
}: {
	context: string
	manifest: string
	outDir: string
	patterns: string[]
	sourcemap: boolean
}): Plugin {
	return {
		name: 'copy-with-hash',
		writeBundle() {
			const manifestPath = join(outDir, manifest);
			const manifestObj: Record<string, string> = existsSync(manifestPath)
				? JSON.parse(readFileSync(manifestPath, 'utf8'))
				: {};
			const copy = (from: string, to: string) => {
				mkdirSync(dirname(to), { recursive: true });
				cpSync(from, to, { dereference: true });
			};
			for (const pattern of patterns) {
				const matches = globSync(join(context, pattern));
				if (!matches.length) {
					throw new Error(`No files found! pattern:${pattern}`);
				}
				const files = matches.flatMap((match) => statSync(match).isDirectory()
					? globSync(`${match}/**/*`, { nodir: true })
					: [match]
				);
				for (const file of files) {
					const rel = relative(context, file);
					const ext = extname(rel);
					const hash = createHash('md5').update(readFileSync(file)).digest('hex').slice(0, 13).toUpperCase();
					const withHash = join(dirname(rel), `${basename(rel, ext)}-${hash}${ext}`);
					copy(file, join(outDir, withHash));
					manifestObj[rel] = withHash;
					if (sourcemap && existsSync(`${file}.map`)) {
						copy(`${file}.map`, join(outDir, `${withHash}.map`));
						manifestObj[`${rel}.map`] = `${withHash}.map`;
					}
				}
			}
			writeFileSync(manifestPath, JSON.stringify(manifestObj, null, 2));
		},
	};
}


export function emitAssets(assets: Record<string, string>, { compress }: { compress: boolean }): Plugin {
	return {
		name: 'emit-assets',
		buildStart() {
			for (const [name, file] of Object.entries(assets)) {
				this.emitFile({
					type: 'asset',
					name,
					source: extname(name) === '.css' ? compile(file, { style: compress ? 'compressed' : 'expanded' }).css : readFileSync(file),
				});
			}
		},
	};
}


export function globals(names: Record<string, string>): Plugin {
	const PREFIX = '\0global:';
	return {
		name: 'globals',
		resolveId(id) {
			if (id in names) {
				return `${PREFIX}${id}`;
			}
		},
		load(id) {
			if (!id.startsWith(PREFIX)) {
				return;
			}
			const name = id.slice(PREFIX.length);
			const keys = Object.keys(require(name)).filter((key) => key !== 'default' && /^[A-Za-z_$][\w$]*$/.test(key));
			return `const m = globalThis.${names[name]};\nexport default m;\nexport const { ${keys.join(', ')} } = m;\n`;
		},
	};
}


export function manifest({
	fileName,
	shortNames = false,
}: {
	fileName: string
	shortNames?: boolean
}): Plugin {
	return {
		name: 'manifest',
		writeBundle(options, bundle) {
			const manifestPath = join(options.dir, fileName);
			const entries: Record<string, string> = existsSync(manifestPath)
				? JSON.parse(readFileSync(manifestPath, 'utf8'))
				: {};
			for (const output of Object.values(bundle)) {
				if (output.type === 'chunk' && output.isEntry) {
					const key = `${shortNames ? basename(output.name) : output.name}${extname(output.fileName)}`;
					entries[key] = output.fileName;
					if (bundle[`${output.fileName}.map`]) {
						entries[`${key}.map`] = `${output.fileName}.map`;
					}
				} else if (output.type === 'asset' && output.name) {
					entries[output.name] = output.fileName;
				}
			}
			writeFileSync(manifestPath, JSON.stringify(entries, null, 2));
		},
	};
}
