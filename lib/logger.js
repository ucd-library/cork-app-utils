const loggers = {};
let config = {};

// Parse log levels from URL
let params = new URLSearchParams(window.location.search);
if( params.has('loglevels') ) {
  if( !window.logLevels ) window.logLevels = {};
  params.get('loglevels').split(',')
    .forEach(level => {
      let [name, levelName] = level.split(':');
      window.logLevels[name.trim()] = levelName.trim();
    });
}

class Logger {

  constructor(name) {
    this.name = name;
    this._initDefaultLevel();
  }

  _initDefaultLevel() {
    if( config.logLevels[this.name] ) {
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
    if( window.logLevels && window.logLevels[this.name] ) {
      return window.logLevels[this.name];
    }
    return this.defaultLevel;
  }

  debug(...args) {
    if( this.levelInt > 0 ) return;
    console.log(`[${this.name}] debug:`, ...args);
  }

  info(...args) {
    if( this.levelInt > 1 ) return;
    console.log(`[${this.name}] info:`, ...args);
  }

  warn(...args) {
    if( this.levelInt > 2 ) return;
    console.warn(`[${this.name}] warn:`, ...args);
  }

  error(...args) {
    if( this.levelInt > 3 ) return;
    console.error(`[${this.name}] error:`, ...args);

    if( config.reportErrors ) {
      args.unshift(`[${this.name}] error:`);
      this.reportError(args);
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

  window.addEventListener('error', event => {
    let {message, filename, lineno, colno, error} = event;

    reportError('window', {
      message, filename, lineno, colno,
      stack : error.stack,
      event : 'error'
    });
  }, {passive: true});
  
  // Catching unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
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
    pathname : window.location.pathname,
    search : window.location.search,
    sourceMapUrl : config.sourceMapUrl,
    sourceMapExtension : config.sourceMapExtension
  };

  if( payload.sourceMapUrl && payload.sourceMapUrl.indexOf('http') !== 0 ) {
    payload.sourceMapUrl = window.location.origin + payload.sourceMapUrl;
  }

  if( config.customAttributes ) {
    payload = Object.assign(payload, config.customAttributes);
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

if( window.LOGGER_CONFIG_VAR ) {
  setLoggerConfig(window[window.LOGGER_CONFIG_VAR]);
} else if( window.APP_CONFIG && window.APP_CONFIG.logger ) {
  setLoggerConfig(window.APP_CONFIG.logger);
}

export {setLoggerConfig, getLogger};