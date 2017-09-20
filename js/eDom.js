/* globals Symbol:true */

'use strict';

/**
 * Easy Dom v0.9.5
 * {@link eDom}
 * @param type HTMLElement || tagName || '.' + className || '#' + id
 * @param {object} props element attributes
 * @arg children
 * @type {{typeof: Function, eDomCreate, eDomCheck, create, setBooleanProp, removeBooleanProp, isEventProp, extractEventName, getAllProps, setProp, removeProp, setAllProps, updateProp, updateAllProps, addEventListeners, create, changed, update, updateParents, extend, insert, inArray, getIndex, hasClass, addClass, removeClass}}
 * @returns {*}
 */
var e$ = function (type, props) {
    var typeOf = typeof type;
    if (typeOf === 'string') {
        var firstLetter = type.charAt(0);

        if (firstLetter === '#') {
            return e$.eDomCheck(document.getElementById(type.substr(1)));
        } else if (firstLetter === '.') {
            return e$.eDomCheck(document.getElementsByClassName(type.split('.').join(' '))[0]);
        } else {
            for (var i = 2, len = arguments.length, children = [len > 2 ? len - 2 : 0]; i < len; i++) {
                children[i - 2] = arguments[i];
            }

            if (children[0] === 0) {
                children = [];
            }

            return new eDom(type, props, children);
        }
    } else if (typeOf === 'object') {
        if (type.tagName) {
            return e$.eDomCheck(type);
        } else if (type.jquery || type.isNodeList()) {
            return e$.eDomCheck(type[0]);
        }
    }
};
/**
 * {@link e$}
 * {@link eDom}
 * @param elem
 * @returns {{}}
 */
e$.eDomCreate = function (elem) {
    var props = e$.getAllProps(elem),
        eDom = {},
        childrenLen = elem.children.length,
        children = [];

    if (childrenLen > 0) {
        for (var i = 0; i < childrenLen; i++) {
            var child = elem.children[i];

            children[children.length] = e$.eDomCreate(child)
        }
    } else {
        if (elem.childNodes.length) {
            children[children.length] = elem.childNodes[0].textContent;
        }
    }

    eDom['type'] = elem.tagName.toUpperCase();
    eDom['props'] = props;
    eDom['children'] = children;

    return eDom;
};
/**
 * {@link e$}
 * @param node
 * @returns {*}
 */
e$.create = function (node) {
    var newNode;
    if (typeof node === 'undefined') {
        newNode = this;
    } else {
        newNode = node;
    }

    var nodeType = typeof newNode;

    if (nodeType === 'string' || nodeType === 'number') {
        return document.createTextNode(newNode);
    }

    var elem = document.createElement(newNode.type);
    e$.setAllProps(elem, newNode.props);
    e$.addEventListeners(elem, newNode.props);
    elem.eDom = newNode;
    newNode.children.map(e$.create).forEach(elem.appendChild.bind(elem));
    return elem;
};
/**
 * 
 * @type {HTMLCollection.isNodeList}
 */
NodeList.prototype.isNodeList = HTMLCollection.prototype.isNodeList = function(){return true;};
/**
 * {@link e$}
 * @param node {HTMLElement}
 * @param index {number}
 */
Element.prototype.render = function (node, index) {
    var updateParent = false,
        newNode = node,
        idx = index;

    if (typeof arguments[0] === 'boolean') {
        updateParent = arguments[0];
        newNode = arguments[1];
        idx = arguments[2];
    }

    e$.update(updateParent, this, newNode, idx || null);
};
/**
 * {@link e$}
 * @returns {{}|*}
 */
Element.prototype.syncElement = function () {
    if (arguments[0]) {
        this.eDom = e$.eDomCreate(this);
    } else {
        this.eDom.props = e$.getAllProps(this);
    }
    e$.updateParents(this);

    return this.eDom;
};
/**
 * {@link e$}
 * @param type {String} tagName
 * @param props {Object} object with attributes
 * @param children {Array} subj
 * @type Function
 */
var eDom = function (type, props, children) {
    this.type = type.toUpperCase();
    this.props = props;
    this.children = children;
};

eDom.prototype = {
    create: e$.create
};
/**
 * {@link e$}
 * @param elem
 * @returns {*}
 */
e$.eDomCheck = function (elem) {
    if (typeof elem.eDom !== 'object') {
        elem.eDom = e$.eDomCreate(elem);
    }
    return elem;
};
/**
 * {@link e$}
 * @param elem
 * @returns {Array}
 */
e$.getAllProps = function (elem) {
    for (var i = 0, atts = elem.attributes, len = atts.length, arr = []; i < len; i++){
        arr[arr.length] = atts[i].nodeName;
    }
    return arr;
};
/**
 * {@link e$}
 * @param target
 * @param obj
 */
e$.extend = function (target, obj) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            target[i] = obj[i];
        }
    }
};
/**
 *
 * @type {Function}
 */
e$.typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === 'function' && obj.constructor === Symbol ? 'symbol' : typeof obj; };
/**
 *
 * @param elem
 * @param name
 * @param value
 */
e$.setBooleanProp = function (elem, name, value) {
    if (value) {
        elem.setAttribute(name, value);
        elem[name] = true;
    } else {
        elem[name] = false;
    }
};
/**
 * {@link e$}
 * @param elem
 * @param name
 */
e$.removeBooleanProp = function (elem, name) {
    elem.removeAttribute(name);
    elem[name] = false;
};
/**
 * {@link e$}
 * @param name
 * @returns {boolean}
 */
e$.isEventProp = function (name) {
    // if start with el
    return (/^on/.test(name));
};
/**
 * {@link e$}
 * @param name
 * @returns {string}
 */
e$.extractEventName = function (name) {
    return name.slice(2).toUpperCase();
};
/**
 * {@link e$}
 * @param elem
 * @param name
 * @param value
 * @returns {boolean}
 */
e$.setProp = function (elem, name, value) {
    if (typeof value === 'boolean') {
        e$.setBooleanProp(elem, name, value);
    } else {
        elem.setAttribute(name, value);
    }
};
/**
 * {@link e$}
 * @param elem
 * @param name
 * @param value
 * @returns {boolean}
 */
e$.removeProp = function (elem, name, value) {
    if (typeof value === 'boolean') {
        e$.removeBooleanProp(elem, name);
    } else {
        elem.removeAttribute(name);
    }
};
/**
 * {@link e$}
 * @param elem
 * @param props
 */
e$.setAllProps = function (elem, props) {
    Object.keys(props).forEach(function (name) {
        e$.setProp(elem, name, props[name]);
    });
};
/**
 * {@link e$}
 * @param elem
 * @param name
 * @param newVal
 * @param oldVal
 */
e$.updateProp = function (elem, name, newVal, oldVal) {
    if (!newVal) {
        e$.removeProp(elem, name, oldVal);
    } else if (!oldVal || newVal !== oldVal) {
        e$.setProp(elem, name, newVal);
    }
};
/**
 * {@link e$}
 * @param elem
 * @param newProps
 */
e$.updateAllProps = function (elem, newProps) {
    var oldProps;
    if (arguments.length <= 2 || arguments[2] === undefined) {
        oldProps = {};
    } else {
        oldProps = arguments[2];
    }

    var props = {};
    e$.extend(props, oldProps);
    e$.extend(props, newProps);

    Object.keys(props).forEach(function (name) {
        if (name === 'value') {
            elem.value = newProps.value || '';
        } else {
            e$.updateProp(elem, name, newProps[name], oldProps[name]);
        }
    });
};
/**
 * check if node1 is changed or removed
 * @param node1 {{type, props, forceUpdate}}
 * @param node2 {{type, props, forceUpdate}}
 * @returns {boolean|*}
 */
e$.changed = function (node1, node2) {
    var condition1 = typeof node1 === 'undefined' ? 'undefined' : e$.typeof(node1),
        condition2 = typeof node2 === 'undefined' ? 'undefined' : e$.typeof(node2);

    return (condition1) !== (condition2) || typeof node1 === 'number' && node1 !== node2 || typeof node1 === 'string' && node1 !== node2 || node1.type !== node2.type || node1.props && node1.props.forceUpdate;
};
/**
 * {@link e$}
 * @param elem
 * @param props
 */
e$.addEventListeners = function (elem, props) {
    Object.keys(props).forEach(function (name) {
        if (e$.isEventProp(name)) {
            elem.addEventListener(e$.extractEventName(name), props[name]);
        }
    });
};
/**
 * {@link e$}
 * @param {boolean || object} item {object} {{tagName, children, eDom, appendChild, replaceChild, removeChild, childNodes}} || {boolean} - update parent condition
 * @param node {{tagName, children, eDom, appendChild, replaceChild, removeChild, childNodes}}
 */
e$.update = function (item, node) {
    var index = 0,
        updateParent = true,
        parent,
        newNode,
        oldNode,
        parentArg = 0, newNodeArg = 1,
        argLen = arguments.length,
        lastArg = arguments[argLen - 1];

    if (typeof arguments[0] === 'boolean') {
        updateParent = arguments[0];
        parentArg = 1;
        newNodeArg = 2;
    }

    parent = arguments[parentArg];
    newNode = arguments[newNodeArg];

    if (typeof lastArg === 'number') {
        index = lastArg;
    }

    e$.eDomCheck(parent);
    oldNode = parent.eDom.children[index];

    if (!oldNode) {
        parent.appendChild(e$.create(newNode));
    } else if (!newNode) {
        parent.removeChild(parent.childNodes[parent.childNodes.length - 1]);
    } else if (e$.changed(newNode, oldNode)) {
        parent.replaceChild(e$.create(newNode), parent.childNodes[index]);
    } else if (newNode.type) {
        e$.updateAllProps(parent.childNodes[index], newNode.props, oldNode.props);

        var newLength = newNode.children.length,
            oldLength = oldNode.children.length;

        for (var i = 0; i < newLength || i < oldLength; i++) {
            e$.update(false, parent.children[index], newNode.children[i], i);
        }
    }

    if (parent.children[index]) {
        parent.eDom.children[index] = newNode;
        parent.children[index].eDom = newNode;
    }

    if (updateParent) {
        e$.updateParents(parent.childNodes[index]);
    }
};
/**
 * {@link e$}
 * @param elem
 * @returns {number}
 */
e$.getIndex = function (elem) {
    var index = 0;
    while (elem = elem.previousSibling) {
        if (elem.nodeType !== 3 || !/^\s*$/.test(elem.data)) {
            index++;
        }
    }
    return index;
};
/**
 * {@link e$}
 * @param elem
 */
e$.updateParents = function (elem) {
    var parent = elem.parentElement;
    if (parent.eDom) {
        parent.eDom.children[e$.getIndex(elem)] = elem.eDom;
        e$.updateParents(parent);
    }
};
