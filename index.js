const Handlebars = require('handlebars');
const fs = require('fs');
const express = require('express');
const app = new express();
const bodyParser = require('body-parser');
const generateTheme = require('./test');
const PATHS = {
	DEFAULT_VARIABLES_JSON: '/themegen/defaults',
	SAVE_VARIABLES: '/themegen/variables/save',
	GENERATE_THEME: '/themegen/generate',
	DOWNLOAD_THEME: '/themegen/download',
	DATA_VARIABLES_LESS_JSON: '/themegen/variables',
	CONTENT_VARIABLES_LESS: '/themegen/content/variables',
	CONTENT_STYLES_LESS: '/themegen/content/styles',
	FILE_DEFAULT_VARIABLES_JSON: './defaults.json',
	FILE_VARIABLES_LESS_TEMPLATE: './templates/variables.less.hbs',
	FILE_VARIABLES_LESS: './tmp/web/variables.less',
	FILE_STYLES_LESS: './tmp/web/style.less',
	FILE_VARIABLES_LESS_JSON: './variables.less.json'
};

app.use(bodyParser.json({ type: 'application/json'}));

// Returns JSON having defaults for varibales.less file
app.get(PATHS.DEFAULT_VARIABLES_JSON, (req, res) => {
	content = fs.readFileSync(PATHS.FILE_DEFAULT_VARIABLES_JSON, 'utf-8');
	res.setHeader('Content-Type', 'application/json');
	res.end(content);
});

// Returns variables used in the variables.less file in the current state.
// In the begining, it is same as the defaults.json (can be made empty later, but logic has to be handled in the app)
app.get(PATHS.DATA_VARIABLES_LESS_JSON, (req, res) => {
	content = fs.readFileSync(PATHS.FILE_VARIABLES_LESS_JSON, 'utf-8');
	res.setHeader('Content-Type', 'application/json');
	res.end(content);
});

// save variables less
app.post(PATHS.SAVE_VARIABLES, (req, res) => {
  console.log('got request', req.body);
  let data = req.body || {};
  updateVariablesLessJSON(data);
  updateVariablesLess(data);

  res.status(200).json({result: "success"});
});

// generate theme zip
app.get(PATHS.GENERATE_THEME, (req, res) => {
	generateTheme().then(() => {
		res.status(200).json({result: "success"});
	});
});

// download theme zip
app.get(PATHS.DOWNLOAD_THEME, (req, res) => {
 	const filePath = './dist/web.zip';
 	res.download(filePath);		
});

// Returns variables.less file
app.get(PATHS.CONTENT_VARIABLES_LESS, (req, res) => {
	content = fs.readFileSync(PATHS.FILE_VARIABLES_LESS, 'utf-8');
	res.setHeader('Content-Type', 'text/plain');
	res.end(content);
});

// Returns styles.less file
app.get(PATHS.CONTENT_STYLES_LESS, (req, res) => {
	content = fs.readFileSync(PATHS.FILE_STYLES_LESS, 'utf-8');
	res.setHeader('Content-Type', 'text/plain');
	res.end(content);
});

const updateVariablesLessJSON = async (data) => {
	console.log('updating variables json', data);
	data = data || {};
	await fs.writeFileSync(PATHS.FILE_VARIABLES_LESS_JSON, JSON.stringify(data));
};

const updateVariablesLess = async (data) => {
	var template = Handlebars.compile(fs.readFileSync(PATHS.FILE_VARIABLES_LESS_TEMPLATE, 'utf-8'));
	var content = template(data);
	await fs.writeFileSync(PATHS.FILE_VARIABLES_LESS, content);
};

app.listen('8888', () => {
	console.log('listening for app')
});