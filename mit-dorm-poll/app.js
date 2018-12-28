const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const bodyParser = require('body-parser');
const logger = require('morgan');
const session = require('express-session');

const pollsRouter = require('./routes/polls');
const responsesRouter = require('./routes/responses');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const adminRouter = require('./routes/admins');

const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false });

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(session({secret:"6170", resave: false, saveUninitialized: true}));

pollsRouter.use(csrfProtection);
responsesRouter.use(csrfProtection);
usersRouter.use(csrfProtection);
adminRouter.use(csrfProtection);
app.use(parseForm);

app.get('/form', csrfProtection, function (req, res) {
  // pass the csrfToken to the view
  res.status(200);
  res.send({ csrfToken: req.csrfToken() });
});

// error handler
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  // handle CSRF token errors here
  res.status(403);
  res.send({ error: 'Form tampered with' });
});

//app.use('/', indexRouter);
app.use('/api/polls', pollsRouter);
app.use('/api/responses', responsesRouter);
app.use('/api/users', usersRouter);
app.use('/api/admins', adminRouter);
app.use('/login', loginRouter);

// Handles any requests that don't match the ones above
app.get('*', (req, res) =>{
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
