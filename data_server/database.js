/*jslint node:true, white:true*/

"use strict";
var tedious = require("tedious");
var tediousTypes = tedious.TYPES;
var Connection = tedious.Connection;
var Request = tedious.Request;

var configSQLServer = {
	userName: "node_user",
	password: "nodeuser",
	server: "192.168.145.129",
	options: {
		database: "dotcontroles",
		instanceName: "SQLEXPRESS",
		rowCollectionOnRequestCompletion: false
	}
};

var database = {

	createConnection: function (callback) {
		var connection = new Connection(configSQLServer).on("connect", function (err) {
			callback(err, !err && connection);
		});
	},

	getSqlDataTypeFor: function (type) {

		switch (type) {
			case "Number":
				return tediousTypes.Int;
			case "String":
				return tediousTypes.NVarChar;
			case "Date":
				return tediousTypes.SmallDateTime;
			default:
				return tediousTypes.NVarChar;
		}

	},

	users: {
		getAll: function (callback) {

			database.createConnection(function (err, connection) {
				if (err) {
					return callback(err);
				}

				var query = "select * from users";

				var request = new Request(query, function (err, rowcount) {
					return callback(err, null, rowcount); // end
				});

				request.on("row", function (columns) {
					var row = {};

					columns.forEach(function (column) {
						row[column.metadata.colName] = column.value;
					});
					return callback(null, row, null);
				});

				connection.execSql(request);

			});

		},

		getById: function (id, callback) {
			var isFound = false;

			database.createConnection(function (err, connection) {
				if (err) {
					return callback(err);
				}

				var query = "SELECT * from users WHERE Id = @Id";

				var request = new Request(query, function (err, rowcount) {
					if (err) {
						throw err;
					}
					if (!isFound) {
						return callback(null, null);
					}
				});

				request.on("row", function (columns) {
					if (isFound) {
						throw new Error("Multiple users with the same id are found in database.");
					}

					isFound = true;

					var row = {};
					columns.forEach(function (column) {
						row[column.metadata.colName] = column.value;
					});
					return callback(null, row);

				});

				request.addParameter('Id', tediousTypes.Int, id);

				connection.execSql(request);

			});
		}
	},

	specialists: {

		getAll: function (callback) {
			database.createConnection(function (err, connection) {
				if (err) {
					return callback(err);
				}

				var specialist = database.constateringen.getPropertyFor("Specialist") || "VerantwoordelijkSpecialist";
				
				var query = "SELECT DISTINCT " + specialist + " from constateringen;";

				var request = new Request(query, function (err, rowcount) {
					return callback(err, null, rowcount); // end
				});

				request.on("row", function (columns) {
					var row = {};

					columns.forEach(function (column) {
						row[column.metadata.colName] = column.value;
					});
					return callback(null, row, null);
				});

				connection.execSql(request);

			});
		}

	},

	constateringen: {

		getColumnDefinitionList: function () {
			return [
				{
					name: "Status",
					property: "StatusId",
					type: "Number",
					options: {
						0: " ",
						1: "Open",
						2: "Status 2",
						3: "Status 3",
						4: "Status 4",
						5: "Status 5",
						6: "Doorgezet"
					},
					editable: {
						control: "Selectbox",
						"default": 2,
						"events": ["selected"]
					}
				},
				{ name: "Patientnummer",
					property: "PatientNr",
					type: "String"
				},
				{ name: "Ziektegeval",
					property: "ZiektegevalNr",
					type: "Number"
				},
				{ name: "Datum Activiteit",
					property: "DatumActiviteit",
					type: "Date",
					sortable: "descending",
					format: "DD-MM-YYYY"
				},
				{ name: "DBC Typering",
					property: "DBCTypering",
					type: "String"
				},
				{ name: "Specialist",
					property: "VerantwoordelijkSpecialist",
					type: "String"
				},
				{ name: "Overige kenmerken",
					property: "OverigeKenmerken",
					type: "String"
				}
			];
		},

		getPropertyFor: function (name) {

			var results = null;
			results = database.constateringen.getColumnDefinitionList().filter(function (colDefinition, index) {
				if (name === colDefinition.property) {
					return colDefinition.property;
				}
			});

			console.log("\n\n\ngetPropertyFor => name, results", name, results);

			if (results.length > 2) {
				throw new Error("Multiple properties were found for name " + name);
			}

			return (results && results.length > 0) ? results[0] : null;
		},

		getTotal: function (filters, callback) {
			database.createConnection(function (err, connection) {
				if (err) {
					return callback(err);
				}

				var where = '';
				if (filters) {
					var filterArray = Object.keys(filters);
					var hasMoreFilters = false;
					if (filterArray.length > 0) {

						filterArray.forEach(function (key) {

							if (!hasMoreFilters) {
								if (filters[key].toLowerCase() === "null") {
									where += ' WHERE ' + 'VerantwoordelijkSpecialist' + " is null";
								} else {
									where += ' WHERE ' + key + " = '" + filters[key] + "'";
								}
								hasMoreFilters = true;
							} else {
								where += ' AND ' + key + " = '" + filters[key] + "'";
							}
						});
					}
				}

				var query = "SELECT count('x') as total FROM Constateringen" + where;
				var total = 0;

				var request = new Request(query, function (err) {
					return callback(err, !err && total);
				});
				request.on("row", function (columns) {
					total = columns.total.value;
				});

				connection.execSql(request);
			});
		},

		getAll: function (offset, limit, filters, callback) {
			database.createConnection(function (err, connection) {
				if (err) {
					return callback(err);
				}

				var where = '';
				if (filters) {
					var filterArray = Object.keys(filters);
					var hasMoreFilters = false;
					if (filterArray.length > 0) {

						filterArray.forEach(function (key) {

							if (!hasMoreFilters) {
								if (filters[key].toLowerCase() === "null") {
									where += ' WHERE ' + 'VerantwoordelijkSpecialist' + " is null";
								} else {
									where += ' WHERE ' + key + " = '" + filters[key] + "'";
								}
								hasMoreFilters = true;
							} else {
								where += ' AND ' + key + " = '" + filters[key] + "'";
							}
						});
					}
				}

				var query = 'SELECT * FROM Constateringen'
					+ where
					+ ' ORDER BY Id ASC OFFSET ' + offset
					+ ' ROWS FETCH NEXT ' + limit
					+ ' ROWS ONLY ';

				console.log("query", query);

				var request = new Request(query, function (err, rowcount) {
					return callback(err, null, rowcount);
				});

				request.on("row", function (columns) {
					var row = {};

					columns.forEach(function (column) {
						row[column.metadata.colName] = column.value;
					});

					return callback(null, row, null);
				});

				connection.execSql(request);
			});
		},

		getById: function (id, callback) {
			var isFound = false;

			database.createConnection(function (err, connection) {
				if (err) {
					return callback(err);
				}

				var query = "SELECT * from constateringen WHERE Id = @Id";

				var request = new Request(query, function (err, rowcount) {
					console.log("rowcount", rowcount);
					if (err) {
						throw err;
					}
					if (!isFound) {
						return callback(null, null);
					}
				});

				request.on("row", function (columns) {
					if (isFound) {
						throw new Error("Multiple constateringen with the same id are found in database.");
					}

					isFound = true;

					var row = {};
					columns.forEach(function (column) {
						row[column.metadata.colName] = column.value;
					});
					return callback(null, row);

				});

				request.addParameter('Id', tediousTypes.Int, id);

				connection.execSql(request);

			});
		},

		update: function (id, properties, callback) {
			if (!id || id === null) {
				throw new Error("Missing argument id.");
			}
			if (!properties || properties.length === 0) {
				throw new Error("Missing argument members.");
			}

			database.createConnection(function (err, connection) {
				if (err) {
					return callback(err);
				}

				var propertyKeys = Object.keys(properties);
				var lastIndex = propertyKeys.length - 1;
				var query = "UPDATE Constateringen ";

				var request = new Request(query, function (err, rowcount) {
					console.log("\nquery = ", query);
					return callback(err, rowcount);
				});

//					console.log("propertyKeys.length", propertyKeys.length);
				propertyKeys.forEach(function (propertyKey, indexPropertyKey) {
					database.constateringen.getColumnDefinitionList().forEach(function (colDefinition, index) {

						if (propertyKey === colDefinition.property) {
//								console.log("\nlastIndex, index", lastIndex, index);

							query += (index === 0)
								? "SET " + propertyKey + " = @" + propertyKey
								: ", " + propertyKey + " = @" + propertyKey;

							console.log(propertyKey, database.getSqlDataTypeFor(colDefinition.type), properties[propertyKey]);
							request.addParameter(propertyKey, database.getSqlDataTypeFor(colDefinition.type), properties[propertyKey]);
						}

					});
				});

				query += " WHERE Id = @Id";
				request.addParameter('Id', tediousTypes.Int, id);

				request.sqlTextOrProcedure = query;
				connection.execSql(request);
			});
		},

		updateAllProperties: function (constatering, callback) {
			database.createConnection(function (err, connection) {
				if (err) {
					return callback(err);
				}

				var query = "UPDATE Constateringen SET "
					+ " GebruikerId = @GebruikerId"
					+ ", StatusId = @StatusId"
					+ ", ZiektegevalNr = @ZiektegevalNr" // prevent sql injection like: '; select * from logins ; --
					+ ", DatumActiviteit = @DatumActiviteit"
					+ ", DBCTypering = @DBCTypering"
					+ ", VerantwoordelijkSpecialist = @VerantwoordelijkSpecialist"
					+ ", OverigeKenmerken = @OverigeKenmerken"
					+ " WHERE Id = @Id";

				var request = new Request(query, function (err, rowcount) {
					return callback(err, rowcount);
				});

				request.addParameter('GebruikerId', tediousTypes.Int, constatering.GebruikerId);
				request.addParameter('StatusId', tediousTypes.Int, constatering.StatusId);
				request.addParameter('ZiektegevalNr', tediousTypes.NVarChar, constatering.ZiektegevalNr);
				request.addParameter('DatumActiviteit', tediousTypes.SmallDateTime, new Date(constatering.DatumActiviteit));
				request.addParameter('DBCTypering', tediousTypes.NVarChar, constatering.DBCTypering);
				request.addParameter('VerantwoordelijkSpecialist', tediousTypes.NVarChar, constatering.VerantwoordelijkSpecialist);
				request.addParameter('OverigeKenmerken', tediousTypes.NVarChar, constatering.OverigeKenmerken);
				request.addParameter('Id', tediousTypes.Int, constatering.Id);

				connection.execSql(request);
			});
		}

	}
};

module.exports = database;