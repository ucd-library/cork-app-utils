const loggers = {};
let config = {};
const win = typeof window !== 'undefined' ? window : undefined;

// Parse log levels from URL
if ( win ) {
  let params = new URLSearchParams(win.location.search);
  if( params.has('loglevels') ) {
    if( !win.logLevels ) win.logLevels = {};
    params.get('loglevels').split(',')
      .forEach(level => {
        let [name, levelName] = level.split(':');
        win.logLevels[name.trim()] = levelName.trim();
      });
  }

  if( params.has('loglevel') ) {
    win.logLevel = params.get('loglevel');
  }

  if( params.has('disablecallerinfo') ) {
    win.disableLoggerCallerInfo = params.get('disablecallerinfo') === 'true';
  }
}


class Logger {

  constructor(name) {
    this.name = name;
    this._initDefaultLevel();
  }

  _initDefaultLevel() {
    if( config.logLevels?.[this.name] ) {
      this.defaultLevel = config.logLevels[this.name];
    } else {
      this.defaultLevel = config.logLevel || 'info';
    }
  }

  get levelInt() {
    switch(this.level) {
      case 'debug': return 0;
      case 'info': return 1;
      case 'warn': return 2;
      case 'error': return 3;
    }
  }

  get level() {
    if( win?.logLevels && win.logLevels[this.name] ) {
      return win.logLevels[this.name];
    }
    return this.defaultLevel;
  }

  debug(...args) {
    if( this.levelInt > 0 ) return;
    console.log(`[${this.name}] debug ${this._getCallerLine()}:${this._twoLineFormat()}`, ...args);
  }

  info(...args) {
    if( this.levelInt > 1 ) return;
    console.log(`[${this.name}] info ${this._getCallerLine()}:${this._twoLineFormat()}`, ...args);
  }

  warn(...args) {
    if( this.levelInt > 2 ) return;
    console.warn(`[${this.name}] warn ${this._getCallerLine()}:${this._twoLineFormat()}`, ...args);
  }

  error(...args) {
    if( this.levelInt > 3 ) return;
    console.error(`[${this.name}] error ${this._getCallerLine()}:${this._twoLineFormat()}`, ...args);

    if( config.reportErrors ) {
      args.unshift(`[${this.name}] error ${this._getCallerLine(true)}:\n`);
      this.reportError(args);
    }
  }

  _twoLineFormat() {
    if( config.disableCallerInfo ) return '';
    return '\n';
  }

  _getCallerLine(force=false) {
    if( config.disableCallerInfo && force === false ) {
      return '';
    }

    try {
      throw new Error();
    } catch(e) {
      let lines = e.stack.split('\n');
      let at, method, fileColLine;

      // chrome
      if ( lines[0] && lines[0].indexOf('Error') === 0 ) {
        [at, method, fileColLine] = lines[3].trim().split(' ');
        return `${method} ${fileColLine}`;
      }

      // firefox or safari
      if ( lines.length >= 3 ){
        [method, fileColLine] = lines[2].trim().split('@');
        return `${method} ${fileColLine}`;
      }

      return '';
    }
  }

  reportError(error) {
    reportError(this.name, error);
  }

}

function setLoggerConfig(_config={}) {
  config = _config;

  if( !config.logLevels ) {
    config.logLevels = {};
  }

  // override logLevel from window
  if( win?.logLevel ) {
    config.logLevel = win.logLevel;
  }

  // override disableCallerInfo from window
  if( win?.disableLoggerCallerInfo ) {
    config.disableCallerInfo = win.disableLoggerCallerInfo;
  }

  // reinitalize loggers with new config
  for( let name in loggers ) {
    loggers[name]._initDefaultLevel();
  }

  initErrorReporting();
}

function initErrorReporting() {
  if( !config.reportErrors ) return;
  if( !config.reportErrors.enabled ) return;

  if( !config.reportErrors.url ) {
    console.warn('No error reporting URL set, ignoring error reporting');
    config.reportErrors = null;
  }

  if( !win?.addEventListener ) return;

  win.addEventListener('error', event => {
    let {message, filename, lineno, colno, error} = event;

    reportError('window', {
      message, filename, lineno, colno,
      stack : error?.stack,
      event : 'error'
    });
  }, {passive: true});

  // Catching unhandled promise rejections
  win.addEventListener('unhandledrejection', event => {
    let error = event.reason;

    if( error instanceof Error ) {
      reportError('window', {
        message : error.message,
        stack : error.stack,
        event : 'unhandledrejection'
      });
    } else {
      reportError('window', error);
    }
  }, {passive: true});
}

function reportError(name, error) {
  if( !config.reportErrors ) return;
  if( !config.reportErrors.enabled ) return;

  let headers = {
    'Content-Type': 'application/json'
  };

  if( config.reportErrors.key ) {
    headers['x-api-key'] = config.reportErrors.key;
  }

  if( config.reportErrors.headers ) {
    headers = Object.assign(headers, config.reportErrors.headers);
  }

  let payload = {
    error,
    name,
    pathname : win?.location?.pathname,
    search : win?.location?.search,
    sourceMapUrl : config.reportErrors.sourceMapUrl,
    sourceMapExtension : config.reportErrors.sourceMapExtension
  };

  if( payload.sourceMapUrl && payload.sourceMapUrl.indexOf('http') !== 0 && win?.location?.origin ) {
    payload.sourceMapUrl = win.location.origin + payload.sourceMapUrl;
  }

  if( config.reportErrors.customAttributes ) {
    payload = Object.assign(payload, config.reportErrors.customAttributes);
  }

  fetch(config.reportErrors.url, {
    method: config.reportErrors.method || 'POST',
    headers,
    body: JSON.stringify(payload)
  }).catch(err => {
    console.error('Error reporting failed:', err);
  });
}

function getLogger(name) {
  if( loggers[name] ) return loggers[name];
  loggers[name] = new Logger(name);
  return loggers[name];
}

if ( win ) {
  if( win.LOGGER_CONFIG_VAR ) {
    setLoggerConfig(win[win.LOGGER_CONFIG_VAR]);
  } else if( win.APP_CONFIG && win.APP_CONFIG.logger ) {
    setLoggerConfig(win.APP_CONFIG.logger);
  }
}

export {setLoggerConfig, getLogger};