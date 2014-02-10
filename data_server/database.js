/*jslint node:true, white:true*/

"use strict";

var core = require("crafity-core");
var tedious = require("tedious");
var tediousTypes = tedious.TYPES;
var Connection = tedious.Connection;
var Request = tedious.Request;
var fs = require("fs");

var configSQLServer = null;

// default configuration
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

		getPropertyFor: function (name, columnDefinitionList) {
			var res = columnDefinitionList
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

		getTypeFor: function (propertyName, columnDefinitionList) {
			var res = columnDefinitionList
				.filter(function (colDefinition, index) {
					return (propertyName === colDefinition.property);
				})
				.map(function (colDefinition, index) {
					if (propertyName === colDefinition.property) {
						return colDefinition.type;
					}
				});

			if (res.length > 2) {
				throw new Error("Multiple types were found for property " + propertyName);
			}

			return (res && res.length > 0) ? res[0] : null;
		},

		users: {
			getAll: function (callback) {
				database.createConnection(function (err, connection) {
					if (err) {
						return callback(err);
					}

					var query = "SELECT * FROM [Users]";

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
			},
			getByCredentials: function (username, password, callback) {
				var isFound = false;

				database.createConnection(function (err, connection) {
					if (err) {
						return callback(err);
					}

					var query = "SELECT APIToken, Id, FirstName, LastName, Username, Email from Users WHERE Username = @Username AND Password = @Password";

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
							throw new Error("Multiple users with the same username are found in the database.");
						}

						isFound = true;

						var row = {};
						columns.forEach(function (column) {
							row[column.metadata.colName] = column.value;
						});
						return callback(null, row);

					});

					request.addParameter("Username", tediousTypes.NVarChar, username);
					request.addParameter("Password", tediousTypes.NVarChar, password);

					connection.execSql(request);

				});
			},
			getRolesByUserId: function (id, callback) {
				database.createConnection(function (err, connection) {
					if (err) {
						return callback(err);
					}

					var query =
						"SELECT ufr.Id, ufr.UserId, ufr.FunctionalRoleId, fr.Name, fr.NeedsSpecialism, ufr.CreationDate, ufr.LastMutationDate"
							+ " FROM [UserFunctionalRoles] as ufr"
							+ " INNER JOIN [FunctionalRoles] as fr ON fr.Id = ufr.FunctionalRoleId"
							+ " WHERE UserId = @Id";

					var rows = [];
					var request = new Request(query, function (err, rowcount) {
						return callback(err, rows, rowcount); // end
					});

					request.on("row", function (columns) {
						var row = {};

						columns.forEach(function (column) {
							row[column.metadata.colName] = column.value;
						});

						rows.push(row);
					});

					request.addParameter("Id", tediousTypes.Int, id);
					connection.execSql(request);

				});
			},
			getSpecialismsByUserId: function (id, callback) {

				database.createConnection(function (err, connection) {
					if (err) {
						return callback(err);
					}

					var query =
						"SELECT us.Id, us.UserId, us.SpecialismId, s.Name, s.AGBCode, us.CreationDate, us.LastMutationDate"
							+ " FROM [UserSpecialisms] AS us"
							+ " INNER JOIN [Specialisms] AS s ON s.Id = us.SpecialismId"
							+ " WHERE UserId = @Id";

					var rows = [];
					var request = new Request(query, function (err, rowcount) {
						return callback(err, rows, rowcount); // end
					});

					request.on("row", function (columns) {
						var row = {};

						columns.forEach(function (column) {
							row[column.metadata.colName] = column.value;
						});

						rows.push(row);
					});

					request.addParameter("Id", tediousTypes.Int, id);
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

		controles: (function () {

			/**
			 * Create or enrich the WHERE clause for a query.
			 *
			 * @example
			 *  createWhereFor("RoleId", filters, request);
			 *
			 * @param keyword
			 * @param filters
			 * @param request
			 * @param whereClause
			 * @returns {*|string}
			 */
			function createWhereFor(keywords, filters, request, whereClause) {
				if (!keywords) {
					throw new Error("Missing argument keywords for the where clause.");
				}
				if (!filters) {
					throw new Error("Missing argument filters for the where clause.");
				}

				var where = whereClause || "";
				var keywordArray = keywords.split(",");
				var filterArray = Object.keys(filters);

				console.log("\nINSIDE createWhereFor method => ");
				console.log("\nkeywords", keywords);
				console.log("\nkeywordArray", keywordArray);
				console.log("\nfilters", filters);
				console.log("\nwhereClause", whereClause);

				filterArray.forEach(function (key) {
					if (core.arrays.contains(keywordArray, key)) {
						// decide if this is a single value
						if (filters[key].indexOf(",") === -1) {
							where += (where ? " AND " + key : key) + " = " + filters[key];
						} else { // .. collection of values
							where += (where ? " AND " + key : key) + " IN (" + filters[key] + ")";
						}
						var sqlType = database.getSqlDataTypeFor(database.controles.getTypeFor(key));
						request.addParameter(key, sqlType, filters[key]);
					}

				});
//				console.log("\n\n\n\nwhere clause containes: ", where);
				return where;

			}

			return {
				getColumnDefinitionList: function () {
					return [
						{
							name: "Code",
							property: "Code",
							type: "String"
						},
						{ name: "Naam",
							property: "Name",
							type: "String"
						},
						{ name: "Type",
							property: "Type",
							type: "String"
						},
						{ name: "Rol",
							property: "RoleId",
							type: "Number"
						},
						{ name: "Aantal Constateringen",
							property: "NumberOfConstateringen",
							type: "Number"
						}
					];
				},
				getPropertyFor: function (name) {
					return database.getPropertyFor(name, database.controles.getColumnDefinitionList());
				},

				getTypeFor: function (propertyName) {
					var first = database.getTypeFor(propertyName, database.controles.getColumnDefinitionList());

					console.log("first", first);
					var res = (first !== null)
						? first
						: database.getTypeFor(propertyName, database.constateringen.getColumnDefinitionList()); // gasl this is tricky thing of something smarter to solve the problem

					console.log("resultaat", res);
					return res;
				},

				getTotal: function (filters, callback) {
					database.createConnection(function (err, connection) {
						if (err) {
							return callback(err);
						}
						var total = 0;
						var where = "";
						var query = "SELECT count('x') as total FROM Controles";

						var request = new Request(query, function (err) {
							return callback(err, !err && total);
						});

						try {
							where = createWhereFor("RoleId", filters, request);
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

						try {
							where = createWhereFor("RoleId", filters, request);
						} catch (error) {
							return callback(error);
						}

						query = "SELECT Controles.*,  (SELECT COUNT(*) FROM Constateringen WHERE ControleId = Controles.Id) AS NumberOfConstateringen FROM [Controles]"
							+ (where ? " WHERE " + where : "")
							+ " ORDER BY Id ASC OFFSET " + offset
							+ " ROWS FETCH NEXT " + limit
							+ " ROWS ONLY ";
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

				// possible filters are:
				// RoleIds
				// date
				getFilteredBy: function (offset, limit, filters, callback) {

					database.createConnection(function (err, connection) {
						if (err) {
							return callback(err);
						}

						var where = "";
						var query = "";

						var request = new Request(query, function (err, rowcount) {
							return callback(err, null, rowcount);
						});

						try {
							where = createWhereFor("RoleId", filters, request);
						} catch (error) {
							return callback(error);
						}

						var subquery = "(SELECT COUNT(*) FROM Constateringen "
							+ createWhereFor("SpecialismId", filters, request, "WHERE ControleId = Controles.Id")
							+ ") AS NumberOfConstateringen ";

						query = "SELECT Controles.*, "
							+ subquery
							+ "FROM [Controles]"
							+ (where ? " WHERE " + where : "")
							+ " ORDER BY Id ASC OFFSET " + offset
							+ " ROWS FETCH NEXT " + limit
							+ " ROWS ONLY ";
						request.sqlTextOrProcedure = query;

						console.log("\nquery:", query);

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
			};

		}()),

		constateringen: (function () {

			function createWhere(filters, request) {
				var where = "StatusId IN (1, 5)";

				if (filters) {
					var filterArray = Object.keys(filters);

					filterArray.forEach(function (key) {

						if (key === "ControleId") {
							where = where && where + " AND ";
							where += "ControleId = @" + key;
							request.addParameter(key, tediousTypes.Int, filters[key]);
						}
						else if (key === "VerantwoordelijkSpecialist") {
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
							name: "Specialisme",
							property: "SpecialismId",
							type: "Number"
						},
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

					return database.getPropertyFor(name, database.constateringen.getColumnDefinitionList());
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
						throw new Error("Missing argument 'id'.");
					}
					if (!properties || properties.length === 0) {
						throw new Error("Missing argument 'members'.");
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
