util = require './util'

pageByKey = {}
keyByIndex = []

addPage = (pageObject) ->
	key = util.randomBytes 4
	pageByKey[key] = pageObject
	keyByIndex.push key
	return key

removeKey = (key) ->
	return null unless key in keyByIndex
	keyByIndex = keyByIndex.filter (each) -> key != each
	delete pageByKey[key]
	key

removeAllAfterKey = (key) ->
	result = []
	return result unless key in keyByIndex
	while keyByIndex[keyByIndex.length-1] != key
		unwanted = keyByIndex.pop()
		result.unshift unwanted
		delete pageByKey[unwanted]
	result

atKey = (key) ->
	pageByKey[key]

debugKeys = ->
	keyByIndex

debugReset = ->
	pageByKey = {}
	keyByIndex = []

module.exports = {addPage, removeKey, removeAllAfterKey, atKey, debugKeys, debugReset}