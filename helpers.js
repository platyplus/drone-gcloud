'use strict'
const getParameter = (item, { key, value } = {}) => {
  if (typeof item === 'string') return { value: item }
  if (Object.keys(item).length === 1) {
    key = Object.keys(item)[0]
    return {
      key,
      value: item[key]
    }
  } else return { key: item[key], value: item[value] }
}

const joinParameter = (param, separator1 = ',', separator2 = '=') => {
  if (typeof param === 'string') return param
  else if (Array.isArray(param))
    return param.map(item => joinParameter(item, separator2)).join(separator1)
  else {
    return Object.keys(param)
      .map(key => `${key}${separator2}${param[key]}`)
      .join(separator1)
  }
}

const parse = (value, defaultValue = []) => {
  if (value === undefined) return defaultValue
  try {
    value = JSON.parse(value)
    if (typeof value === 'object') {
      if (!Array.isArray(value))
        value = Object.keys(value).map(key => ({ [key]: value[key] }))
    }
  } catch (err) {
    if (typeof value === 'string') value = value.split(',')
  } finally {
    return value
  }
}

module.exports = { getParameter, joinParameter, parse }
