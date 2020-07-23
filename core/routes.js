const error = require('../middleware/error');
const express = require('express');
const morgan = require('morgan');
const config = require('config');

const startupDebugger = require('debug')('app:startup');
const routesDebugger = require('debug')('app:routes');

const letters = require ('../routes/letters');
const users = require('../routes/users');
const auth = require('../routes/auth');



module.exports = function (app) {
    
    if (process.env.NODE_ENV === 'development') {
        startupDebugger(`NODE_ENV: ${process.env.NODE_ENV}`);
        startupDebugger('Application name: ' + config.get('name'));
        startupDebugger('Mail server: ' + config.get('mail.host'));
        startupDebugger('Morgan log is enabled');
        app.use(
          morgan('combined', { stream: { write: (msg) => routesDebugger(msg) } })
        );
      }
    
    app.use(express.json());

    app.use('/api/users', users);
    app.use('/api/letters', letters);
    app.use('/api/auth', auth);

    app.use(error);

}