// Initialize the database
var Datastore = require('nedb');
db = {};
db.persons = new Datastore({
  filename: 'db/persons.db'
});
db.projects = new Datastore({
  filename: 'db/projObject.db'
});
db.tokens = new Datastore({
  filename: 'db/token.db'
});
db.scans = new Datastore({
  filename: 'db/scans.db'
});

db.persons.loadDatabase();
db.projects.loadDatabase();
db.tokens.loadDatabase();
db.scans.loadDatabase();

// tokenDb.ensureIndex({
//   fieldName: 'token',
//   expireAfterSeconds: 10
// }, (err) => {
//   //error
//   if (err)
//     console.log(err);
// })

exports.addScan = function (data, callback) {
  var scanObj = {
    "No": data.No,
    "scantime": data.scantime,
    "total": data.total,
    "resultItems": data.resultItems
  }
  db.scans.insert(token, (err, newDoc) => {
    if (err) console.log(err)
    else
      return callback(newDoc);
  })
}


exports.addToken = function (data, callback) {
  console.log('add token here')
  var token = {
    "token": data.token,
    "userId": data.userId,
    "username": data.userName,
    "ttl": data.ttl,
    "currentTime": data.currentTime
  }
  db.tokens.insert(token, (err, newDoc) => {
    if (err) console.log(err)
    else {
      console.log(newDoc);
      return callback(newDoc);
    }
  })
}
exports.getTokens = function (fnc) {
  // Get all persons from the database
  db.tokens.find({}, function (err, docs) {
    // Execute the parameter function
    console.log('token here' + docs);
    fnc(docs);
  });
}

exports.getTokenByUsername = function (username, callback) {
  db.tokens.findOne({
    username: username
  }, function (err, doc) {
    if (err) {
      console.log(err);
    }
    return callback(doc);
  });
}

exports.deleteToken = function (id, callback) {
  db.tokens.remove({
    _id: id
  }, {}, function (err, numRemoved) {
    // Do nothing
    return callback(numRemoved);
  });
}


exports.addProject = function (data, callback) {

  var scanTime = 0;
  if (data.scans) {
    scanTime = data.scans.length;
  }
  var projObject = {
    "projectName": data.projectName,
    "projectCode": data.projectCode,
    "projectOwner": data.projectOwner,
    "projectMember": data.projectMember,
    "projectId": data.id,
    "scans": scanTime,

  }
  db.projects.insert(projObject, (err, newDoc) => {
    if (err) {
      console.log(err);
    }
    if (newDoc) {
      return callback(1)
    }
    //do nothing
  });
};

//update project
exports.updateProject = function (data, callback) {

  var projObject = {
    "projectName": data.projectName,
    "projectCode": data.projectCode,
    "projectOwner": data.projectOwner,
    "projectMember": data.projectMember
  }
  db.projects.update(projObject, {
    multi: true
  }, (err, numReplaced) => {
    if (err) {
      console.log(err);
    }
    return callback(numReplaced);
  });
};

exports.getProjectByCode = function (projCode, callback) {
  db.projects.findOne({
    "projectCode": projCode
  }, function (err, doc) {
    if (err) {
      console.log(err);
    }
    return callback(doc);
  });
}


exports.getProjects = function (fnc) {
  // Get all persons from the database
  db.projects.find({}, function (err, docs) {
    // Execute the parameter function
    fnc(docs);
  });
}

exports.deleteProject = function (id, callback) {
  db.projects.remove({
    _id: id
  }, {}, function (err, numRemoved) {
    // Do nothing
    return callback(numRemoved);
  });
}

exports.deleteAllProject = function (callback) {
  db.projects.remove({}, {
    multi: true
  }, (err, numRemoved) => {
    if (err) console.log(err);
    return callback(numRemoved);
  })
}


// Adds a person
exports.addPerson = function (firstname, lastname) {

  // Create the person object
  var person = {
    "firstname": firstname,
    "lastname": lastname
  };

  // Save the person to the database
  db.persons.insert(person, function (err, newDoc) {
    // Do nothing
  });
};

// Returns all persons
exports.getPersons = function (fnc) {

  // Get all persons from the database
  db.persons.find({}, function (err, docs) {

    // Execute the parameter function
    fnc(docs);
  });
}

// Deletes a person
exports.deletePerson = function (id) {

  db.persons.remove({
    _id: id
  }, {}, function (err, numRemoved) {
    // Do nothing
  });
}