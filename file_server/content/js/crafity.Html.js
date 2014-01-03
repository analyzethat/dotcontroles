/*jslint browser: true, nomen: true, vars: true, white: true, evil: true, forin: true */
/*globals Window, numeral, moment, console*/

(function (crafity) {
	"use strict";

	(function (html) {

		function Element(type) {
			if (!this || this instanceof Window) {
				return new Element(type);
			}
			this._type = type;
		}

		Element.prototype = crafity.core.EventEmitter.prototype;
		Element.prototype.getChildren = function () {
			if (!this._children) {
				this._children = [];
			}
			return this._children;
		};
		Element.prototype.setChildren = function (children) {
			if (this._children) {
				this._children = children;
			}
			return this._children;
		};
		Element.prototype.clear = function () {
			var self = this;
			var children = self.getChildren();
			if (!children.length) {
				return self;
			}
			children.forEach(function (child) {
				self.getElement().removeChild(child.getElement());
			});
			self.setChildren([]);
			return this;
		};
		Element.prototype.render = function () {
			return this.getElement();
		};
		Element.prototype.getType = function () {
			return this._type;
		};
		Element.prototype.getElement = function () {
			if (!this._element) {
				this._element = document.createElement(this.getType());
			}
			return this._element;
		};
		Element.prototype.prepend = function (children) {
			if (!children) {
				return this;
			}
			var self = this;

			function addChild(child) {
				if (child instanceof Element) {
					self.setChildren([child].concat(self.getChildren()));
					if (self.getElement().childNodes.length > 0) {
						self.getElement().insertBefore(child.render(), self.getElement().childNodes[0]);
					} else {
						self.getElement().appendChild(child.render());
					}
				} else {
					throw new Error("Unexpected child to append");
				}
			}

			if (children instanceof Array) {
				children.forEach(function (child) {
					addChild(child);
				});
			} else if (children instanceof Element) {
				addChild(children);
			} else {
				throw new Error("Unexpected child to append");
			}

			return this;
		};
		Element.prototype.append = function (children) {
			if (!children) {
				return this;
			}
			var self = this;

			function addChild(child) {
				if (child instanceof Element) {
					self.getChildren().push(child);
					self.getElement().appendChild(child.render());
				} else {
					throw new Error("Unexpected child to append");
				}
			}

			if (children instanceof Array) {
				children.forEach(addChild);
			} else if (children instanceof Element) {
				addChild(children);
			} else {
				throw new Error("Unexpected child to append");
			}

			return this;
		};
		Element.prototype.appendTo = function (parent) {
			if (!parent) {
				return this;
			}
			parent.append(this);
			return this;
		};
		Element.prototype.addClass = function (classNames) {
			var classString = this.getElement().getAttribute("class");
			var classes = (classString && classString.length && classString.split(" ")) || [];
			var classesToAdd = classNames.split(" ");
			classesToAdd.forEach(function (classToAdd) {
				if (classes.indexOf(classToAdd) > -1) {
					return;
				}
				classes.push(classToAdd);
			});
			this.getElement().setAttribute("class", classes.join(" "));
			return this;
		};
		Element.prototype.attr = function (name, value) {
			if (value === undefined) {
				return this.getElement().getAttribute(name);
			}
			if (value === null) {
				this.getElement().removeAttribute(name);
			} else {
				this.getElement().setAttribute(name, value);
			}
			return this;
		};
		Element.prototype.hasClass = function (classNames) {
			var classes = (this.getElement().getAttribute("class") || "").split(" ");
			var classesToCheck = classNames.split(" ");
			if (classesToCheck.length === 0) {
				return false;
			}
			var hasClasses = true;
			classesToCheck.forEach(function (classToAdd) {
				var index = classes.indexOf(classToAdd);
				hasClasses = hasClasses && (index > -1);
			});
			return hasClasses;
		};
		Element.prototype.hasNotClass = function (classNames) {
			return !this.hasClass(classNames);
		};
		Element.prototype.removeClass = function (classNames) {
			var classString = this.getElement().getAttribute("class");
			var classes = (classString && classString.length && classString.split(" ")) || [];
			var classesToAdd = classNames.split(" ");
			classesToAdd.forEach(function (classToAdd) {
				var index = classes.indexOf(classToAdd);
				if (index === -1) {
					return;
				}
				classes.splice(index, 1);
			});
			this.getElement().setAttribute("class", classes.join(" "));
			return this;
		};
		Element.prototype.toggleClass = function (classNames) {
			var self = this;
			//var classes = (this.getElement().getAttribute("class") || "").split(" ");
			var classesToAdd = classNames.split(" ");
			classesToAdd.forEach(function (classToAdd) {
				if (self.hasClass(classToAdd)) {
					self.removeClass(classToAdd);
				} else {
					self.addClass(classToAdd);
				}
			});
			return this;
		};
		Element.prototype.isVisible = function () {
			return !this.hasClass("hidden");
		};
		Element.prototype.readonly = function (value) {
			if (value === true) {
				this.attr("readonly", "readonly");
				this.emit("readonlyChanged", value);
			} else if (value === false) {
				this.attr("readonly", null);
				this.emit("readonlyChanged", value);
			} else {
				return !!this.attr("readonly");
			}
			return this;
		};
		Element.prototype.disabled = function (value) {
			if (value === true) {
				this.attr("disabled", "disabled");
				this.emit("disabledChanged", value);
			} else if (value === false) {
				this.attr("disabled", null);
				this.emit("disabledChanged", value);
			} else {
				return !!this.attr("disabled");
			}
			return this;
		};
		Element.prototype.tabindex = function (value) {
			if (value) {
				this.attr("tabindex", value);
			} else if (value === null) {
				this.attr("tabindex", null);
			} else {
				return !!this.attr("tabindex");
			}
			return this;
		};
		Element.prototype.show = function () {
			this.removeClass("hidden");
			return this;
		};
		Element.prototype.hide = function () {
			this.addClass("hidden");
			return this;
		};
		Element.prototype.text = function (text) {
			if (text) {
				this.getElement().textContent = text;
				return this;
			}
			return this.getElement().textContent;
		};
		Element.prototype.value = function (value) {
			if (value !== undefined) {
				this.getElement().value = value;
				return this;
			}
			return this.getElement().value;
		};
		Element.prototype.focus = function () {
			this.getElement().focus();
		};
		Element.prototype.id = function (id) {
			if (id) {
				this.getElement().setAttribute("id", id);
				return this;
			}
			return this.getAttribute("id");
		};
		Element.prototype.toggleVisibility = function () {
			if (this.isVisible()) {
				this.hide();
			} else {
				this.show();
			}
		};
		Element.prototype.addEventListener = function () {
			this.getElement().addEventListener.apply(this.getElement(), arguments);
			return this;
		};
		Element.prototype.removeEventListener = function () {
			this.getElement().removeEventListener.apply(this.getElement(), arguments);
			return this;
		};
		html.Element = Element;

		function MenuPanel(name, init) {
			this._menuItems = new Element("ul");
			this.addClass("menu-panel hidden");
			if (name) {
				this.append(new Element("h2").text(name));
			}
			this.append(this._menuItems);

			if (init) {
				init(this.getElement());
			}
		}

		MenuPanel.prototype = new Element("div");
		MenuPanel.prototype.addMenuItem = function (menuItem) {
			var self = this;
			this._menuItems.append(menuItem);
			menuItem.on("click", function (clickedMenuItem) {
				self._menuItems.getChildren().forEach(function (mi) {
					if (mi !== clickedMenuItem) {
						mi.removeClass("selected");
					}
				});
				clickedMenuItem.addClass("selected");
			});
			return self;
		};
		MenuPanel.prototype.addMenuItems = function (menuItems) {
			var self = this;
			if (menuItems instanceof Array) {
				menuItems.forEach(function (menuItem) {
					self.addMenuItem(menuItem);
				});
			}
			if (menuItems instanceof Element) {
				self.addMenuItem(menuItems);
			}
			return self;
		};
		html.MenuPanel = MenuPanel;

		function MenuItem(name, callback) {
			var self = this;

			self.on("click", callback);

			var anchor = new Element("a");
			anchor.attr("href", "#" + name);
			anchor.addEventListener("click", function () {
				self.emit("click", self);
			});
			this.on("selected", function () {
				self.emit("click", self);
			});
			anchor.text(name);
			this.addClass("menuitem");

			this.append(anchor);
		}

		MenuItem.prototype = new Element("li");
		MenuItem.prototype.select = function () {
			this.addClass("selected");
			this.emit("selectionChanged", this);
			this.emit("selected", this);
			return this;
		};
		MenuItem.prototype.selected = function () {
			return this.hasClass("selected");
		};
		MenuItem.prototype.deselect = function () {
			this.removeClass("selected");
			this.emit("selectionChanged", this);
			this.emit("deselected", this);
			return this;
		};
		html.MenuItem = MenuItem;

		function Searchbox(callback) {
			var self = this;

			this._search = new Element("input")
				.attr("type", "search")
				.attr("name", "search")
				.attr("results", "5");

			if (callback) {
				this.on("change", callback);
			}

			this._search.addEventListener("keyup", function (e) {
				if (e.which === 13) {
					return;
					/* Handled by search event */
				}
				self.emit("change", self._search.value());
			});
			this._search.addEventListener("search", function () {
				self.emit("change", self._search.value());
			});

			this.append(this._search);
			this.addClass("searchbox");
		}

		Searchbox.prototype = new Element("div");
		Searchbox.prototype.focus = function () {
			this._search.focus();
			return this;
		};
		html.Searchbox = Searchbox;

		function List() {
			var self = this;

			this._searchBox = new Searchbox();
			this.onsearch = function (filter) {
				if (!filter) {
					return;
				}
				self._searchBox.on("change", filter);
			};
			this.onClientSelected = function filter(cb) {

			};
			this._listitems = [];
			this.addClass("list");
			this._itemContainer = new Element("ul").addClass("itemContainer");

			this.append(this._searchBox);
			this.append(this._itemContainer);
		}

		List.prototype = new Element("div");
		List.prototype.focus = function () {
			this._searchBox.focus();
		};
		List.prototype.addListItem = function (listItem) {
			var self = this;

			listItem.on("click", function updateSelection() {
				self.getListItems().forEach(function (listitem) {
					if (listitem !== listItem) {
						listitem.deselect();
					}
				});
				listItem.select();
			});
			listItem.on("selected", function (listitem) {
				self.emit("clientSelected", listitem.data);
			});

			this._listitems.push(listItem);
			this._itemContainer.append(listItem);
		};
		List.prototype.addListItems = function (listItems) {
			var self = this;
			listItems.forEach(function (listItem) {
				self.addListItem(listItem);
			});
		};
		List.prototype.clearListItems = function () {
			this._itemContainer.clear();
			this._listitems = [];
		};
		List.prototype.getListItems = function () {
			return [].concat(this._listitems);
		};
		html.List = List;

		function ListItem(name, data) {
			var self = this;
			this.addClass("ListItem");
			this.append(new Element("div").addClass("content").text(name));
			this.data = data;
			this.tabindex("0");
			this.getElement().addEventListener("click", function () {
				self.emit("click", self);
			});
			this.getElement().addEventListener("focus", function () {
				self.emit("click", self);
			});
		}

		ListItem.prototype = new Element("li");
		ListItem.prototype.select = function () {
			this.addClass("selected");
			this.emit("selectionChanged", this);
			this.emit("selected", this);
			return this;
		};
		ListItem.prototype.selected = function () {
			return this.hasClass("selected");
		};
		ListItem.prototype.deselect = function () {
			this.removeClass("selected");
			this.emit("selectionChanged", this);
			this.emit("deselected", this);
			return this;
		};
		html.ListItem = ListItem;

		function Grid(columns) {
			var self = this;
			var container = new Element("div").addClass("container").appendTo(this);
			var table = new Element("table").attr("cellspacing", "0").appendTo(container);
			var thead = new Element("thead").appendTo(table).addClass("header");
			var headerRow = new Element("tr").appendTo(thead);

			var tbody = new Element("tbody").appendTo(table);
			var TYPE_DATE = "Date";
			var TYPE_NUMBER = "Number";
			var TYPE_BOOLEAN = "Boolean";

			var EMPTY_VALUE = " ";
			var ASC = "ascending";
			var DESC = "descending";

			var _rows = null;

			this.addClass("grid");

			function sortRowsPerColumn(column, sortOrder) {
				var sortedRows = [];
				var valuesSortedPerColumn = _rows
					.map(function (row) {
						var value = row[column.property];
						if (typeof value === 'number' && isNaN(value)) {
							return "__NaN__";
						}
						return value;
					});
				valuesSortedPerColumn = valuesSortedPerColumn.filter(function onlyUnique(value, index, self) {
					return valuesSortedPerColumn.indexOf(value) === index;
				});

				var sortFunctions = {
					ascending: function (a, b) {
						if (a > b) { return 1; }
						if (a < b) { return -1; }
						return 0;
					},
					descending: function (a, b) {
						if (a > b) { return -1; }
						if (a < b) { return 1; }
						return 0;
					}
				};

				valuesSortedPerColumn.sort(sortFunctions[sortOrder]);

				valuesSortedPerColumn.forEach(function (sortedRowValue) {
					_rows.forEach(function (row) {

						if (row[column.property] === sortedRowValue ||
							(sortedRowValue === "__NaN__"
								&& typeof row[column.property] === 'number'
								&& isNaN(row[column.property]))) {
							sortedRows.push(row);
						}
					});
				});

				return sortedRows;
			}

			function addRows(rows) {
				rows.forEach(self.addRow);
			}

			this.addColumn = function (column) {
				var th = new Element("th").addClass("sortable");
				var stickyTH = new Element("div");
				var textSpan = new Element("span");

				stickyTH.append(textSpan.text(column.name)).addClass("sticky").appendTo(th);

				if (column.sortable) {
					th.addClass(column.sortable); // asc or desc
				}

				// event handler
				stickyTH.addEventListener("click", function () {

					var lastSortOrder;
					var newSortOrder;

					if (th.hasClass(ASC)) {
						lastSortOrder = ASC;
					} else if (th.hasClass(DESC)) {
						lastSortOrder = DESC;
					}

					headerRow.getChildren().forEach(function (thElement) {
						thElement.removeClass(ASC).removeClass(DESC);
					});

					if (lastSortOrder === ASC) {
						th.addClass(newSortOrder = DESC);
					} else if (lastSortOrder === DESC) {
						th.addClass(newSortOrder = ASC);
					} else {
						th.addClass(newSortOrder = ASC); // default
					}

					var sortedRows = sortRowsPerColumn(column, newSortOrder);
					self.clearRows();
					addRows(sortedRows);

				});
				th.addClass("column").appendTo(headerRow);
			};

			this.addColumns = function (columns) {
				if (!columns) {
					throw new Error("Argument 'columns' is required");
				}
				columns.forEach(self.addColumn);
			};

			this.clearColumns = function () {
				headerRow.clear();
			};

			this.addRow = function (row) {
				var rowElement = new Element("tr").appendTo(tbody).addClass("row");

				columns.forEach(function (column) {
					var td = new Element("td").addClass("cell").appendTo(rowElement);

					if (column.options) {
						td.addClass("string");
					} else {
						td.addClass(column.type.toLowerCase());
					}

					var actualValue = row[column.property];

					if (actualValue === undefined || actualValue === null) {
						actualValue = EMPTY_VALUE;

					} else if (column.type === TYPE_NUMBER && typeof actualValue === "number" && !isNaN(actualValue)) {
						if (actualValue < 0) {
							td.addClass("negative");
						} else {
							td.addClass("positive");
						}
						if (column.format) {
							actualValue = numeral(actualValue).format(column.format);
						}
					} else if (column.type === TYPE_DATE) {
						if (column.format) {
							actualValue = moment(actualValue).format(column.format);
						}
					}

					if (column.editable) {
						var instantiate = new Function("return new crafity.html." + column.editable.control + "()");
						var editControl = instantiate();
						if (column.options) { editControl.options(column.options); }
						editControl.value(actualValue);
						if (column.editable.events && column.editable.events.length) {
							column.editable.events.forEach(function (event) {
								editControl.on(event, function () {
									var args = Array.prototype.slice.apply(arguments);
									self.emit.apply(self, [event, column, row].concat(args));
								});
							});
						}

						td.append(editControl);
					} else {
						td.text(actualValue.toString());
					}
				});
			};

			this.addRows = function (rows) {
				this.clearRows();

				_rows = rows;
				var sortedRows = [];

				// 1. sort rows
				// NB this will sort the last winning sortable column in the array of columns
				columns.some(function (column) {
					if (column.sortable) {
						sortedRows = sortRowsPerColumn(column, column.sortable);
						return true;
					}
					return false;
				});

				// 2. add rows
				addRows(sortedRows);
			};

			this.clearRows = function () {
				tbody.clear();
				new Element("tr").appendTo(tbody).addClass("row top-spacer");
			};

			this.clearRows();

			if (columns) {
				this.addColumns(columns);
			}
		}

		Grid.prototype = new Element("div");
		html.Grid = Grid;

		function ButtonBar() {
			this.addClass("buttonBar");
		}

		ButtonBar.prototype = new Element("div");
		html.ButtonBar = ButtonBar;

		function Button(text) {
			var self = this;
			this.addClass("button");
			this.text(text);
			this.getElement().addEventListener("click", function () {
				if (self.disabled()) { return; }
				self.emit("click");
			});
		}

		Button.prototype = new Element("a");
		html.Button = Button;

		function Form() {
			this.addClass("form");
		}

		Form.prototype = new Element("div");
		html.Form = Form;

		function Field() {
			this.addClass("field");
			this._innerSpan = new Element("span").addClass("border");
			this._label = new Element("label").append(this._innerSpan);
			this.append(this._label);
		}

		Field.prototype = new Element("div");
		Field.prototype.label = function (name) {
			if (!name) {
				return this._innerSpan.text();
			}
			this._innerSpan.text(name);
			return this;
		};
		html.Field = Field;

		function mixin(target, Type, args) {
			var instance = new Type();
			var prop;

			for (prop in instance) {
				target[prop] = instance[prop];
			}
			target.prototype = instance;
			target.prototype.constructor = Type;
			return target;
		}

		function TextField() {
			var self = this;
			mixin(this, Field);
			//this[__PROTO__] = new Field();
			this.addClass("textfield edit");
			this._textField = new Element("input").attr("type", "text");
			this.append(this._textField);
			this.value = function (value) {
				if (value === undefined) {
					return this._textField.value();
				}
				this._textField.value(value);
				return this;

			};

			this.on("readonlyChanged", function (bool) {
				if (bool === true) {
					self.removeClass("edit").addClass("readonly")
						._textField.readonly(true).tabindex("-1");
				}
				if (bool === false) {
					self.addClass("edit").removeClass("readonly")
						._textField.readonly(false).tabindex(null);
				}
			});
		}

		TextField.prototype = new Element("div");
		html.TextField = TextField;

		function DateField() {
			var self = this;
			mixin(this, Field);
			this.addClass("datefield edit");
			this._dateField = new Element("input").attr("type", "text");
			this.append(this._dateField);
			this.value = function (value) {
				if (value === undefined) {
					return this._dateField.value();
				}
				this._dateField.value(value);
				return this;

			};
			this._dateField.addEventListener("blur", function (e) {
				var value = self._dateField.value();
				var parts;
				self._dateField.removeClass("invalid");

				if (value.match(/^[0-9]{4,4}$/)) {
					return self._dateField.value(value.substr(0, 2) + '-' + value.substr(2, 2) + '-' + new Date().getFullYear());
				}
				if (value.match(/^[0-9]{6,6}$/)) {
					return self._dateField.value(value.substr(0, 2) + '-' + value.substr(2, 2) + '-20' + value.substr(4, 2));
				}
				if (value.match(/^[0-9]{8,8}$/)) {
					return self._dateField.value(value.substr(0, 2) + '-' + value.substr(2, 2) + '-' + value.substr(4, 4));
				}
				if (value.match(/^[0-9]{1,2}[-][0-9]{1,2}$/)) {
					parts = value.split('-');
					parts[2] = new Date().getFullYear();
					return self._dateField.value(parts.join("-"));
				}
				if (value.match(/^[0-9]{1,2}[-][0-9]{1,2}[-][0-9]{1,1}$/)) {
					parts = value.split('-');
					parts[2] = "200" + parts[2];
					return self._dateField.value(parts.join("-"));
				}
				if (value.match(/^[0-9]{1,2}[-][0-9]{1,2}[-][0-9]{1,1}$/)) {
					parts = value.split('-');
					parts[2] = "200" + parts[2];
					return self._dateField.value(parts.join("-"));
				}
				if (value.match(/^[0-9]{1,2}[-][0-9]{1,2}[-][0-9]{2,2}$/)) {
					parts = value.split('-');
					parts[2] = "20" + parts[2];
					return self._dateField.value(parts.join("-"));
				}
				if (value.match(/^[0-9]{1,2}[-][0-9]{1,2}[-][0-9]{4,4}$/)) {
					return false;
				}
				if (value.length === 0) {
					return false;
				}
				self._dateField.focus();
				self._dateField.addClass("invalid");
				e.preventDefault();
				return false;
			});
			this.on("readonlyChanged", function (bool) {
				if (bool === true) {
					self.removeClass("edit").addClass("readonly")
						._dateField.readonly(true).tabindex("-1")
						.attr("placeholder", "");
				}
				if (bool === false) {
					self.addClass("edit").removeClass("readonly")
						._dateField.readonly(false).tabindex(null)
						.attr("placeholder", "dd-mm-jjjj");
				}
			});
		}

		DateField.prototype = new Element("div");
		html.DateField = DateField;

		function Selectbox() {
			var self = this;

			this._selectedValue = new Element("span");
			this.append(this._selectedValue);

			this._optionList = new Selectbox.OptionList();
			this.append(this._optionList);

			this._mouseInfo = this._optionList._mouseInfo;

			this._options = [];
			this.addClass("selectbox edit collapsed");
			this.tabindex("0");

			this._optionList
				.on("selected", function (value) {
					if (self.value() !== value) {
						self.value(value);
						self.emit("selected", value);
					}
					self.focus();
				})
				.on("lostFocus", function () {
					self._mouseInfo.source = null;
					self._mouseInfo.isdown = false;
					self._mouseInfo.islong = false;

					if (self.readonly()) { return false; }
					return self.removeClass("expanded").addClass("collapsed");
				});

			this.on("readonlyChanged", function (bool) {
				if (bool === true) {
					self.removeClass("edit").addClass("readonly").tabindex("-1");
				}
				if (bool === false) {
					self.addClass("edit").removeClass("readonly").tabindex(null);
				}
				self._optionList.readonly(bool);
			});
			var showOptionListTimer;

			function showOptionList(e) {
				clearTimeout(showOptionListTimer);
				showOptionListTimer = setTimeout(function () {
					if (self._mouseInfo.isdown) { self._mouseInfo.islong = true; }
				}, 400);

				self.addClass("expanded").removeClass("collapsed");
				self._optionList.show();

				// Now see if the top and the bottom of the options list fits on the screen
				var optionListElement = self._optionList.getElement();
				var rects = optionListElement.getClientRects();
				if (rects.length) {
					var top = rects[0].top;
					var bottom = rects[0].top + rects[0].height;
					var marginTop = optionListElement.style.marginTop.replace(/px$/i, "");
					if (top < 0) {
						optionListElement.style.marginTop = (parseInt(marginTop, 10) - top) + "px";
					}
					if (bottom > window.innerHeight) {
						optionListElement.style.marginTop = parseInt(marginTop, 10) - (bottom - window.innerHeight) + "px";
					}
				}
				e.preventDefault();
				return false;
			}

			function highlightSelectedItem(optionList) {
				function onmousemove() {
					optionList
						.removeEventListener("mousemove", onmousemove)
						.removeClass("nohover");
				}

				optionList
					.addClass("nohover")
					.removeEventListener("mousemove", onmousemove)
					.addEventListener("mousemove", onmousemove);
			}

			this.addEventListener("keyup", function (e) {
				if (self.readonly()) { return; }
				if ((e.keyCode === 13 || e.keyCode === 32) && !e.shiftKey && !e.ctrlKey && !e.metaKey && (e.target === self.getElement() || e.target === undefined)) {
					if (self._optionList.hasNotClass("visible")) {
						highlightSelectedItem(self._optionList);
						showOptionList(e);
					}
				}
			});
			this.addEventListener("mousedown", function (e) {
				if (self._mouseInfo.source !== null && self._mouseInfo.source !== self) { return true; }
				if (self.readonly()) { return; }
				self._mouseInfo.source = self;
				self._mouseInfo.isdown = true;
				self._mouseInfo.islong = false;
				return showOptionList(e);
			});
		}

		Selectbox.OptionList = function OptionList() {
			var self = this;
			this._mouseInfo = {
				isdown: false,
				islong: false,
				source: null
			};
			this.addClass("option-list collapsed").tabindex("0");
			this.selectedItem = null;
			this.highlightedItem = null;
			this.addEventListener("blur", function () {
				if (self.readonly()) { return false; }
				if (self._mouseInfo.isdown) { return false; }
				self.removeClass("expanded").addClass("collapsed").removeClass("visible");
				self.emit("lostFocus");
			});
		};
		Selectbox.OptionList.prototype = new Element("div");
		Selectbox.OptionList.prototype.options = function (options) {
			var self = this;
			var previousElement = null;

			if (options === undefined) {
				return self._options;
			}
			self._options = options;
			self.selectedItem = null;
			self.highlightedItem = null;

			self.addEventListener("keyup", function (e) {
				if (self.readonly()) { return; }
				var currentItem = (self.highlightedItem || self.selectedItem) || (self.getChildren().length && self.getChildren()[0]);
				if (e.keyCode === 38 && !e.shiftKey && !e.ctrlKey && !e.metaKey) { // Up
					if (self.hasClass("visible")) {
						var previousOption = currentItem && currentItem.previousOption;
						self.removeClass("nohover");
						if (previousOption) {
							previousOption.addClass("hover");
							if (currentItem) { currentItem.removeClass("hover"); }
							self.highlightedItem = previousOption;
						}
						e.preventDefault();
						return false;
					}
				}
				if (e.keyCode === 40 && !e.shiftKey && !e.ctrlKey && !e.metaKey) { // Down
					if (self.hasClass("visible")) {
						var nextOption = currentItem && currentItem.nextOption;
						self.removeClass("nohover");
						if (nextOption) {
							nextOption.addClass("hover");
							if (currentItem) { currentItem.removeClass("hover"); }
							self.highlightedItem = nextOption;
						}
						e.preventDefault();
						return false;
					}
				}
				if ((e.keyCode === 13 || e.keyCode === 32) && !e.shiftKey && !e.ctrlKey && !e.metaKey && (e.target === self.getElement() || e.target === undefined)) {
					self.hide().emit("selected", currentItem.attr("data-value"));
					e.preventDefault();
					return false;
				}
			});

			Object.keys(options).forEach(function (key, index) {
				var element = new Element("div")
					.addClass("option")
					.attr("data-value", key)
					.text(options[key]);
				if (previousElement) {
					previousElement.nextOption = element;
					element.previousOption = previousElement;
				}
				element.nextOption = null;
				previousElement = element;

				self.append(element);
				element.addEventListener("mouseover", function () {
					self.removeClass("nohover");
					element.addClass("hover");
					if (self.highlightedItem) { self.highlightedItem.removeClass("hover"); }
					self.highlightedItem = element;
				});
				element.addEventListener("mouseout", function () {
					element.removeClass("hover");
				});
				element.addEventListener("mousedown", function (e) {
					self._mouseInfo.source = self;
					self._mouseInfo.isdown = true;
					self._mouseInfo.islong = false;
					self.focus();
					e.preventDefault();
					return false;
				});
				element.addEventListener("mouseup", function () {
					if (self._mouseInfo.islong || self._mouseInfo.source === self) {
						self.hide().emit("selected", key);
					}
					self._mouseInfo.source = null;
					self._mouseInfo.isdown = false;
					self._mouseInfo.islong = false;
				});
				if (self._selectedValue === options[key]) {
					self.selectedItem = element;
					self.highlightedItem = element;
					element.addClass("selected").addClass("hover");
					self.getElement().style.marginTop = -1 * (16 + 2) * index + "px";
				}
			});
			return self;
		};
		Selectbox.OptionList.prototype.getFriendlyName = function () {
			return this._options[this.value()];
		};
		Selectbox.OptionList.prototype.value = function (value) {
			var self = this;
			if (value === undefined) {
				return this._selectedValue;
			}
			this._selectedValue = value;
			this.selectedItem = null;
			this.highlightedItem = null;
			this.getChildren().forEach(function (optionElement, index) {
				if (optionElement.attr("data-value") === (value || "").toString()) {
					self.selectedItem = optionElement;
					self.highlightedItem = optionElement;
					optionElement.addClass("selected");
					self.getElement().style.marginTop = -1 * (16 + 2) * index + "px";
				} else {
					optionElement.removeClass("selected");
				}
			});

			return this;
		};
		Selectbox.OptionList.prototype.show = function () {
			this.removeClass("collapsed").addClass("visible expanded").focus();
			if (this.selectedItem) { this.selectedItem.addClass("hover"); }
			return this;
		};
		Selectbox.OptionList.prototype.hide = function () {
			this.removeClass("visible expanded").addClass("collapsed").focus();
			return this;
		};

		Selectbox.prototype = new Element("div");
		Selectbox.prototype.value = function (value) {
			var self = this;
			if (value === undefined) {
				return this._optionList.value();
			}
			this._optionList.value(value);
			this._selectedValue.text(this._optionList.getFriendlyName() || "");
			return self;
		};
		Selectbox.prototype.options = function (options) {
			var self = this;
			if (options === undefined) {
				return self._optionList.options();
			}
			self._optionList.options(options);
			return self;

		};
		html.Selectbox = Selectbox;

		function SelectField() {
			var self = this;
			mixin(this, Field);
			//this[__PROTO__] = new Field();
			this.addClass("selectfield edit");
			this._selectbox = new Selectbox();
			this._selectbox.on("selected", function (value) {
				self.emit("selected", value);
			});

			this.options = function (options) {
				if (options === undefined) {
					return this._selectbox.options();
				}
				this._selectbox.options(options);
				return this;

			};

			this.append(this._selectbox);

			// value of the selected option
			this.value = function (value) {
				if (value === undefined) {
					return this._selectbox.value();
				}
				this._selectbox.value(value);
				return this;

			};

			this._isreadonly = false;
			this.readonly = function (bool) {
				if (bool === true) {
					self.removeClass("edit").addClass("readonly");
					self._selectbox.readonly(true);
					self._selectbox.tabindex("-1");
					self._isreadonly = bool;
				} else if (bool === false) {
					self.addClass("edit").removeClass("readonly");
					self._selectbox.readonly(false);
					self._selectbox.tabindex("0");
					self._isreadonly = bool;
				} else {
					return self._isreadonly;
				}
				return self;
			};
		}

		SelectField.prototype = new Element();
		html.SelectField = SelectField;

	}(crafity.html = crafity.html || {}));

}(window.crafity = window.crafity || {}));