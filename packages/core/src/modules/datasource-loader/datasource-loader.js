'use strict'

const resolver = require('../resolver')
const configValidator = require('../config-validator')
const datasourceBinder = require('../datasource-binder')

const loadError = 'Cannot load datasource someDatasource because it does not look like a datasource'

function resolveDatasource (path) {
  return resolver.resolve(path)
}

function parseConfiguration (datasourceName, validation, options) {
  return configValidator.validate(datasourceName, validation, options)
}

function register (registrationFn, configuration) {
  if (typeof registrationFn !== 'function') {
    throw new Error(`${loadError} (no registration function)`)
  }

  return registrationFn(configuration)
}

function initialise (name, registrationFn, configuration = {}, schedule) {
  const datasource = register(registrationFn, configuration)

  if (typeof datasource.fetch !== 'function') {
    throw new Error(`${loadError} (no fetch function)`)
  }

  return datasourceBinder.bind(name, datasource, schedule)
}

exports.load = function (descriptor) {
  const datasourceIds = Object.keys(descriptor)
  return datasourceIds.reduce((datasources, id) => {
    const { module: path, options, schedule } = descriptor[id]
    const { validation, register } = resolveDatasource(path)
    const configuration = parseConfiguration(id, validation, options)
    datasources[id] = initialise(id, register, configuration, schedule)
    return datasources
  }, {})
}
