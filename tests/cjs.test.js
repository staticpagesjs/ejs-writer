import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import rimraf from 'rimraf';
import { ejsWriter } from '../cjs/index.js';

// cwd should be in tests folder where we provide a proper folder structure.
process.chdir(path.dirname(fileURLToPath(import.meta.url)));

// TODO: mock fs to provide a more stable environment for the tests?

afterEach(() => {
	rimraf.sync('dist');
});

test('can initialize a writer with default parameters', async () => {
	const writer = ejsWriter();
	expect(writer).toBeDefined();
});

test('can render a simple template', async () => {
	const writer = ejsWriter();

	await writer({
		value: {
			url: 'unnamed',
			body: 'foo',
		}
	});

	const expectedPath = 'dist/unnamed.html';
	const expectedContent = 'hello world!<p>foo</p>';

	expect(fs.existsSync(expectedPath)).toBe(true);
	expect(fs.readFileSync(expectedPath, 'utf-8')).toBe(expectedContent);
});

test('can set multiple views dir with initial view', async () => {
	const writer = ejsWriter({
		view: 'userview.ejs',
		viewsDir: [
			'views2/userViews1',
			'views2/userViews2'
		]
	});

	await writer({
		value: {
			url: 'unnamed',
			body: 'foo',
		}
	});

	const expectedPath = 'dist/unnamed.html';
	const expectedContent = '__*<p>foo</p>*__';

	expect(fs.existsSync(expectedPath)).toBe(true);
	expect(fs.readFileSync(expectedPath, 'utf-8')).toBe(expectedContent);
});

test('can use ejsCoptions to provide context variables', async () => {
	const writer = ejsWriter({
		view: 'globals.test.ejs',
		ejsOptions: {
			context: {
				globalValue: 'foo bar'
			}
		}
	});

	await writer({
		value: {
			url: 'unnamed',
			body: 'foo',
		}
	});

	const expectedPath = 'dist/unnamed.html';
	const expectedContent = 'foo bar';

	expect(fs.existsSync(expectedPath)).toBe(true);
	expect(fs.readFileSync(expectedPath, 'utf-8')).toBe(expectedContent);
});

test('can set output dir', async () => {
	const writer = ejsWriter({
		outDir: 'dist'
	});

	await writer({
		value: {
			url: 'unnamed',
			body: 'foo',
		}
	});

	const expectedPath = 'dist/unnamed.html';
	const expectedContent = 'hello world!<p>foo</p>';

	expect(fs.existsSync(expectedPath)).toBe(true);
	expect(fs.readFileSync(expectedPath, 'utf-8')).toBe(expectedContent);
});

test('can set outfile name via url', async () => {
	const writer = ejsWriter();

	await writer({
		value: {
			url: 'my/output.file',
			body: 'foo',
		}
	});

	const expectedPath = 'dist/my/output.file.html';
	const expectedContent = 'hello world!<p>foo</p>';

	expect(fs.existsSync(expectedPath)).toBe(true);
	expect(fs.readFileSync(expectedPath, 'utf-8')).toBe(expectedContent);
});

test('can set outfile name via header.path', async () => {
	const writer = ejsWriter();

	await writer({
		value: {
			header: {
				path: 'my/output.file'
			},
			body: 'foo',
		}
	});

	const expectedPath = 'dist/my/output.html';
	const expectedContent = 'hello world!<p>foo</p>';

	expect(fs.existsSync(expectedPath)).toBe(true);
	expect(fs.readFileSync(expectedPath, 'utf-8')).toBe(expectedContent);
});

test('can set outfile name via outFile option', async () => {
	const writer = ejsWriter({
		outFile: () => 'my/output.file'
	});

	await writer({
		value: {
			body: 'foo',
		}
	});

	const expectedPath = 'dist/my/output.file';
	const expectedContent = 'hello world!<p>foo</p>';

	expect(fs.existsSync(expectedPath)).toBe(true);
	expect(fs.readFileSync(expectedPath, 'utf-8')).toBe(expectedContent);
});

test('can turn off custom markdown filter', async () => {
	const writer = ejsWriter({
		showdownEnabled: false
	});

	await expect(async () => {
		await writer({
			value: {
				url: 'unnamed',
				body: 'foo',
			}
		});
	})
		.rejects
		.toThrow('this.markdown is not a function');
});

test('can configure showdown filter', async () => {
	const writer = ejsWriter({
		view: 'showdown.ejs',
		showdownOptions: {
			headerLevelStart: 2
		}
	});

	await writer({
		value: {
			url: 'unnamed',
			body: '# foo',
		}
	});

	const expectedPath = 'dist/unnamed.html';
	const expectedContent = '<h2 id="foo">foo</h2>';

	expect(fs.existsSync(expectedPath)).toBe(true);
	expect(fs.readFileSync(expectedPath, 'utf-8')).toBe(expectedContent);
});
