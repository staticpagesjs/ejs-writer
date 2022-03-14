const fs = require('fs');
jest.spyOn(fs, 'writeFileSync').mockImplementation();
jest.spyOn(fs, 'mkdirSync').mockImplementation();

const path = require('path');
const ejsWriter = require('../cjs/index').cli;

process.chdir(__dirname); // cwd should be in tests folder where we provide a proper folder structure.
// TODO: mock fs to provide a more stable environment for the tests?

afterEach(() => {
	jest.clearAllMocks();
});

test('cli: can initialize a writer with default parameters', async () => {
	const writer = await ejsWriter();
	expect(writer).toBeDefined();
});

test('cli: can render a simple template', async () => {
	const writer = await ejsWriter();

	await writer({
		body: 'foo',
	});

	const expectedPath = path.resolve('build/unnamed-1.html');
	const expectedContent = 'hello world!<p>foo</p>';

	expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
	expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, expectedContent);
});

test('cli: can set multiple views dir with initial view', async () => {
	const writer = await ejsWriter({
		view: 'userview.ejs',
		viewsDir: [
			'altViews/userViews1',
			'altViews/userViews2'
		]
	});

	await writer({
		body: 'foo',
	});

	const expectedPath = path.resolve('build/unnamed-1.html');
	const expectedContent = '__*<p>foo</p>*__';

	expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
	expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, expectedContent);
});

test('cli: can set output dir', async () => {
	const writer = await ejsWriter({
		outDir: 'dist'
	});

	await writer({
		body: 'foo',
	});

	const expectedPath = path.resolve('dist/unnamed-1.html');
	const expectedContent = 'hello world!<p>foo</p>';

	expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
	expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, expectedContent);
});

test('cli: can set outfile name via output.path', async () => {
	const writer = await ejsWriter();

	await writer({
		output: {
			path: 'my/output.file'
		},
		body: 'foo',
	});

	const expectedPath = path.resolve('build/my/output.file');
	const expectedContent = 'hello world!<p>foo</p>';

	expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
	expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, expectedContent);
});

test('cli: can set outfile name via output.url', async () => {
	const writer = await ejsWriter();

	await writer({
		output: {
			url: 'my/output.file'
		},
		body: 'foo',
	});

	const expectedPath = path.resolve('build/my/output.file.html');
	const expectedContent = 'hello world!<p>foo</p>';

	expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
	expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, expectedContent);
});

test('cli: can set outfile name via header.path', async () => {
	const writer = await ejsWriter();

	await writer({
		header: {
			path: 'my/output.file'
		},
		body: 'foo',
	});

	const expectedPath = path.resolve('build/my/output.html');
	const expectedContent = 'hello world!<p>foo</p>';

	expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
	expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, expectedContent);
});

test('cli: can set outfile name via outFile option', async () => {
	const writer = await ejsWriter({
		outFile: '() => "my/output.file"',
	});

	await writer({
		body: 'foo',
	});

	const expectedPath = path.resolve('build/my/output.file');
	const expectedContent = 'hello world!<p>foo</p>';

	expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
	expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, expectedContent);
});

test('cli: can turn off custom markdown filter', async () => {
	const writer = await ejsWriter({
		showdownEnabled: false
	});

	await expect(async () => {
		await writer({
			body: 'foo',
		});
	  })
		.rejects
		.toThrow('this.markdown is not a function');
});

test('cli: can configure showdown filter', async () => {
	const writer = await ejsWriter({
		view: 'showdown.ejs',
		showdownOptions: {
			headerLevelStart: 2
		}
	});

	await writer({
		body: '# foo',
	});

	const expectedPath = path.resolve('build/unnamed-1.html');
	const expectedContent = '<h2 id="foo">foo</h2>';

	expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
	expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, expectedContent);
});
