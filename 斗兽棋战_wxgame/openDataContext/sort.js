//使用文档：http://www.jb51.net/article/76868.htm

export default function sort_object(object, subkey, desc) {
  var is_array = false;

  if (Object.prototype.toString.call(object) === '[object Array]') {
    is_array = true;
  }

  if (is_array) {
    var keys = { length: object.length };
  } else {
    if (typeof (Object.keys) == 'function') {
      var keys = Object.keys(object);
    } else {
      var keys = [];
      for (var key in keys) {
        keys.push(key);
      }
    }
  }

  for (var i = 0; i < keys.length; i++) {
    for (var j = i + 1; j < keys.length; j++) {

      if (is_array) {
        //数组排序
        if (Object.prototype.toString.call(subkey) === '[object Array]') {
          var vali = object[i];
          var valj = object[j];

          for (var si = 0; si < subkey.length; si++) {
            vali = vali[subkey[si]];
            valj = valj[subkey[si]];
          }
        } else {
          if ((!subkey && subkey !== 0) || subkey == '' && object.sort) {
            var vali = object[i];
            var valj = object[j];
          } else {
            var vali = object[i][subkey];
            var valj = object[j][subkey];
          }
        }

        if (desc) {
          if (valj > vali) {
            var tmp = object[i];
            object[i] = object[j];
            object[j] = tmp;
          }
        } else {
          if (valj < vali) {
            var tmp = object[i];
            object[i] = object[j];
            object[j] = tmp;
          }
        }
      } else {
        //对象排序
        var obi = object[keys[i]];
        var obj = object[keys[j]];

        if (Object.prototype.toString.call(subkey) === '[object Array]') {
          var vali = obi;
          var valj = obj;

          for (var si = 0; si < subkey.length; si++) {
            vali = vali[subkey[si]];
            valj = valj[subkey[si]];
          }
        } else {
          if ((!subkey && subkey !== 0) || subkey == '' && object.sort) {
            var vali = obi;
            var valj = obj;
          } else {
            var vali = obi[subkey];
            var valj = obj[subkey];
          }
        }

        if (desc) {
          if (valj > vali) {
            var tmp = keys[i];
            keys[i] = keys[j];
            keys[j] = tmp;
          }
        } else {
          if (valj < vali) {
            var tmp = keys[i];
            keys[i] = keys[j];
            keys[j] = tmp;
          }
        }
      }//is!array
    }
  }

  if (is_array) {
    return object;
  } else {
    var sorted = {};

    for (var i = 0; i < keys.length; i++) {
      sorted[keys[i]] = object[keys[i]];
    }

    return sorted;
  }
} 