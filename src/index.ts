import * as fs from 'fs';
import * as path from 'path';
import { marked } from 'marked';
import { renderFile } from 'ejs';
import { fileWriter } from '@static-pages/file-writer';

export type EJSWriterOptions = {
	view?: string | { (data: Record<string, unknown>): string };
	viewsDir?: string | string[];
	ejsOptions?: ejs.Options;
	markedEnabled?: boolean;
	markedOptions?: marked.MarkedOptions;
} & Omit<fileWriter.Options, 'renderer'>;

export const ejsWriter = ({
	view = 'main.ejs',
	viewsDir = 'views',
	ejsOptions = {},
	markedEnabled = true,
	markedOptions = {},
	...rest
}: EJSWriterOptions = {}) => {
	if (typeof view !== 'string' && typeof view !== 'function')
		throw new Error('ejs-writer \'view\' option expects a string or a function.');

	if (typeof viewsDir !== 'string' && !(Array.isArray(viewsDir) && viewsDir.every(x => typeof x === 'string')))
		throw new Error('ejs-writer \'viewsDir\' option expects a string or string[].');

	if (typeof ejsOptions !== 'object' || !ejsOptions)
		throw new Error('ejs-writer \'ejsOptions\' option expects an object.');

	if (typeof markedOptions !== 'object' || !markedOptions)
		throw new Error('ejs-writer \'markedOptions\' option expects an object.');

	// Provide a built-in markdown filter
	if (markedEnabled) {
		if (typeof ejsOptions.context !== 'object' || !ejsOptions.context) {
			ejsOptions.context = {};
		}
		ejsOptions.context.markdown = (md: string) => marked(md, markedOptions);
	}

	const viewsDirArray = Array.isArray(viewsDir) ? viewsDir : [viewsDir];

	return fileWriter({
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
					views: viewsDirArray,
					...ejsOptions,
				},
				(err, str) => err ? reject(err) : resolve(str)
			);
		}),
	});
};

export default ejsWriter;
