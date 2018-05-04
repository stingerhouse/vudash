'use strict'

const loader = require('../../../../dashboard/loader')

module.exports = function (request, h) {
  const { dashboards } = request.server.plugins.ui
  const { io } = request.server.plugins.socket
  const { name } = request.params
  const { descriptor } = request.payload

  const isUpdate = loader.has(dashboards, name)

  loader.add(dashboards, name, io, descriptor)

  return h.code(isUpdate ? 200 : 201)
}
