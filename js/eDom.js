/* globals Symbol:true */
'use strict';

var e$;

NodeList.prototype.isNodeList = HTMLCollection.prototype.isNodeList = function(){return true;};

/**
 * 
 * @param type HTMLelem or tagName
 * @param {object} props element attributes
 * @arg children
 * @type {{node: e$, typeof: Function, setBooleanProp: e$.setBooleanProp, removeBooleanProp: e$.removeBooleanProp, isEventProp: e$.isEventProp, extractEventName: e$.extractEventName, isCustomProp: e$.isCustomProp, setProp: e$.setProp, removeProp: e$.removeProp, setAllProps: e$.setAllProps, updateProp: e$.updateProp, updateAllProps: e$.updateAllProps, addEventListeners: e$.addEventListeners, createElement: e$.create, changed: e$.changed, updateElement: e$.update, init: e$.init}}
 * @returns {*}
 */
e$ = function (type, props) {
    var typeOf = typeof type;
    if (typeOf === 'string') {
        var firstLetter = type.charAt(0);
        if (firstLetter === '#') {
            return e$.makeElement(document.getElementById(type.substr(1)));
        } else if (firstLetter === '.') {
            return e$.makeElement(document.getElementsByClassName(type.split('.').join(' '))[0]);
        } else {
            for (var i = 2, len = arguments.length, children = [len > 2 ? len - 2 : 0]; i < len; i++) {
                children[i - 2] = arguments[i];
            }
            if (children[0] === 0) {
                children = [];
            }
            var node = { type: type, props: props || {}, children: children };
            node.create = e$.create;
            return node;
        }
    } else if (typeOf === 'object') {
        if (type.tagName) {
            return e$.makeElement(type);
        } else if (type.jquery || NodeList.prototype.isNodeList(type)) {
            return e$.makeElement(type[0]);
        }
    }
};

e$.makeElement = function (elem) {
    if (typeof elem.eDom !== 'object') {
        elem.eDom = e$.eDomCreate(elem);
    }
    if (typeof elem.eOut !== 'function') { // TODO: Выпилить условие после обновления всех методов на диффренте
        e$.setMethods(elem);
    }
    return elem;
};

e$.getAllProps = function (elem) {
    for (var i = 0, atts = elem.attributes, len = atts.length, arr = []; i < len; i++){
        arr.push(atts[i].nodeName);
    }
    return arr;
};

e$.extend = function (target, obj) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            target[i] = obj[i];
        }
    }
};

e$.typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === 'function' && obj.constructor === Symbol ? 'symbol' : typeof obj; };

e$.setBooleanProp = function (elem, name, value) {
    if (value) {
        elem.setAttribute(name, value);
        elem[name] = true;
    } else {
        elem[name] = false;
    }
};

e$.removeBooleanProp = function (elem, name) {
    elem.removeAttribute(name);
    elem[name] = false;
};

e$.isEventProp = function (name) {
    // если начинается на el
    return (/^on/.test(name));
};

e$.extractEventName = function (name) {
    return name.slice(2).toLowerCase();
};

e$.isCustomProp = function () {
    return false;
};

e$.setProp = function (elem, name, value) {
    if (e$.isCustomProp(name)) {
        return true;
    } else if (typeof value === 'boolean') {
        e$.setBooleanProp(elem, name, value);
    } else {
        elem.setAttribute(name, value);
    }
};

e$.removeProp = function (elem, name, value) {
    if (e$.isCustomProp(name)) {
        return true;
    } else if (typeof value === 'boolean') {
        e$.removeBooleanProp(elem, name);
    } else {
        elem.removeAttribute(name);
    }
};

e$.setAllProps = function (elem, props) {
    Object.keys(props).forEach(function (name) {
        e$.setProp(elem, name, props[name]);
    });
};

e$.updateProp = function (elem, name, newVal, oldVal) {
    if (!newVal) {
        e$.removeProp(elem, name, oldVal);
    } else if (!oldVal || newVal !== oldVal) {
        e$.setProp(elem, name, newVal);
    }
};

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

e$.changed = function (node1, node2) {
    var conditon1 = typeof node1 === 'undefined' ? 'undefined' : e$.typeof(node1),
        conditon2 = typeof node2 === 'undefined' ? 'undefined' : e$.typeof(node2);
    return (conditon1) !== (conditon2) || typeof node1 === 'number' && node1 !== node2 || typeof node1 === 'string' && node1 !== node2 || node1.type !== node2.type || node1.props && node1.props.forceUpdate;
};

e$.addEventListeners = function (elem, props) {
    Object.keys(props).forEach(function (name) {
        if (e$.isEventProp(name)) {
            elem.addEventListener(e$.extractEventName(name), props[name]);
        }
    });
};

e$.eDomCreate = function (elem) {
    var props = e$.getAllProps(elem),
        eDom = {},
        childrenLen = elem.children.length,
        children = [];
    if (childrenLen > 0) {
        for (var i = 0; i < childrenLen; i++) {
            var child = elem.children[i];
            children.push(e$.eDomCreate(child));
        }
    } else {
        if (elem.childNodes.length) {
            children.push(elem.childNodes[0].textContent);
        }
    }
    eDom['type'] = elem.tagName;
    eDom['props'] = props;
    eDom['children'] = children;
    return eDom;
};

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
    e$.setMethods(elem);
    newNode.children.map(e$.create).forEach(elem.appendChild.bind(elem));
    return elem;
};

/**
 *
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
    if (!parent.eDom) { // TODO: рудимент, который после перевода сайта на новое обращение надо выпилить или в качестве защиты от дурака на лету прикручивать виртуальное представление с помощью e$.eDomCreate()
        parent.eDom = e$(parent.tagName, {});
    }
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

e$.getIndex = function (elem) {
    var index = 0;
    while (elem = elem.previousSibling) {
        if (elem.nodeType !== 3 || !/^\s*$/.test(elem.data)) {
            index++;
        }
    }
    return index;
};

e$.inArray = function (elem, arr, i) {
    return arr === null ? -1 : arr.indexOf.call(arr, elem, i);
};

e$.updateParents = function (elem) {
    var parent = elem.parentNode;
    if (parent.eDom) {
        parent.eDom.children[e$.getIndex(elem)] = elem.eDom;
        e$.updateParents(parent);
    }
};

e$.hasClass = function (item, className) {
    if (item.props.hasOwnProperty('class')) {
        var classList = item.props.class.split(' ');
        return e$.inArray(className, classList);
    } else {
        return false;
    }
};

e$.addClass = function (item, className) {
    var classPosition = e$.hasClass(item, className);
    if (classPosition >= 0) {
        return false;
    } else {
        item.props.class += ' ' + className;
    }
};

e$.removeClass = function (item, className) {
    var classPosition = e$.hasClass(item, className);
    if (classPosition >= 0) {
        var classList = item.props.class.split(' ');
        classList.splice(classPosition, 1);
        var newClass = '';
        for (var i = 0, classListLength = classList.length; i < classListLength; i++) {
            newClass += ' ' + classList[i];
        }
        item.props.class = newClass;
    } else {
        return false;
    }
};

e$.insert = function (parent, index, newNode) {
    var eDom = parent.eDom;
    parent.insertBefore(e$.create(newNode), parent.children[index]);
    eDom.children.splice(index, 0, newNode);
    e$.updateParents(parent);
};

e$.setMethods = function (elem) {
    elem.eOut = e$.eOut;
    elem.eIn = e$.eIn;
};

e$.eIn = function (updateAtts) {
    if (updateAtts) {
        this.eDom.props = e$.getAllProps(this);
    } else {
        this.eDom = e$.eDomCreate(this);
    }
    
    return this.eDom;
};

e$.eOut = function (node) {
    var updateParent = false,
        newNode = node,
        index = e$.getIndex(this);
    if (typeof arguments[0] === 'boolean') {
        updateParent = arguments[0];
        newNode = arguments[1];
    }
    e$.update(updateParent, this, newNode, index);
};
