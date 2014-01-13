/*jslint node:true, white:true*/

"use strict";
var tedious = require("tedious");
var tediousTypes = tedious.TYPES;
var Connection = tedious.Connection;
var Request = tedious.Request;
var fs = require("fs");

var configSQLServer = null;

//var configSQLServer = {
//	userName: "node_user",
//	password: "nodeuser",
//	server: "192.168.145.129",
//	options: {
//		database: "dotcontroles",
//		instanceName: "SQLEXPRESS",
//		rowCollectionOnRequestCompletion: false
//	}
//};

var database = (function () {

	configSQLServer = JSON.parse(fs.readFileSync("config.json").toString()).configSQLServer;

	console.log("\n\nconfigSQLServer =", configSQLServer);

	return {

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

					var query = "SELECT * FROM users";

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

					console.log("database.constateringen.getPropertyFor(Specialist)", database.constateringen.getPropertyFor("Specialist"));
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

		controles: {
			
			getAll: function (callback) {
				database.createConnection(function (err, connection) {
					if (err) {
						return callback(err);
					}

					var query = "SELECT * from Controles;";
					var request = new Request(query, function (err, rowcownt) {
						return callback(err, null, rowcount); // end
					});

					request.on("row", function (columns) {
						var row = {};

						columns.forEach(function (column) {
							console.log("column", column);
							row[column.metadata.colName] = column.value;
						});

						return callback(null, row, null);
					});

					connection.execSql(request);
				});
			}
		},

		constateringen: (function () {

			function createWhere(filters, request) {
				var where = "";

				if (filters) {
					var filterArray = Object.keys(filters);

					filterArray.forEach(function (key) {

						if (key === "VerantwoordelijkSpecialist") {
							where = where && where + " AND ";

							if (filters[key].toLowerCase() === "null") {
								where += "VerantwoordelijkSpecialist is null";
							} else {
								where += "VerantwoordelijkSpecialist = @" + key;
								request.addParameter(key, tediousTypes.NVarChar, filters[key]);
							}

						} else if (key === "DatumActiviteit") {
							// TODO: IS THE DATE VALID???
							where = where && where + " AND ";

							where += "DatumActiviteit >= @" + key;
							request.addParameter(key, tediousTypes.SmallDateTime, new Date(filters[key]));
						} else {
							throw new Error("The filter '" + key + "' is not supported.");
						}

					});

				}

				return where;
			}

			return {

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
					var res = null;
					res = database.constateringen.getColumnDefinitionList()
						.filter(function (colDefinition, index) {
							return (name === colDefinition.name);
						})
						.map(function (colDefinition, index) {
							if (name === colDefinition.name) {
								return colDefinition.property;
							}
						});

					if (res.length > 2) {
						throw new Error("Multiple properties were found for name " + name);
					}

					return (res && res.length > 0) ? res[0] : null;
				},

				getTotal: function (filters, callback) {
					database.createConnection(function (err, connection) {
						if (err) {
							return callback(err);
						}
						var total = 0;
						var where = "";
						var query = "SELECT count('x') as total FROM Constateringen";

						var request = new Request(query, function (err) {
							return callback(err, !err && total);
						});

						try {
							where = createWhere(filters, request);
						} catch (error) {
							return callback(error);
						}

						query += (where ? ' WHERE ' + where : "");

						request.on("row", function (columns) {
							total = columns.total.value;
						});
						console.log("query", query);
						request.sqlTextOrProcedure = query;
						connection.execSql(request);
					});
				},

				getAll: function (offset, limit, filters, callback) {
					database.createConnection(function (err, connection) {
						if (err) {
							return callback(err);
						}

						var where = "";
						var query = "";

						var request = new Request(query, function (err, rowcount) {
							return callback(err, null, rowcount);
						});

						//					if (filters) {
						//						var filterArray = Object.keys(filters);
						//
						//						filterArray.forEach(function (key) {
						//
						//							if (key === "VerantwoordelijkSpecialist") {
						//								where = where && where + " AND ";
						//
						//								if (filters[key].toLowerCase() === "null") {
						//									where += "VerantwoordelijkSpecialist is null";
						//								} else {
						//									where += "VerantwoordelijkSpecialist = @" + key;
						//									request.addParameter(key, tediousTypes.NVarChar, filters[key]);
						//								}
						//
						//							} else if (key === "DatumActiviteit") {
						//								// TODO: IS THE DATE VALID???
						//								where = where && where + " AND ";
						//
						//								where += "DatumActiviteit >= @" + key;
						//								request.addParameter(key, tediousTypes.SmallDateTime, new Date(filters[key]));
						//							} else {
						//								error = new Error("The filter '" + key + "' is not supported.");
						//							}
						//
						//						});
						//
						//						if (error) {
						//							return callback(error);
						//						}
						//					}
						try {
							where = createWhere(filters, request);
						} catch (error) {
							return callback(error);
						}

						query = 'SELECT * FROM Constateringen'
							+ (where ? ' WHERE ' + where : "")
							+ ' ORDER BY Id ASC OFFSET ' + offset
							+ ' ROWS FETCH NEXT ' + limit
							+ ' ROWS ONLY ';
						request.sqlTextOrProcedure = query;

						console.log("\nquery", query);

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

			};
		}())

	};

}());

module.exports = database;