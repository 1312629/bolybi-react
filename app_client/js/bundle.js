/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* -----------------------------   GENERAL   --------------------------------- */
var LineChart = window["react-chartjs"].Bar;

var isMenu = false;

var formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
});

var cart;

var cartComponent = null;

var headerCpn = null;

var orderInfoCpn = null;

if (Cookies.get("token")) {
    getCart();
} else {
    cart = null;
}

var format = function format(numb) {
    return formatter.format(numb);
};

var menu;

var changePage = function changePage(newPage) {
    if (menu && menu._reactInternalInstance) {
        menu.setState({ page: newPage });
        hideMenu();
    }
};

var _ReactRouter = ReactRouter,
    Router = _ReactRouter.Router,
    Route = _ReactRouter.Route,
    IndexRoute = _ReactRouter.IndexRoute,
    IndexLink = _ReactRouter.IndexLink,
    Link = _ReactRouter.Link;


function showMenu() {
    if (!isMenu) {
        isMenu = true;
        $('.main-menu').animate({ left: 0 });
    }
};

function hideMenu() {
    if (isMenu) {
        isMenu = false;
        $('.main-menu').animate({ left: '-500px' });
    }
};

function isLogin() {
    return Cookies.get("token") != null;
};

function checkText(text) {
    if (text != null && text.trim().length > 0) {
        return true;
    }
    return false;
};

function checkNumber(number) {
    if (number == '' || isNaN(number) || number < 0) {
        return false;
    }
    return true;
};

function getInfoUser() {
    if (Cookies.get('token')) {
        var payload = jwt_decode(Cookies.get('token'));
        return payload;
    }
    return null;
};

function isAdmin() {
    if (isLogin()) {
        if (getInfoUser().type === "Admin") {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

function createCartDetail(item, size) {
    return { item: item, size: size, quantity: 1, total: item.price - item.discount };
};

function addToCart(item, size) {
    if (cart) {
        var crnDetail = _.find(cart.cartDetails, function (o) {
            return o.item._id === item._id && o.size === size;
        });
        if (crnDetail) {
            crnDetail.quantity++;
            cart.total -= crnDetail.total;
            crnDetail.total = crnDetail.quantity * (item.price - item.discount);
            cart.total += crnDetail.total;
        } else {
            var newDetail = createCartDetail(item, size);
            cart.cartDetails.push(newDetail);
        }
        return cart;
    } else {
        return null;
    }
};

function updateCart() {
    if (cart != null && Cookies.get("token") != null) {
        $.ajax({
            url: "/api/carts",
            headers: { 'Authorization': 'Bearer ' + Cookies.get("token") },
            method: 'PUT',
            contentType: "application/json",
            data: JSON.stringify(cart),
            success: function success(data) {
                window.stop();
                cart = data;
                updateCartInUI();
                alert("Updated Cart!");
            },
            error: function error(xhr, status, err) {
                alert(xhr.responseJSON.message);
                window.stop();
            }
        });
    } else {
        return;
    }
};

function getCart() {
    var token = Cookies.get("token");
    if (token) {
        $.ajax({
            url: "/api/carts",
            headers: { 'Authorization': 'Bearer ' + token },
            method: 'GET',
            contentType: "application/json",
            success: function success(data) {
                cart = data;
                updateCartInUI();
            },
            error: function error(xhr, result, err) {
                alert(xhr.responseJSON.message);
            }
        });
    } else {
        cart = null;
    }
};

function updateCartInUI() {
    if (cartComponent && cartComponent._reactInternalInstance) {
        if (cart) {
            cartComponent.setState({ cart: cart });
        } else {
            cartComponent.setState({ cart: { total: 0 } });
        }
    }
    if (headerCpn && headerCpn._reactInternalInstance) {
        if (cart) {
            headerCpn.setState({ cart: cart });
        } else {
            headerCpn.setState({ cart: { total: 0 } });
        }
    }
    if (orderInfoCpn && orderInfoCpn._reactInternalInstance) {
        if (cart) {
            orderInfoCpn.state.cart = cart;
        } else {
            orderInfoCpn.state.cart = { total: 0 };
        }
        orderInfoCpn.setState(orderInfoCpn.state);
    }
};

function getTypes(fullfill) {
    $.get("/api/types").done(fullfill).fail(function (xhr, status, err) {
        alert(xhr.responseJSON.message);
        window.stop();
    });
};

function addNewType(newType, fullfill) {
    $.ajax({
        url: "/api/types",
        headers: { 'Authorization': 'Bearer ' + Cookies.get("token") },
        method: 'POST',
        contentType: "application/json",
        data: JSON.stringify(newType),
        success: fullfill,
        error: function error(xhr, status, err) {
            alert(xhr.responseJSON.message);
            window.stop();
        }
    });
};

function updateType(type, fullfill) {
    $.ajax({
        url: "/api/types/" + type._id,
        headers: { 'Authorization': 'Bearer ' + Cookies.get("token") },
        method: 'PUT',
        contentType: "application/json",
        data: JSON.stringify(type),
        success: fullfill,
        error: function error(xhr, status, err) {
            alert(xhr.responseJSON.message);
            window.stop();
        }
    });
};

function _createOrder(info, myCart, fullfill) {
    info.orderDetails = [];
    info.owner = myCart.user;
    var tmpDetail;
    for (var i = 0; i < myCart.cartDetails.length; i++) {
        tmpDetail = {
            item: myCart.cartDetails[i].item,
            size: myCart.cartDetails[i].size,
            quantity: myCart.cartDetails[i].quantity
        };
        info.orderDetails.push(tmpDetail);
    }
    info.total = 0;

    $.ajax({
        url: "/api/orders",
        headers: { 'Authorization': 'Bearer ' + Cookies.get("token") },
        method: 'POST',
        contentType: "application/json",
        data: JSON.stringify(info),
        success: fullfill,
        error: function error(xhr, status, err) {
            alert(xhr.responseJSON.message);
        }
    });
};

function getOrders(fullfill) {
    var token = Cookies.get("token");
    if (token) {
        $.ajax({
            url: "/api/orders",
            headers: { 'Authorization': 'Bearer ' + token },
            method: 'GET',
            contentType: "application/json",
            success: fullfill,
            error: function error(xhr, result, err) {
                alert(xhr.responseJSON.message);
            }
        });
    }
};

function formatOrders(list) {
    for (var i = 0; i < list.length; i++) {
        list[i].createdDate = list[i].createdDate.split("T")[0];
        if (list[i].status != 'Finished') {
            list[i].updatedDate = '';
        } else {
            list[i].updatedDate = list[i].updatedDate.split("T")[0];
        }
        if (!isNaN(list[i].total)) {
            list[i].total = format(list[i].total);
        }
    }
    return list;
};

function updateOrder(order, fullfill) {
    if (isAdmin()) {
        $.ajax({
            url: "/api/orders/" + order._id,
            headers: { 'Authorization': 'Bearer ' + Cookies.get("token") },
            method: 'PUT',
            contentType: "application/json",
            data: JSON.stringify(order),
            success: fullfill,
            error: function error(xhr, status, err) {
                alert(xhr.responseJSON.message);
            }
        });
    } else {
        return null;
    }
};

function formatProducts(list) {
    for (var i = 0; i < list.length; i++) {
        list[i].preview = list[i].itemMetas[0].metaValue;
        if (!isNaN(list[i].price)) {
            list[i].price = format(list[i].price);
        }
        if (!isNaN(list[i].discount)) {
            list[i].discount = format(list[i].discount);
        }
    }
    return list;
};

function daysDifference(d0, d1) {
    var diff = new Date(+d1).setHours(12) - new Date(+d0).setHours(12);
    return Math.round(diff / 8.64e7);
}

function getDaysBetweenDates(d0, d1) {

    var msPerDay = 8.64e7;

    // Copy dates so don't mess them up
    var x0 = new Date(d0);
    var x1 = new Date(d1);

    // Set to noon - avoid DST errors
    x0.setHours(12, 0, 0);
    x1.setHours(12, 0, 0);

    // Round to remove daylight saving errors
    return Math.round((x1 - x0) / msPerDay);
}

function formatRpOrders(data) {
    var range = 7;
    // Add a helper to format timestamp data
    Date.prototype.formatDDMM = function () {
        return this.getDate() + "/" + (this.getMonth() + 1);
    };
    Date.prototype.adjustDate = function (days) {
        var date;
        days = days || 0;
        if (days === 0) {
            date = new Date(this.getTime());
        } else if (days > 0) {
            date = new Date(this.getTime());

            date.setDate(date.getDate() + days);
        } else {
            date = new Date(this.getFullYear(), this.getMonth(), this.getDate() - Math.abs(days), this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds());
        }
        this.setTime(date.getTime());
        return this;
    };

    var labels = [],
        datas = [],
        datas2 = [];
    for (var i = 0; i < range; ++i) {
        datas.push(0);
        datas2.push(0);
    }
    for (var i = range - 1; i >= 0; i--) {
        labels.push(new Date().adjustDate(-i).formatDDMM());
    }

    var dif;
    for (var i = 0; i < data.length; i++) {
        dif = getDaysBetweenDates(new Date(data[i]._id.year, data[i]._id.month - 1, data[i]._id.day), new Date());
        console.log(dif);
        if (dif < range) {
            datas[dif] = data[i].totalPrice;
            datas2[dif] = data[i].count;
        }
    }

    var tempData = {
        labels: labels,
        datasets: [{
            type: 'line',
            yAxisID: "y-axis-1",
            label: 'Income',
            backgroundColor: 'rgba(172, 70, 60, 0)',
            borderColor: 'rgba(172, 70, 60, 1)',
            borderWidth: 2,
            data: datas
        }, {
            type: 'bar',
            yAxisID: "y-axis-0",
            label: 'Number orders',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 3,
            data: datas2
        }]
    };

    return tempData;
};

function getReports(fullfill) {
    console.log('report');
    $.get("/api/reportOrders").done(fullfill).fail(function (xhr, status, err) {
        alert(xhr.responseJSON.message);
    });
};

/* ------------------------------   CLIENT   ----------------------------------*/

var InfoUser = React.createClass({
    displayName: 'InfoUser',
    getInitialState: function getInitialState() {
        return { user: getInfoUser() };
    },
    render: function render() {
        return React.createElement(
            'div',
            { className: 'row user-div hidden-xs' },
            React.createElement(
                'div',
                { className: 'col-md-12 text-center' },
                React.createElement('img', { className: 'avatar', src: this.state.user.avatarURL })
            ),
            React.createElement(
                'div',
                { className: 'col-md-12 text-center' },
                React.createElement(
                    'h3',
                    { className: 'user-name' },
                    this.state.user.name
                ),
                React.createElement(
                    'h4',
                    { className: 'user-email' },
                    this.state.user.email
                ),
                React.createElement(
                    'a',
                    { className: 'logout-btn', onClick: this.props.click },
                    'Logout'
                ),
                React.createElement('hr', null)
            )
        );
    }
});

var DropDownUser = React.createClass({
    displayName: 'DropDownUser',
    getInitialState: function getInitialState() {
        return { user: getInfoUser() };
    },
    render: function render() {
        return React.createElement(
            'div',
            { className: 'dropdown' },
            React.createElement('img', { className: 'avatar', src: this.state.user.avatarURL }),
            React.createElement(
                'div',
                { className: 'dropdown-content' },
                React.createElement(
                    Link,
                    { onClick: function onClick() {
                            return changePage("/cart");
                        }, to: '/cart', className: 'hidden-lg hidden-md hidden-sm' },
                    'Cart ($0.0)'
                ),
                React.createElement(
                    Link,
                    { to: '/ordersList' },
                    'Orders'
                ),
                React.createElement(
                    'a',
                    { onClick: this.props.click },
                    'Logout'
                )
            )
        );
    }
});

/* MAIN MENU */
var MainMenu = React.createClass({
    displayName: 'MainMenu',
    changePage: function changePage(event) {
        var location = event.target.getAttribute('href').split("#")[1];
        hideMenu();
        this.setState({ page: location });
    },
    getInitialState: function getInitialState() {
        var location = window.location.href.split("#")[1];
        return { page: location };
    },
    render: function render() {
        return React.createElement(
            'div',
            { className: 'main-menu' },
            React.createElement(
                'div',
                { className: 'close-menu', onClick: hideMenu },
                React.createElement(
                    'i',
                    { className: 'material-icons' },
                    'close'
                )
            ),
            isLogin() ? React.createElement(InfoUser, { click: this.props.logout }) : React.createElement(
                'div',
                { className: 'push' },
                ' '
            ),
            React.createElement(
                'ul',
                null,
                React.createElement(
                    'li',
                    null,
                    React.createElement(
                        Link,
                        { onClick: this.changePage, to: '/', className: this.state.page === '/' ? 'active' : '' },
                        'Home'
                    )
                ),
                React.createElement(
                    'li',
                    null,
                    React.createElement(
                        Link,
                        { onClick: this.changePage, to: 'shop', className: this.state.page === '/shop' ? 'active' : '' },
                        'Shop'
                    )
                ),
                React.createElement(
                    'li',
                    null,
                    React.createElement(
                        Link,
                        { onClick: this.changePage, to: 'about', className: this.state.page === '/about' ? 'active' : '' },
                        'About'
                    )
                ),
                React.createElement(
                    'li',
                    null,
                    React.createElement(
                        Link,
                        { onClick: this.changePage, to: 'contact', className: this.state.page === '/contact' ? 'active' : '' },
                        'Contact'
                    )
                ),
                !isLogin() && React.createElement(
                    'li',
                    null,
                    React.createElement(
                        Link,
                        { onClick: this.changePage, to: 'login', className: this.state.page === '/login' ? 'active' : '' },
                        'Login'
                    )
                )
            ),
            React.createElement(
                'ul',
                { className: 'submenu hidden-xs' },
                React.createElement(
                    'li',
                    null,
                    React.createElement(
                        'a',
                        null,
                        'Return Policy'
                    )
                ),
                React.createElement(
                    'li',
                    null,
                    React.createElement(
                        'a',
                        null,
                        'Disclaimer'
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'social-media' },
                React.createElement(
                    'a',
                    { target: '_blank', href: 'http://facebook.com' },
                    React.createElement(
                        'span',
                        null,
                        React.createElement('i', { className: 'fa fa-facebook' })
                    )
                ),
                React.createElement(
                    'a',
                    { target: '_blank', href: 'https://www.pinterest.com/' },
                    React.createElement(
                        'span',
                        null,
                        React.createElement('i', { className: 'fa fa-pinterest' })
                    )
                ),
                React.createElement(
                    'a',
                    { target: '_blank', href: 'https://plus.google.com' },
                    React.createElement(
                        'span',
                        null,
                        React.createElement('i', { className: 'fa fa-google-plus' })
                    )
                )
            )
        );
    },
    componentDidMount: function componentDidMount() {
        menu = this;
    }
});

/* HEADER */
var Header = React.createClass({
    displayName: 'Header',
    getInitialState: function getInitialState() {
        if (cart) {
            return { cart: cart };
        } else {
            return { cart: { total: 0 } };
        }
    },
    componentDidMount: function componentDidMount() {
        headerCpn = this;
    },
    render: function render() {
        return React.createElement(
            'header',
            { className: 'header fixed' },
            React.createElement(
                'div',
                { className: 'header-wrapper top-bar' },
                React.createElement(
                    'div',
                    { className: 'container-fluid' },
                    React.createElement(
                        'div',
                        { className: 'row' },
                        React.createElement(
                            'div',
                            { className: 'col-xs-2 col-sm-3' },
                            React.createElement(
                                'div',
                                { className: 'menu-icon pull-left' },
                                React.createElement(
                                    'a',
                                    { onClick: showMenu },
                                    React.createElement(
                                        'i',
                                        { className: 'material-icons' },
                                        'menu'
                                    ),
                                    React.createElement(
                                        'span',
                                        { className: 'hidden-xs' },
                                        'Menu'
                                    )
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'col-xs-8 col-sm-6' },
                            React.createElement(
                                'div',
                                { className: 'header-logo text-center' },
                                React.createElement(
                                    Link,
                                    { to: '/', className: 'logo-text' },
                                    this.props.children
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'col-xs-2 col-sm-3' },
                            React.createElement(
                                'div',
                                { className: 'header-cart pull-right' },
                                React.createElement(
                                    'div',
                                    { className: 'cart-wrapper' },
                                    React.createElement(
                                        Link,
                                        { to: '/cart', className: 'hidden-xs', onClick: function onClick() {
                                                return changePage("/cart");
                                            } },
                                        React.createElement(
                                            'span',
                                            { className: 'hidden-xs cart' },
                                            format(this.state.cart.total)
                                        ),
                                        React.createElement(
                                            'span',
                                            { className: 'hidden-xs' },
                                            'Cart'
                                        )
                                    ),
                                    isLogin() && React.createElement(DropDownUser, { click: this.props.logout })
                                )
                            )
                        )
                    )
                )
            )
        );
    }
});

/* HOME */
var Home = React.createClass({
    displayName: 'Home',
    render: function render() {
        var image1 = {
            backgroundImage: "url('./images/bg_1.jpg')"
        };
        var image2 = {
            backgroundImage: "url('./images/bg_2.jpg')"
        };
        var image3 = {
            backgroundImage: "url('./images/bg_3.jpg')"
        };

        return React.createElement(
            'section',
            { className: 'page-section relative height-100' },
            React.createElement(
                'div',
                { className: 'flexslider-container' },
                React.createElement(
                    'div',
                    { className: 'flexslider' },
                    React.createElement(
                        'ul',
                        { className: 'slides' },
                        React.createElement('li', { style: image1 }),
                        React.createElement('li', { style: image2 }),
                        React.createElement('li', { style: image3 })
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'btn-wrapper' },
                React.createElement(
                    Link,
                    { to: 'shop', onClick: function onClick() {
                            return changePage("/shop");
                        }, className: 'btn-theme btn-home' },
                    'Shop Now'
                )
            )
        );
    },
    componentDidMount: function componentDidMount() {
        $('.flexslider').flexslider({
            animation: "slide"
        });
        changePage("/");
    }
});

/* SHOP */
var Shop = React.createClass({
    displayName: 'Shop',
    getInitialState: function getInitialState() {
        //                return {listItems: [{name: 'Ultra Boost', brand: 'Adidas', color: 'Black', price: 4000000, discount: 0, itemMetas: [{metaKey: 'url', metaValue: './images/bg_1.jpg'}]}, {name: 'Tubular Doom', brand: 'Adidas', color: 'Grey', price: 3600000, discount: 0, itemMetas: [{metaKey: 'url', metaValue: './images/bg_2.jpg'}]}]}
        return {
            listItems: [],
            listGenders: ["All", "Men", "Women", "Couple"]
        };
    },
    render: function render() {
        return React.createElement(
            'section',
            { className: 'page-section full-height' },
            React.createElement(
                'div',
                { className: 'container-fluid container-shop full-height' },
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-md-12 col-lg-12 content', id: 'content' },
                        React.createElement(
                            'div',
                            { className: 'shop-sorting' },
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-sm-12 text-center' },
                                    React.createElement(
                                        'span',
                                        { className: 'hidden-xs' },
                                        'Sort by'
                                    ),
                                    React.createElement(
                                        'span',
                                        { className: 'select-wrapper hidden-xs' },
                                        React.createElement(
                                            'select',
                                            null,
                                            React.createElement(
                                                'option',
                                                { value: 'name' },
                                                'Product Name'
                                            ),
                                            React.createElement(
                                                'option',
                                                { value: '-price' },
                                                'HIGHEST PRICE'
                                            ),
                                            React.createElement(
                                                'option',
                                                { value: 'price' },
                                                'LOWEST PRICE'
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'span',
                                        null,
                                        'Show me'
                                    ),
                                    React.createElement(
                                        'span',
                                        { className: 'select-wrapper' },
                                        React.createElement(
                                            'select',
                                            null,
                                            this.state.listGenders.map(function (gender, index) {
                                                return React.createElement(
                                                    'option',
                                                    { key: index, value: gender },
                                                    gender
                                                );
                                            }, this)
                                        )
                                    )
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'row products grid' },
                            this.state.listItems.map(function (item, index) {
                                return React.createElement(
                                    'div',
                                    { className: 'col-md-4 col-sm-6', key: index },
                                    React.createElement(
                                        'div',
                                        { className: 'thumbnail no-border no-padding' },
                                        React.createElement(
                                            'div',
                                            { className: 'media' },
                                            React.createElement(
                                                Link,
                                                { className: 'media-link', to: "product/" + item._id },
                                                React.createElement('img', { alt: '', src: item.itemMetas[0].metaValue })
                                            )
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'caption text-center' },
                                            React.createElement(
                                                'h4',
                                                { className: 'caption-title' },
                                                item.name
                                            ),
                                            item.discount != 0 ? React.createElement(
                                                'div',
                                                { className: 'price' },
                                                React.createElement(
                                                    'del',
                                                    { className: 'text-red' },
                                                    format(item.price)
                                                ),
                                                format(item.price - item.discount)
                                            ) : React.createElement(
                                                'div',
                                                { className: 'price' },
                                                format(item.price)
                                            )
                                        )
                                    )
                                );
                            })
                        )
                    )
                )
            )
        );
    },
    componentDidMount: function componentDidMount() {
        changePage("/shop");
        var that = this;
        $.get("/api/items", function (data) {
            that.setState({ listItems: data });
        });
    }
});

/* ABOUT */
var About = React.createClass({
    displayName: 'About',
    render: function render() {
        return React.createElement(
            'section',
            { className: 'page-section height-100' },
            React.createElement(
                'div',
                { className: 'container-fluid full-height' },
                React.createElement(
                    'div',
                    { className: 'col-md-12 relative min-height' },
                    React.createElement(
                        'div',
                        { className: 'wrapper-vertical-center' },
                        React.createElement(
                            'div',
                            { className: 'text-center about-header' },
                            React.createElement(
                                'h2',
                                { className: 'block-header' },
                                'About us'
                            ),
                            React.createElement(
                                'div',
                                { className: 'social-media' },
                                React.createElement(
                                    'a',
                                    { target: '_blank', href: 'http://facebook.com' },
                                    React.createElement(
                                        'span',
                                        null,
                                        React.createElement('i', { className: 'fa fa-facebook' })
                                    )
                                ),
                                React.createElement(
                                    'a',
                                    { target: '_blank', href: 'https://www.pinterest.com/' },
                                    React.createElement(
                                        'span',
                                        null,
                                        React.createElement('i', { className: 'fa fa-pinterest' })
                                    )
                                ),
                                React.createElement(
                                    'a',
                                    { target: '_blank', href: 'https://plus.google.com' },
                                    React.createElement(
                                        'span',
                                        null,
                                        React.createElement('i', { className: 'fa fa-google-plus' })
                                    )
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'regular-text' },
                            'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi.'
                        )
                    )
                )
            )
        );
    },
    componentDidMount: function componentDidMount() {
        changePage("/about");
    }
});

/* CONTACT */
var Contact = React.createClass({
    displayName: 'Contact',
    render: function render() {
        return React.createElement(
            'section',
            { className: 'page-section height-100' },
            React.createElement(
                'div',
                { className: 'container-fluid' },
                React.createElement(
                    'div',
                    { className: 'col-md-12 relative min-height' },
                    React.createElement(
                        'div',
                        { className: 'wrapper-vertical-center' },
                        React.createElement(
                            'div',
                            { className: 'text-center about-header' },
                            React.createElement(
                                'h2',
                                { className: 'block-header' },
                                'Contact Us'
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'regular-text contact-subheader text-center' },
                            React.createElement(
                                'p',
                                null,
                                'We are happy to hear from you.'
                            )
                        ),
                        React.createElement(
                            'form',
                            { method: 'post', name: 'contactForm', className: 'contact-form ', id: 'contact-form' },
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-md-6' },
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement('input', { type: 'text', name: 'fullname', className: 'form-control ', placeholder: 'Name', maxLength: '30', size: '30', required: '', tabIndex: '1' })
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'col-md-6' },
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement('input', { type: 'email', placeholder: 'Email', name: 'emailAddress', className: 'form-control', tabIndex: '2', required: '' })
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-md-12' },
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement('input', { type: 'text', name: 'subject', className: 'form-control ', placeholder: 'Subject', maxLength: '30', size: '30', required: '', tabIndex: '3' })
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-md-12' },
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement('textarea', { placeholder: 'Message', name: 'messages', className: 'form-control', tabIndex: '4', cols: '50', rows: '4', required: '' })
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-md-12' },
                                    React.createElement('div', { className: 'msg_form' })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'col-md-12' },
                                    React.createElement(
                                        'button',
                                        { className: 'btn-theme form-btn pull-right', type: 'submit' },
                                        React.createElement(
                                            'span',
                                            { className: 'hidden-xs' },
                                            'Send a message'
                                        ),
                                        React.createElement(
                                            'span',
                                            { className: 'hidden-sm hidden-md hidden-lg' },
                                            'Send'
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
    },
    componentDidMount: function componentDidMount() {
        changePage("/contact");
    }
});

/* LOGIN */
var Login = React.createClass({
    displayName: 'Login',
    getInitialState: function getInitialState() {
        return { mode: 'login', avatar: '../images/avatar_default.png' };
    },
    checkPassword: function checkPassword() {
        if (this.state.mode === 'login') {
            if (this.refs.password.value.length >= 6) {
                return true;
            } else {
                $(this.refs.password).addClass("has-error");
                $('.msg_form').html($('.msg_form').html() + "\Wrong Password!");
            }
        } else {
            if (this.refs.password.value.length >= 6 && this.refs.password.value === this.refs.repassword.value) {
                return true;
            } else {
                if (this.refs.password.value.length < 6) {
                    $(this.refs.password).addClass("has-error");
                    $('.msg_form').html($('.msg_form').html() + "\nPassword has at least 6 char!");
                    return false;
                } else {
                    $(this.refs.repassword).addClass("has-error");
                    $('.msg_form').html($('.msg_form').html() + "\nRe-password doesn't match!");
                    return false;
                }
            }
        }
    },
    checkEmail: function checkEmail() {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (re.test(this.refs.email.value)) {
            return true;
        } else {
            $(this.refs.email).addClass("has-error");
            $('.msg_form').html($('.msg_form').html() + "\nInvalid Email!");
            return false;
        }
    },
    checkName: function checkName() {
        if (this.refs.name.value != null && this.refs.name.value.trim().length > 0) {
            return true;
        } else {
            $(this.refs.name).addClass("has-error");
            $('.msg_form').html($('.msg_form').html() + "\nInvalid Name!");
            return false;
        }
    },
    checkLogin: function checkLogin() {
        return this.checkEmail() && this.checkPassword();
    },
    login: function login() {
        if (this.refs.btnLogin.innerHTML === "...") {
            return false;
        }
        $('.msg_form').html("");
        $(this.refs.email).removeClass("has-error");
        $(this.refs.password).removeClass("has-error");
        if (this.checkLogin()) {
            this.refs.btnLogin.innerHTML = "...";
            var info = {
                email: this.refs.email.value,
                password: this.refs.password.value
            };
            var that = this;
            $.post('/api/login', info).done(function (data) {
                window.stop();
                Cookies.set("token", data.token);
                that.refs.btnLogin.innerHTML = "Login";
                $('.msg_form').html("Login Succesfully!");
                getCart();
                if (isAdmin()) {
                    setTimeout(function () {
                        that.props.router.push('/admin');
                    }, 1500);
                } else {
                    setTimeout(function () {
                        that.props.router.push('/');
                    }, 1500);
                }
            }).fail(function (xhr, status, err) {
                that.refs.btnLogin.innerHTML = "Login";
                $('.msg_form').html(xhr.responseJSON.message);
                window.stop();
            });
        };
    },
    checkReg: function checkReg() {
        return this.checkEmail() && this.checkPassword() && this.checkName();
    },
    register: function register() {
        if (this.refs.btnReg.innerHTML === "...") {
            return false;
        }
        $('.msg_form').html("");
        $(this.refs.email).removeClass("has-error");
        $(this.refs.password).removeClass("has-error");
        $(this.refs.name).removeClass("has-error");
        if (this.checkReg()) {
            this.refs.btnReg.innerHTML = "...";
            this.sendRegInfo();
        };
    },
    sendRegInfo: function sendRegInfo() {
        // Get the selected files from the input.
        var files = this.refs.avatar.files;
        // Create a new FormData object.
        var formData = new FormData();
        // Loop through each of the selected files.
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            // Check the file type.
            if (!file.type.match('image.*')) {
                continue;
            }
            // Add the file to the request.
            formData.append('avatar', file, file.name);
        }
        formData.append('name', this.refs.name.value);
        formData.append('email', this.refs.email.value);
        formData.append('password', this.refs.password.value);
        var xhr = new XMLHttpRequest();
        // Open the connection.
        xhr.open('POST', '/api/register', true);
        // Set up a handler for when the request finishes.
        var that = this;
        xhr.onload = function () {
            if (xhr.status === 200) {
                // File(s) uploaded.
                that.refs.btnReg.innerHTML = "Register";
                $('.msg_form').html("Register Succesfully!");
                console.log(JSON.parse(xhr.response).token);
                Cookies.set("token", JSON.parse(xhr.response).token);
                window.stop();
                getCart();
                setTimeout(function () {
                    that.props.router.push('/');
                }, 1500);
            } else {
                that.refs.btnReg.innerHTML = "Register";
                $('.msg_form').html(xhr.responseJSON.message);
                window.stop();
            }
        };
        xhr.send(formData);
    },
    submit: function submit(event) {
        event.preventDefault();
        if (this.state.mode === 'login') {
            this.login();
        } else {
            this.register();
        }
    },
    resetAll: function resetAll() {
        this.state.avatar = '../images/avatar_default.png';
        $('.msg_form').html("");
        $(this.refs.email).removeClass("has-error");
        $(this.refs.password).removeClass("has-error");
        $(this.refs.name).removeClass("has-error");
        this.setState(this.state);
    },
    changeMode: function changeMode(event) {
        event.preventDefault();
        this.resetAll();
        this.state.mode = event.target.innerHTML;
        this.setState(this.state);
        return false;
    },
    changeAvatar: function changeAvatar(event) {
        console.log(event.target.files);
        if (event.target.files.length > 0) {
            this.state.avatar = URL.createObjectURL(event.target.files[0]);
            this.setState(this.state);
        } else {
            this.state.avatar = "./images/avatar_default.png";
            this.setState(this.state);
        }
    },
    render: function render() {
        return React.createElement(
            'section',
            { className: 'page-section full-height' },
            React.createElement(
                'div',
                { className: 'container-fluid full-height' },
                React.createElement(
                    'div',
                    { className: 'col-md-12 full-height relative' },
                    React.createElement(
                        'div',
                        { className: 'wrapper-vertical-center max-width-600' },
                        React.createElement(
                            'div',
                            { className: 'text-center login-header' },
                            React.createElement(
                                'h2',
                                { className: 'block-header' },
                                this.state.mode
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'regular-text contact-subheader text-center' },
                            React.createElement(
                                'p',
                                null,
                                'Please fill all info below.'
                            )
                        ),
                        React.createElement(
                            'form',
                            { onSubmit: this.submit, method: 'post', name: 'contactForm', className: 'contact-form ', id: 'contact-form' },
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-md-12' },
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement('input', { type: 'email', placeholder: 'Email', ref: 'email', name: 'email', className: 'form-control', tabIndex: '1', required: 'true' })
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-md-12' },
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement('input', { type: 'password', name: 'password', ref: 'password', className: 'form-control ', placeholder: 'Password', maxLength: '30', size: '30', required: 'true', tabIndex: '2' })
                                    )
                                )
                            ),
                            this.state.mode === "register" && React.createElement(
                                'div',
                                null,
                                React.createElement(
                                    'div',
                                    { className: 'row' },
                                    React.createElement(
                                        'div',
                                        { className: 'col-md-12' },
                                        React.createElement(
                                            'div',
                                            { className: 'form-group' },
                                            React.createElement('input', { type: 'password', name: 'repassword', ref: 'repassword', className: 'form-control ', tabIndex: '3', placeholder: 'Retype Password', maxLength: '30', size: '30', required: 'true' })
                                        )
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'row' },
                                    React.createElement(
                                        'div',
                                        { className: 'col-md-12' },
                                        React.createElement(
                                            'div',
                                            { className: 'form-group' },
                                            React.createElement('input', { type: 'text', name: 'name', className: 'form-control', ref: 'name', placeholder: 'Name', maxLength: '30', size: '30', required: 'true', tabIndex: '4' })
                                        )
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'row' },
                                    React.createElement(
                                        'div',
                                        { className: 'col-md-12' },
                                        React.createElement(
                                            'div',
                                            { className: 'form-group' },
                                            React.createElement('input', { onChange: this.changeAvatar, ref: 'avatar', accept: 'image/*', type: 'file', name: 'avatar', className: 'form-control' })
                                        )
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'row text-center' },
                                    React.createElement(
                                        'div',
                                        { className: 'col-md-12' },
                                        React.createElement(
                                            'div',
                                            { className: 'form-group' },
                                            React.createElement('img', { src: this.state.avatar, alt: 'avatar' })
                                        )
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-md-12' },
                                    React.createElement('div', { className: 'msg_form' })
                                )
                            ),
                            this.state.mode === "register" ? React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-md-6 col-xs-12 text-center' },
                                    React.createElement(
                                        'button',
                                        { onClick: this.changeMode, className: 'btn-theme form-btn col-md-12 col-xs-12' },
                                        'login'
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'col-md-6 col-xs-12 text-center' },
                                    React.createElement(
                                        'button',
                                        { ref: 'btnReg', className: 'btn-theme form-btn col-md-12' },
                                        'Register'
                                    )
                                )
                            ) : React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-md-6 col-xs-12 text-center' },
                                    React.createElement(
                                        'button',
                                        { onClick: this.changeMode, className: 'btn-theme form-btn col-md-12 col-xs-12' },
                                        'register'
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'col-md-6 col-xs-12 text-center' },
                                    React.createElement(
                                        'button',
                                        { ref: 'btnLogin', type: 'submit', className: 'btn-theme form-btn col-md-12' },
                                        'Login'
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
    },
    componentDidMount: function componentDidMount() {
        changePage("/login");
    },
    componentWillMount: function componentWillMount() {
        if (isLogin()) {
            this.props.router.push("/");
        }
    }
});

/* PRODUCT */
var Product = React.createClass({
    displayName: 'Product',
    changeSize: function changeSize(event) {
        var newDetail;
        if (event.target.value != '') {
            newDetail = this.state.item.itemDetails[parseInt(event.target.value)];
        } else {
            newDetail = { size: '', quantity: 0 };
        }
        this.state.crnDetail = newDetail;
        this.setState(this.state);
    },
    changeImg: function changeImg(event) {
        console.log(event.target.src);
        this.state.crnImg = event.target.src;
        this.setState(this.state);
    },
    btnAddClick: function btnAddClick() {
        if (cart) {
            addToCart(this.state.item, this.state.crnDetail.size);
            updateCart();
        } else {
            alert("Please login to use cart!");
            this.props.router.push('/');
        }
    },
    getInitialState: function getInitialState() {
        return { crnImg: './images/bg_2.jpg', item: { name: 'Tubular Doom', brand: 'Adidas', color: 'Grey', price: 3600000, discount: 0, itemMetas: [{ metaKey: 'url', metaValue: './images/bg_2.jpg' }, { metaKey: 'url', metaValue: './images/bg_1.jpg' }, { metaKey: 'url', metaValue: './images/bg_3.jpg' }], itemDetails: [{ size: '36', quantity: 5 }, { size: '40', quantity: 0 }] }, crnDetail: { size: '', quantity: 0 } };
    },
    render: function render() {
        return React.createElement(
            'section',
            { className: 'page-section full-height' },
            React.createElement(
                'div',
                { className: 'container-fluid full-height' },
                React.createElement('div', { className: 'fake-white' }),
                React.createElement(
                    'div',
                    { className: 'row product-single' },
                    React.createElement(
                        'a',
                        { href: '#/shop' },
                        React.createElement(
                            'div',
                            { className: 'all_products' },
                            React.createElement('span', { className: 'glyphicon glyphicon-th' })
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-md-6 text-center relative min-height' },
                        React.createElement(
                            'div',
                            { className: 'images-wrapper' },
                            React.createElement('img', { alt: '', className: 'imgdetail max-height', src: this.state.crnImg }),
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement('div', { className: 'hidden-xs col-sm-3' }),
                                this.state.item.itemMetas.map(function (itemMeta, index) {
                                    return React.createElement(
                                        'div',
                                        { key: index, className: 'col-xs-4 col-sm-2' },
                                        React.createElement(
                                            'div',
                                            { className: 'img-product-detail' },
                                            React.createElement(
                                                'a',
                                                null,
                                                React.createElement('img', { onClick: this.changeImg, className: 'full-width', alt: '', src: itemMeta.metaValue })
                                            )
                                        )
                                    );
                                }, this)
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-md-6 filters-shop min-height' },
                        React.createElement(
                            'div',
                            { className: 'product-name' },
                            React.createElement(
                                'h2',
                                { className: 'product-title' },
                                this.state.item.name
                            ),
                            this.state.item.discount != 0 ? React.createElement(
                                'div',
                                { className: 'product-price' },
                                React.createElement(
                                    'del',
                                    { className: 'text-red' },
                                    format(this.state.item.price)
                                ),
                                format(this.state.item.price - this.state.item.discount)
                            ) : React.createElement(
                                'div',
                                { className: 'product-price' },
                                format(this.state.item.price)
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'wrapper-info' },
                            React.createElement(
                                'div',
                                { className: 'product-text' },
                                this.state.item.description
                            ),
                            React.createElement(
                                'div',
                                { className: 'buttons relative' },
                                React.createElement(
                                    'div',
                                    null,
                                    React.createElement(
                                        'span',
                                        { className: 'select-wrapper-size' },
                                        React.createElement(
                                            'select',
                                            { className: 'form-control size-select', name: 'size', onChange: this.changeSize, defaultValue: this.state.crnDetail.size },
                                            React.createElement(
                                                'option',
                                                { value: '', disabled: true },
                                                'Select Size'
                                            ),
                                            this.state.item.itemDetails.map(function (itemDetail, index) {
                                                return React.createElement(
                                                    'option',
                                                    { key: index, value: index },
                                                    itemDetail.size
                                                );
                                            })
                                        )
                                    ),
                                    React.createElement(
                                        'span',
                                        { className: 'input-group-btn text-center' },
                                        this.state.crnDetail.size != '' && this.state.crnDetail.quantity == 0 ? React.createElement(
                                            'label',
                                            { className: 'out-stock-label' },
                                            'Out Stock'
                                        ) : React.createElement(
                                            'button',
                                            { onClick: this.btnAddClick, className: 'btn-theme btn-detail' },
                                            'Add to cart'
                                        )
                                    )
                                )
                            ),
                            React.createElement('div', { className: 'message fadein fadeout' })
                        )
                    )
                )
            )
        );
    },
    componentDidMount: function componentDidMount() {
        var that = this;
        $.get('/api/items/' + that.props.params.itemId, function (data) {
            var crnState = that.state;
            crnState.item = data;
            crnState.crnImg = data.itemMetas[0].metaValue;
            that.setState(crnState);
        });
    }
});

/* CART */
var Cart = React.createClass({
    displayName: 'Cart',
    add: function add(index) {
        cart.cartDetails[index].quantity++;
        updateCart();
    },
    sub: function sub(index) {
        if (cart.cartDetails[index].quantity > 1) {
            cart.cartDetails[index].quantity--;
            updateCart();
        } else {
            return;
        }
    },
    remove: function remove(index) {
        console.log(index);
        cart.cartDetails.splice(index, 1);
        console.log(cart);
        updateCart();
    },
    getInitialState: function getInitialState() {
        if (cart) {
            return { cart: cart };
        } else {
            return { cart: { cartDetails: [], total: 0 } };
        }
    },
    componentDidMount: function componentDidMount() {
        cartComponent = this;
    },
    render: function render() {
        return React.createElement(
            'section',
            { className: 'page-section color full-height' },
            React.createElement(
                'div',
                { className: 'container full-height no-overflow' },
                isLogin() ? React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-md-12' },
                        React.createElement(
                            'h2',
                            { className: 'block-header header-cart text-center' },
                            'Your Cart'
                        )
                    ),
                    this.state.cart.cartDetails.map(function (cartDetail, index) {
                        var _this = this;

                        return React.createElement(
                            'div',
                            { key: index, className: this.state.cart.cartDetails.length > 1 ? "col-md-4" : "col-md-offset-3 col-md-6" },
                            React.createElement(
                                'div',
                                { className: 'wrapper-cart' },
                                React.createElement(
                                    'div',
                                    { className: 'remove-product' },
                                    React.createElement(
                                        'a',
                                        { onClick: function onClick() {
                                                return _this.remove(index);
                                            } },
                                        React.createElement('i', { className: 'fa fa-close' })
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'image' },
                                    React.createElement('img', { alt: '', src: cartDetail.item.itemMetas[0].metaValue })
                                ),
                                React.createElement(
                                    'h4',
                                    { className: 'text-center' },
                                    cartDetail.item.name
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'size-unit' },
                                    'Size: ',
                                    cartDetail.size
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'price-unit' },
                                    format(cartDetail.item.price - cartDetail.item.discount)
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'text-center div-change-qtt' },
                                    React.createElement(
                                        'span',
                                        { className: 'counter', onClick: function onClick() {
                                                return _this.sub(index);
                                            } },
                                        React.createElement('i', { className: 'fa fa-minus' })
                                    ),
                                    React.createElement(
                                        'span',
                                        { className: 'input' },
                                        cartDetail.quantity
                                    ),
                                    React.createElement(
                                        'span',
                                        { className: 'counter', onClick: function onClick() {
                                                return _this.add(index);
                                            } },
                                        React.createElement('i', { className: 'fa fa-plus' })
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'subtotal' },
                                    format(cartDetail.total)
                                )
                            )
                        );
                    }, this),
                    this.state.cart.cartDetails.length == 0 ? React.createElement(
                        'div',
                        { className: 'col-md-12 full-height relative' },
                        React.createElement(
                            'div',
                            { className: 'wrapper-vertical-center' },
                            React.createElement(
                                'div',
                                { className: 'regular-text text-center text-cart' },
                                React.createElement(
                                    'p',
                                    null,
                                    'There is not items yet.'
                                ),
                                React.createElement(
                                    Link,
                                    { to: 'shop' },
                                    'Back to shop'
                                )
                            )
                        )
                    ) : React.createElement(
                        'div',
                        { className: 'col-md-12' },
                        React.createElement(
                            'div',
                            { className: 'shopping-cart' },
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-md-4' },
                                    React.createElement(
                                        Link,
                                        { to: 'shop', className: 'btn btn-theme btn-theme-dark btn-block' },
                                        'Back Store'
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'col-md-4 text-center total-amount' },
                                    React.createElement(
                                        'span',
                                        null,
                                        'Total: '
                                    ),
                                    React.createElement(
                                        'span',
                                        { className: '' },
                                        format(this.state.cart.total)
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'col-md-4' },
                                    React.createElement(
                                        Link,
                                        { to: '/orderInfo', className: 'btn btn-theme btn-theme-dark btn-block' },
                                        'Checkout'
                                    )
                                )
                            )
                        )
                    )
                ) : React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-md-12 text-center' },
                        React.createElement(
                            'h2',
                            { className: 'block-header header-cart text-center' },
                            'Please login first to use cart'
                        ),
                        React.createElement(
                            Link,
                            { to: 'login', className: 'btn-theme btn-home' },
                            'Login Page'
                        )
                    )
                )
            )
        );
    }
});

/* ORDER INFO */
var OrderInfo = React.createClass({
    displayName: 'OrderInfo',
    getInitialState: function getInitialState() {
        var myCart = cart ? cart : { cartDetails: [], total: 0 };
        return {
            receiver: "",
            phone: "",
            address: "",
            note: "",
            owner: {
                name: "Bolybi shop",
                phone: "0128-673-2996",
                email: "bolybi.shop@gmail.com",
                web: "bolybi-shop.tk"
            },
            cart: myCart
        };
    },
    reset: function reset() {
        $(this.refs.receiver).removeClass('has-error');
        $(this.refs.phone).removeClass('has-error');
        $(this.refs.address).removeClass('has-error');
    },
    createOrder: function createOrder() {
        this.reset();
        if (!checkText(this.refs.receiver.value)) {
            $(this.refs.receiver).addClass('has-error');
            return false;
        }
        if (!checkText(this.refs.phone.value)) {
            $(this.refs.phone).addClass('has-error');
            return false;
        }
        if (!checkText(this.refs.address.value)) {
            $(this.refs.address).addClass('has-error');
            return false;
        }
        var info = {
            receiver: this.refs.receiver.value,
            phone: this.refs.phone.value,
            address: this.refs.address.value,
            note: this.refs.note.value
        };
        var that = this;
        _createOrder(info, this.state.cart, function (data) {
            alert("Created New Order!");
            that.props.router.push("/orderList");
        });
    },
    update: function update(kind) {
        if (kind === "receiver") {
            this.state.name = this.refs.receiver.value;
            this.setState(this.state);
        } else if (kind === "phone") {
            this.state.phone = this.refs.phone.value;
            this.setState(this.state);
        } else if (kind === "address") {
            this.state.address = this.refs.address.value;
            this.setState(this.state);
        } else if (kind === "note") {
            this.state.note = this.refs.note.value;
            this.setState(this.state);
        }
    },
    componentDidMount: function componentDidMount() {
        orderInfoCpn = this;
    },
    render: function render() {
        var _this2 = this;

        if (!this.state.cart) {
            this.props.router.push("/");
            return null;
        }
        return React.createElement(
            'section',
            { className: 'page-section full-height' },
            React.createElement(
                'div',
                { className: 'container-fluid full-height' },
                React.createElement('div', { className: 'fake-white' }),
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-md-6' },
                        React.createElement(
                            'div',
                            { className: 'order-info-name' },
                            React.createElement(
                                'h2',
                                { className: 'block-header text-center' },
                                'Order Info'
                            )
                        ),
                        React.createElement(
                            'form',
                            { onSubmit: this.submit, method: 'post', name: 'infoForm', className: 'contact-form info-form', id: 'info-form' },
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-md-6' },
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement('input', { type: 'text', onChange: function onChange() {
                                                return _this2.update("receiver");
                                            }, placeholder: 'Receiver Name', ref: 'receiver', name: 'receiver', className: 'form-control', tabIndex: '1', required: 'true' })
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'col-md-6' },
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement('input', { type: 'text', onChange: function onChange() {
                                                return _this2.update("phone");
                                            }, placeholder: 'Phone Number', ref: 'phone', name: 'phone', className: 'form-control', tabIndex: '2', required: 'true' })
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-md-12' },
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement('textarea', { ref: 'address', onChange: function onChange() {
                                                return _this2.update("address");
                                            }, placeholder: 'Address', rows: '2', className: 'form-control', tabIndex: '3', type: 'text' })
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-md-12' },
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement('textarea', { ref: 'note', onChange: function onChange() {
                                                return _this2.update("note");
                                            }, rows: '4', placeholder: 'Note', className: 'form-control', tabIndex: '4', type: 'text' })
                                    )
                                )
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-md-6 info-preview' },
                        React.createElement(
                            'div',
                            { className: 'invoice' },
                            React.createElement(
                                'header',
                                null,
                                React.createElement(
                                    'div',
                                    { className: 'header-wrapper top-bar' },
                                    React.createElement(
                                        'div',
                                        { className: 'container-fluid' },
                                        React.createElement(
                                            'div',
                                            { className: 'row' },
                                            React.createElement(
                                                'div',
                                                { className: 'col-xs-12 col-sm-6' },
                                                React.createElement(
                                                    'h1',
                                                    null,
                                                    'invoice'
                                                )
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'col-xs-12 col-sm-6 pull-right' },
                                                React.createElement(
                                                    'p',
                                                    { className: 'shop-name' },
                                                    this.state.owner.name
                                                ),
                                                React.createElement(
                                                    'p',
                                                    null,
                                                    this.state.owner.phone
                                                ),
                                                React.createElement(
                                                    'a',
                                                    { href: "mailto@" + this.state.owner.email },
                                                    this.state.owner.email
                                                ),
                                                React.createElement(
                                                    'a',
                                                    { href: this.state.owner.web },
                                                    this.state.owner.web
                                                )
                                            )
                                        )
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'invoice-content' },
                                React.createElement(
                                    'div',
                                    { className: 'row relative' },
                                    React.createElement(
                                        'div',
                                        { className: 'col-md-6 col-xs-12' },
                                        React.createElement(
                                            'ul',
                                            null,
                                            React.createElement(
                                                'li',
                                                null,
                                                React.createElement(
                                                    'label',
                                                    null,
                                                    'Receiver\'s Name:'
                                                ),
                                                React.createElement(
                                                    'div',
                                                    { className: 'invoice-text' },
                                                    this.state.name
                                                )
                                            ),
                                            React.createElement(
                                                'li',
                                                null,
                                                React.createElement(
                                                    'label',
                                                    null,
                                                    'Phone Number:'
                                                ),
                                                React.createElement(
                                                    'div',
                                                    { className: 'invoice-text' },
                                                    this.state.phone
                                                )
                                            ),
                                            React.createElement(
                                                'li',
                                                null,
                                                React.createElement(
                                                    'label',
                                                    null,
                                                    'Address:'
                                                ),
                                                React.createElement(
                                                    'div',
                                                    { className: 'invoice-text' },
                                                    this.state.address
                                                )
                                            ),
                                            React.createElement(
                                                'li',
                                                null,
                                                React.createElement(
                                                    'label',
                                                    null,
                                                    'Note:'
                                                ),
                                                React.createElement(
                                                    'div',
                                                    { className: 'invoice-text' },
                                                    this.state.note
                                                )
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'col-md-6 col-xs-12 pull-right mid-air' },
                                        React.createElement(
                                            'label',
                                            null,
                                            'Invoice Total'
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'total', ref: 'total' },
                                            format(this.state.cart.total)
                                        )
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'table-responsive' },
                                    React.createElement(
                                        'table',
                                        { className: 'table table-hover table-detail' },
                                        React.createElement(
                                            'thead',
                                            null,
                                            React.createElement(
                                                'tr',
                                                null,
                                                React.createElement(
                                                    'th',
                                                    null,
                                                    'Description'
                                                ),
                                                React.createElement(
                                                    'th',
                                                    { className: 'text-center' },
                                                    'Unit Cost'
                                                ),
                                                React.createElement(
                                                    'th',
                                                    { className: 'text-center' },
                                                    'Qty'
                                                ),
                                                React.createElement(
                                                    'th',
                                                    { className: 'text-right' },
                                                    'Total'
                                                )
                                            )
                                        ),
                                        React.createElement(
                                            'tbody',
                                            null,
                                            this.state.cart.cartDetails.map(function (detail, index) {
                                                return React.createElement(
                                                    'tr',
                                                    { key: index },
                                                    React.createElement(
                                                        'td',
                                                        null,
                                                        detail.item.name,
                                                        React.createElement(
                                                            'div',
                                                            { className: 'lb' },
                                                            detail.size,
                                                            ' | ',
                                                            detail.item.color
                                                        )
                                                    ),
                                                    React.createElement(
                                                        'td',
                                                        { className: 'text-center' },
                                                        format(detail.item.price - detail.item.discount)
                                                    ),
                                                    React.createElement(
                                                        'td',
                                                        { className: 'text-center' },
                                                        detail.quantity
                                                    ),
                                                    React.createElement(
                                                        'td',
                                                        { className: 'text-right' },
                                                        format(detail.total)
                                                    )
                                                );
                                            }, this)
                                        ),
                                        React.createElement(
                                            'tfoot',
                                            null,
                                            React.createElement(
                                                'tr',
                                                null,
                                                React.createElement(
                                                    'th',
                                                    { className: 'total-text', colSpan: 3 },
                                                    'Totals'
                                                ),
                                                React.createElement(
                                                    'th',
                                                    { className: 'text-right' },
                                                    format(this.state.cart.total)
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'order-info-btn' },
                            React.createElement(
                                'a',
                                { onClick: this.createOrder, className: 'btn btn-theme btn-theme-dark btn-block' },
                                'Finish'
                            )
                        )
                    )
                )
            ),
            React.createElement('div', { className: 'message fadein fadeout' })
        );
    }
});

/* ORDERS LIST */
var OrdersList = React.createClass({
    displayName: 'OrdersList',
    componentDidMount: function componentDidMount() {
        var that = this;
        getOrders(function (data) {
            data = formatOrders(data);
            console.log(data);
            $('#table').bootstrapTable({
                data: data
            });
            var windowSize = $(window).width();
            if (windowSize < 768) {
                $('#table').bootstrapTable('toggleView');
            }
            $('#table').on('click-row.bs.table', function (e, row, $element) {
                console.log(row);
                that.state.crnOrder = row;
                $("#orderModal").modal();
                that.setState(that.state);
            });

            //            $(window).on('resize', function(event){
            //                var windowSize = $(window).width();
            //                if(windowSize < 768){
            //                    alert("Please reload page!");
            //                    window.location.reload();
            //                }
            //            });
        });
    },
    getInitialState: function getInitialState() {
        return {
            crnOrder: {
                orderDetails: []
            }
        };
    },
    render: function render() {
        return React.createElement(
            'section',
            { className: 'page-section full-height' },
            React.createElement(
                'div',
                { className: 'container-fluid full-height' },
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-md-12' },
                        React.createElement(
                            'h2',
                            { className: 'block-header header-cart text-center' },
                            'Your List Orders'
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-md-12' },
                        React.createElement(
                            'table',
                            { id: 'table', 'data-locale': 'en-US', 'data-sort-name': 'status', 'data-sort-order': 'desc', 'data-pagination': 'true', 'data-search': 'true' },
                            React.createElement(
                                'thead',
                                null,
                                React.createElement(
                                    'tr',
                                    null,
                                    React.createElement(
                                        'th',
                                        { 'data-field': '_id', 'data-sortable': 'true' },
                                        'ID'
                                    ),
                                    React.createElement(
                                        'th',
                                        { 'data-field': 'createdDate', 'data-sortable': 'true' },
                                        'Created Date'
                                    ),
                                    React.createElement(
                                        'th',
                                        { 'data-field': 'updatedDate', 'data-sortable': 'true' },
                                        'Finished Date'
                                    ),
                                    React.createElement(
                                        'th',
                                        { 'data-field': 'status', 'data-sortable': 'true' },
                                        'Status'
                                    ),
                                    React.createElement(
                                        'th',
                                        { 'data-field': 'total', 'data-sortable': 'true' },
                                        'Total'
                                    )
                                )
                            )
                        )
                    )
                )
            ),
            React.createElement(
                'div',
                { id: 'orderModal', className: 'modal fade', role: 'dialog' },
                React.createElement(
                    'div',
                    { className: 'modal-dialog modal-lg' },
                    React.createElement(
                        'div',
                        { className: 'modal-content' },
                        React.createElement(
                            'div',
                            { className: 'modal-header' },
                            React.createElement(
                                'button',
                                { type: 'button', className: 'close', 'data-dismiss': 'modal' },
                                '\xD7'
                            ),
                            React.createElement(
                                'h1',
                                { className: 'modal-title text-center' },
                                'Order #',
                                this.state.crnOrder._id
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'modal-body' },
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-md-offset-2 col-md-8 col-xs-12 border-bot' },
                                    React.createElement(
                                        'div',
                                        { className: 'row' },
                                        React.createElement(
                                            'div',
                                            { className: 'col-md-4 col-xs-12' },
                                            React.createElement(
                                                'label',
                                                null,
                                                'Receiver\'s Name:'
                                            )
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-md-8 col-xs-12' },
                                            this.state.crnOrder.receiver
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'row' },
                                        React.createElement(
                                            'div',
                                            { className: 'col-md-4 col-xs-12' },
                                            React.createElement(
                                                'label',
                                                null,
                                                'Phone Number:'
                                            )
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-md-8 col-xs-12' },
                                            this.state.crnOrder.phone
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'row' },
                                        React.createElement(
                                            'div',
                                            { className: 'col-md-4 col-xs-12' },
                                            React.createElement(
                                                'label',
                                                null,
                                                'Address:'
                                            )
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-md-8 col-xs-12' },
                                            this.state.crnOrder.address
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'row ' },
                                        React.createElement(
                                            'div',
                                            { className: 'col-md-4 col-xs-12' },
                                            React.createElement(
                                                'label',
                                                null,
                                                'Note:'
                                            )
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-md-8 col-xs-12' },
                                            this.state.crnOrder.note
                                        )
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'row' },
                                this.state.crnOrder.orderDetails.map(function (detail, index) {
                                    return React.createElement(
                                        'div',
                                        { key: index, className: this.state.crnOrder.orderDetails.length > 1 ? "col-md-4" : "col-md-offset-3 col-md-6" },
                                        React.createElement(
                                            'div',
                                            { className: 'wrapper-cart' },
                                            React.createElement('div', { className: 'remove-product' }),
                                            React.createElement(
                                                'div',
                                                { className: 'image' },
                                                React.createElement('img', { alt: '', src: detail.item.itemMetas[0].metaValue })
                                            ),
                                            React.createElement(
                                                'h4',
                                                { className: 'text-center' },
                                                detail.item.name
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'size-unit' },
                                                'Size: ',
                                                detail.size,
                                                ' | Color: ',
                                                detail.item.color
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'price-unit' },
                                                format(detail.price - detail.discount)
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'text-center div-change-qtt' },
                                                React.createElement(
                                                    'span',
                                                    { className: 'input' },
                                                    'Quantity: ',
                                                    detail.quantity
                                                )
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'subtotal' },
                                                format(detail.total)
                                            )
                                        )
                                    );
                                }, this),
                                React.createElement(
                                    'div',
                                    { className: 'col-md-12' },
                                    React.createElement(
                                        'div',
                                        { className: 'shopping-cart' },
                                        React.createElement(
                                            'div',
                                            { className: 'row' },
                                            React.createElement(
                                                'div',
                                                { className: 'col-md-offset-4 col-md-4 text-center total-amount' },
                                                React.createElement(
                                                    'span',
                                                    null,
                                                    'Total: '
                                                ),
                                                React.createElement(
                                                    'span',
                                                    { className: '' },
                                                    this.state.crnOrder.total
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
    }
});

/* APP */
var AppCustomer = React.createClass({
    displayName: 'AppCustomer',
    logout: function logout() {
        Cookies.remove("token");
        cart = null;
        updateCartInUI();
        this.forceUpdate();
        this.props.router.push("/");
    },
    render: function render() {
        return React.createElement(
            'div',
            { className: 'home' },
            React.createElement('link', { rel: 'stylesheet', href: './css/flexslider.css' }),
            React.createElement('link', { rel: 'stylesheet', href: './css/style.css' }),
            React.createElement(
                Header,
                { logout: this.logout },
                'Bolybi'
            ),
            React.createElement(
                'div',
                { className: 'content-area' },
                this.props.children
            ),
            React.createElement(MainMenu, { logout: this.logout })
        );
    }
});

/* -----------------------------   SERVER   ---------------------------------*/

var NaviBar = React.createClass({
    displayName: 'NaviBar',
    getInitialState: function getInitialState() {
        return null;
    },
    render: function render() {
        return React.createElement(
            'header',
            { className: 'main-header' },
            React.createElement(
                Link,
                { to: '/admin', className: 'logo' },
                React.createElement(
                    'span',
                    { className: 'logo-mini' },
                    React.createElement(
                        'b',
                        null,
                        'B'
                    ),
                    'LB'
                ),
                React.createElement(
                    'span',
                    { className: 'logo-lg' },
                    React.createElement(
                        'b',
                        null,
                        'BOLYBI'
                    ),
                    'shop'
                )
            ),
            React.createElement(
                'nav',
                { className: 'navbar navbar-static-top', role: 'navigation' },
                React.createElement(
                    'a',
                    { className: 'sidebar-toggle', 'data-toggle': 'offcanvas', role: 'button' },
                    React.createElement(
                        'span',
                        { className: 'sr-only' },
                        'Toggle navigation'
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'navbar-custom-menu' },
                    React.createElement(
                        'ul',
                        { className: 'nav navbar-nav' },
                        React.createElement(
                            'li',
                            { className: 'dropdown messages-menu' },
                            React.createElement(
                                'a',
                                { className: 'dropdown-toggle', 'data-toggle': 'dropdown' },
                                React.createElement('i', { className: 'fa fa-envelope-o' }),
                                React.createElement(
                                    'span',
                                    { className: 'label label-success' },
                                    '4'
                                )
                            ),
                            React.createElement(
                                'ul',
                                { className: 'dropdown-menu' },
                                React.createElement(
                                    'li',
                                    { className: 'header' },
                                    'You have 4 messages'
                                ),
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'ul',
                                        { className: 'menu' },
                                        React.createElement(
                                            'li',
                                            null,
                                            React.createElement(
                                                'a',
                                                null,
                                                React.createElement(
                                                    'div',
                                                    { className: 'pull-left' },
                                                    React.createElement('img', { src: '', className: 'img-circle', alt: 'User Image' })
                                                ),
                                                React.createElement(
                                                    'h4',
                                                    null,
                                                    'Support Team',
                                                    React.createElement(
                                                        'small',
                                                        null,
                                                        React.createElement('i', { className: 'fa fa-clock-o' }),
                                                        ' 5 mins'
                                                    )
                                                ),
                                                React.createElement(
                                                    'p',
                                                    null,
                                                    'Why not buy a new awesome theme?'
                                                )
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            React.createElement(
                                                'a',
                                                null,
                                                React.createElement(
                                                    'div',
                                                    { className: 'pull-left' },
                                                    React.createElement('img', { src: '', className: 'img-circle', alt: 'User Image' })
                                                ),
                                                React.createElement(
                                                    'h4',
                                                    null,
                                                    'AdminLTE Design Team',
                                                    React.createElement(
                                                        'small',
                                                        null,
                                                        React.createElement('i', { className: 'fa fa-clock-o' }),
                                                        ' 2 hours'
                                                    )
                                                ),
                                                React.createElement(
                                                    'p',
                                                    null,
                                                    'Why not buy a new awesome theme?'
                                                )
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            React.createElement(
                                                'a',
                                                null,
                                                React.createElement(
                                                    'div',
                                                    { className: 'pull-left' },
                                                    React.createElement('img', { src: '', className: 'img-circle', alt: 'User Image' })
                                                ),
                                                React.createElement(
                                                    'h4',
                                                    null,
                                                    'Developers',
                                                    React.createElement(
                                                        'small',
                                                        null,
                                                        React.createElement('i', { className: 'fa fa-clock-o' }),
                                                        ' Today'
                                                    )
                                                ),
                                                React.createElement(
                                                    'p',
                                                    null,
                                                    'Why not buy a new awesome theme?'
                                                )
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            React.createElement(
                                                'a',
                                                null,
                                                React.createElement(
                                                    'div',
                                                    { className: 'pull-left' },
                                                    React.createElement('img', { src: '', className: 'img-circle', alt: 'User Image' })
                                                ),
                                                React.createElement(
                                                    'h4',
                                                    null,
                                                    'Sales Department',
                                                    React.createElement(
                                                        'small',
                                                        null,
                                                        React.createElement('i', { className: 'fa fa-clock-o' }),
                                                        ' Yesterday'
                                                    )
                                                ),
                                                React.createElement(
                                                    'p',
                                                    null,
                                                    'Why not buy a new awesome theme?'
                                                )
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            React.createElement(
                                                'a',
                                                null,
                                                React.createElement(
                                                    'div',
                                                    { className: 'pull-left' },
                                                    React.createElement('img', { src: '', className: 'img-circle', alt: 'User Image' })
                                                ),
                                                React.createElement(
                                                    'h4',
                                                    null,
                                                    'Reviewers',
                                                    React.createElement(
                                                        'small',
                                                        null,
                                                        React.createElement('i', { className: 'fa fa-clock-o' }),
                                                        ' 2 days'
                                                    )
                                                ),
                                                React.createElement(
                                                    'p',
                                                    null,
                                                    'Why not buy a new awesome theme?'
                                                )
                                            )
                                        )
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    { className: 'footer' },
                                    React.createElement(
                                        'a',
                                        null,
                                        'See All Messages'
                                    )
                                )
                            )
                        ),
                        React.createElement(
                            'li',
                            { className: 'dropdown notifications-menu' },
                            React.createElement(
                                'a',
                                { className: 'dropdown-toggle', 'data-toggle': 'dropdown' },
                                React.createElement('i', { className: 'fa fa-bell-o' }),
                                React.createElement(
                                    'span',
                                    { className: 'label label-warning' },
                                    '10'
                                )
                            ),
                            React.createElement(
                                'ul',
                                { className: 'dropdown-menu' },
                                React.createElement(
                                    'li',
                                    { className: 'header' },
                                    'You have 10 notifications'
                                ),
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'ul',
                                        { className: 'menu' },
                                        React.createElement(
                                            'li',
                                            null,
                                            React.createElement(
                                                'a',
                                                null,
                                                React.createElement('i', { className: 'fa fa-users text-aqua' }),
                                                ' 10 new members joined today'
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            React.createElement(
                                                'a',
                                                null,
                                                React.createElement('i', { className: 'fa fa-warning text-yellow' }),
                                                ' Very long description here that may not fit into the page and may cause design problems'
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            React.createElement(
                                                'a',
                                                null,
                                                React.createElement('i', { className: 'fa fa-users text-red' }),
                                                ' 10 new members joined'
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            React.createElement(
                                                'a',
                                                null,
                                                React.createElement('i', { className: 'fa fa-shopping-cart text-green' }),
                                                ' 25 sales made'
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            React.createElement(
                                                'a',
                                                null,
                                                React.createElement('i', { className: 'fa fa-user text-red' }),
                                                ' You changed your username'
                                            )
                                        )
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    { className: 'footer' },
                                    React.createElement(
                                        'a',
                                        null,
                                        'View all'
                                    )
                                )
                            )
                        ),
                        React.createElement(
                            'li',
                            { className: 'dropdown tasks-menu' },
                            React.createElement(
                                'a',
                                { className: 'dropdown-toggle', 'data-toggle': 'dropdown' },
                                React.createElement('i', { className: 'fa fa-flag-o' }),
                                React.createElement(
                                    'span',
                                    { className: 'label label-danger' },
                                    '9'
                                )
                            ),
                            React.createElement(
                                'ul',
                                { className: 'dropdown-menu' },
                                React.createElement(
                                    'li',
                                    { className: 'header' },
                                    'You have 9 tasks'
                                ),
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'ul',
                                        { className: 'menu' },
                                        React.createElement(
                                            'li',
                                            null,
                                            React.createElement(
                                                'a',
                                                null,
                                                React.createElement(
                                                    'h3',
                                                    null,
                                                    'Design some buttons',
                                                    React.createElement(
                                                        'small',
                                                        { className: 'pull-right' },
                                                        '20%'
                                                    )
                                                ),
                                                React.createElement(
                                                    'div',
                                                    { className: 'progress xs' },
                                                    React.createElement(
                                                        'div',
                                                        { className: 'progress-bar progress-bar-aqua', role: 'progressbar', 'aria-valuenow': '20', 'aria-valuemin': '0', 'aria-valuemax': '100' },
                                                        React.createElement(
                                                            'span',
                                                            { className: 'sr-only' },
                                                            '20% Complete'
                                                        )
                                                    )
                                                )
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            React.createElement(
                                                'a',
                                                null,
                                                React.createElement(
                                                    'h3',
                                                    null,
                                                    'Create a nice theme',
                                                    React.createElement(
                                                        'small',
                                                        { className: 'pull-right' },
                                                        '40%'
                                                    )
                                                ),
                                                React.createElement(
                                                    'div',
                                                    { className: 'progress xs' },
                                                    React.createElement(
                                                        'div',
                                                        { className: 'progress-bar progress-bar-green', role: 'progressbar', 'aria-valuenow': '20', 'aria-valuemin': '0', 'aria-valuemax': '100' },
                                                        React.createElement(
                                                            'span',
                                                            { className: 'sr-only' },
                                                            '40% Complete'
                                                        )
                                                    )
                                                )
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            React.createElement(
                                                'a',
                                                null,
                                                React.createElement(
                                                    'h3',
                                                    null,
                                                    'Some task I need to do',
                                                    React.createElement(
                                                        'small',
                                                        { className: 'pull-right' },
                                                        '60%'
                                                    )
                                                ),
                                                React.createElement(
                                                    'div',
                                                    { className: 'progress xs' },
                                                    React.createElement(
                                                        'div',
                                                        { className: 'progress-bar progress-bar-red', role: 'progressbar', 'aria-valuenow': '20', 'aria-valuemin': '0', 'aria-valuemax': '100' },
                                                        React.createElement(
                                                            'span',
                                                            { className: 'sr-only' },
                                                            '60% Complete'
                                                        )
                                                    )
                                                )
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            React.createElement(
                                                'a',
                                                null,
                                                React.createElement(
                                                    'h3',
                                                    null,
                                                    'Make beautiful transitions',
                                                    React.createElement(
                                                        'small',
                                                        { className: 'pull-right' },
                                                        '80%'
                                                    )
                                                ),
                                                React.createElement(
                                                    'div',
                                                    { className: 'progress xs' },
                                                    React.createElement(
                                                        'div',
                                                        { className: 'progress-bar progress-bar-yellow', role: 'progressbar', 'aria-valuenow': '20', 'aria-valuemin': '0', 'aria-valuemax': '100' },
                                                        React.createElement(
                                                            'span',
                                                            { className: 'sr-only' },
                                                            '80% Complete'
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    { className: 'footer' },
                                    React.createElement(
                                        'a',
                                        null,
                                        'View all tasks'
                                    )
                                )
                            )
                        ),
                        React.createElement(
                            'li',
                            { className: 'dropdown user user-menu' },
                            React.createElement(
                                'a',
                                { className: 'dropdown-toggle', 'data-toggle': 'dropdown' },
                                React.createElement('img', { src: this.props.children.avatarURL, className: 'user-image', alt: 'User Image' }),
                                React.createElement(
                                    'span',
                                    { className: 'hidden-xs' },
                                    this.props.children.name
                                )
                            ),
                            React.createElement(
                                'ul',
                                { className: 'dropdown-menu' },
                                React.createElement(
                                    'li',
                                    { className: 'user-header' },
                                    React.createElement('img', { src: this.props.children.avatarURL, className: 'img-circle', alt: 'User Image' }),
                                    React.createElement(
                                        'p',
                                        null,
                                        this.props.children.name,
                                        React.createElement(
                                            'small',
                                            null,
                                            'Member since ',
                                            this.props.children.createdDate.split("T")[0]
                                        )
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    { className: 'user-body' },
                                    React.createElement(
                                        'div',
                                        { className: 'col-xs-4 text-center' },
                                        React.createElement(
                                            'a',
                                            { href: 'https://www.facebook.com/nguyen.viettri.9' },
                                            'Facebook'
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'col-xs-4 text-center' },
                                        React.createElement(
                                            'a',
                                            { href: 'https://nvt-cv.firebaseapp.com' },
                                            'LinkedIN'
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'col-xs-4 text-center' },
                                        React.createElement(
                                            'a',
                                            { href: 'https://nvt-cv.firebaseapp.com' },
                                            'HomePage'
                                        )
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    { className: 'user-footer' },
                                    React.createElement(
                                        'div',
                                        { className: 'pull-left' },
                                        React.createElement(
                                            'a',
                                            { className: 'btn btn-default btn-flat' },
                                            'Profile'
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'pull-right' },
                                        React.createElement(
                                            'a',
                                            { onClick: this.props.signOut, className: 'btn btn-default btn-flat' },
                                            'Sign out'
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
    }
});

var SideBar = React.createClass({
    displayName: 'SideBar',
    render: function render() {
        return React.createElement(
            'aside',
            { className: 'main-sidebar' },
            React.createElement(
                'section',
                { className: 'sidebar' },
                React.createElement(
                    'div',
                    { className: 'user-panel' },
                    React.createElement(
                        'div',
                        { className: 'pull-left image' },
                        React.createElement('img', { src: this.props.children.avatarURL, className: 'img-circle', alt: 'User Image' })
                    ),
                    React.createElement(
                        'div',
                        { className: 'pull-left info' },
                        React.createElement(
                            'p',
                            null,
                            this.props.children.name
                        ),
                        React.createElement(
                            'a',
                            null,
                            React.createElement('i', { className: 'fa fa-circle text-success' }),
                            ' Online'
                        )
                    )
                ),
                React.createElement(
                    'form',
                    { action: '#', method: 'get', className: 'sidebar-form' },
                    React.createElement(
                        'div',
                        { className: 'input-group' },
                        React.createElement('input', { type: 'text', name: 'q', id: 'search', className: 'form-control', placeholder: 'Search...' }),
                        React.createElement(
                            'span',
                            { className: 'input-group-btn' },
                            React.createElement(
                                'button',
                                { type: 'submit', name: 'search', id: 'search-btn', className: 'btn btn-flat' },
                                React.createElement('i', { className: 'fa fa-search' })
                            )
                        )
                    )
                ),
                React.createElement(
                    'ul',
                    { className: 'sidebar-menu' },
                    React.createElement(
                        'li',
                        { className: 'header' },
                        'MAIN NAVIGATION'
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            Link,
                            { to: '/admin' },
                            React.createElement('i', { className: 'fa fa-dashboard' }),
                            ' ',
                            React.createElement(
                                'span',
                                null,
                                'Overview'
                            )
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            null,
                            React.createElement('i', { className: 'fa fa-envelope' }),
                            ' ',
                            React.createElement(
                                'span',
                                null,
                                'Mailbox'
                            ),
                            React.createElement(
                                'small',
                                { className: 'label pull-right bg-yellow' },
                                '12'
                            )
                        )
                    ),
                    React.createElement(
                        'li',
                        { className: 'header' },
                        'ORDER'
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            Link,
                            { to: '/admin/orders' },
                            React.createElement('i', { className: 'fa fa-file-text-o' }),
                            React.createElement(
                                'span',
                                null,
                                'Orders'
                            ),
                            React.createElement(
                                'span',
                                { className: 'label pull-right bg-red' },
                                '4'
                            )
                        )
                    ),
                    React.createElement(
                        'li',
                        { className: 'header' },
                        'PRODUCT'
                    ),
                    React.createElement(
                        'li',
                        { className: 'treeview' },
                        React.createElement(
                            'a',
                            null,
                            React.createElement('i', { className: 'fa fa-th' }),
                            ' ',
                            React.createElement(
                                'span',
                                null,
                                'Products'
                            )
                        ),
                        React.createElement(
                            'ul',
                            { className: 'treeview-menu' },
                            React.createElement(
                                'li',
                                null,
                                React.createElement(
                                    Link,
                                    { to: '/admin/viewproduct' },
                                    React.createElement('i', { className: 'fa fa-circle-o' }),
                                    ' View All Products'
                                )
                            ),
                            React.createElement(
                                'li',
                                null,
                                React.createElement(
                                    Link,
                                    { to: '/admin/newproduct' },
                                    React.createElement('i', { className: 'fa fa-circle-o text-red' }),
                                    ' Add New Product'
                                )
                            )
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            Link,
                            { to: '/admin/types' },
                            React.createElement('i', { className: 'fa fa-th' }),
                            ' ',
                            React.createElement(
                                'span',
                                null,
                                'Type'
                            )
                        )
                    )
                )
            )
        );
    }
});

var ContentHeader = React.createClass({
    displayName: 'ContentHeader',
    render: function render() {
        return React.createElement(
            'section',
            { className: 'content-header' },
            React.createElement(
                'h1',
                null,
                'Dashboard',
                React.createElement(
                    'small',
                    null,
                    'Version 2.0'
                )
            ),
            React.createElement(
                'ol',
                { className: 'breadcrumb' },
                React.createElement(
                    'li',
                    null,
                    React.createElement(
                        'a',
                        { href: '#' },
                        React.createElement('i', { className: 'fa fa-dashboard' }),
                        ' Home'
                    )
                ),
                React.createElement(
                    'li',
                    { className: this.props.children != null ? "" : "active" },
                    this.props.children == null ? "Dashboard" : React.createElement(
                        Link,
                        { to: '/admin' },
                        'Dashboard'
                    )
                ),
                this.props.children != null && React.createElement(
                    'li',
                    { className: 'active' },
                    this.props.children
                )
            )
        );
    }
});

var BoxUsers = React.createClass({
    displayName: 'BoxUsers',
    getInitialState: function getInitialState() {
        return { listUsers: [] };
    },
    render: function render() {
        var listUsers = _.take(this.props.children, 4);
        listUsers = _.orderBy(listUsers, ['createdDate', 'name'], ['desc', 'asc']);
        this.state.listUsers = listUsers;
        return React.createElement(
            'div',
            { className: 'box box-danger' },
            React.createElement(
                'div',
                { className: 'box-header with-border' },
                React.createElement(
                    'h3',
                    { className: 'box-title' },
                    'Latest Members'
                ),
                React.createElement(
                    'div',
                    { className: 'box-tools pull-right' },
                    React.createElement(
                        'span',
                        { className: 'label label-danger' },
                        this.props.children.length
                    ),
                    React.createElement(
                        'button',
                        { className: 'btn btn-box-tool', 'data-widget': 'collapse' },
                        React.createElement('i', { className: 'fa fa-minus' })
                    ),
                    React.createElement(
                        'button',
                        { className: 'btn btn-box-tool', 'data-widget': 'remove' },
                        React.createElement('i', { className: 'fa fa-times' })
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'box-body no-padding' },
                React.createElement(
                    'ul',
                    { className: 'users-list clearfix' },
                    this.state.listUsers.map(function (user, index) {
                        return React.createElement(
                            'li',
                            { key: index },
                            React.createElement('img', { src: user.avatarURL, alt: 'User Image' }),
                            React.createElement(
                                'a',
                                { className: 'users-list-name' },
                                user.name
                            ),
                            React.createElement(
                                'span',
                                { className: 'users-list-date' },
                                user.createdDate.split('T')[0]
                            )
                        );
                    }, this)
                )
            ),
            React.createElement(
                'div',
                { className: 'box-footer text-center' },
                React.createElement(
                    'a',
                    { className: 'uppercase' },
                    'View All Users'
                )
            )
        );
    }
});

var BoxProducts = React.createClass({
    displayName: 'BoxProducts',
    getInitialState: function getInitialState() {
        return { listProducts: [] };
    },
    render: function render() {
        var listProducts = _.take(this.props.children, 4);
        listProducts = _.orderBy(listProducts, ['createdDate', 'name'], ['desc', 'asc']);
        this.state.listProducts = listProducts;
        return React.createElement(
            'div',
            { className: 'box box-primary' },
            React.createElement(
                'div',
                { className: 'box-header with-border' },
                React.createElement(
                    'h3',
                    { className: 'box-title' },
                    'Recently Added Products'
                ),
                React.createElement(
                    'div',
                    { className: 'box-tools pull-right' },
                    React.createElement(
                        'button',
                        { className: 'btn btn-box-tool', 'data-widget': 'collapse' },
                        React.createElement('i', { className: 'fa fa-minus' })
                    ),
                    React.createElement(
                        'button',
                        { className: 'btn btn-box-tool', 'data-widget': 'remove' },
                        React.createElement('i', { className: 'fa fa-times' })
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'box-body' },
                React.createElement(
                    'ul',
                    { className: 'products-list product-list-in-box' },
                    this.state.listProducts.map(function (product, index) {
                        return React.createElement(
                            'li',
                            { key: index, className: 'item' },
                            React.createElement(
                                'div',
                                { className: 'product-img' },
                                React.createElement('img', { src: product.itemMetas[0].metaValue, alt: 'Product Image' })
                            ),
                            React.createElement(
                                'div',
                                { className: 'product-info' },
                                React.createElement(
                                    Link,
                                    { to: "product/" + product._id, className: 'product-title' },
                                    product.name,
                                    ' ',
                                    React.createElement(
                                        'span',
                                        { className: 'label label-warning pull-right' },
                                        product.type
                                    )
                                ),
                                React.createElement(
                                    'span',
                                    { className: 'product-description' },
                                    format(product.price)
                                )
                            )
                        );
                    }, this)
                )
            ),
            React.createElement(
                'div',
                { className: 'box-footer text-center' },
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-md-12' },
                        React.createElement(
                            Link,
                            { to: '/admin/viewproduct', className: 'uppercase' },
                            'View All Products'
                        )
                    )
                )
            )
        );
    }
});

var BoxOrders = React.createClass({
    displayName: 'BoxOrders',
    getInitialState: function getInitialState() {
        return {
            orders: []
        };
    },
    render: function render() {
        var orders = _.take(this.props.children, 4);
        orders = _.orderBy(orders, ['createdDate', 'name'], ['desc', 'asc']);
        this.state.orders = orders;
        return React.createElement(
            'div',
            { className: 'box box-info' },
            React.createElement(
                'div',
                { className: 'box-header with-border' },
                React.createElement(
                    'h3',
                    { className: 'box-title' },
                    'Latest Orders'
                ),
                React.createElement(
                    'div',
                    { className: 'box-tools pull-right' },
                    React.createElement(
                        'button',
                        { className: 'btn btn-box-tool', 'data-widget': 'collapse' },
                        React.createElement('i', { className: 'fa fa-minus' })
                    ),
                    React.createElement(
                        'button',
                        { className: 'btn btn-box-tool', 'data-widget': 'remove' },
                        React.createElement('i', { className: 'fa fa-times' })
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'box-body' },
                React.createElement(
                    'div',
                    { className: 'table-responsive' },
                    React.createElement(
                        'table',
                        { className: 'table no-margin' },
                        React.createElement(
                            'thead',
                            null,
                            React.createElement(
                                'tr',
                                null,
                                React.createElement(
                                    'th',
                                    null,
                                    'ID'
                                ),
                                React.createElement(
                                    'th',
                                    { className: 'text-center' },
                                    'Owner'
                                ),
                                React.createElement(
                                    'th',
                                    { className: 'text-center' },
                                    'Created Date'
                                ),
                                React.createElement(
                                    'th',
                                    { className: 'text-center' },
                                    'Status'
                                ),
                                React.createElement(
                                    'th',
                                    { className: 'text-right' },
                                    'Total Price'
                                )
                            )
                        ),
                        React.createElement(
                            'tbody',
                            null,
                            this.state.orders.map(function (order, index) {
                                return React.createElement(
                                    'tr',
                                    { key: index },
                                    React.createElement(
                                        'td',
                                        null,
                                        order._id
                                    ),
                                    React.createElement(
                                        'td',
                                        { className: 'text-center' },
                                        order.owner.email
                                    ),
                                    React.createElement(
                                        'td',
                                        { className: 'text-center' },
                                        order.createdDate.split('T')[0]
                                    ),
                                    React.createElement(
                                        'td',
                                        { className: 'text-center' },
                                        order.status
                                    ),
                                    React.createElement(
                                        'td',
                                        { className: 'text-right' },
                                        format(order.total)
                                    )
                                );
                            }, this)
                        )
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'box-footer text-center' },
                React.createElement(
                    Link,
                    { to: '/admin/orders', className: 'uppercase' },
                    'View All Orders'
                )
            )
        );
    }
});

//var GraphOrders = React.createClass({
//    render() {
//        return ( 
//                <LineChart data={this.props.children}/>
//            );
//      }
//});

var chartOptions = {
    title: {
        fontSize: 28,
        fullWidth: true,
        display: true,
        text: 'REPORT CHART'
    },
    tooltips: {
        enabled: true,
        intersect: true,
        mode: 'index',
        callbacks: {
            label: function label(tooltipItem, data) {
                if (tooltipItem.datasetIndex == 0) {
                    return format(tooltipItem.yLabel);
                } else {
                    return tooltipItem.yLabel;
                }
            }
        }
    },
    scales: {
        yAxes: [{
            position: "left",
            "id": "y-axis-0"
        }, {
            position: "right",
            "id": "y-axis-1",
            gridLines: {
                display: false
            },
            ticks: {
                beginAtZero: true,
                callback: function callback(value, index, values) {
                    return format(value);
                }
            }
        }]
    },
    responsive: true
};

var SvHome = React.createClass({
    displayName: 'SvHome',
    getInitialState: function getInitialState() {
        return {
            listUsers: [],
            listOrders: [],
            listProducts: [],
            reportOrders: {
                labels: [],
                datasets: []
            }
        };
    },
    render: function render() {
        return React.createElement(
            'div',
            null,
            React.createElement(ContentHeader, null),
            React.createElement(
                'section',
                { className: 'content' },
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-md-3 col-sm-6 col-xs-12' },
                        React.createElement(
                            'div',
                            { className: 'info-box' },
                            React.createElement(
                                'span',
                                { className: 'info-box-icon bg-aqua' },
                                React.createElement('i', { className: 'fa fa-envelope-o' })
                            ),
                            React.createElement(
                                'div',
                                { className: 'info-box-content' },
                                React.createElement(
                                    'span',
                                    { className: 'info-box-text' },
                                    'Feedbacks'
                                ),
                                React.createElement(
                                    'span',
                                    { className: 'info-box-number' },
                                    '90'
                                )
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-md-3 col-sm-6 col-xs-12' },
                        React.createElement(
                            'div',
                            { className: 'info-box' },
                            React.createElement(
                                'span',
                                { className: 'info-box-icon bg-red' },
                                React.createElement('i', { className: 'fa fa-file-text-o' })
                            ),
                            React.createElement(
                                'div',
                                { className: 'info-box-content' },
                                React.createElement(
                                    'span',
                                    { className: 'info-box-text' },
                                    'Orders'
                                ),
                                React.createElement(
                                    'span',
                                    { className: 'info-box-number' },
                                    this.state.listOrders.length
                                )
                            )
                        )
                    ),
                    React.createElement('div', { className: 'clearfix visible-sm-block' }),
                    React.createElement(
                        'div',
                        { className: 'col-md-3 col-sm-6 col-xs-12' },
                        React.createElement(
                            'div',
                            { className: 'info-box' },
                            React.createElement(
                                'span',
                                { className: 'info-box-icon bg-green' },
                                React.createElement('i', { className: 'fa fa-shopping-cart' })
                            ),
                            React.createElement(
                                'div',
                                { className: 'info-box-content' },
                                React.createElement(
                                    'span',
                                    { className: 'info-box-text' },
                                    'Products'
                                ),
                                React.createElement(
                                    'span',
                                    { className: 'info-box-number' },
                                    this.state.listProducts.length
                                )
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-md-3 col-sm-6 col-xs-12' },
                        React.createElement(
                            'div',
                            { className: 'info-box' },
                            React.createElement(
                                'span',
                                { className: 'info-box-icon bg-yellow' },
                                React.createElement('i', { className: 'ion ion-ios-people-outline' })
                            ),
                            React.createElement(
                                'div',
                                { className: 'info-box-content' },
                                React.createElement(
                                    'span',
                                    { className: 'info-box-text' },
                                    'Members'
                                ),
                                React.createElement(
                                    'span',
                                    { className: 'info-box-number' },
                                    this.state.listUsers.length
                                )
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-md-12 col-sm-12 col-xs-12 text-center', style: { padding: 100 + 'px' } },
                        React.createElement(LineChart, { options: chartOptions, data: this.state.reportOrders, redraw: true })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-md-8' },
                        React.createElement(
                            BoxOrders,
                            null,
                            this.state.listOrders
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-md-4' },
                        React.createElement(
                            BoxProducts,
                            null,
                            this.state.listProducts
                        ),
                        React.createElement(
                            BoxUsers,
                            null,
                            this.state.listUsers
                        )
                    )
                )
            )
        );
    },
    componentDidMount: function componentDidMount() {
        var that = this;
        $.get("/api/users").done(function (data) {
            that.state.listUsers = data;
            that.setState(that.state);
        }).fail(function (xhr, status, err) {
            alert(xhr.responseJSON.message);
        });
        $.get("/api/items").done(function (data) {
            that.state.listProducts = data;
            that.setState(that.state);
        }).fail(function (xhr, status, err) {
            alert(xhr.responseJSON.message);
        });
        getOrders(function (data) {
            that.state.listOrders = data;
            that.setState(that.state);
        });
        getReports(function (data) {
            that.state.reportOrders = formatRpOrders(data);
            console.log(that.state.reportOrders);
            that.setState(that.state);
        });
    }
});

var NewProduct = React.createClass({
    displayName: 'NewProduct',
    getInitialState: function getInitialState() {
        return {
            listGender: ["Men", "Women", "Couple"],
            listCates: [],
            listTypes: [],
            imgs: ["img0"],
            detail: ["detail0"],
            count: 1
        };
    },
    componentDidMount: function componentDidMount() {
        var that = this;
        getTypes(function (data) {
            if (data.length > 0) {
                that.state.listTypes = data;
                that.state.listCates = that.state.listTypes[0].categories;
                that.setState(that.state);
            } else {
                return;
            }
        });
    },
    changeOpt: function changeOpt(event) {
        this.state.listCates = this.state.listTypes[event.target.value].categories;
        this.setState(this.state);
    },
    removeImg: function removeImg(index) {
        this.state.imgs.splice(index, 1);
        this.setState(this.state);
    },
    changeImg: function changeImg(index) {
        var id = this.state.imgs[index];
        $('#input' + id);
        if ($('#input' + id)[0].files.length > 0) {
            var newImg = URL.createObjectURL($('#input' + id)[0].files[0]);
            $("#" + id).attr("src", newImg);
        } else {
            $("#" + id).attr("src", "");
        }
    },
    addImg: function addImg() {
        this.state.imgs.push("img" + this.state.count);
        this.state.count++;
        this.setState(this.state);
    },
    removeDetail: function removeDetail(index) {
        this.state.detail.splice(index, 1);
        this.setState(this.state);
    },
    addDetail: function addDetail() {
        this.state.detail.push("detail" + this.state.count);
        this.state.count++;
        this.setState(this.state);
    },
    reset: function reset() {
        $(this.refs.name).removeClass("has-error");
        $(this.refs.brand).removeClass("has-error");
        $(this.refs.color).removeClass("has-error");
        $(this.refs.price).removeClass("has-error");
        $(this.refs.discount).removeClass("has-error");
    },
    checkImgs: function checkImgs() {
        for (var i = 0; i < this.state.imgs.length; i++) {
            var id = this.state.imgs[i];
            if ($("#input" + id)[0].files.length <= 0) {
                this.state.imgs.splice(i, 1);
                i--;
            }
        }
        this.setState(this.state);
        if (this.state.imgs.length > 0) {
            return true;
        }
        return false;
    },
    checkDetail: function checkDetail() {
        for (var i = 0; i < this.state.detail.length; i++) {
            var id = this.state.detail[i];
            var size = $("#size" + id).val();
            var qtt = $("#qtt" + id).val();
            if (!checkText(size) || !checkNumber(qtt)) {
                this.state.detail.splice(i, 1);
                i--;
            }
        }
        this.setState(this.state);
        if (this.state.detail.length > 0) {
            return true;
        }
        return false;
    },
    checkValid: function checkValid() {
        var name = this.refs.name.value;
        var brand = this.refs.brand.value;
        var color = this.refs.color.value;
        var price = this.refs.price.value;
        var discount = this.refs.discount.value;
        if (!checkText(name)) {
            $(this.refs.name).addClass("has-error");
            $(this.refs.name)[0].scrollIntoView();
        } else if (!checkText(brand)) {
            $(this.refs.brand).addClass("has-error");
            $(this.refs.brand)[0].scrollIntoView();
        } else if (!checkText(color)) {
            $(this.refs.color).addClass("has-error");
            $(this.refs.color)[0].scrollIntoView();
        } else if (!checkNumber(price)) {
            $(this.refs.price).addClass("has-error");
            $(this.refs.price)[0].scrollIntoView();
        } else if (!checkNumber(discount)) {
            $(this.refs.discount).addClass("has-error");
            $(this.refs.discount)[0].scrollIntoView();
        } else if (!this.checkImgs()) {
            alert("Must have at least 1 image!");
        } else if (!this.checkDetail()) {
            alert("Must have at least 1 size!");
        } else {
            return true;
        }
        return false;
    },
    newInfo: function newInfo() {
        var product = {
            name: this.refs.name.value,
            brand: this.refs.brand.value,
            color: this.refs.color.value,
            price: parseInt(this.refs.price.value),
            discount: parseInt(this.refs.discount.value),
            gender: this.refs.gender.value,
            category: this.refs.category.value,
            type: this.state.listTypes[this.refs.type.value].name,
            description: this.refs.description.value,
            itemDetails: [],
            itemMetas: []
        };
        for (var i = 0; i < this.state.detail.length; i++) {
            var id = this.state.detail[i];
            var newDetail = { size: $("#size" + id).val(), quantity: parseInt($("#qtt" + id).val()) };
            product.itemDetails.push(newDetail);
        }
        return product;
    },
    sendInfo: function sendInfo() {
        var product = this.newInfo();
        var files = [];
        var id;
        var formData = new FormData();
        for (var i = 0; i < this.state.imgs.length; i++) {
            id = this.state.imgs[i];
            var file = $('#input' + id)[0].files[0];
            if (!file.type.match('image.*')) {
                continue;
            }
            formData.append('imgs', file, file.name);
        }
        formData.append('item', JSON.stringify(product));
        var xhr = new XMLHttpRequest();
        // Open the connection.
        xhr.open('POST', '/api/items', true);
        xhr.setRequestHeader("Authorization", 'Bearer ' + Cookies.get("token"));
        // Set up a handler for when the request finishes.
        var that = this;
        xhr.onload = function () {
            if (xhr.status === 201) {
                window.stop();
                alert("Added New Product!");
                that.setState(that.getInitialState());
            } else {
                console.log(JSON.parse(xhr.response));
                window.stop();
                alert("FAIL!");
            }
        };
        xhr.send(formData);
    },
    submit: function submit(event) {
        event.preventDefault();
        this.reset();
        if (this.checkValid()) {
            this.sendInfo();
        } else {
            return;
        }
    },
    render: function render() {
        return React.createElement(
            'div',
            { className: 'full-height' },
            React.createElement(
                ContentHeader,
                null,
                'Add New Product'
            ),
            React.createElement(
                'section',
                { className: 'content' },
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-xs-12' },
                        React.createElement(
                            'div',
                            { className: 'box' },
                            React.createElement(
                                'div',
                                { className: 'box-header' },
                                React.createElement(
                                    'h3',
                                    { className: 'box-title' },
                                    'Add New Product'
                                )
                            ),
                            React.createElement(
                                'div',
                                { id: true, className: 'box-body' },
                                React.createElement(
                                    'form',
                                    { onSubmit: this.submit, method: 'post', className: 'form-horizontal', role: 'form' },
                                    React.createElement(
                                        'div',
                                        { className: 'form-group hide' },
                                        React.createElement(
                                            'label',
                                            { className: 'col-sm-2 control-label' },
                                            'ID '
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-5' },
                                            React.createElement('input', { className: 'form-control', type: 'text', disabled: true })
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement(
                                            'label',
                                            { className: 'col-sm-3 control-label' },
                                            'Gender '
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-6' },
                                            React.createElement(
                                                'select',
                                                { className: 'form-control', ref: 'gender' },
                                                this.state.listGender.map(function (gender, index) {
                                                    return React.createElement(
                                                        'option',
                                                        { key: index, value: gender },
                                                        gender
                                                    );
                                                }, this)
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement(
                                            'label',
                                            { className: 'col-sm-3 control-label' },
                                            'Type '
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-6' },
                                            React.createElement(
                                                'select',
                                                { className: 'form-control', ref: 'type', onChange: this.changeOpt },
                                                this.state.listTypes.map(function (type, index) {
                                                    return React.createElement(
                                                        'option',
                                                        { key: index, value: index },
                                                        type.name
                                                    );
                                                }, this)
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement(
                                            'label',
                                            { className: 'col-sm-3 control-label' },
                                            'Category '
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-6' },
                                            React.createElement(
                                                'select',
                                                { className: 'form-control', ref: 'category' },
                                                this.state.listCates.map(function (cate, index) {
                                                    return React.createElement(
                                                        'option',
                                                        { key: index, value: cate },
                                                        cate
                                                    );
                                                }, this)
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement(
                                            'label',
                                            { className: 'col-sm-3 control-label' },
                                            'Name '
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-6' },
                                            React.createElement('input', { ref: 'name', className: 'form-control', type: 'text' })
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement(
                                            'label',
                                            { className: 'col-sm-3 control-label' },
                                            'Brand '
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-6' },
                                            React.createElement('input', { ref: 'brand', className: 'form-control', type: 'text' })
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement(
                                            'label',
                                            { className: 'col-sm-3 control-label' },
                                            'Color '
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-6' },
                                            React.createElement('input', { ref: 'color', className: 'form-control', type: 'text' })
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement(
                                            'label',
                                            { className: 'col-sm-3 control-label' },
                                            'Price '
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-6' },
                                            React.createElement('input', { ref: 'price', className: 'form-control', type: 'number', min: 0 })
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement(
                                            'label',
                                            { className: 'col-sm-3 control-label' },
                                            'Discount '
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-6' },
                                            React.createElement('input', { ref: 'discount', className: 'form-control', type: 'number', defaultValue: 0, min: 0 })
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement(
                                            'label',
                                            { className: 'col-sm-3 control-label' },
                                            'Description '
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-6' },
                                            React.createElement('textarea', { ref: 'description', rows: 5, className: 'form-control', type: 'text' })
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-3' },
                                            ' '
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-6' },
                                            React.createElement(
                                                'a',
                                                { 'data-toggle': 'collapse', 'data-target': '#imgChart', className: 'btn btn-default col-sm-12 col-xs-12' },
                                                'IMAGE TABLE'
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-3' },
                                            ' '
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-6' },
                                            React.createElement(
                                                'div',
                                                { id: 'imgChart', className: 'collapse table-responsive' },
                                                React.createElement(
                                                    'table',
                                                    { className: 'table table-bordered table-striped' },
                                                    React.createElement(
                                                        'thead',
                                                        null,
                                                        React.createElement(
                                                            'tr',
                                                            null,
                                                            React.createElement(
                                                                'th',
                                                                { colSpan: '3', className: 'text-center' },
                                                                'IMG CHART'
                                                            )
                                                        ),
                                                        React.createElement(
                                                            'tr',
                                                            null,
                                                            React.createElement(
                                                                'th',
                                                                null,
                                                                'Choose File'
                                                            ),
                                                            React.createElement(
                                                                'th',
                                                                null,
                                                                'Preview'
                                                            ),
                                                            React.createElement('th', null)
                                                        )
                                                    ),
                                                    React.createElement(
                                                        'tbody',
                                                        null,
                                                        this.state.imgs.map(function (id, index) {
                                                            var _this3 = this;

                                                            return React.createElement(
                                                                'tr',
                                                                { key: id },
                                                                React.createElement(
                                                                    'td',
                                                                    null,
                                                                    React.createElement('input', { onChange: function onChange() {
                                                                            return _this3.changeImg(index);
                                                                        }, id: "input" + id, className: 'form-control', accept: 'image/*', type: 'file' })
                                                                ),
                                                                React.createElement(
                                                                    'td',
                                                                    null,
                                                                    React.createElement('img', { className: 'img-responsive preview', id: id })
                                                                ),
                                                                React.createElement(
                                                                    'td',
                                                                    { className: 'text-right' },
                                                                    React.createElement(
                                                                        'a',
                                                                        { className: 'btn btn-danger', onClick: function onClick() {
                                                                                return _this3.removeImg(index);
                                                                            } },
                                                                        'X'
                                                                    )
                                                                )
                                                            );
                                                        }, this)
                                                    ),
                                                    React.createElement(
                                                        'tfoot',
                                                        null,
                                                        React.createElement(
                                                            'tr',
                                                            null,
                                                            React.createElement(
                                                                'td',
                                                                { colSpan: '3' },
                                                                React.createElement(
                                                                    'div',
                                                                    { className: 'col-sm-3' },
                                                                    ' '
                                                                ),
                                                                React.createElement(
                                                                    'a',
                                                                    { className: 'btn btn-success col-sm-6 col-xs-12', onClick: this.addImg },
                                                                    'Add'
                                                                )
                                                            )
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-3' },
                                            ' '
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-6' },
                                            React.createElement(
                                                'a',
                                                { 'data-toggle': 'collapse', 'data-target': '#sizeChart', className: 'btn btn-default col-sm-12 col-xs-12' },
                                                'SIZE CHARTS'
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-3' },
                                            ' '
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-6' },
                                            React.createElement(
                                                'div',
                                                { id: 'sizeChart', className: 'collapse table-responsive' },
                                                React.createElement(
                                                    'table',
                                                    { className: 'table table-bordered table-striped' },
                                                    React.createElement(
                                                        'thead',
                                                        null,
                                                        React.createElement(
                                                            'tr',
                                                            null,
                                                            React.createElement(
                                                                'th',
                                                                { colSpan: '3', className: 'text-center' },
                                                                'SIZES CHART'
                                                            )
                                                        ),
                                                        React.createElement(
                                                            'tr',
                                                            null,
                                                            React.createElement(
                                                                'th',
                                                                null,
                                                                'Size'
                                                            ),
                                                            React.createElement(
                                                                'th',
                                                                null,
                                                                'Quantity'
                                                            ),
                                                            React.createElement('th', null)
                                                        )
                                                    ),
                                                    React.createElement(
                                                        'tbody',
                                                        null,
                                                        this.state.detail.map(function (id, index) {
                                                            var _this4 = this;

                                                            return React.createElement(
                                                                'tr',
                                                                { key: id },
                                                                React.createElement(
                                                                    'td',
                                                                    null,
                                                                    React.createElement('input', { className: 'form-control', type: 'text', id: "size" + id })
                                                                ),
                                                                React.createElement(
                                                                    'td',
                                                                    null,
                                                                    React.createElement('input', { className: 'form-control', type: 'number', id: "qtt" + id, min: 1 })
                                                                ),
                                                                React.createElement(
                                                                    'td',
                                                                    { className: 'text-right' },
                                                                    React.createElement(
                                                                        'a',
                                                                        { className: 'btn btn-danger', onClick: function onClick() {
                                                                                return _this4.removeDetail(index);
                                                                            } },
                                                                        'X'
                                                                    )
                                                                )
                                                            );
                                                        }, this)
                                                    ),
                                                    React.createElement(
                                                        'tfoot',
                                                        null,
                                                        React.createElement(
                                                            'tr',
                                                            null,
                                                            React.createElement(
                                                                'td',
                                                                { colSpan: '3' },
                                                                React.createElement(
                                                                    'div',
                                                                    { className: 'col-sm-3' },
                                                                    ' '
                                                                ),
                                                                React.createElement(
                                                                    'a',
                                                                    { className: 'btn btn-success col-sm-6 col-xs-12', onClick: this.addDetail },
                                                                    'Add'
                                                                )
                                                            )
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'form-group' },
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-3' },
                                            ' '
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'col-sm-6' },
                                            React.createElement(
                                                'button',
                                                { type: 'submit', className: 'btn btn-primary col-sm-12' },
                                                'Finish'
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
    }
});

function imageFormatter(value) {
    console.log("test");
    console.log(value);
    return '<img src="' + value + '" />';
}

var ViewProduct = React.createClass({
    displayName: 'ViewProduct',
    getInitialState: function getInitialState() {
        return { listProducts: [], detail: [] };
    },
    render: function render() {
        return React.createElement(
            'div',
            { className: 'full-height' },
            React.createElement(
                ContentHeader,
                null,
                'View Products'
            ),
            React.createElement(
                'section',
                { className: 'content' },
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-xs-12' },
                        React.createElement(
                            'div',
                            { className: 'box' },
                            React.createElement(
                                'div',
                                { className: 'box-header' },
                                React.createElement(
                                    'h3',
                                    { className: 'box-title' },
                                    'View Products'
                                )
                            ),
                            React.createElement(
                                'div',
                                { id: true, className: 'box-body' },
                                React.createElement(
                                    'table',
                                    { id: 'product-table', 'data-locale': 'en-US', 'data-sort-name': 'status', 'data-sort-order': 'asc', 'data-pagination': 'true', 'data-search': 'true' },
                                    React.createElement(
                                        'thead',
                                        null,
                                        React.createElement(
                                            'tr',
                                            null,
                                            React.createElement(
                                                'th',
                                                { 'data-field': 'preview', 'data-formatter': 'imageFormatter' },
                                                'Preview'
                                            ),
                                            React.createElement(
                                                'th',
                                                { 'data-field': 'name', 'data-sortable': 'true' },
                                                'Name'
                                            ),
                                            React.createElement(
                                                'th',
                                                { 'data-field': 'gender', 'data-sortable': 'true' },
                                                'Gender'
                                            ),
                                            React.createElement(
                                                'th',
                                                { 'data-field': 'type', 'data-sortable': 'true' },
                                                'Type'
                                            ),
                                            React.createElement(
                                                'th',
                                                { 'data-field': 'category', 'data-sortable': 'true' },
                                                'Category'
                                            ),
                                            React.createElement(
                                                'th',
                                                { 'data-field': 'brand', 'data-sortable': 'true' },
                                                'Brand'
                                            ),
                                            React.createElement(
                                                'th',
                                                { 'data-field': 'color', 'data-sortable': 'true' },
                                                'Color'
                                            ),
                                            React.createElement(
                                                'th',
                                                { 'data-field': 'price', 'data-sortable': 'true' },
                                                'Price'
                                            ),
                                            React.createElement(
                                                'th',
                                                { 'data-field': 'discount', 'data-sortable': 'true' },
                                                'Discount'
                                            )
                                        )
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'modal fade', id: 'modalTable', tabIndex: '-1', role: 'dialog' },
                                    React.createElement(
                                        'div',
                                        { className: 'modal-dialog' },
                                        React.createElement(
                                            'div',
                                            { className: 'modal-content' },
                                            React.createElement(
                                                'div',
                                                { className: 'modal-header' },
                                                React.createElement(
                                                    'button',
                                                    { type: 'button', className: 'close', 'data-dismiss': 'modal' },
                                                    React.createElement(
                                                        'span',
                                                        { 'aria-hidden': 'true' },
                                                        '\xD7'
                                                    )
                                                ),
                                                React.createElement(
                                                    'h4',
                                                    { className: 'modal-title' },
                                                    'Modal table'
                                                )
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'modal-body' },
                                                React.createElement(
                                                    'table',
                                                    { id: 'detail-table',
                                                        'data-locale': 'en-US',
                                                        'data-height': '299' },
                                                    React.createElement(
                                                        'thead',
                                                        null,
                                                        React.createElement(
                                                            'tr',
                                                            null,
                                                            React.createElement(
                                                                'th',
                                                                { 'data-field': 'size' },
                                                                'Size'
                                                            ),
                                                            React.createElement(
                                                                'th',
                                                                { 'data-field': 'quantity' },
                                                                'Quantity'
                                                            )
                                                        )
                                                    )
                                                )
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'modal-footer' },
                                                React.createElement(
                                                    'button',
                                                    { type: 'button', className: 'btn btn-default', 'data-dismiss': 'modal' },
                                                    'Close'
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
    },
    componentDidMount: function componentDidMount() {
        var that = this;
        $.get("/api/items").done(function (data) {
            console.log(data);
            that.state.listProducts = formatProducts(data);
            that.setState(that.state);
            $('#product-table').bootstrapTable({
                data: that.state.listProducts,
                columns: [{
                    title: 'Preview',
                    field: 'preview',
                    align: 'center',
                    valign: 'middle',
                    searchable: 'false',
                    formatter: imageFormatter
                }]
            });

            $('#detail-table').bootstrapTable({
                data: that.state.detail
            });

            var windowSize = $(window).width();
            if (windowSize < 768) {
                $('#product-table').bootstrapTable('toggleView');
            }
            $('#product-table').on('click-row.bs.table', function (e, row, $element) {
                that.state.detail = row.itemDetails;
                that.setState(that.state);
                $('#modalTable').modal();
            });
            $('#modalTable').on('shown.bs.modal', function () {
                $('#detail-table').bootstrapTable('load', that.state.detail);
            });
        }).fail(function (xhr, status, err) {
            alert(xhr.responseJSON.message);
        });
    }
});

var TypesPage = React.createClass({
    displayName: 'TypesPage',
    changeOpt: function changeOpt(event) {
        this.state.cates = this.state.types[event.target.value].categories;
        this.setState(this.state);
    },
    openModal: function openModal(mode) {
        this.state.mode = mode;
        this.setState(this.state);
    },
    checkValid: function checkValid(text) {
        if (text === null || text.trim().length === 0) {
            return false;
        }
        if (this.state.mode === "type") {
            if (_.find(this.state.types, function (o) {
                return o.name === text;
            })) {
                alert(text + " has been existed!");
                return false;
            } else {
                return true;
            }
        } else {
            if (_.find(this.state.cates, text)) {
                alert(text + " has been existed!");
                return false;
            } else {
                return true;
            }
        }
    },
    addChange: function addChange() {
        if (this.state.mode === "type") {
            if (this.checkValid(this.refs.newType.value)) {
                var newType = { name: this.refs.newType.value, categories: [] };
                var that = this;
                addNewType(newType, function (data) {
                    that.state.types.push(data);
                    that.setState(that.state);
                    alert("Added New Type!");
                });
            }
        } else {
            if (this.checkValid(this.refs.newCate.value)) {
                var index = this.refs.type.value;
                var type = JSON.parse(JSON.stringify(this.state.types[index]));
                type.categories.push(this.refs.newCate.value);
                var that = this;
                updateType(type, function (data) {
                    that.state.types[index] = data;
                    that.state.cates = data.categories;
                    that.setState(that.state);
                    alert("Added New Category!");
                });
            }
        }
        return;
    },
    getInitialState: function getInitialState() {
        return {
            types: [],
            cates: []
        };
    },
    componentDidMount: function componentDidMount() {
        var that = this;
        getTypes(function (data) {
            if (data.length > 0) {
                that.state.types = data;
                that.state.cates = that.state.types[0].categories;
                that.setState(that.state);
            } else {
                return;
            }
        });
    },
    render: function render() {
        var _this5 = this;

        return React.createElement(
            'div',
            { className: 'full-height' },
            React.createElement(
                ContentHeader,
                null,
                'Manage Type'
            ),
            React.createElement(
                'section',
                { className: 'content' },
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-xs-12' },
                        React.createElement(
                            'div',
                            { className: 'box' },
                            React.createElement(
                                'div',
                                { className: 'box-header' },
                                React.createElement(
                                    'h3',
                                    { className: 'box-title' },
                                    'Manage Types'
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'box-body' },
                                React.createElement(
                                    'div',
                                    { className: 'row' },
                                    this.state.types.length > 0 ? React.createElement(
                                        'div',
                                        { className: 'col-md-offset-4 col-md-4' },
                                        React.createElement(
                                            'label',
                                            null,
                                            'Type'
                                        ),
                                        React.createElement(
                                            'select',
                                            { ref: 'type', onChange: this.changeOpt, className: 'form-control' },
                                            this.state.types.map(function (type, index) {
                                                return React.createElement(
                                                    'option',
                                                    { key: index, value: index },
                                                    type.name
                                                );
                                            }, this)
                                        ),
                                        React.createElement('br', null),
                                        React.createElement(
                                            'label',
                                            null,
                                            'Categories'
                                        ),
                                        React.createElement(
                                            'ul',
                                            { className: 'list-types' },
                                            this.state.cates.map(function (cate, index) {
                                                return React.createElement(
                                                    'li',
                                                    { key: index },
                                                    cate
                                                );
                                            }, this)
                                        )
                                    ) : React.createElement(
                                        'h3',
                                        { className: 'text-center' },
                                        'Don\'t have any types. Please add new Type first!'
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'row' },
                                    React.createElement(
                                        'div',
                                        { className: 'col-md-offset-4 col-md-4' },
                                        React.createElement(
                                            'button',
                                            { 'data-toggle': 'modal', 'data-target': '#addModal', className: 'btn btn-primary col-sm-12 col-xs-12', onClick: function onClick() {
                                                    return _this5.openModal("type");
                                                } },
                                            "ADD NEW TYPE"
                                        ),
                                        this.state.types.length > 0 && React.createElement(
                                            'button',
                                            { 'data-toggle': 'modal', 'data-target': '#addModal', className: 'btn btn-warning col-sm-12 col-xs-12', onClick: function onClick() {
                                                    return _this5.openModal("cate");
                                                } },
                                            'ADD CATEGORY'
                                        ),
                                        React.createElement(
                                            'div',
                                            { id: 'addModal', className: 'modal fade', role: 'dialog' },
                                            React.createElement(
                                                'div',
                                                { className: 'modal-dialog modal-sm' },
                                                React.createElement(
                                                    'div',
                                                    { className: 'modal-content' },
                                                    React.createElement(
                                                        'div',
                                                        { className: 'modal-header' },
                                                        React.createElement(
                                                            'button',
                                                            { type: 'button', className: 'close', 'data-dismiss': 'modal' },
                                                            '\xD7'
                                                        ),
                                                        this.state.mode === "type" ? React.createElement(
                                                            'h4',
                                                            { className: 'modal-title' },
                                                            'Add New Type'
                                                        ) : React.createElement(
                                                            'h4',
                                                            { className: 'modal-title' },
                                                            'Add New Category'
                                                        )
                                                    ),
                                                    React.createElement(
                                                        'div',
                                                        { className: 'modal-body text-center' },
                                                        this.state.mode === "type" ? React.createElement('input', { type: 'text', ref: 'newType', className: 'col-md-offset-1 col-md-10', placeholder: 'Type Name' }) : React.createElement('input', { type: 'text', ref: 'newCate', className: 'col-md-offset-1 col-md-10', placeholder: 'Category Name' })
                                                    ),
                                                    React.createElement(
                                                        'div',
                                                        { className: 'modal-footer' },
                                                        React.createElement(
                                                            'button',
                                                            { type: 'button', className: 'btn btn-default', 'data-dismiss': 'modal' },
                                                            'Close'
                                                        ),
                                                        React.createElement(
                                                            'button',
                                                            { type: 'button', onClick: this.addChange, className: 'btn btn-primary', 'data-dismiss': 'modal' },
                                                            'Add'
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
    }
});

var Table = React.createClass({
    displayName: 'Table',
    getInitialState: function getInitialState() {
        console.log("right");
        return {
            orders: formatOrders(this.props.children)
        };
    },
    componentDidMount: function componentDidMount() {
        $('#table').bootstrapTable({
            data: this.state.orders
        });
        var windowSize = $(window).width();
        if (windowSize < 768) {
            $('#table').bootstrapTable('toggleView');
        }
        var that = this;
        $('#table').on('click-row.bs.table', function (e, row, $element) {
            that.props.showModal(row);
        });
    },
    componentDidUpdate: function componentDidUpdate() {
        this.state.orders = formatOrders(this.state.orders);
        console.log("update");
        //        console.log(this.state.orders);
        //        for (var i = 0; i < this.state.orders.length; i++) {
        //            $('#table').bootstrapTable('updateRow', {index: i, row: this.state.orders[i]});
        //        }
        $('#table').bootstrapTable("load", {
            data: this.state.orders
        });
        //        var windowSize = $(window).width();
        //        if(windowSize < 768){
        //            $('#table').bootstrapTable('toggleView');
        //        }
        //        var that = this;
        //        $('#table').on('click-row.bs.table', function (e, row, $element) {
        //            that.props.showModal(row);
        //        })
    },
    render: function render() {
        return React.createElement(
            'table',
            { id: 'table', 'data-locale': 'en-US', 'data-sort-name': 'status', 'data-sort-order': 'asc', 'data-pagination': 'true', 'data-search': 'true' },
            React.createElement(
                'thead',
                null,
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'th',
                        { 'data-field': '_id', 'data-sortable': 'true' },
                        'ID'
                    ),
                    React.createElement(
                        'th',
                        { 'data-field': 'receiver', 'data-sortable': 'true' },
                        'Receiver'
                    ),
                    React.createElement(
                        'th',
                        { 'data-field': 'phone', 'data-sortable': 'true' },
                        'Phone'
                    ),
                    React.createElement(
                        'th',
                        { 'data-field': 'createdDate', 'data-sortable': 'true' },
                        'Created Date'
                    ),
                    React.createElement(
                        'th',
                        { 'data-field': 'updatedDate', 'data-sortable': 'true' },
                        'Finished Date'
                    ),
                    React.createElement(
                        'th',
                        { 'data-field': 'status', 'data-sortable': 'true' },
                        'Status'
                    ),
                    React.createElement(
                        'th',
                        { 'data-field': 'total', 'data-sortable': 'true' },
                        'Total'
                    )
                )
            )
        );
    }
});

var OrdersPage = React.createClass({
    displayName: 'OrdersPage',
    showModal: function showModal(order) {
        this.state.crnOrder = order;
        this.setState(this.state);
        $("#orderModal").modal();
    },
    componentDidMount: function componentDidMount() {
        var that = this;
        getOrders(function (data) {
            that.state.orders = data;
            that.setState(that.state);
            //            data = formatOrders(data);
            //            $('#table').bootstrapTable({
            //                data: data
            //            });
            //            var windowSize = $(window).width();
            //            if(windowSize < 768){
            //                $('#table').bootstrapTable('toggleView');
            //            }
            //            $('#table').on('click-row.bs.table', function (e, row, $element) {
            //                that.state.crnOrder = row;
            //                $("#orderModal").modal();
            //                that.setState(that.state);
            //            })
        });
    },
    nextStat: function nextStat() {
        if (this.state.crnOrder._id) {
            var that = this;
            var bak = _.findIndex(this.state.orders, function (o) {
                return o._id == that.state.crnOrder._id;
            });
            if (this.state.crnOrder.status === "New") {
                this.state.crnOrder.status = "Pending";
            } else if (this.state.crnOrder.status === "Pending") {
                this.state.crnOrder.status = "Finished";
            } else {
                return;
            }
            $('#orderModal').modal('toggle');
            updateOrder(this.state.crnOrder, function (data) {
                alert("Updated order!");
                that.state.orders[bak] = data;
                that.state.crnOrder = { orderDetails: [], owner: { name: '', email: '' } };
                //                console.log(that.state.crnOrder);
                that.setState(that.state);
            });
        }
    },
    getInitialState: function getInitialState() {
        return {
            orders: [],
            crnOrder: {
                orderDetails: [],
                owner: {
                    name: '',
                    email: ''
                }
            }
        };
    },
    render: function render() {
        return React.createElement(
            'div',
            { className: 'full-height' },
            React.createElement(
                ContentHeader,
                null,
                'Orders Page'
            ),
            React.createElement(
                'section',
                { className: 'content' },
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-xs-12' },
                        React.createElement(
                            'div',
                            { className: 'box' },
                            React.createElement(
                                'div',
                                { className: 'box-header' },
                                React.createElement(
                                    'h3',
                                    { className: 'box-title' },
                                    'Orders Page'
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'box-body' },
                                React.createElement(
                                    'div',
                                    { className: 'row' },
                                    React.createElement(
                                        'div',
                                        { className: 'col-md-12' },
                                        this.state.orders.length > 0 && React.createElement(
                                            Table,
                                            { showModal: this.showModal },
                                            this.state.orders
                                        )
                                    )
                                )
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { id: 'orderModal', className: 'modal fade', role: 'dialog' },
                    React.createElement(
                        'div',
                        { className: 'modal-dialog modal-lg' },
                        React.createElement(
                            'div',
                            { className: 'modal-content' },
                            React.createElement(
                                'div',
                                { className: 'modal-header' },
                                React.createElement(
                                    'button',
                                    { type: 'button', className: 'close', 'data-dismiss': 'modal' },
                                    '\xD7'
                                ),
                                React.createElement(
                                    'h1',
                                    { className: 'modal-title text-center' },
                                    'Order #',
                                    this.state.crnOrder._id
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'modal-body' },
                                React.createElement(
                                    'div',
                                    { className: 'row' },
                                    React.createElement(
                                        'div',
                                        { className: 'col-md-6 col-xs-12' },
                                        React.createElement(
                                            'div',
                                            { className: 'row' },
                                            React.createElement(
                                                'div',
                                                { className: 'col-md-12 col-xs-12 text-center' },
                                                React.createElement(
                                                    'h4',
                                                    null,
                                                    'Receiver\'s'
                                                )
                                            )
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'row' },
                                            React.createElement(
                                                'div',
                                                { className: 'col-md-4 col-xs-12 text-right' },
                                                React.createElement(
                                                    'label',
                                                    null,
                                                    'Name:'
                                                )
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'col-md-8 col-xs-12 text-center' },
                                                this.state.crnOrder.receiver
                                            )
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'row' },
                                            React.createElement(
                                                'div',
                                                { className: 'col-md-4 col-xs-12 text-right' },
                                                React.createElement(
                                                    'label',
                                                    null,
                                                    'Phone:'
                                                )
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'col-md-8 col-xs-12 text-center' },
                                                this.state.crnOrder.phone
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'col-md-6 col-xs-12' },
                                        React.createElement(
                                            'div',
                                            { className: 'row' },
                                            React.createElement(
                                                'div',
                                                { className: 'col-md-12 col-xs-12 text-center' },
                                                React.createElement(
                                                    'h4',
                                                    null,
                                                    'User\'s'
                                                )
                                            )
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'row' },
                                            React.createElement(
                                                'div',
                                                { className: 'col-md-4 col-xs-12 text-right' },
                                                React.createElement(
                                                    'label',
                                                    null,
                                                    'Name:'
                                                )
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'col-md-8 col-xs-12 text-center' },
                                                this.state.crnOrder.owner.name
                                            )
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'row' },
                                            React.createElement(
                                                'div',
                                                { className: 'col-md-4 col-xs-12 text-right' },
                                                React.createElement(
                                                    'label',
                                                    null,
                                                    'Email:'
                                                )
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'col-md-8 col-xs-12 text-center' },
                                                React.createElement(
                                                    'a',
                                                    { href: "mailto@" + this.state.crnOrder.owner.email },
                                                    this.state.crnOrder.owner.email
                                                )
                                            )
                                        )
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'row' },
                                    React.createElement(
                                        'div',
                                        { className: 'col-md-12 col-xs-12 border-bot' },
                                        React.createElement(
                                            'div',
                                            { className: 'row' },
                                            React.createElement(
                                                'div',
                                                { className: 'col-md-2 col-xs-12 text-right' },
                                                React.createElement(
                                                    'label',
                                                    null,
                                                    'Address:'
                                                )
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'col-md-10 col-xs-12 text-center' },
                                                this.state.crnOrder.address
                                            )
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'row ' },
                                            React.createElement(
                                                'div',
                                                { className: 'col-md-2 col-xs-12 text-right' },
                                                React.createElement(
                                                    'label',
                                                    null,
                                                    'Note:'
                                                )
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'col-md-10 col-xs-12 text-center' },
                                                this.state.crnOrder.note
                                            )
                                        )
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'row' },
                                    this.state.crnOrder.orderDetails.map(function (detail, index) {
                                        return React.createElement(
                                            'div',
                                            { key: index, className: this.state.crnOrder.orderDetails.length > 1 ? "col-md-4" : "col-md-offset-3 col-md-6" },
                                            React.createElement(
                                                'div',
                                                { className: 'wrapper-cart' },
                                                React.createElement('div', { className: 'remove-product' }),
                                                React.createElement(
                                                    'div',
                                                    { className: 'image' },
                                                    React.createElement('img', { alt: '', src: detail.item.itemMetas[0].metaValue })
                                                ),
                                                React.createElement(
                                                    'h4',
                                                    { className: 'text-center' },
                                                    detail.item.name
                                                ),
                                                React.createElement(
                                                    'div',
                                                    { className: 'size-unit' },
                                                    'Size: ',
                                                    detail.size,
                                                    ' | Color: ',
                                                    detail.item.color
                                                ),
                                                React.createElement(
                                                    'div',
                                                    { className: 'price-unit' },
                                                    format(detail.price - detail.discount)
                                                ),
                                                React.createElement(
                                                    'div',
                                                    { className: 'text-center div-change-qtt' },
                                                    React.createElement(
                                                        'span',
                                                        { className: 'input' },
                                                        'Quantity: ',
                                                        detail.quantity
                                                    )
                                                ),
                                                React.createElement(
                                                    'div',
                                                    { className: 'subtotal' },
                                                    format(detail.total)
                                                )
                                            )
                                        );
                                    }, this),
                                    React.createElement(
                                        'div',
                                        { className: 'col-md-12' },
                                        React.createElement(
                                            'div',
                                            { className: 'shopping-cart' },
                                            React.createElement(
                                                'div',
                                                { className: 'row' },
                                                React.createElement(
                                                    'div',
                                                    { className: 'col-md-offset-4 col-md-4 text-center total-amount' },
                                                    React.createElement(
                                                        'span',
                                                        null,
                                                        'Total: '
                                                    ),
                                                    React.createElement(
                                                        'span',
                                                        { className: '' },
                                                        this.state.crnOrder.total
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'modal-footer' },
                                this.state.crnOrder.status === 'New' && React.createElement(
                                    'button',
                                    { onClick: this.nextStat, className: 'btn btn-lg btn-warning' },
                                    'Next to PENDING'
                                ),
                                this.state.crnOrder.status === 'Pending' && React.createElement(
                                    'button',
                                    { onClick: this.nextStat, className: 'btn btn-lg btn-success' },
                                    'Next to FINISH'
                                )
                            )
                        )
                    )
                )
            )
        );
    }
});

var AppAdmin = React.createClass({
    displayName: 'AppAdmin',
    signOut: function signOut() {
        Cookies.remove("token");
        cart = null;
        updateCartInUI();
        this.forceUpdate();
        this.props.router.push("/");
    },
    getInitialState: function getInitialState() {
        return { user: getInfoUser() };
    },
    render: function render() {
        if (!isAdmin()) {
            return null;
        }
        return React.createElement(
            'div',
            { className: 'full-height' },
            React.createElement('link', { href: 'https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css', rel: 'stylesheet', type: 'text/css' }),
            React.createElement('link', { href: '../css/allskins.css', rel: 'stylesheet', type: 'text/css' }),
            React.createElement('link', { href: '../css/AdminLTE.css', rel: 'stylesheet', type: 'text/css' }),
            React.createElement(
                'div',
                { className: 'wrapper skin-blue' },
                React.createElement(
                    NaviBar,
                    { signOut: this.signOut },
                    this.state.user
                ),
                React.createElement(
                    SideBar,
                    null,
                    this.state.user
                ),
                React.createElement(
                    'div',
                    { className: 'content-wrapper' },
                    this.props.children
                ),
                React.createElement(
                    'footer',
                    { className: 'main-footer' },
                    React.createElement(
                        'div',
                        { className: 'pull-right hidden-xs' },
                        React.createElement(
                            'b',
                            null,
                            'Version'
                        ),
                        ' 2.2.0'
                    ),
                    React.createElement(
                        'strong',
                        null,
                        'Copyright \xA9 2014-2015 ',
                        React.createElement(
                            'a',
                            { href: 'http://almsaeedstudio.com' },
                            'Almsaeed Studio'
                        ),
                        '.'
                    ),
                    'All rights reserved.'
                )
            )
        );
    },
    componentDidMount: function componentDidMount() {
        if (!isAdmin()) {
            return;
        }
        loadScript();
    },
    componentWillMount: function componentWillMount() {
        if (!isAdmin()) {
            this.props.router.push("/");
            return;
        }
    }
});

function loadScript() {
    $.getScript("/js/dist/app.min.js").done(function (script, textStatus) {
        console.log(textStatus);
    }).fail(function (xhr, status, err) {
        console.log("failed!");
    });
}

/* ------------------------------   ROUTER   --------------------------------*/

ReactDOM.render(React.createElement(
    Router,
    { history: ReactRouter.hashHistory },
    React.createElement(
        Route,
        { path: '/', component: AppCustomer },
        React.createElement(IndexRoute, { component: Home }),
        React.createElement(Route, { path: 'shop', component: Shop }),
        React.createElement(Route, { path: 'about', component: About }),
        React.createElement(Route, { path: 'contact', component: Contact }),
        React.createElement(Route, { path: 'login', component: Login }),
        React.createElement(Route, { path: 'cart', component: Cart }),
        React.createElement(Route, { path: 'product/:itemId', component: Product }),
        React.createElement(Route, { path: 'orderInfo', component: OrderInfo }),
        React.createElement(Route, { path: 'ordersList', component: OrdersList })
    ),
    React.createElement(
        Route,
        { path: '/admin', component: AppAdmin },
        React.createElement(IndexRoute, { component: SvHome }),
        React.createElement(Route, { path: 'newproduct', component: NewProduct }),
        React.createElement(Route, { path: 'viewproduct', component: ViewProduct }),
        React.createElement(Route, { path: 'types', component: TypesPage }),
        React.createElement(Route, { path: 'orders', component: OrdersPage })
    )
), document.getElementById("root"));

/***/ })
/******/ ]);