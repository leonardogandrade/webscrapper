const express = require('express');
const routes = express.Router();

//Import Controllers
const GitInfoController = require('./controllers/gitInfo');
const GitInfoAPIController = require('./controllers/gitInfoAPI');

routes.get('/',GitInfoController.instructions);
routes.get('/scraping/:user/:repo',GitInfoController.getGitData)

//Using GitHub API
routes.get('/gitapi/:user/:repo',GitInfoAPIController.getGitDataAPI)

module.exports = routes;