import * as fs from 'fs';
import * as path from 'path';
import showdown from 'showdown';
import { renderFile } from 'ejs';
import { fileWriter, FileWriterOptions } from '@static-pages/file-writer';

export type EJSWriterOptions = {
	view?: string | { (data: Record<string, unknown>): string };
	viewsDir?: string | string[];
	ejsOptions?: ejs.Options;
	showdownEnabled?: boolean;
	showdownOptions?: showdown.ConverterOptions;
} & Omit<FileWriterOptions, 'renderer'>;

export const ejsWriter = (options: EJSWriterOptions = {}) => {
	const {
		view = 'main.ejs',
		viewsDir = 'views',
		ejsOptions = {},
		showdownEnabled = true,
		showdownOptions = {},
		...rest
	} = options;

	if (typeof view !== 'string' && typeof view !== 'function')
		throw new Error('ejs-writer \'view\' option expects a string or a function.');

	if (typeof viewsDir !== 'string' && !(Array.isArray(viewsDir) && viewsDir.every(x => typeof x === 'string')))
		throw new Error('ejs-writer \'viewsDir\' option expects a string or string[].');

	if (typeof ejsOptions !== 'object' || !ejsOptions)
		throw new Error('ejs-writer \'ejsOptions\' option expects an object.');

	if (typeof showdownOptions !== 'object' || !showdownOptions)
		throw new Error('ejs-writer \'showdownOptions\' option expects an object.');

	// Provide a built-in markdown filter
	if (showdownEnabled) {
		const converter = new showdown.Converter({
			simpleLineBreaks: true,
			ghCompatibleHeaderId: true,
			customizedHeaderId: true,
			tables: true,
			...showdownOptions,
		});

		if (typeof ejsOptions.context !== 'object' || !ejsOptions.context) {
			ejsOptions.context = {};
		}
		ejsOptions.context.markdown = (md: string) => converter.makeHtml(md);
	}

	const viewsDirArray = Array.isArray(viewsDir) ? viewsDir : [viewsDir];

	const writer = fileWriter({
		...rest,
		renderer: data => new Promise((resolve, reject) => {
			const resolvedView = typeof view === 'function' ? view(data) : view;
			const viewDir = viewsDirArray.find(x => fs.existsSync(path.resolve(x, resolvedView)));
			if (typeof viewDir === 'undefined') {
				throw new Error(`ejs-writer failed to render template '${view}', no such file found in 'viewsDir'.`);
			}
			return renderFile(
				path.resolve(viewDir, resolvedView),
				data,
				{
					...ejsOptions,
					views: viewsDirArray,
				},
				(err, str) => err ? reject(err) : resolve(str)
			);
		}),
	});

	return (data: Record<string, unknown>): Promise<void> => writer(data);
};

export default ejsWriter;
