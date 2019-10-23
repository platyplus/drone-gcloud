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

const parse = (value, defaultValue = []) => {
  if (value === undefined) return defaultValue
  value = JSON.parse(value)
  if (typeof value === 'string') value = value.split(',')
  return value
}

module.exports = { getParameter, parse }
