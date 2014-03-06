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

		logQuery: function (queryString) {
			console.log("\n\n******** SQL query:\n\n", queryString);
			console.log("\n*********\n");
		},
		logCreateWhereFor: function (keywords, filters, request, whereClause) {
			console.log("\n*** INSIDE createWhereFor method => ");
			console.log("\n\tkeywords: ", keywords);
			console.log("\n\tfilters: ", filters);
			console.log("\n\tcustom whereClause: ", whereClause);

		},

		users: {
			getAll: function (callback) {
				database.createConnection(function (err, connection) {
					if (err) {
						return callback(err);
					}

					var query = "SELECT FirstName, LastName, Username, Email, APIToken \nFROM [Users]";

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

					database.logQuery(query);
					connection.execSql(request);

				});
			},
			getById: function (id, callback) {
				var isFound = false;

				database.createConnection(function (err, connection) {
					if (err) {
						return callback(err);
					}

					var query = "SELECT FirstName, LastName, Username, Email, APIToken \nFROM [Users] \nWHERE Id = @Id";

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
					database.logQuery(query);

					connection.execSql(request);

				});
			},
			getByCredentials: function (username, password, callback) {
				var isFound = false;

				database.createConnection(function (err, connection) {
					if (err) {
						return callback(err);
					}

					var query = "SELECT APIToken, Id, FirstName, LastName, Username, Email \nFROM Users \nWHERE Username = @Username \nAND Password = @Password";

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
							+ " \nFROM [UserFunctionalRoles] as ufr"
							+ " \nINNER JOIN [FunctionalRoles] as fr ON fr.Id = ufr.FunctionalRoleId"
							+ " \nWHERE UserId = @Id";

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

					database.logQuery(query);

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
							+ " \nFROM [UserSpecialisms] AS us"
							+ " \nINNER JOIN [Specialisms] AS s ON s.Id = us.SpecialismId"
							+ " \nWHERE UserId = @Id";

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

					database.logQuery(query);

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

					var query = "SELECT DISTINCT " + specialist + " \nFROM [Constateringen];";

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

					database.logQuery(query);
					connection.execSql(request);

				});
			}
		},

		controles: (function () {

			/**
			 * Create or enrich the WHERE clause for a query.
			 *
			 * @example
			 *  createWhereFor("FunctionalRoleId", filters, request);
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
				if (!filters || filters.length === 0) {
					return "";
					//throw new Error("Missing argument filters for the where clause.");
				}

				var where = "";
				var keywordArray = keywords.split(",");
				var filterArray = Object.keys(filters);

				database.logCreateWhereFor(keywords, filters, request, whereClause);

				filterArray.forEach(function (key) {
					if (core.arrays.contains(keywordArray, key)) {
						// decide if this is a single value
						if (filters[key].indexOf(",") === -1) {
							where += (where ? " \nAND " + key : key) + " = " + filters[key];
						} else { // .. collection of values
							where += (where ? " \nAND " + key : key) + " IN (" + filters[key] + ")";
						}
						var sqlType = database.getSqlDataTypeFor(database.controles.getTypeFor(key));
						request.addParameter(key, sqlType, filters[key]);
					}

				});

				if (whereClause) {
					where += (where ? " \nAND " + whereClause : whereClause);
				}
				return where ? "\nWHERE " + where : "";

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
							property: "FunctionalRoleId",
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

					var res = (first !== null)
						? first
						: database.getTypeFor(propertyName, database.constateringen.getColumnDefinitionList()); // TODOgasl this is tricky thing of something smarter to solve the problem

					return res;
				},

				getColumnsAllowedForFilering: function () {
					return "FunctionalRoleId,Code,Id";
				},

				getTotal: function (filters, callback) {
					database.createConnection(function (err, connection) {
						if (err) {
							return callback(err);
						}
						var total = 0;
						var where = "";
						var query = "SELECT count('x') as total \nFROM Controles ";//c LEFT JOIN [FunctionalRoles] as fr ON fr.Id = c.FunctionalRoleId ";

						var request = new Request(query, function (err) {
							return callback(err, !err && total);
						});

						try {
							where = createWhereFor("FunctionalRoleId", filters, request);
						} catch (error) {
							return callback(error);
						}

						query += where;

						request.on("row", function (columns) {
							total = columns.total.value;
						});

						database.logQuery(query);

						request.sqlTextOrProcedure = query;
						connection.execSql(request);
					});
				},

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
							where = createWhereFor("FunctionalRoleId", filters, request);
						} catch (error) {
							return callback(error);
						}

						var subquery = "(SELECT COUNT(*) FROM [Constateringen] "
							+ createWhereFor("SpecialismId", filters, request, "ControleId = c.Id AND StatusId IN (1,5)")
							+ ") AS NumberOfConstateringen ";

						query = "SELECT c.*, fr.Name as RoleName, " + subquery
							+ "\nFROM [Controles] as c"
							+ " \nLEFT JOIN [FunctionalRoles] as fr ON fr.Id = c.FunctionalRoleId "
							+ where
							+ " \nORDER BY Id ASC OFFSET " + offset
							+ " \nROWS FETCH NEXT " + limit
							+ " \nROWS ONLY ";

						request.sqlTextOrProcedure = query;

						request.on("row", function (columns) {
							var row = {};

							columns.forEach(function (column) {
								row[column.metadata.colName] = column.value;
							});

							return callback(null, row, null);
						});

						database.logQuery(query);

						connection.execSql(request);
					});
				}
			};

		}()),

		constateringen: (function () {

			/**
			 * Create or enrich the WHERE clause for a query.
			 *
			 * @example
			 *  createWhereFor("FunctionalRoleId", filters, request);
			 *
			 * @param {String} keywords Comma separated input parameters
			 * @param {Object} filters A filter object
			 * @param {Object} request
			 * @param {String} whereClause A custom filter for this Where clause
			 *
			 * @returns {*|String} Returns the value of the where clause.
			 */
			function createWhereFor(keywords, filters, request, whereClause) {
				if (!keywords) {
					throw new Error("Missing argument keywords for the where clause.");
				}
				if (!filters && filters.length === 0) {
					return "";
					//throw new Error("Missing argument filters for the where clause.");
				}

				var where = "";
				var keywordArray = keywords.split(",");
				var filterArray = Object.keys(filters);

				database.logCreateWhereFor(keywords, filters, request, whereClause);

				filterArray.forEach(function (key) {

					if (core.arrays.contains(keywordArray, key)) {

						if (filters[key].indexOf(",") > -1) {									// decide if this is a collection of values
							where += (where ? " AND " + key : key) + " IN (" + filters[key] + ")";
						}

						else if (key === "VerantwoordelijkSpecialist") {			//... or a single value
							if (filters[key].toLowerCase() === "null") {
								where += (where ? " AND " + key : key) + " is null";
							} else {
								where += (where ? " AND " + key : key) + " = @" + key;
							}
						}

						else if (key === "DatumActiviteit" && database.constateringen.getTypeFor(key) === "Date") {
							where += (where ? " AND " + key : key) + " >= @" + key;
							filters[key] = new Date(filters[key]);
						} else {
							where += (where ? " AND " + key : key) + " = @" + key;
						}

						var sqlType = database.getSqlDataTypeFor(database.constateringen.getTypeFor(key));
						request.addParameter(key, sqlType, filters[key]);
					}
				});

				if (whereClause) {
					where += (where ? " AND " + whereClause : whereClause)
				}

				return where ? "\nWHERE " + where : "";
			}

			return {

				getColumnDefinitionList: function () {
					return [
						{
							name: "Controle",
							property: "ControleId",
							type: "Number"
						},
						{
							name: "Specialisme",
							property: "SpecialismId",
							type: "Number"
						},
						{
							name: "Status",
							property: "StatusId",
							type: "Number"
						},
						{
							name: "LastMutationDate",
							property: "LastMutationDate",
							type: "Date"
						},
						{
							name: "UserId",
							property: "UserId",
							type: "Number"
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
							type: "Date"
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
				getTypeFor: function (propertyName) {
					var result = database.getTypeFor(propertyName, database.constateringen.getColumnDefinitionList());
					if (!result) {
						console.log("\n\nNo type found for propertyName", propertyName);
					}
					return result;
				},

				getTotal: function (filters, callback) {
					database.createConnection(function (err, connection) {
						if (err) {
							return callback(err);
						}
						var total = 0;
						var where = "";
						var query = "SELECT count('x') as total \nFROM [Constateringen]";

						var request = new Request(query, function (err) {
							return callback(err, !err && total);
						});

						try {
							where = createWhereFor("ControleId", filters, request, "StatusId IN (1,5)");
						} catch (error) {
							return callback(error);
						}

						query += " " + where;

						request.on("row", function (columns) {
							total = columns.total.value;
						});

						database.logQuery(query);

						request.sqlTextOrProcedure = query;
						connection.execSql(request);
					});
				},

				getFilteredBy: function (offset, limit, filters, callback) {
					database.createConnection(function (err, connection) {
						if (err) {
							return callback(err);
						}

						var where = "";
						var orderBy = " \nORDER BY ";
						var orderByColumnName = " Id";
						var sortOrder = " ASC ";
						var query = "";
						var request = new Request(query, function (err, rowcount) {
							return callback(err, null, rowcount);
						});

						// Sanitize input
						// fiter can be done only on
						// controle id
						// list of specialism ids
						// datumActiviteit
						// verantwoordelijkeSpecialist
						try {
							where = createWhereFor("ControleId,SpecialismId,DatumActiviteit,VerantwoordelijkSpecialist", filters, request, "StatusId IN (1,5)");

							if (filters.sortBy && filters.sortOrder) {
								orderByColumnName = filters.sortBy;
								if (filters.sortOrder === "ascending") {
									sortOrder = " ASC ";
								} else if (filters.sortOrder === "descending") { //TODOgasl refactor this and put sorting into another category, not filters
									sortOrder = " DESC ";
								}
							}
						} catch (error) {
							return callback(error);
						}

						query = "SELECT const.*, status.Name as StatusName"
							+ " \nFROM [Constateringen] as const"
							+ " \nINNER JOIN [Statuses] as status ON status.Id = const.StatusId "
							+ where
							+ orderBy + orderByColumnName + sortOrder
							+ "\nOFFSET " + offset
							+ " \nROWS FETCH NEXT " + limit
							+ " \nROWS ONLY ";
						request.sqlTextOrProcedure = query;

						request.on("row", function (columns) {
							var row = {};

							columns.forEach(function (column) {
								row[column.metadata.colName] = column.value;
							});

							return callback(null, row, null);
						});

						database.logQuery(query);

						connection.execSql(request);
					});
				},

				getById: function (id, callback) {
					var isFound = false;

					database.createConnection(function (err, connection) {
						if (err) {
							return callback(err);
						}

						var query = "SELECT * \nFROM [Constateringen] \nWHERE Id = @Id";

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

						database.logQuery(query);
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

						var query = "UPDATE [Constateringen] ";

						var request = new Request(query, function (err, rowcount) {
							return callback(err, rowcount);
						});

						propertyKeys.forEach(function (propertyKey, indexPropertyKey) {
							database.constateringen.getColumnDefinitionList().forEach(function (colDefinition, index) {

								if (propertyKey === colDefinition.property) {

									query += (indexPropertyKey === 0)
										? "\nSET " + propertyKey + " = @" + propertyKey
										: ", " + propertyKey + " = @" + propertyKey;

									if (database.constateringen.getTypeFor(propertyKey) === "Date") {
										properties[propertyKey] = new Date(properties[propertyKey]);
									}

									console.log("\n***** property key-value: ", propertyKey, properties[propertyKey]);
									console.log("\tSQL type via tedious: ", database.getSqlDataTypeFor(colDefinition.type).type);

									request.addParameter(propertyKey, database.getSqlDataTypeFor(colDefinition.type), properties[propertyKey]);
								}

							});
						});

						query += " \nWHERE Id = @Id";
						request.addParameter('Id', tediousTypes.Int, id);

						database.logQuery(query);

						request.sqlTextOrProcedure = query;
						connection.execSql(request);
					});
				},

				updateAllProperties: function (constatering, callback) {
					database.createConnection(function (err, connection) {
						if (err) {
							return callback(err);
						}

						var query = "UPDATE [Constateringen] \nSET "
							+ " UserId = @UserId"
							+ ", StatusId = @StatusId"
							+ ", ZiektegevalNr = @ZiektegevalNr" // prevent sql injection like: '; select * from logins ; --
							+ ", DatumActiviteit = @DatumActiviteit"
							+ ", DBCTypering = @DBCTypering"
							+ ", VerantwoordelijkSpecialist = @VerantwoordelijkSpecialist"
							+ ", OverigeKenmerken = @OverigeKenmerken"
							+ " \nWHERE Id = @Id";

						var request = new Request(query, function (err, rowcount) {
							return callback(err, rowcount);
						});

						request.addParameter('UserId', tediousTypes.Int, constatering.UserId);
						request.addParameter('StatusId', tediousTypes.Int, constatering.StatusId);
						request.addParameter('ZiektegevalNr', tediousTypes.NVarChar, constatering.ZiektegevalNr);
						request.addParameter('DatumActiviteit', tediousTypes.SmallDateTime, new Date(constatering.DatumActiviteit));
						request.addParameter('DBCTypering', tediousTypes.NVarChar, constatering.DBCTypering);
						request.addParameter('VerantwoordelijkSpecialist', tediousTypes.NVarChar, constatering.VerantwoordelijkSpecialist);
						request.addParameter('OverigeKenmerken', tediousTypes.NVarChar, constatering.OverigeKenmerken);
						request.addParameter('Id', tediousTypes.Int, constatering.Id);

						database.logQuery(query);

						connection.execSql(request);
					});
				}

			};
		}())

	};

}());

module.exports = database;
