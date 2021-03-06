'use strict'

const Widget = require('../widget')
const EventEmitter = require('events')
const transformLoader = require('../transform-loader')
const widgetDatasourceBinding = require('../widget-datasource-binding')

function fetchDatasource (datasources, datasourceId) {
  const loopbackDatasource = {
    emitter: new EventEmitter()
  }

  return datasources[datasourceId] || loopbackDatasource
}

exports.load = function (dashboard, widgets = [], datasources = {}) {
  return widgets.reduce((curr, descriptor) => {
    const {
      name,
      position,
      background,
      datasource: datasourceId,
      transformations,
      widget: widgetPath,
      options
    } = descriptor

    const widget = Widget.create(widgetPath, { position, background, options })

    const datasource = fetchDatasource(datasources, datasourceId)
    widget.register(datasource.emitter)

    const transforms = transformations ? transformLoader.load(name, transformations) : []
    widgetDatasourceBinding.bindEvent(dashboard, widget, datasource, transforms)

    datasource.emitter.on('plugin', (eventName, data) => {
      dashboard.emit(eventName, data)
    })

    curr[widget.id] = widget
    return curr
  }, {})
}
