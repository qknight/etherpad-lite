/**
 * The Toolbar Module creates and renders the toolbars and buttons
 */
var _ = require("underscore")
  , tagAttributes
  , tag
  , defaultButtons
  , Button
  , ButtonsGroup
  , Separator
  , defaultButtonAttributes;

defaultButtonAttributes = function (name, overrides) {
  return {
    key: name,
    localizationId: "pad.toolbar." + name + ".title",
    icon: "buttonicon-" + name
  };
};

tag = function (name, attributes, contents) {
  var aStr = tagAttributes(attributes);

  if (_.isString(contents) && contents.length > 0) {
    return '<' + name + aStr + '>' + contents + '</' + name + '>';
  }
  else {
    return '<' + name + aStr + '></' + name + '>';
  }
};

tagAttributes = function (attributes) {
  attributes = _.reduce(attributes || {}, function (o, val, name) {
    if (!_.isUndefined(val)) {
      o[name] = val;
    }
    return o;
  }, {});

  return " " + _.map(attributes, function (val, name) {
    return "" + name + '="' + _.escape(val) + '"';
  }).join(" ");
};

ButtonsGroup = function () {
  this.buttons = [];
};

ButtonsGroup.fromArray = function (array) {
  var btnGroup = new this;
  _.each(array, function (btnName) {
    btnGroup.addButton(Button.load(btnName));
  });
  return btnGroup;
};

ButtonsGroup.prototype.addButton = function (button) {
  this.buttons.push(button);
  return this;
};

ButtonsGroup.prototype.render = function () {
  if (this.buttons.length == 1) {
    this.buttons[0].grouping = "";
  }
  else {
    _.first(this.buttons).grouping = "grouped-left";
    _.last(this.buttons).grouping = "grouped-right";
    _.each(this.buttons.slice(1, -1), function (btn) {
      btn.grouping = "grouped-middle"
    });
  }

  return _.map(this.buttons, function (btn) {
    return btn.render();
  }).join("\n");
};

Button = function (attributes) {
  this.attributes = attributes;
};

Button.load = function (btnName) {
  var button = module.exports.availableButtons[btnName];
  if (button.constructor === Button || button.constructor === SelectButton) {
    return button;
  }
  else {
    return new Button(button);
  }
};

_.extend(Button.prototype, {
  grouping: "",

  render: function () {
    var liAttributes = {
      "data-type": "button",
      "data-key": this.attributes.key,
    };
    return tag("li", liAttributes,
      tag("a", { "class": this.grouping, "data-l10n-id": this.attributes.localizationId },
        tag("span", { "class": "buttonicon " + this.attributes.icon })
      )
    );
  }
});

SelectButton = function (attributes) {
  this.attributes = attributes;
  this.options = [];
};

_.extend(SelectButton.prototype, Button.prototype, {
  addOption: function (value, text, attributes) {
    this.options.push({
      value: value,
      text: text,
      attributes: attributes
    });
    return this;
  },

  select: function (attributes) {
    var self = this
      , options = [];

    _.each(this.options, function (opt) {
      var a = _.extend({
        value: opt.value
      }, opt.attributes);

      options.push( tag("option", a, opt.text) );
    });
    return tag("select", attributes, options.join(""));
  },

  render: function () {
    var attributes = {
      id: this.attributes.id,
      "data-key": this.attributes.command,
      "data-type": "select"
    };
    return tag("li", attributes,
      this.select({ id: this.attributes.selectId })
    );
  }
});

Separator = function () {};
Separator.prototype.render = function () {
  return tag("li", { "class": "separator" });
};

module.exports = {
  availableButtons: {
    bold: defaultButtonAttributes("bold"),
    italic: defaultButtonAttributes("italic"),
    underline: defaultButtonAttributes("underline"),
    strikethrough: defaultButtonAttributes("strikethrough"),

    orderedlist: {
      key: "insertorderedlist",
      localizationId: "pad.toolbar.ol.title",
      icon: "buttonicon-insertorderedlist"
    },

    unorderedlist: {
      key: "insertunorderedlist",
      localizationId: "pad.toolbar.ul.title",
      icon: "buttonicon-insertunorderedlist"
    },

    indent: defaultButtonAttributes("indent"),
    outdent: {
      key: "outdent",
      localizationId: "pad.toolbar.unindent.title",
      icon: "buttonicon-outdent"
    },

    undo: defaultButtonAttributes("undo"),
    redo: defaultButtonAttributes("redo"),

    clearauthorship: {
      key: "clearauthorship",
      localizationId: "pad.toolbar.clearAuthorship.title",
      icon: "buttonicon-clearauthorship"
    },

    importexport: {
      key: "import_export",
      localizationId: "pad.toolbar.import_export.title",
      icon: "buttonicon-import_export"
    },

    timeslider: {
      key: "showTimeSlider",
      localizationId: "pad.toolbar.timeslider.title",
      icon: "buttonicon-history"
    },

    savedrevision: defaultButtonAttributes("savedRevision"),
    settings: defaultButtonAttributes("settings"),
    embed: defaultButtonAttributes("embed"),
    showusers: defaultButtonAttributes("showusers")
  },

  registerButton: function (buttonName, buttonInfo) {
    this.availableButtons[buttonName] = buttonInfo;
  },

  button: function (attributes) {
    return new Button(attributes);
  },
  separator: function () {
    return (new Separator).render();
  },
  selectButton: function (attributes) {
    return new SelectButton(attributes);
  },
  menu: function (buttons) {
    var groups = _.map(buttons, function (group) {
      return ButtonsGroup.fromArray(group).render();
    });
    return groups.join(this.separator());
  }
};