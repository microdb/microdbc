var fs = require('fs');
var path = require('path');
var env = require('node-env-file');
var _microdb = null;
var _fldpath = null;

function init() {
  return new Promise(function (resolve) {
    var runchk = preRunCheck();
    if (!runchk.isok) {
      resolve(runchk.msg);
    }
    else {
      resolve('init complete');
    }
  });

}

function generateSource() {
  return new Promise(function (resolve) {
    var runchk = preRunCheck();
    if (!runchk.isok) {
      resolve(runchk.msg);
      return;
    }

    folderCheck().then(function (res) {
      if (res.success) {
        _microdb = require('microdb-api')(process.env.MICRODB_APIKEY);
        _microdb.on(_microdb.Events.init, function () {
          genCode().then(function (res) {
            resolve('code generated...check '+process.env.OutputCodeFolder+' folder');
          });
        });
      }
      else {
        resolve(res.msg);
      }
    });
  });

}

function genCode() {
  return new Promise(function (resolve) {

    var folderInfo = {};
    var fldpath = path.join(__dirname, process.env.OutputCodeFolder);

    var tblKeys = Object.keys(_microdb.Tables);
    for (var index = 0; index < tblKeys.length; index++) {
      var key = tblKeys[index];
      var filePath = path.join(fldpath, key + '.js');
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      var tbl = _microdb.Tables[key];
      var str = new StringBuilder();
      str.append("var microdb = require('microdb-api')(process.env.MICRODB_APIKEY);");
      str.append('\r\n\r\n\r\n');

      //model attributes
      str.append('// model definition...helpful for validation');
      str.append('\r\n');
      str.append('var ' + key + '_column_definitions={');
      str.append('\r\n');
      for (var ci = 0; ci < tbl.ColumnHeaders.length; ci++) {
        var h = tbl.ColumnHeaders[ci];
        str.append('\t');
        str.append(h.FormattedName + ":{");
        str.append("'DataType':'");
        str.append(datatypeck(h.DataType) + "',");
        str.append("'Length':'");
        str.append(h.Length + "',");
        str.append("'Required':'");
        str.append(nullCheck(h.NotNull) + "'");
        str.append('}');
        if (ci < tbl.ColumnHeaders.length - 1) {
          str.append(',');
          str.append('\r\n');
        }

      }
      str.append('\r\n');
      str.append('};');
      str.append('\r\n\r\n\r\n');

      //the model
      str.append('// model for passing one or more values to methods');
      str.append('\r\n');

      str.append('var ' + key + '={');
      str.append('\r\n');
      for (var ci2 = 0; ci2 < tbl.ColumnHeaders.length; ci2++) {
        var h2 = tbl.ColumnHeaders[ci2];
        str.append('\t');
        str.append(h2.FormattedName);
        str.append(":''");
        if (ci2 < tbl.ColumnHeaders.length - 1) {
          str.append(',');
          str.append('\r\n');
        }
      }
      str.append('\r\n');
      str.append('};');
      str.append('\r\n\r\n\r\n');

      str.append('microdb.Tables.' + key + '.get('+key+').then(function (res) {');
      str.append('\r\n');
      str.append('\t if(res.success && res.data){');
      str.append('\r\n');
      str.append('\t\t  var getz = res.data;');
      str.append('\r\n');
      str.append('\t }');
      str.append('\r\n');
      str.append('\t else{');
      str.append('\r\n');
      str.append('\t\t var err = res.error;');
      str.append('\r\n');
      str.append('\t }');
      str.append('\r\n');
      str.append('});');
      str.append('\r\n\r\n');

      str.append('microdb.Tables.' + key + '.saveNew('+key+').then(function (res) {');
      str.append('\r\n');
      str.append('\t if(res.success && res.data && res.data.addedRows){');
      str.append('\r\n');
      str.append('\t\t  var newid = res.data.addedRows[0].insertId;');
      str.append('\r\n');
      str.append('\t }');
      str.append('\r\n');
      str.append('\t else{');
      str.append('\r\n');
      str.append('\t\t var err = res.error;');
      str.append('\r\n');
      str.append('\t }');
      str.append('\r\n');
      str.append('});');
      str.append('\r\n\r\n');

      str.append('microdb.Tables.' + key + '.saveUpdate('+key+').then(function (res) {');
      str.append('\r\n');
      str.append('\t if(res.success && res.data && res.data.updateRows){');
      str.append('\r\n');
      str.append('\t\t var upzoes = res.data.updateRows;');
      str.append('\r\n');
      str.append('\t }');
      str.append('\r\n');
      str.append('\t else{');
      str.append('\r\n');
      str.append('\t\t var err = res.error;');
      str.append('\r\n');
      str.append('\t }');
      str.append('\r\n');
      str.append('});');
      str.append('\r\n\r\n');

      str.append('microdb.Tables.' + key + '.saveDelete({primarykey:'+key+'.primarykey}).then(function (res) {');
      str.append('\r\n');
      str.append('\t if(res.success && res.data && res.data.deletedRows){');
      str.append('\r\n');
      str.append('\t\t var donezos = res.data.deletedRows;');
      str.append('\r\n');
      str.append('\t }');
      str.append('\r\n');
      str.append('\t else{');
      str.append('\r\n');
      str.append('\t\t var err = res.error;');
      str.append('\r\n');
      str.append('\t }');
      str.append('\r\n');
      str.append('});');
      str.append('\r\n\r\n');


      str.append('// if table uses the Attachment column type to store a file with the row');
      str.append('\r\n');
      str.append('microdb.Tables.'+key+'.getAttachment({attachment_col_name:"id"}).then(function (res) {');
      str.append('\r\n');
      str.append('\t if(res.success && res.data){');
      str.append('\r\n');
      str.append('\t\t var file = res.data;');
      str.append('\r\n');
      str.append('\t }');
      str.append('\r\n');
      str.append('\t else{');
      str.append('\r\n');
      str.append('\t\t var err = res.error;');
      str.append('\r\n');
      str.append('\t }');
      str.append('\r\n');
      str.append('});');
      str.append('\r\n\r\n');

      str.append('\r\n\r\n\r\n');

      fs.writeFileSync(filePath, str.toString());
    }
    resolve(folderInfo);

  });
}

function folderCheck() {
  return new Promise(function (resolve) {
    var folderInfo = {};
    try {
      if (!fs.existsSync(_fldpath)) {
        fs.mkdirSync(_fldpath);
      }
      folderInfo.success = true;
      resolve(folderInfo);
    }
    catch (err) {
      folderInfo.success = false;
      folderInfo.msg = err;
      resolve(folderInfo);
    }

  });
}

function datatypeck(data) {
  if (data == 'mediumtext') {
    return 'string';
  }
  else {
    return data;
  }
}

function nullCheck(data) {
  if (data == 'mediumtext') {
    return 'string';
  }
  else {
    return data;
  }
}



function preRunCheck() {
  var res = {
    isok: false,
    msg: ''
  };

  if (!fs.existsSync(path.join(__dirname, 'envVars.txt'))) {
    res.isok = false;
    res.msg = 'missing file envVars.txt';
  }
  else {
    try {
      env('./envVars.txt');
      if (!process.env.MICRODB_APIKEY) {
        res.isok = false;
        res.msg = 'envVars.txt missing MICRODB_APIKEY';
      }
      else if (!process.env.OutputCodeFolder) {
        res.isok = false;
        res.msg = 'envVars.txt missing OutputCodeFolder';
      }
      else {
        res.isok = true;
        _fldpath = path.join(__dirname, process.env.OutputCodeFolder);
      }
    }
    catch (err) {
      res.isok = false;
      res.msg = 'cannot load envVars.txt';
    }

  }

  return res;

}


function StringBuilder() {

  this.theString = null;

  this.append = function (str) {
    if (this.theString === null) {
      this.theString = str;
    }
    else {
      this.theString = this.theString.concat(str);
    }
  };

  this.toString = function () {
    return this.theString;
  };

  this.clear = function () {
    this.theString = null;
  };

  return this;

}

module.exports = {
  init: init,
  generateSource: generateSource
};