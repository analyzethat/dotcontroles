"use strict";

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
		children.forEach(addChild(child));
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
		hasClasses &= (index > -1);
	});
	return hasClasses;
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
	var classes = (this.getElement().getAttribute("class") || "").split(" ");
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
};

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

function Searchbox(callback) {
	var self = this;

	var search = new Element("input")
		.attr("type", "search")
		.attr("name", "search")
		.attr("results", "5");

	if (callback) {
		this.on("change", callback);
	}

	search.getElement().addEventListener("keyup", function (e) {
		if (e.which === 13) {
			return;
			/* Handled by search event */
		}
		self.emit("change", search.value());
	});
	search.getElement().addEventListener("search", function () {
		self.emit("change", search.value());
	});

	this.append(search);
	this.addClass("searchbox");
}
Searchbox.prototype = new Element("div");

function List(filter) {

	var searchBox = new Searchbox();

	this.onsearch = function (filter) {
		if (!filter) {
			return;
		}
		searchBox.on("change", filter);
	};
	this.onClientSelected = function filter(cb) {

	};
	this._listitems = [];
	this.addClass("list");
	this._itemContainer = new Element("ul").addClass("itemContainer");

	this.append(searchBox);
	this.append(this._itemContainer);
}
List.prototype = new Element("div");
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
		self.emit("clientSelected", listitem.data)
	});

	this._listitems.push(listItem);
	this._itemContainer.append(listItem);
};
List.prototype.addListItems = function (listItems) {
	var self = this;
	listItems.forEach(function (listItem) {
		self.addListItem(listItem);
	})
};
List.prototype.clearListItems = function () {
	this._itemContainer.clear();
	this._listitems = [];
};
List.prototype.getListItems = function () {
	return [].concat(this._listitems);
};

function ListItem(name, data) {
	var self = this;
	this.addClass("ListItem");
	this.append(new Element("div").addClass("content").text(name));
	this.data = data;
	this.attr("tabindex", "0");
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

function Grid(columns) {
	var self = this;
	var container = new Element("div").addClass("container").appendTo(this);
	var table = new Element("table").attr("cellspacing", "0").appendTo(container);
	var thead = new Element("thead").appendTo(table).addClass("header");
	var headerRow = new Element("tr").appendTo(thead);

	var tbody = new Element("tbody").appendTo(table);
	var TYPE_DATE = "Date"
	var TYPE_NUMBER = "Number"
	var TYPE_BOOLEAN = "Boolean"

	var EMPTY_VALUE = " ";
	var ASC = "ascending";
	var DESC = "descending";

	var _rows = null;

	this.addClass("grid");

	this.addColumn = function (column) {
		var th = new Element("th").addClass("sortable");
		var stickyTH = new Element("div");
		var textSpan = new Element("span")

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

	function sortRowsPerColumn(column, sortOrder) {
		var valuesSortedPerColumn = [];
		var sortedRows = [];

		valuesSortedPerColumn = _rows
			.map(function (row) {
				var value = row[column.property];
				if (typeof value === 'number' && isNaN(value)) {
					return "__NaN__";
				}
				return value;
			})
			.filter(function onlyUnique(value, index, self) {
				return self.indexOf(value) === index;
			});

		var sortFunctions = {
			ascending: function (a, b) {
				if (a > b) return 1;
				if (a < b) return -1;
				return 0;
			},
			descending: function (a, b) {
				if (a > b) return -1;
				if (a < b) return 1;
				return 0;
			}
		};

		valuesSortedPerColumn.sort(sortFunctions[sortOrder]);
		console.log("valuesSortedPerColumn", valuesSortedPerColumn);

		valuesSortedPerColumn.forEach(function (sortedRowValue) {
			_rows.forEach(function (row) {

				console.log(sortedRowValue);

				if (false && isNaN(sortedRowValue)) {
					console.log("\n\r");
					console.log("NEXT sortedRowValue = ", sortedRowValue);
					console.log("isNaN(" + sortedRowValue + ")", isNaN(sortedRowValue));
					console.log("typeof " + sortedRowValue + " === 'number'", typeof sortedRowValue === "number");
					console.log("isNaN(" + row[column.property] + ")", isNaN(row[column.property]));
					console.log("typeof " + row[column.property] + " === 'number'", typeof row[column.property] === 'number');
				}

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
				var instantiate = new Function("return new " + column.editable.control + "()");
				var editControl = instantiate();
				editControl.options(column.options);
				editControl.value(actualValue);

				td.append(editControl);
			} else {
				td.text(actualValue.toString());
			}
		});
	};

	this.addRows = function (rows) {
		this.clearRows();

		_rows = rows;
		var sortedRows;

		// 1. sort rows
		// NB this will sort the last winning sortable column in the array of columns
		columns.some(function (column) {
			if (column.sortable) {
				sortedRows = sortRowsPerColumn(column, column.sortable);
				return true;
			}

		});

		// 2. add rows
		addRows(sortedRows);
	}

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

function ButtonBar() {
	this.addClass("buttonBar");
}
ButtonBar.prototype = new Element("div");

function Button(text, callback) {
	var self = this;
	this.addClass("button");
	this.text(text);
	this.getElement().addEventListener("click", function () {
		self.emit("click");
	});
}
Button.prototype = new Element("a");

function Form() {
	this.addClass("form");
}
Form.prototype = new Element("div");

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
	} else {
		this._innerSpan.text(name);
		return this;
	}
};

function TextField() {
	var self = this;
	this.__proto__ = new Field();
	this.addClass("textfield edit");
	this._textField = new Element("input").attr("type", "text");
	this.append(this._textField);
	this.value = function (value) {
		if (value === undefined) {
			return this._textField.value();
		} else {
			this._textField.value(value);
			return this;
		}
	};

	this._isreadonly = false;
	this.readonly = function (bool) {
		if (bool === true) {
			self.removeClass("edit").addClass("readonly");
			self._textField.attr("readonly", "readonly");
			self._textField.attr("tabindex", "-1");
			self._isreadonly = bool;
		} else if (bool === false) {
			self.addClass("edit").removeClass("readonly");
			self._textField.attr("readonly", null);
			self._textField.attr("tabindex", null);
			self._isreadonly = bool;
		} else {
			return self._isreadonly;
		}
		return self;
	};
}

function Selectbox() {
	this.addClass("selectbox edit");
	var self = this;

	this._options = [];
	this.options = function (options) {
		if (options === undefined) {
			return this._options;
		} else {
			this._options = options;

			options.forEach(function (option) {
				self.append(
					new Element("option")
						.attr("value", option.value)
						.text(option.text));
			});

			return self;
		}
	}
}
Selectbox.prototype = new Element("select");

function SelectField() {
	var self = this;
	this.__proto__ = new Field();
	this.addClass("selectfield edit");
	this._selectbox = new Selectbox();

	this.options = function (options) {
		if (options === undefined) {
			return this._selectbox.options();
		} else {
			this._selectbox.options(options);
			return this;
		}
	};

	this.append(this._selectbox);

	// value of the selected option
	this.value = function (value) {
		if (value === undefined) {
			return this._selectbox.value();
		} else {
			this._selectbox.value(value);
			return this;
		}
	};

	this._isreadonly = false;
	this.readonly = function (bool) {
		if (bool === true) {
			self.removeClass("edit").addClass("readonly");
			self._selectbox.attr("readonly", "readonly");
			self._selectbox.attr("tabindex", "-1");
			self._isreadonly = bool;
		} else if (bool === false) {
			self.addClass("edit").removeClass("readonly");
			self._selectbox.attr("readonly", null);
			self._selectbox.attr("tabindex", null);
			self._isreadonly = bool;
		} else {
			return self._isreadonly;
		}
		return self;
	};
}