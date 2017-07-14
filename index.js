const fs = require('fs')
const sass = require('node-sass')

const reIL = /`([^*][^]+?)`/m
const reES = /`\*([^]+?)\*`/m
const reIM = /\s*@import ?(.+\.bscss)\s*$/

function nextMatch (inText, arr) {
  var reArr = [
    {type: 'il', m: inText.match(reIL)},
    {type: 'es', m: inText.match(reES)},
    {type: 'im', m: inText.match(reIM)}
  ].filter(obj => obj.m)

  if (!reArr.length) {
    arr.push({
      type: 'text',
      text: inText
    })
    return arr
  }

  var next = reArr.reduce((a, b) => { return a.m.index < b.m.index ? a : b })

  let match = next.m[1]
  let gone = next.m[0]
  let pre = inText.slice(0, next.m.index)
  let post = inText.slice(next.m.index + gone.length)
  arr.push({
    type: 'text',
    text: pre
  })
  switch (next.type) {
    case 'il':
    case 'es':
      arr.push({
        type: 'code',
        text: match
      })
      break
    case 'im':
      arr.push({
        type: 'import',
        text: match
      })
      break

  }

  return nextMatch(post, arr)
}

function transform (inArr) {
  function parseObj (inObj, depth) {
    if (!depth) {
      depth = 0
    }
    var out = ''
    Object.entries(inObj).forEach((kv) => {
      let k = kv[0]
      let v = kv[1]
      if (typeof v === 'string') {
        out += `${new Array(depth + 1).join(' ') + k}: ${v};\n`
      } else {
        out += `${new Array(depth + 1).join(' ') + k}: {\n${new Array(depth + 2).join(' ') + parseObj(v, depth + 1)}${new Array(depth + 2).join(' ')}}\n`
      }
    })
    return out
  }

  if (!Array.isArray(inArr)) {
    inArr = nextMatch(inArr, [])
  }
  var __out = ''
  function add (text) {
    __out += text
  }
  for (var i = 0; i < inArr.length; i++) {
    let _obj = inArr[i]
    if (_obj.type === 'text') {
      __out += _obj.text
    } else if (_obj.type === 'code') {
      _out = eval(_obj.text)
      if (!_out) {
        continue
      } else if (typeof _out === 'string') {
        __out += _out
        continue
      } else if (typeof _out === 'object') {

      }
    } else if (_obj.type === 'import') {
      __out += transform(fs.readFileSync(_obj.text, 'utf8'))
    }
  }
  return __out
}

module.exports = {
  fromString (inText) {
    return sass.renderSync({data: transform(inText), includePaths: fs.readdirSync('.')}).css.toString('utf8')
  },
  fromFile (inFilePath) {
    return this.fromString(fs.readFileSync(inFilePath, 'utf8'))
  }
}
