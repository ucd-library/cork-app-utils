const loggers = {};
let config = {};

class Logger {

  constructor(name) {
    this.name = name;
  }

  _initDefaultLevel() {
    if( typeof config.logLevel === 'string' ) {
      this.defaultLevel = config.logLevel;
    } else {
      this.defaultLevel = config.logLevels[this.name] || 'info';
    }

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

  console.log('Logger config', config);

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

  fetch(config.reportErrors.url, {
    method: config.reportErrors.method || 'POST',
    headers,
    body: JSON.stringify({
      error, 
      name,
      pathname : window.location.pathname,
      search : window.location.search
    })
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