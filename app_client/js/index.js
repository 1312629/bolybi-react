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

var format = function(numb){
    return formatter.format(numb);
}

var menu;

var changePage = function(newPage) {
    if (menu && menu._reactInternalInstance) {
        menu.setState({page: newPage});
        hideMenu();
    }
}

var { Router,
  Route,
  IndexRoute,
  IndexLink,
  Link } = ReactRouter;

function showMenu(){
    if(!isMenu) {
        isMenu = true;
        $('.main-menu').animate({left: 0});
    }
};

function hideMenu(){
    if(isMenu) {
        isMenu = false;
        $('.main-menu').animate({left: '-500px'});
    }
};

function isLogin(){
    return Cookies.get("token") != null;
};

function checkText(text){
    if(text != null && text.trim().length > 0){
        return true;
    }
    return false;
};

function checkNumber(number){
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
    return {item: item, size: size, quantity: 1, total: (item.price - item.discount)};
};

function addToCart(item, size) {
    if (cart) {
        var crnDetail = _.find(cart.cartDetails, function(o) { return o.item._id === item._id && o.size === size; });
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
            headers: {'Authorization': 'Bearer ' + Cookies.get("token")},
            method: 'PUT',
            contentType: "application/json",
            data: JSON.stringify(cart),
            success: function(data){
                window.stop();
                cart = data;
                updateCartInUI();
                alert("Updated Cart!");
            },
            error: function(xhr, status, err) {
                alert(xhr.responseJSON.message);
                window.stop();
            }
        })
    } else {
        return;
    }
};

function getCart() {
    var token = Cookies.get("token");
    if (token) {
        $.ajax({
            url: "/api/carts",
            headers: {'Authorization': 'Bearer ' + token},
            method: 'GET',
            contentType: "application/json",
            success: function(data){
                cart = data;
                updateCartInUI();
            },
            error: function(xhr, result, err) {
                alert(xhr.responseJSON.message);
            }
        })  
    } else {
        cart = null;
    }
};

function updateCartInUI() {
    if (cartComponent && cartComponent._reactInternalInstance) {
        if (cart) {
            cartComponent.setState({cart: cart});
        } else {
            cartComponent.setState({cart: {total: 0}});
        }
    }
    if (headerCpn && headerCpn._reactInternalInstance) {
        if (cart) {
            headerCpn.setState({cart: cart});
        } else {
            headerCpn.setState({cart: {total: 0}});
        }
    }
    if (orderInfoCpn && orderInfoCpn._reactInternalInstance) {
        if (cart) {
            orderInfoCpn.state.cart = cart;
        } else {
            orderInfoCpn.state.cart = {total: 0};
        }
        orderInfoCpn.setState(orderInfoCpn.state);
    }
};

function getTypes(fullfill) {
    $.get("/api/types")
        .done(fullfill)
        .fail(function(xhr, status, err) {
            alert(xhr.responseJSON.message);
            window.stop();
        });
}; 

function addNewType(newType, fullfill) {
    $.ajax({
        url: "/api/types",
        headers: {'Authorization': 'Bearer ' + Cookies.get("token")},
        method: 'POST',
        contentType: "application/json",
        data: JSON.stringify(newType),
        success: fullfill,
        error: function(xhr, status, err) {
            alert(xhr.responseJSON.message);
            window.stop();
        }
    });
};

function updateType(type, fullfill) {
    $.ajax({
        url: "/api/types/" + type._id,
        headers: {'Authorization': 'Bearer ' + Cookies.get("token")},
        method: 'PUT',
        contentType: "application/json",
        data: JSON.stringify(type),
        success: fullfill,
        error: function(xhr, status, err) {
            alert(xhr.responseJSON.message);
            window.stop();
        }
    });
};

function createOrder(info, myCart, fullfill){
    info.orderDetails = [];
    info.owner = myCart.user;
    var tmpDetail;
    for (var i = 0; i < myCart.cartDetails.length; i++) {
        tmpDetail = {
            item: myCart.cartDetails[i].item,
            size: myCart.cartDetails[i].size,
            quantity: myCart.cartDetails[i].quantity
        }
        info.orderDetails.push(tmpDetail);
    }
    info.total = 0;
    
    $.ajax({
        url: "/api/orders",
        headers: {'Authorization': 'Bearer ' + Cookies.get("token")},
        method: 'POST',
        contentType: "application/json",
        data: JSON.stringify(info),
        success: fullfill,
        error: function(xhr, status, err) {
            alert(xhr.responseJSON.message);
        }
    })
};

function getOrders(fullfill){
    var token = Cookies.get("token");
    if (token) {
        $.ajax({
            url: "/api/orders",
            headers: {'Authorization': 'Bearer ' + token},
            method: 'GET',
            contentType: "application/json",
            success: fullfill,
            error: function(xhr, result, err) {
                alert(xhr.responseJSON.message);
            }
        }) 
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

function updateOrder(order, fullfill){
    if (isAdmin()){
        $.ajax({
            url: "/api/orders/" + order._id,
            headers: {'Authorization': 'Bearer ' + Cookies.get("token")},
            method: 'PUT',
            contentType: "application/json",
            data: JSON.stringify(order),
            success: fullfill,
            error: function(xhr, status, err) {
                alert(xhr.responseJSON.message);
            }
        })
    } else {
        return null;
    }
};

function formatProducts(list){
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
  return Math.round(diff/8.64e7);
}

function getDaysBetweenDates(d0, d1) {

  var msPerDay = 8.64e7;

  // Copy dates so don't mess them up
  var x0 = new Date(d0);
  var x1 = new Date(d1);

  // Set to noon - avoid DST errors
  x0.setHours(12,0,0);
  x1.setHours(12,0,0);

  // Round to remove daylight saving errors
  return Math.round( (x1 - x0) / msPerDay );
}

function formatRpOrders(data){
    var range = 7;
    // Add a helper to format timestamp data
    Date.prototype.formatDDMM = function() {
        return this.getDate() +
        "/" +  (this.getMonth() + 1);
    }
    Date.prototype.adjustDate = function(days){
        var date;
        days = days || 0;
        if(days === 0){
            date = new Date( this.getTime() );
        } else if(days > 0) {
            date = new Date( this.getTime() );

            date.setDate(date.getDate() + days);
        } else {
            date = new Date(
                this.getFullYear(),
                this.getMonth(),
                this.getDate() - Math.abs(days),
                this.getHours(),
                this.getMinutes(),
                this.getSeconds(),
                this.getMilliseconds()
            );
        }
        this.setTime(date.getTime());
        return this;
    };

    var labels = [], datas = [], datas2 = [];
    for (var i = 0; i < range; ++i) {
        datas.push(0);
        datas2.push(0);
    }
    for (var i = range - 1; i >= 0; i--) {
        labels.push(new Date().adjustDate(-i).formatDDMM());
    }
    
    var dif; 
    for (var i = 0; i < data.length; i++){
        dif = getDaysBetweenDates(new Date(data[i]._id.year, data[i]._id.month - 1, data[i]._id.day), new Date());
        console.log(dif);
        if (dif < range) {
            datas[dif] = data[i].totalPrice;
            datas2[dif] = data[i].count;
        }
    }
    
    var tempData = {
      labels : labels,
      datasets : [{
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

function getReports(fullfill){
    console.log('report');
    $.get("/api/reportOrders")
        .done(fullfill)
        .fail(function(xhr, status, err){
            alert(xhr.responseJSON.message);
    });
};

function loginByFb(info, fullfill, reject){
    $.post("/api/auth/facebook", {access_token: info.accessToken})
        .done(fullfill)
        .fail(reject);
};

/* ------------------------------   CLIENT   ----------------------------------*/

var InfoUser = React.createClass({
    getInitialState(){
        return {user: getInfoUser()};    
    },
    render() {
        return (
            <div className="row user-div hidden-xs">
                <div className="col-md-12 text-center">
                    <img className="avatar" src={this.state.user.avatarURL}/>
                </div>
                <div className="col-md-12 text-center">
                    <h3 className="user-name">{this.state.user.name}</h3>
                    <h4 className="user-email">{this.state.user.email}</h4>
                    <a className="logout-btn" onClick={this.props.click}>Logout</a>
                    <hr/>
                </div>
            </div>
        );
    }
});

var DropDownUser = React.createClass({
    getInitialState() {
        return {user: getInfoUser()} ;   
    },
    render() {
        return (
            <div className="dropdown">
                <img className="avatar" src={this.state.user.avatarURL}/>
                <div className="dropdown-content">
                    <Link onClick={() => changePage("/cart")} to="/cart" className="hidden-lg hidden-md hidden-sm">Cart ($0.0)</Link>
                    <Link to="/ordersList">Orders</Link>
                    <a onClick={this.props.click}>Logout</a>
                </div>
            </div> 
        );
    }
});

/* MAIN MENU */
var MainMenu = React.createClass({
    changePage(event){
        var location = event.target.getAttribute('href').split("#")[1];
        hideMenu();
        this.setState({page: location});  
    },
    getInitialState(){
        var location = window.location.href.split("#")[1];
        return {page: location};    
    },
    render(){
      return (
        <div className="main-menu">
          <div className="close-menu" onClick={hideMenu}>
            <i className="material-icons">close</i>
          </div>
          {
            (isLogin()) ? (
                <InfoUser click={this.props.logout}/>
            ) : (
                <div className="push"> </div>
            )
          }
          <ul>
            <li><Link onClick={this.changePage} to="/" className={this.state.page==='/' ? 'active' : ''}>Home</Link></li>
            <li><Link onClick={this.changePage} to="shop" className={this.state.page==='/shop' ? 'active' : ''}>Shop</Link></li>
            <li><Link onClick={this.changePage} to="about" className={this.state.page==='/about' ? 'active' : ''}>About</Link></li>
            <li><Link onClick={this.changePage} to="contact" className={this.state.page==='/contact' ? 'active' : ''}>Contact</Link></li>
            { 
                (!isLogin()) && (
                    <li><Link onClick={this.changePage} to="login" className={this.state.page==='/login' ? 'active' : ''}>Login</Link></li>
                )
            }
          </ul>
          <ul className="submenu hidden-xs">
            <li><a>Return Policy</a></li>
            <li><a>Disclaimer</a></li>
          </ul>
          <div className="social-media">
            <a target="_blank" href="http://facebook.com">
              <span><i className="fa fa-facebook"></i></span>
            </a>
            <a target="_blank" href="https://www.pinterest.com/">
              <span><i className="fa fa-pinterest"></i></span>
            </a>
            <a target="_blank" href="https://plus.google.com">
              <span><i className="fa fa-google-plus"></i></span>
            </a>
          </div>
        </div>
      );
    },
    componentDidMount(){
        menu = this;
    }
});

/* HEADER */
var Header = React.createClass({
    getInitialState() {
        if (cart) {
            return {cart: cart};
        } else {
            return {cart: {total: 0}};
        }  
    },
    componentDidMount() {
        headerCpn = this;
    },
    render(){
      return (
        <header className="header fixed">
          <div className="header-wrapper top-bar">
            <div className="container-fluid">
              <div className="row">
                <div className="col-xs-2 col-sm-3">
                  <div className="menu-icon pull-left">
                    <a onClick={showMenu}>
                      <i className="material-icons">menu</i>
                      <span className="hidden-xs">Menu</span>
                    </a>
                  </div>
                </div>
                <div className="col-xs-8 col-sm-6">
                  <div className="header-logo text-center">
                    <Link to="/" className="logo-text">{this.props.children}</Link>
                  </div>
                </div>
                <div className="col-xs-2 col-sm-3">
                  <div className="header-cart pull-right">
                    <div className="cart-wrapper">
                      <Link to="/cart" className="hidden-xs" onClick={() => changePage("/cart")}>
                        <span className="hidden-xs cart">{format(this.state.cart.total)}</span>
                        <span className="hidden-xs">Cart</span>
                      </Link>
                        {
                            (isLogin()) && <DropDownUser click={this.props.logout}/>
                        }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      );
    }
});

/* HOME */
var Home = React.createClass({
    render(){
      var image1 = {
        backgroundImage: "url('./images/bg_1.jpg')"
      };
      var image2 = {
        backgroundImage: "url('./images/bg_2.jpg')"
      };
      var image3 = {
        backgroundImage: "url('./images/bg_3.jpg')"
      };

      return (
        <section className="page-section relative height-100">
            <div className="flexslider-container">
                <div className="flexslider">
                    <ul className="slides">
                        <li style={image1}>
                        </li>
                       <li style={image2}>
                        </li>
                        <li style={image3}>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="btn-wrapper">
                <Link to="shop" onClick={() => changePage("/shop")} className="btn-theme btn-home">Shop Now</Link>
            </div>
        </section>
      );
    },
    componentDidMount() {
        $('.flexslider').flexslider({
            animation: "slide"
        });
        changePage("/");
    }
});

/* SHOP */
var Shop = React.createClass({
    getInitialState() {
//                return {listItems: [{name: 'Ultra Boost', brand: 'Adidas', color: 'Black', price: 4000000, discount: 0, itemMetas: [{metaKey: 'url', metaValue: './images/bg_1.jpg'}]}, {name: 'Tubular Doom', brand: 'Adidas', color: 'Grey', price: 3600000, discount: 0, itemMetas: [{metaKey: 'url', metaValue: './images/bg_2.jpg'}]}]}
        return {
            listItems: [],
            listGenders: ["All", "Men", "Women", "Couple"]
        };
    },
    render() {
        return(
            <section className="page-section full-height">
              <div className="container-fluid container-shop full-height">
                  <div className="row">
                      <div className="col-md-12 col-lg-12 content" id="content">
                          <div className="shop-sorting">
                              <div className="row">
                                  <div className="col-sm-12 text-center">
                                      <span className="hidden-xs">Sort by</span>
                                      <span className="select-wrapper hidden-xs">
                                      <select>
                                          <option value="name">Product Name</option>
                                          <option value="-price">HIGHEST PRICE</option>
                                          <option value="price">LOWEST PRICE</option>
                                      </select>
                                  </span>
                                      <span>Show me</span>
                                      <span className="select-wrapper">
                                      <select>
                                        {
                                            this.state.listGenders.map(function(gender, index){
                                                return (
                                                    <option key={index} value={gender}>{gender}</option>
                                                );
                                            }, this)
                                        }
                                      </select>
                                  </span>
                                  </div>
                              </div>
                          </div>

                          <div className="row products grid">
                              {
                                  this.state.listItems.map(function(item, index){
                                      return (
                                        <div className="col-md-4 col-sm-6" key={index}>
                                          <div className="thumbnail no-border no-padding">
                                              <div className="media">
                                                  <Link className="media-link" to={"product/" + item._id}>
                                                      <img alt="" src={item.itemMetas[0].metaValue}/>
                                                  </Link>
                                              </div>
                                              <div className="caption text-center">
                                                  <h4 className="caption-title">{item.name}</h4>
                                                    {
                                                        (item.discount != 0) ? (
                                                            <div className="price"><del className="text-red">{format(item.price)}</del>{format(item.price-item.discount)}</div>
                                                        ) : (
                                                            <div className="price">{format(item.price)}</div>
                                                        )
                                                    }
                                              </div>
                                          </div>
                                      </div>
                                      );
                                  })
                              }
                          </div>
                      </div>
                  </div>
              </div>
          </section>
        );
    },
    componentDidMount(){
        changePage("/shop");
        var that = this;
        $.get("/api/items", function(data){
            that.setState({listItems: data});
        });
    }
});

/* ABOUT */
var About = React.createClass({
    render(){
        return(
            <section className="page-section height-100">
                <div className="container-fluid full-height">
                    <div className="col-md-12 relative min-height">
                        <div className="wrapper-vertical-center">
                            <div className="text-center about-header">
                                <h2 className="block-header">About us</h2>
                                <div className="social-media">
                                    <a target="_blank" href="http://facebook.com">
                                        <span><i className="fa fa-facebook"></i></span>
                                    </a>
                                    <a target="_blank" href="https://www.pinterest.com/">
                                        <span><i className="fa fa-pinterest"></i></span>
                                    </a>
                                    <a target="_blank" href="https://plus.google.com">
                                        <span><i className="fa fa-google-plus"></i></span>
                                    </a>
                                </div>
                            </div>
                            <div className="regular-text">
                                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi.
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    },
    componentDidMount(){
        changePage("/about");
    }
});

/* CONTACT */
var Contact = React.createClass({
    render(){
        return(
            <section className="page-section height-100">
                <div className="container-fluid">
                    <div className="col-md-12 relative min-height">
                        <div className="wrapper-vertical-center">
                            <div className="text-center about-header">
                                <h2 className="block-header">Contact Us</h2>
                            </div>

                            <div className="regular-text contact-subheader text-center">
                                <p>We are happy to hear from you.</p>
                            </div>

                            <form method="post" name="contactForm" className="contact-form " id="contact-form">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <input type="text" name="fullname" className="form-control " placeholder="Name" maxLength="30" size="30" required="" tabIndex="1"/>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <input type="email" placeholder="Email" name="emailAddress" className="form-control" tabIndex="2" required=""/>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <input type="text" name="subject" className="form-control " placeholder="Subject" maxLength="30" size="30" required="" tabIndex="3"/>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <textarea placeholder="Message" name="messages" className="form-control" tabIndex="4" cols="50" rows="4" required=""></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="msg_form"></div>
                                    </div>
                                    <div className="col-md-12">
                                        <button className="btn-theme form-btn pull-right" type="submit">
                                            <span className="hidden-xs">Send a message</span>
                                            <span className="hidden-sm hidden-md hidden-lg">Send</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        );
    },
    componentDidMount(){
        changePage("/contact");
    }
});

/* LOGIN */
var Login = React.createClass({
    getInitialState() {
        return ({mode: 'login', avatar: '../images/avatar_default.png'});
    },
    checkPassword() {
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
    checkEmail() {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (re.test(this.refs.email.value)) {
            return true;
        } else {
            $(this.refs.email).addClass("has-error");
            $('.msg_form').html($('.msg_form').html() + "\nInvalid Email!");
            return false;
        }
    },
    direct() {
        var that = this;
        if (isAdmin()) {
            setTimeout(function(){that.props.router.push('/admin');}, 500);
        } else {
            setTimeout(function(){that.props.router.push('/');}, 500);
        }
    },
    checkName() {
        if (this.refs.name.value != null && this.refs.name.value.trim().length > 0) {
            return true;
        } else {
            $(this.refs.name).addClass("has-error");
            $('.msg_form').html($('.msg_form').html() + "\nInvalid Name!");
            return false;
        }    
    },
    checkLogin() {
        return (this.checkEmail() && this.checkPassword()); 
    },
    login() {
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
            $.post('/api/login', info)
                .done(function(data){
                    window.stop();
                    Cookies.set("token", data.token);
                    that.refs.btnLogin.innerHTML = "Login";
                    $('.msg_form').html("Login Succesfully!");
                    getCart();
                    that.direct();
                })
                .fail(function(xhr, status, err){
                    that.refs.btnLogin.innerHTML = "Login";
                    $('.msg_form').html(xhr.responseJSON.message);
                    window.stop();
                });
        };
    },
    checkReg() {
        return (this.checkEmail() && this.checkPassword() && this.checkName()); 
    },
    register() {
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
    sendRegInfo() {
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
                console.log((JSON.parse(xhr.response)).token);
                Cookies.set("token", (JSON.parse(xhr.response)).token);
                window.stop();
                getCart();
                setTimeout(function(){that.props.router.push('/');}, 1500);
            } else {
                that.refs.btnReg.innerHTML = "Register";
                $('.msg_form').html(xhr.responseJSON.message);
                window.stop();
            }
        };
        xhr.send(formData);
    },
    submit(event) {
        event.preventDefault();
        if (this.state.mode === 'login') {
            this.login();
        } else {
            this.register();
        }    
    },
    resetAll(){
        this.state.avatar = '../images/avatar_default.png';
        $('.msg_form').html("");
        $(this.refs.email).removeClass("has-error");
        $(this.refs.password).removeClass("has-error");
        $(this.refs.name).removeClass("has-error");
        this.setState(this.state);
    },
    changeMode(event){
        event.preventDefault();
        this.resetAll();
        this.state.mode = event.target.innerHTML;
        this.setState(this.state);
        return false;
    },
    changeAvatar(event) {
        console.log(event.target.files);
        if (event.target.files.length > 0) {
            this.state.avatar = URL.createObjectURL(event.target.files[0]);
            this.setState(this.state);    
        } else {
            this.state.avatar = "./images/avatar_default.png";
            this.setState(this.state);   
        }
    },
    render(){
        return(
            <section className="page-section full-height">
                <div className="container-fluid full-height">
                    <div className="col-md-12 full-height relative">
                        <div className="wrapper-vertical-center max-width-600">
                            <div className="text-center login-header">
                                <h2 className="block-header">{this.state.mode}</h2>
                            </div>
                            <div className="regular-text contact-subheader text-center">
                                <p>Please fill all info below.</p>
                            </div>
                            <form onSubmit={this.submit} method="post" name="contactForm" className="contact-form " id="contact-form">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <input type="email" placeholder="Email" ref="email" name="email" className="form-control" tabIndex="1" required="true"/>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <input type="password" name="password" ref="password" className="form-control " placeholder="Password" maxLength="30" size="30" required="true" tabIndex="2"/>
                                        </div>
                                    </div>
                                </div>
                                {
                                    (this.state.mode === "register") && (
                                    <div>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <input type="password" name="repassword" ref="repassword" className="form-control " tabIndex="3" placeholder="Retype Password" maxLength="30" size="30" required="true"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <input type="text" name="name" className="form-control" ref="name" placeholder="Name" maxLength="30" size="30" required="true" tabIndex="4"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <input onChange={this.changeAvatar} ref="avatar" accept="image/*" type="file" name="avatar" className="form-control"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row text-center">
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <img src={this.state.avatar} alt='avatar'/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    )                      
                                }
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="msg_form"></div>
                                    </div>
                                </div>
                                {
                                    (this.state.mode === "register") ? (
                                        <div className="row">
                                            <div className="col-md-6 col-xs-12 text-center">
                                                <button onClick={this.changeMode} className="btn-theme form-btn col-md-12 col-xs-12">
                                                    login
                                                </button>
                                            </div>
                                            <div className="col-md-6 col-xs-12 text-center">
                                                <button ref="btnReg" className="btn-theme form-btn col-md-12">
                                                    Register
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="row">
                                            <div className="col-md-6 col-xs-12 text-center">
                                                <button onClick={this.changeMode} className="btn-theme form-btn col-md-12 col-xs-12">
                                                    register
                                                </button>
                                            </div>
                                            <div className="col-md-6 col-xs-12 text-center">
                                                <button ref='btnLogin' type="submit" className="btn-theme form-btn col-md-12">
                                                    Login
                                                </button>
                                            </div>
                                            <FBLoginBtn fb={FB} direct={this.direct}/>
                                        </div>
                                    )
                                }
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        );
    },
    componentDidMount(){
        changePage("/login");
    },
    componentWillMount(){
        if (isLogin()) {
            this.props.router.push("/");
        }
    }
})

/* PRODUCT */
var Product = React.createClass({
    changeSize(event){
        var newDetail;
        if (event.target.value != ''){
          newDetail = this.state.item.itemDetails[parseInt(event.target.value)];
        } else {
          newDetail = {size: '', quantity: 0};
        }
        this.state.crnDetail = newDetail;
        this.setState(this.state);
    },
    changeImg(event){
        console.log(event.target.src);
        this.state.crnImg = event.target.src;
        this.setState(this.state);
    },
    btnAddClick() {
        if (cart) {
            addToCart(this.state.item, this.state.crnDetail.size);
            updateCart();
        } else {
            alert("Please login to use cart!");
            this.props.router.push('/');
        }
    },
    getInitialState(){
        return {crnImg: './images/bg_2.jpg',item: {name: 'Tubular Doom', brand: 'Adidas', color: 'Grey', price: 3600000, discount: 0, itemMetas: [{metaKey: 'url', metaValue: './images/bg_2.jpg'}, {metaKey: 'url', metaValue: './images/bg_1.jpg'}, {metaKey: 'url', metaValue: './images/bg_3.jpg'}], itemDetails: [{size: '36', quantity: 5}, {size: '40', quantity: 0}]}, crnDetail: {size: '', quantity: 0}};
    },
    render(){
      return (
        <section className="page-section full-height">
            <div className="container-fluid full-height">
                <div className="fake-white"></div>
                <div className="row product-single">
                    <a href="#/shop">
                        <div className="all_products">
                            <span className="glyphicon glyphicon-th"></span>
                        </div>
                    </a>
                    <div className="col-md-6 text-center relative min-height">
                        <div className="images-wrapper">
                            <img alt="" className="imgdetail max-height" src={this.state.crnImg}/>
                            <div className="row">
                                <div className="hidden-xs col-sm-3"></div>
                                {
                                  this.state.item.itemMetas.map(function(itemMeta, index){
                                    return (
                                      <div key={index} className="col-xs-4 col-sm-2">
                                          <div className="img-product-detail">
                                              <a>
                                                  <img onClick={this.changeImg} className="full-width" alt="" src={itemMeta.metaValue}/>
                                              </a>
                                          </div>
                                      </div>
                                    );
                                  }, this)
                                }
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 filters-shop min-height">
                        <div className="product-name">
                            <h2 className="product-title">{this.state.item.name}</h2>
                            {
                                (this.state.item.discount != 0) ? (
                                    <div className="product-price"><del className="text-red">{format(this.state.item.price)}</del>{format(this.state.item.price-this.state.item.discount)}</div>
                                ) : (
                                    <div className="product-price">{format(this.state.item.price)}</div>
                                )
                            }
                        </div>
                        <div className="wrapper-info">
                            <div className="product-text">{this.state.item.description}</div>
                            <div className="buttons relative">
                                <div>
                                    <span className="select-wrapper-size">
                                        <select className="form-control size-select" name="size" onChange={this.changeSize} defaultValue={this.state.crnDetail.size}>
                                            <option value="" disabled>Select Size</option>
                                            {
                                              this.state.item.itemDetails.map(function(itemDetail, index){
                                                return <option key={index} value={index}>{itemDetail.size}</option>
                                              })
                                            }
                                        </select>
                                    </span>
                                    <span className="input-group-btn text-center">
                                        {
                                            (this.state.crnDetail.size != '' && this.state.crnDetail.quantity == 0)
                                            ? (
                                                <label className="out-stock-label">Out Stock</label>
                                            )
                                            : (
                                                <button onClick={this.btnAddClick} className="btn-theme btn-detail">Add to cart</button>
                                            )
                                        }
                                    </span>
                                </div>
                            </div>
                        <div className="message fadein fadeout"></div>
                    </div>
                </div>
            </div>
          </div>
        </section>
      )
    },
    componentDidMount(){
        var that = this;
        $.get('/api/items/' + that.props.params.itemId, function(data){
            var crnState = that.state;
            crnState.item = data;
            crnState.crnImg = data.itemMetas[0].metaValue;
            that.setState(crnState);
        });
    }
})

/* CART */
var Cart = React.createClass({
    add(index) {
        cart.cartDetails[index].quantity++;
        updateCart();
    },
    sub(index){
        if (cart.cartDetails[index].quantity > 1) {
            cart.cartDetails[index].quantity--;
            updateCart();
        } else {
            return;
        }
    },
    remove(index) {
        console.log(index);
        cart.cartDetails.splice(index, 1);
        console.log(cart);
        updateCart();
    },
    getInitialState(){
        if (cart) {
            return {cart: cart};
        } else {
            return {cart: {cartDetails: [], total: 0}}
        }
    },
    componentDidMount() {
        cartComponent = this;    
    },
    render(){
        return (
          <section className="page-section color full-height">
              <div className="container full-height no-overflow">
                { 
                    (isLogin()) ? (
                        <div className="row">
                          <div className="col-md-12">
                              <h2 className="block-header header-cart text-center">Your Cart</h2>
                          </div>
                          {
                              this.state.cart.cartDetails.map(function(cartDetail, index){
                                return (
                                    <div key={index} className={(this.state.cart.cartDetails.length > 1) ? "col-md-4" : "col-md-offset-3 col-md-6"}>
                                      <div className="wrapper-cart">
                                          <div className="remove-product">
                                              <a onClick={() => this.remove(index)}>
                                                  <i className="fa fa-close"></i>
                                              </a>
                                          </div>
                                          <div className="image">
                                              <img alt="" src={cartDetail.item.itemMetas[0].metaValue}/>
                                          </div>
                                          <h4 className="text-center">{cartDetail.item.name}</h4>
                                        <div className="size-unit">Size: {cartDetail.size}</div>
                                          <div className="price-unit">{format(cartDetail.item.price - cartDetail.item.discount)}</div>
                                          <div className='text-center div-change-qtt'>
                                              <span className="counter" onClick={() => this.sub(index)}><i className="fa fa-minus"></i></span>
                                              <span className="input">{cartDetail.quantity}</span>
                                              <span className="counter" onClick={() => this.add(index)}><i className="fa fa-plus"></i></span>
                                          </div>
                                          <div className="subtotal">{format(cartDetail.total)}</div>
                                      </div>
                                    </div>
                                );
                              }, this)
                          }
                          {
                            (this.state.cart.cartDetails.length == 0) ? (
                              <div className="col-md-12 full-height relative">
                                  <div className="wrapper-vertical-center">
                                      <div className="regular-text text-center text-cart">
                                          <p>There is not items yet.</p>
                                          <Link to="shop">Back to shop</Link>
                                      </div>
                                  </div>
                              </div>
                            ) : (
                                <div className="col-md-12">
                                  <div className="shopping-cart">
                                      <div className="row">
                                          <div className="col-md-4">
                                              <Link to="shop" className="btn btn-theme btn-theme-dark btn-block">Back Store</Link>
                                          </div>
                                          <div className="col-md-4 text-center total-amount">
                                              <span>Total: </span>
                                              <span className="">{format(this.state.cart.total)}</span>
                                          </div>
                                          <div className="col-md-4">
                                              <Link to="/orderInfo" className="btn btn-theme btn-theme-dark btn-block">Checkout</Link>
                                          </div>
                                      </div>
                                  </div>
                                </div>
                            )
                          }
                        </div>
                    ) : (
                        <div className="row">
                            <div className="col-md-12 text-center">
                                <h2 className="block-header header-cart text-center">Please login first to use cart</h2>
                                <Link to="login" className="btn-theme btn-home">Login Page</Link>
                            </div>
                        </div>
                    )
                }
              </div>
          </section>
        )
    }
});

/* ORDER INFO */
var OrderInfo = React.createClass({
    getInitialState() {
        var myCart = cart ? cart : {cartDetails: [], total: 0};
        return (
            {
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
            }
        );
    },
    reset() {
        $(this.refs.receiver).removeClass('has-error');
        $(this.refs.phone).removeClass('has-error');
        $(this.refs.address).removeClass('has-error');
    },
    createOrder() {
        this.reset();
        if ( !checkText(this.refs.receiver.value) ) {
            $(this.refs.receiver).addClass('has-error');
            return false;
        }   
        if ( !checkText(this.refs.phone.value) ) {
            $(this.refs.phone).addClass('has-error');
            return false;
        } 
        if ( !checkText(this.refs.address.value) ) {
            $(this.refs.address).addClass('has-error');
            return false;
        }
        var info = {
            receiver: this.refs.receiver.value,
            phone: this.refs.phone.value,
            address: this.refs.address.value,
            note: this.refs.note.value
        }
        var that = this;
        createOrder(info, this.state.cart, function(data){
            alert("Created New Order!");
            that.props.router.push("/orderList");
        });
    },
    update(kind){
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
    componentDidMount() {
        orderInfoCpn = this;
    },
    render() {
        if (!this.state.cart) {
            this.props.router.push("/");
            return null;
        }
        return (
            <section className="page-section full-height">
                <div className="container-fluid full-height">
                    <div className="fake-white"></div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="order-info-name">
                                <h2 className="block-header text-center">Order Info</h2>
                            </div>
                            <form onSubmit={this.submit} method="post" name="infoForm" className="contact-form info-form" id="info-form">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <input type="text" onChange={() => this.update("receiver")} placeholder="Receiver Name" ref="receiver" name="receiver" className="form-control" tabIndex="1" required="true"/>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                             <input type="text" onChange={() => this.update("phone")} placeholder="Phone Number" ref="phone" name="phone" className="form-control" tabIndex="2" required="true"/>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                             <textarea ref="address" onChange={() => this.update("address")} placeholder="Address" rows="2" className="form-control" tabIndex="3" type="text"></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                             <textarea ref="note" onChange={() => this.update("note")} rows="4" placeholder="Note" className="form-control" tabIndex="4" type="text"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="col-md-6 info-preview">
                            <div className="invoice">
                                <header>
                                    <div className="header-wrapper top-bar">
                                        <div className="container-fluid">
                                            <div className="row">
                                                <div className="col-xs-12 col-sm-6">
                                                    <h1>invoice</h1>
                                                </div>
                                                <div className="col-xs-12 col-sm-6 pull-right">
                                                    <p className="shop-name">{this.state.owner.name}</p>
                                                    <p>{this.state.owner.phone}</p>
                                                    <a href={"mailto@" + this.state.owner.email}>{this.state.owner.email}</a>
                                                    <a href={this.state.owner.web}>{this.state.owner.web}</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </header>
                                <div className="invoice-content">
                                    <div className="row relative">
                                        <div className="col-md-6 col-xs-12">
                                            <ul>
                                                <li>
                                                    <label>Receiver's Name:</label>
                                                    <div className="invoice-text">{this.state.name}</div>
                                                </li>
                                                <li>
                                                    <label>Phone Number:</label>
                                                    <div className="invoice-text">{this.state.phone}</div>
                                                </li>
                                                <li>
                                                    <label>Address:</label>
                                                    <div className="invoice-text">{this.state.address}</div>
                                                </li>
                                                <li>
                                                    <label>Note:</label>
                                                    <div className="invoice-text">{this.state.note}</div>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="col-md-6 col-xs-12 pull-right mid-air">
                                            <label>Invoice Total</label>
                                            <div className="total" ref="total">{format(this.state.cart.total)}</div>
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-hover table-detail">
                                            <thead>
                                                <tr>
                                                    <th>Description</th>
                                                    <th className="text-center">Unit Cost</th>
                                                    <th className="text-center">Qty</th>
                                                    <th className="text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    this.state.cart.cartDetails.map(function(detail, index){
                                                        return (
                                                            <tr key={index}>
                                                                <td>
                                                                    {detail.item.name}
                                                                    <div className="lb">{detail.size} | {detail.item.color}</div>
                                                                </td>
                                                                <td className="text-center">{format(detail.item.price - detail.item.discount)}</td>
                                                                <td className="text-center">{detail.quantity}</td>
                                                                <td className="text-right">{format(detail.total)}</td>
                                                            </tr>
                                                        );
                                                    }, this)
                                                }
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <th className="total-text" colSpan={3}>Totals</th>
                                                    <th className="text-right">{format(this.state.cart.total)}</th>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="order-info-btn">
                                <a onClick={this.createOrder} className="btn btn-theme btn-theme-dark btn-block">Finish</a>
                            </div>                                                    
                        </div>
                    </div>
                </div>
                <div className="message fadein fadeout"></div>
            </section>
        );
    }
});

/* ORDERS LIST */
var OrdersList = React.createClass({
    componentDidMount() {
        var that = this;
        getOrders(function(data){
            data = formatOrders(data);
            console.log(data);
            $('#table').bootstrapTable({
                data: data
            });
            var windowSize = $(window).width();
            if(windowSize < 768){
                $('#table').bootstrapTable('toggleView');
            }
            $('#table').on('click-row.bs.table', function (e, row, $element) {
                console.log(row);
                that.state.crnOrder = row;
                $("#orderModal").modal();
                that.setState(that.state);
            })
            
//            $(window).on('resize', function(event){
//                var windowSize = $(window).width();
//                if(windowSize < 768){
//                    alert("Please reload page!");
//                    window.location.reload();
//                }
//            });
        });
    },
    getInitialState() {
        return {
            crnOrder: {
                orderDetails: []
            }    
        };    
    },
    render() {
        return(
            <section className="page-section full-height">
                <div className="container-fluid full-height">
                    <div className="row">
                        <div className="col-md-12">
                            <h2 className="block-header header-cart text-center">Your List Orders</h2>
                        </div>
                        <div className="col-md-12">
                            <table id="table" data-locale="en-US" data-sort-name="status" data-sort-order="desc" data-pagination="true" data-search="true">
                                <thead>
                                    <tr>
                                        <th data-field="_id" data-sortable="true">ID</th>
                                        <th data-field="createdDate" data-sortable="true">Created Date</th>
                                        <th data-field="updatedDate" data-sortable="true">Finished Date</th>
                                        <th data-field="status" data-sortable="true">Status</th>
                                        <th data-field="total" data-sortable="true">Total</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                </div>
            
                <div id="orderModal" className="modal fade" role="dialog">
                  <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                      <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal">&times;</button>
                        <h1 className="modal-title text-center">Order #{this.state.crnOrder._id}</h1>
                      </div>
                      <div className="modal-body">
                        <div className="row">
                            <div className="col-md-offset-2 col-md-8 col-xs-12 border-bot">
                                <div className="row">
                                    <div className="col-md-4 col-xs-12">
                                        <label>Receiver's Name:</label>
                                    </div>
                                    <div className="col-md-8 col-xs-12">
                                        {this.state.crnOrder.receiver}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-4 col-xs-12">
                                        <label>Phone Number:</label>
                                    </div>
                                    <div className="col-md-8 col-xs-12">
                                        {this.state.crnOrder.phone}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-4 col-xs-12">
                                        <label>Address:</label>
                                    </div>
                                    <div className="col-md-8 col-xs-12">
                                        {this.state.crnOrder.address}
                                    </div>
                                </div>
                                <div className="row ">
                                    <div className="col-md-4 col-xs-12">
                                        <label>Note:</label>
                                    </div>
                                    <div className="col-md-8 col-xs-12">
                                        {this.state.crnOrder.note}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            {
                              this.state.crnOrder.orderDetails.map(function(detail, index){
                                return (
                                    <div key={index} className={(this.state.crnOrder.orderDetails.length > 1) ? "col-md-4" : "col-md-offset-3 col-md-6"}>
                                      <div className="wrapper-cart">
                                          <div className="remove-product">

                                          </div>
                                          <div className="image">
                                              <img alt="" src={detail.item.itemMetas[0].metaValue}/>
                                          </div>
                                          <h4 className="text-center">{detail.item.name}</h4>
                                          <div className="size-unit">Size: {detail.size} | Color: {detail.item.color}</div>
                                          <div className="price-unit">{format(detail.price - detail.discount)}</div>
                                          <div className='text-center div-change-qtt'>
                                              <span className="input">Quantity: {detail.quantity}</span>
                                          </div>
                                          <div className="subtotal">{format(detail.total)}</div>
                                      </div>
                                    </div>
                                );
                              }, this)
                            }
                            <div className="col-md-12">
                                <div className="shopping-cart">
                                  <div className="row">
                                      <div className="col-md-offset-4 col-md-4 text-center total-amount">
                                          <span>Total: </span>
                                          <span className="">{this.state.crnOrder.total}</span>
                                      </div>
                                  </div>
                                </div>
                            </div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
            </section>
        );
    }
});

/* APP */
var AppCustomer = React.createClass({
    logout(){
        Cookies.remove("token");
        cart = null;
        updateCartInUI();
        this.forceUpdate();
        this.props.router.push("/");
    },
    render() {
      return (
        <div className='home'>
          <link rel="stylesheet" href="./css/flexslider.css"/>
            <link rel="stylesheet" href="./css/style.css"/>
          <Header logout={this.logout}>Bolybi</Header>
          <div className="content-area">
            {this.props.children}
          </div>
          <MainMenu logout={this.logout}/>
        </div>
      );
    }
});


/* -----------------------------   SERVER   ---------------------------------*/

var NaviBar = React.createClass({
    getInitialState() {
        return null;
    },
    render() {
        return (
            <header className="main-header">
                <Link to="/admin" className="logo">
                    <span className="logo-mini"><b>B</b>LB</span>
                    <span className="logo-lg"><b>BOLYBI</b>shop</span>
                </Link>
                <nav className="navbar navbar-static-top" role="navigation">
                    <a className="sidebar-toggle" data-toggle="offcanvas" role="button">
                        <span className="sr-only">Toggle navigation</span>
                    </a>
                    <div className="navbar-custom-menu">
                        <ul className="nav navbar-nav">
                            <li className="dropdown messages-menu">
                                <a className="dropdown-toggle" data-toggle="dropdown">
                                    <i className="fa fa-envelope-o"></i>
                                    <span className="label label-success">4</span>
                                </a>
                                <ul className="dropdown-menu">
                                    <li className="header">You have 4 messages</li>
                                    <li>
                                        <ul className="menu">
                                            <li>
                                                <a>
                                                    <div className="pull-left">
                                                        <img src="" className="img-circle" alt="User Image" />
                                                    </div>
                                                    <h4>
                                                Support Team
                                                <small><i className="fa fa-clock-o"></i> 5 mins</small>
                                              </h4>
                                                    <p>Why not buy a new awesome theme?</p>
                                                </a>
                                            </li>
                                            <li>
                                                <a>
                                                    <div className="pull-left">
                                                        <img src="" className="img-circle" alt="User Image" />
                                                    </div>
                                                    <h4>
                                                AdminLTE Design Team
                                                <small><i className="fa fa-clock-o"></i> 2 hours</small>
                                              </h4>
                                                    <p>Why not buy a new awesome theme?</p>
                                                </a>
                                            </li>
                                            <li>
                                                <a>
                                                    <div className="pull-left">
                                                        <img src="" className="img-circle" alt="User Image" />
                                                    </div>
                                                    <h4>
                                                Developers
                                                <small><i className="fa fa-clock-o"></i> Today</small>
                                              </h4>
                                                    <p>Why not buy a new awesome theme?</p>
                                                </a>
                                            </li>
                                            <li>
                                                <a>
                                                    <div className="pull-left">
                                                        <img src="" className="img-circle" alt="User Image" />
                                                    </div>
                                                    <h4>
                                                Sales Department
                                                <small><i className="fa fa-clock-o"></i> Yesterday</small>
                                              </h4>
                                                    <p>Why not buy a new awesome theme?</p>
                                                </a>
                                            </li>
                                            <li>
                                                <a>
                                                    <div className="pull-left">
                                                        <img src="" className="img-circle" alt="User Image" />
                                                    </div>
                                                    <h4>
                                                Reviewers
                                                <small><i className="fa fa-clock-o"></i> 2 days</small>
                                              </h4>
                                                    <p>Why not buy a new awesome theme?</p>
                                                </a>
                                            </li>
                                        </ul>
                                    </li>
                                    <li className="footer"><a>See All Messages</a>
                                    </li>
                                </ul>
                            </li>
                            <li className="dropdown notifications-menu">
                                <a className="dropdown-toggle" data-toggle="dropdown">
                                    <i className="fa fa-bell-o"></i>
                                    <span className="label label-warning">10</span>
                                </a>
                                <ul className="dropdown-menu">
                                    <li className="header">You have 10 notifications</li>
                                    <li>
                                        <ul className="menu">
                                            <li>
                                                <a>
                                                    <i className="fa fa-users text-aqua"></i> 10 new members joined today
                                                </a>
                                            </li>
                                            <li>
                                                <a>
                                                    <i className="fa fa-warning text-yellow"></i> Very long description here that may not fit into the page and may cause design problems
                                                </a>
                                            </li>
                                            <li>
                                                <a>
                                                    <i className="fa fa-users text-red"></i> 10 new members joined
                                                </a>
                                            </li>
                                            <li>
                                                <a>
                                                    <i className="fa fa-shopping-cart text-green"></i> 25 sales made
                                                </a>
                                            </li>
                                            <li>
                                                <a>
                                                    <i className="fa fa-user text-red"></i> You changed your username
                                                </a>
                                            </li>
                                        </ul>
                                    </li>
                                    <li className="footer"><a>View all</a>
                                    </li>
                                </ul>
                            </li>
                            <li className="dropdown tasks-menu">
                                <a className="dropdown-toggle" data-toggle="dropdown">
                                    <i className="fa fa-flag-o"></i>
                                    <span className="label label-danger">9</span>
                                </a>
                                <ul className="dropdown-menu">
                                    <li className="header">You have 9 tasks</li>
                                    <li>
                                        <ul className="menu">
                                            <li>
                                                <a>
                                                    <h3>
                                                Design some buttons
                                                <small className="pull-right">20%</small>
                                              </h3>
                                                    <div className="progress xs">
                                                        <div className="progress-bar progress-bar-aqua" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100">
                                                            <span className="sr-only">20% Complete</span>
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                            <li>
                                                <a>
                                                    <h3>
                                                Create a nice theme
                                                <small className="pull-right">40%</small>
                                              </h3>
                                                    <div className="progress xs">
                                                        <div className="progress-bar progress-bar-green" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100">
                                                            <span className="sr-only">40% Complete</span>
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                            <li>
                                                <a>
                                                    <h3>
                                                Some task I need to do
                                                <small className="pull-right">60%</small>
                                              </h3>
                                                    <div className="progress xs">
                                                        <div className="progress-bar progress-bar-red" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100">
                                                            <span className="sr-only">60% Complete</span>
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                            <li>
                                                <a>
                                                    <h3>
                                                Make beautiful transitions
                                                <small className="pull-right">80%</small>
                                              </h3>
                                                    <div className="progress xs">
                                                        <div className="progress-bar progress-bar-yellow" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100">
                                                            <span className="sr-only">80% Complete</span>
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                        </ul>
                                    </li>
                                    <li className="footer">
                                        <a>View all tasks</a>
                                    </li>
                                </ul>
                            </li>
                            <li className="dropdown user user-menu">
                                <a className="dropdown-toggle" data-toggle="dropdown">
                                    <img src={this.props.children.avatarURL} className="user-image" alt="User Image" />
                                    <span className="hidden-xs">{this.props.children.name}</span>
                                </a>
                                <ul className="dropdown-menu">
                                    <li className="user-header">
                                        <img src={this.props.children.avatarURL} className="img-circle" alt="User Image" />
                                        <p>
                                            {this.props.children.name}
                                            <small>Member since {this.props.children.createdDate.split("T")[0]}</small>
                                        </p>
                                    </li>
                                    <li className="user-body">
                                        <div className="col-xs-4 text-center">
                                            <a href="https://www.facebook.com/nguyen.viettri.9">Facebook</a>
                                        </div>
                                        <div className="col-xs-4 text-center">
                                            <a href="https://nvt-cv.firebaseapp.com">LinkedIN</a>
                                        </div>
                                        <div className="col-xs-4 text-center">
                                            <a href="https://nvt-cv.firebaseapp.com">HomePage</a>
                                        </div>
                                    </li>
                                    <li className="user-footer">
                                        <div className="pull-left">
                                            <a className="btn btn-default btn-flat">Profile</a>
                                        </div>
                                        <div className="pull-right">
                                            <a onClick={this.props.signOut} className="btn btn-default btn-flat">Sign out</a>
                                        </div>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>
        );
    }
});

var SideBar = React.createClass({
    render() {
        return (
            <aside className="main-sidebar">
                <section className="sidebar">
                    <div className="user-panel">
                        <div className="pull-left image">
                            <img src={this.props.children.avatarURL} className="img-circle" alt="User Image" />
                        </div>
                        <div className="pull-left info">
                            <p>{this.props.children.name}</p>
                            <a><i className="fa fa-circle text-success"></i> Online</a>
                        </div>
                    </div>
                    <form action="#" method="get" className="sidebar-form">
                        <div className="input-group">
                            <input type="text" name="q" id="search" className="form-control" placeholder="Search..." />
                            <span className="input-group-btn">
                                    <button type="submit" name="search" id="search-btn" className="btn btn-flat"><i className="fa fa-search"></i></button>
                                  </span>
                        </div>
                    </form>
                    <ul className="sidebar-menu">
                        <li className="header">MAIN NAVIGATION</li>
                        <li>
                            <Link to="/admin">
                                <i className="fa fa-dashboard"></i> <span>Overview</span>
                            </Link>
                        </li>
                        <li>
                            <a>
                                <i className="fa fa-envelope"></i> <span>Mailbox</span>
                                <small className="label pull-right bg-yellow">12</small>
                            </a>
                        </li>
                        <li className="header">ORDER</li>
                        <li>
                            <Link to="/admin/orders">
                                <i className="fa fa-file-text-o"></i>
                                <span>Orders</span>
                                <span className="label pull-right bg-red">4</span>
                            </Link>
                        </li>
                        <li className="header">PRODUCT</li>
                        <li className="treeview">
                            <a>
                                <i className="fa fa-th"></i> <span>Products</span>
                            </a>
                            <ul className="treeview-menu">
                                <li><Link to="/admin/viewproduct"><i className="fa fa-circle-o"></i> View All Products</Link>
                                </li>
                                <li><Link to="/admin/newproduct"><i className="fa fa-circle-o text-red"></i> Add New Product</Link>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <Link to='/admin/types'>
                                <i className="fa fa-th"></i> <span>Type</span>
                            </Link>
                        </li>
                    </ul>
                </section>
            </aside>
        );
    }
});

var ContentHeader = React.createClass({
    render() {
        return(
            <section className="content-header">
              <h1>
                Dashboard
                <small>Version 2.0</small>
              </h1>
              <ol className="breadcrumb">
                <li><a href="#"><i className="fa fa-dashboard"></i> Home</a></li>
                <li className={(this.props.children!=null) ? "" : "active"}>
                    {
                        (this.props.children==null) ? "Dashboard" : (
                            <Link to="/admin">Dashboard</Link>
                        )
                    }
                </li>
                {
                    (this.props.children != null) && (
                        <li className="active">{this.props.children}</li>
                    )
                }
              </ol>
            </section>
        );
    }
});

var BoxUsers = React.createClass({
    getInitialState(){
        return {listUsers: []};    
    },
    render() {
        var listUsers = _.take(this.props.children, 4);
        listUsers = _.orderBy(listUsers, ['createdDate', 'name'], ['desc', 'asc']);
        this.state.listUsers = listUsers;  
        return (
            <div className="box box-danger">
                <div className="box-header with-border">
                    <h3 className="box-title">Latest Members</h3>
                    <div className="box-tools pull-right">
                        <span className="label label-danger">{this.props.children.length}</span>
                        <button className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i>
                        </button>
                        <button className="btn btn-box-tool" data-widget="remove"><i className="fa fa-times"></i>
                        </button>
                    </div>
                </div>
                <div className="box-body no-padding">
                    <ul className="users-list clearfix">
                        {
                            this.state.listUsers.map(function(user, index){
                                return (
                                    <li key={index}>
                                        <img src={user.avatarURL} alt="User Image" />
                                        <a className="users-list-name">{user.name}</a>
                                        <span className="users-list-date">{user.createdDate.split('T')[0]}</span>
                                    </li>    
                                );
                            }, this)
                        }
                        
                    </ul>
                </div>
                <div className="box-footer text-center">
                    <a className="uppercase">View All Users</a>
                </div>
            </div>
        );
    }
});

var BoxProducts = React.createClass({
    getInitialState(){
        return {listProducts: []};    
    },
    render() {
        var listProducts = _.take(this.props.children, 4);
        listProducts = _.orderBy(listProducts, ['createdDate', 'name'], ['desc', 'asc']);
        this.state.listProducts = listProducts;
        return (
            <div className="box box-primary">
                <div className="box-header with-border">
                    <h3 className="box-title">Recently Added Products</h3>
                    <div className="box-tools pull-right">
                        <button className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i>
                        </button>
                        <button className="btn btn-box-tool" data-widget="remove"><i className="fa fa-times"></i>
                        </button>
                    </div>
                </div>
                <div className="box-body">
                    <ul className="products-list product-list-in-box">
                    {
                        this.state.listProducts.map(function(product, index){
                            return (
                                <li key={index} className="item">
                                    <div className="product-img">
                                        <img src={product.itemMetas[0].metaValue} alt="Product Image" />
                                    </div>
                                    <div className="product-info">
                                        <Link to={"product/" + product._id} className="product-title">{product.name} <span className="label label-warning pull-right">{product.type}</span></Link>
                                        <span className="product-description">{format(product.price)}</span>
                                    </div>
                                </li>
                            );
                        }, this)
                    }
                    </ul>
                </div>
                <div className="box-footer text-center">
                    <div className="row">
                        <div className="col-md-12">
                            <Link to="/admin/viewproduct" className="uppercase">View All Products</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var BoxOrders = React.createClass({
    getInitialState(){
        return {
            orders: []
        }    
    },
    render() {
        var orders = _.take(this.props.children, 4);
        orders = _.orderBy(orders, ['createdDate', 'name'], ['desc', 'asc']);
        this.state.orders = orders;
        return (
            <div className="box box-info">
                <div className="box-header with-border">
                    <h3 className="box-title">Latest Orders</h3>
                    <div className="box-tools pull-right">
                        <button className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i>
                        </button>
                        <button className="btn btn-box-tool" data-widget="remove"><i className="fa fa-times"></i>
                        </button>
                    </div>
                </div>
                <div className="box-body">
                    <div className="table-responsive">
                        <table className="table no-margin">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th className="text-center">Owner</th>
                                    <th className="text-center">Created Date</th>
                                    <th className="text-center">Status</th>
                                    <th className="text-right">Total Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.orders.map(function(order, index){
                                        return (
                                            <tr key={index}>
                                                <td>{order._id}</td>
                                                <td className="text-center">{order.owner.name}</td>
                                                <td className="text-center">{order.createdDate.split('T')[0]}</td>
                                                <td className="text-center">{order.status}</td>
                                                <td className="text-right">{format(order.total)}</td>
                                            </tr>
                                        )
                                    }, this)
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="box-footer text-center">
                    <Link to="/admin/orders" className="uppercase">View All Orders</Link>
                </div>
            </div>
        );
    }
});

var FBLoginBtn = React.createClass({
    getInitialState(){
        this.FB = this.props.fb;
        this.direct = this.props.direct;
        return {
            message: ""
        };
    },
    componentDidMount() {
      this.FB.Event.subscribe('auth.logout', 
         this.onLogout.bind(this));
      this.FB.Event.subscribe('auth.statusChange', 
         this.onStatusChange.bind(this));
        this.FB.XFBML.parse();
    },
    componentDidUpdate() {
        this.FB.XFBML.parse();    
    },
    onStatusChange(response) {
        var that = this;
        if( response.status === "connected" ) {
            loginByFb(response.authResponse, function(data){
                Cookies.set("token", data.token);
                getCart();
                that.direct();
            }, function(xhr, status, err){
                FB.logout(function(response) {
                    console.log("logout!");
                    alert(xhr.responseJSON.message);
                });
            });
        }
    },
    onLogout(response) {
      this.setState({
         message: ""
      });
    },
    render() {
        return (
            <div className="col-md-12 col-xs-12 text-center">
                <div 
                   className="fb-login-button" 
                   data-max-rows="1" 
                   data-size="xlarge" 
                   data-show-faces="false" 
                   data-auto-logout-link="false"
                   >
                </div>
             </div>
        );
    }
});

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
            label: function(tooltipItem, data) {
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
            display:false
        },
        ticks: {
            beginAtZero: true,
            callback: function(value, index, values) {
              return format(value);
            }
        }
      }]
    },
    responsive: true
};

function imageFormatter(value) {
    console.log("test");
    console.log(value);
    return '<img src="'+value+'" />';
}

var SvHome = React.createClass({
    getInitialState() {
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
    render() {
        return(
            <div>
                <ContentHeader/>
                <section className="content">
                    <div className="row">
                        <div className="col-md-3 col-sm-6 col-xs-12">
                            <div className="info-box">
                                <span className="info-box-icon bg-aqua"><i className="fa fa-envelope-o"></i></span>
                                <div className="info-box-content">
                                    <span className="info-box-text">Feedbacks</span>
                                    <span className="info-box-number">90</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 col-xs-12">
                            <div className="info-box">
                                <span className="info-box-icon bg-red"><i className="fa fa-file-text-o"></i></span>
                                <div className="info-box-content">
                                    <span className="info-box-text">Orders</span>
                                    <span className="info-box-number">{this.state.listOrders.length}</span>
                                </div>
                            </div>
                        </div>
                        <div className="clearfix visible-sm-block"></div>
                        <div className="col-md-3 col-sm-6 col-xs-12">
                            <div className="info-box">
                                <span className="info-box-icon bg-green"><i className="fa fa-shopping-cart"></i></span>
                                <div className="info-box-content">
                                    <span className="info-box-text">Products</span>
                                    <span className="info-box-number">{this.state.listProducts.length}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 col-xs-12">
                            <div className="info-box">
                                <span className="info-box-icon bg-yellow"><i className="ion ion-ios-people-outline"></i></span>
                                <div className="info-box-content">
                                    <span className="info-box-text">Members</span>
                                    <span className="info-box-number">{this.state.listUsers.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12 col-sm-12 col-xs-12 text-center" style={{padding: 100+'px'}}>
                            <LineChart options={chartOptions} data={this.state.reportOrders} redraw/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-8">
                            <BoxOrders>{this.state.listOrders}</BoxOrders>
                        </div>
                        <div className="col-md-4">
                            <BoxProducts>{this.state.listProducts}</BoxProducts>
                            <BoxUsers>{this.state.listUsers}</BoxUsers>
                        </div>
                    </div>
                </section>
            </div>
        );
    },
    componentDidMount() {
        var that = this;
        $.get("/api/users")
            .done(function(data){
                that.state.listUsers = data;
                that.setState(that.state);
            })
            .fail(function(xhr, status, err){
                alert(xhr.responseJSON.message);
            });
        $.get("/api/items")
            .done(function(data){
                that.state.listProducts = data;
                that.setState(that.state);
            })
            .fail(function(xhr, status, err){
                alert(xhr.responseJSON.message);
            });
        getOrders(function(data){
            that.state.listOrders = data;
            that.setState(that.state);
        });
        getReports(function(data){
            that.state.reportOrders = formatRpOrders(data);
            console.log(that.state.reportOrders);
            that.setState(that.state);
        });
    }
});

var NewProduct = React.createClass({
    getInitialState(){
        return {
                    listGender: ["Men", "Women", "Couple"], 
                    listCates: [], 
                    listTypes: [],
                    imgs: ["img0"],
                    detail: ["detail0"],
                    count: 1
                };    
    },
    componentDidMount() {
        var that = this;
        getTypes(function(data){
            if (data.length > 0) {
                that.state.listTypes = data;
                that.state.listCates = that.state.listTypes[0].categories;
                that.setState(that.state);
            } else {
                return;   
            }
        });        
    },
    changeOpt(event) {
        this.state.listCates = this.state.listTypes[event.target.value].categories;
        this.setState(this.state);
    },
    removeImg(index){
        this.state.imgs.splice(index, 1);
        this.setState(this.state);
    },
    changeImg(index){
        var id = this.state.imgs[index];
        $('#input'+id)
        if ($('#input'+id)[0].files.length > 0) {
            var newImg = URL.createObjectURL($('#input'+id)[0].files[0]);
            $("#"+id).attr("src", newImg);   
        } else {
            $("#"+id).attr("src", "");
        }
    },
    addImg(){
        this.state.imgs.push("img" + this.state.count);
        this.state.count++;
        this.setState(this.state);
    },
    removeDetail(index){
        this.state.detail.splice(index, 1);
        this.setState(this.state);
    },
    addDetail(){
        this.state.detail.push("detail" + this.state.count);
        this.state.count++;
        this.setState(this.state);
    },
    reset(){
        $(this.refs.name).removeClass("has-error");
        $(this.refs.brand).removeClass("has-error");
        $(this.refs.color).removeClass("has-error");
        $(this.refs.price).removeClass("has-error");
        $(this.refs.discount).removeClass("has-error");
    },
    checkImgs(){
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
    checkDetail() {
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
    checkValid(){
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
    newInfo() {
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
            var newDetail = {size: $("#size" + id).val(), quantity: parseInt($("#qtt" + id).val())};
            product.itemDetails.push(newDetail);
        }
        return product;
    },
    sendInfo() {
        var product = this.newInfo();
        var files = [];
        var id;
        var formData = new FormData();
        for (var i = 0; i < this.state.imgs.length; i++) {
            id = this.state.imgs[i];
            var file = $('#input'+id)[0].files[0];
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
    submit(event){
        event.preventDefault();
        this.reset();
        if (this.checkValid()){
            this.sendInfo();
        } else {
            return;
        }
    },
    render() {
        return (
            <div className="full-height">
                <ContentHeader>Add New Product</ContentHeader>
                <section className="content">
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="box">
                                <div className="box-header">
                                    <h3 className="box-title">Add New Product</h3>
                                </div>
                                <div id className="box-body">
                                    <form onSubmit={this.submit} method="post" className="form-horizontal" role="form">
                                        <div className="form-group hide">
                                            <label className="col-sm-2 control-label">ID </label>
                                            <div className="col-sm-5">
                                                <input className="form-control" type="text" disabled/>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Gender </label>
                                            <div className="col-sm-6">
                                                <select className="form-control" ref="gender">
                                                    { 
                                                        this.state.listGender.map(function(gender, index) { 
                                                            return (
                                                                <option key={index} value={gender}>{gender}</option>
                                                            ) 
                                                        }, this) 
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Type </label>
                                            <div className="col-sm-6">
                                                <select className="form-control" ref="type" onChange={this.changeOpt}>
                                                    {
                                                        this.state.listTypes.map(function(type, index){
                                                            return (
                                                                <option key={index} value={index}>{type.name}</option>
                                                            );
                                                        }, this)
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Category </label>
                                            <div className="col-sm-6">
                                                <select className="form-control" ref="category">
                                                    {
                                                        this.state.listCates.map(function(cate, index){
                                                            return (
                                                                <option key={index} value={cate}>{cate}</option>
                                                            );
                                                        }, this)
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Name </label>
                                            <div className="col-sm-6">
                                                <input ref="name" className="form-control" type="text" />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Brand </label>
                                            <div className="col-sm-6">
                                                <input ref="brand" className="form-control" type="text" />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Color </label>
                                            <div className="col-sm-6">
                                                <input ref="color" className="form-control" type="text" />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Price </label>
                                            <div className="col-sm-6">
                                                <input ref="price" className="form-control" type="number" min={0}/>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Discount </label>
                                            <div className="col-sm-6">
                                                <input ref="discount" className="form-control" type="number" defaultValue={0} min={0}/>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Description </label>
                                            <div className="col-sm-6">
                                                <textarea ref="description" rows={5} className="form-control" type="text"></textarea>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="col-sm-3"> </div>
                                            <div className="col-sm-6">
                                                <a data-toggle="collapse" data-target="#imgChart" className="btn btn-default col-sm-12 col-xs-12">IMAGE TABLE</a>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="col-sm-3"> </div>
                                            <div className="col-sm-6">
                                                <div id="imgChart" className="collapse table-responsive">
                                                    <table className="table table-bordered table-striped">
                                                        <thead>
                                                            <tr>
                                                                <th colSpan="3" className="text-center">IMG CHART</th>
                                                            </tr>
                                                            <tr>
                                                                <th>Choose File</th>
                                                                <th>Preview</th>
                                                                <th></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                this.state.imgs.map(function(id, index){
                                                                    return (
                                                                        <tr key={id}>
                                                                            <td>
                                                                                <input onChange={() => this.changeImg(index)} id={"input"+id} className="form-control" accept="image/*" type="file" />
                                                                            </td>
                                                                            <td>
                                                                                <img className="img-responsive preview" id={id} />
                                                                            </td>
                                                                            <td className="text-right">
                                                                                <a className="btn btn-danger" onClick={() => this.removeImg(index)}>X</a>
                                                                            </td>
                                                                        </tr>    
                                                                    );    
                                                                }, this)        
                                                            }
                                                        </tbody>
                                                        <tfoot>
                                                            <tr>
                                                                <td colSpan="3">
                                                                    <div className="col-sm-3"> </div>
                                                                    <a className="btn btn-success col-sm-6 col-xs-12" onClick={this.addImg}>Add</a>
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="col-sm-3"> </div>
                                            <div className="col-sm-6">
                                                <a data-toggle="collapse" data-target="#sizeChart" className="btn btn-default col-sm-12 col-xs-12">SIZE CHARTS</a>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="col-sm-3"> </div>
                                            <div className="col-sm-6">
                                                <div id="sizeChart" className="collapse table-responsive">
                                                    <table className="table table-bordered table-striped">
                                                        <thead>
                                                            <tr>
                                                                <th colSpan="3" className="text-center">SIZES CHART</th>
                                                            </tr>
                                                            <tr>
                                                                <th>Size</th>
                                                                <th>Quantity</th>
                                                                <th></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                this.state.detail.map(function(id, index){
                                                                    return (
                                                                        <tr key={id}>
                                                                            <td>
                                                                                <input className="form-control" type="text" id={"size"+id} />
                                                                            </td>
                                                                            <td>
                                                                                <input className="form-control" type="number" id={"qtt"+id} min={1}/>
                                                                            </td>
                                                                            <td className="text-right">
                                                                                <a className="btn btn-danger" onClick={() => this.removeDetail(index)}>X</a>
                                                                            </td>
                                                                        </tr>      
                                                                    );
                                                                }, this)       
                                                            }
                                                        </tbody>
                                                        <tfoot>
                                                            <tr>
                                                                <td colSpan="3">
                                                                    <div className="col-sm-3"> </div>
                                                                    <a className="btn btn-success col-sm-6 col-xs-12" onClick={this.addDetail}>Add</a>
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="col-sm-3"> </div>
                                            <div className="col-sm-6">
                                                <button type="submit" className="btn btn-primary col-sm-12">Finish</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
});

var ViewProduct = React.createClass({
    getInitialState() {
        return {listProducts: [], detail: []};    
    },
    render() {
        return (
            <div className="full-height">
                <ContentHeader>View Products</ContentHeader>
                <section className="content">
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="box">
                                <div className="box-header">
                                    <h3 className="box-title">View Products</h3>
                                </div>
                                <div id className="box-body">
                                    <table id="product-table" data-locale="en-US" data-sort-name="status" data-sort-order="asc" data-pagination="true" data-search="true">
                                        <thead>
                                            <tr>
                                                <th data-field="preview" data-formatter="imageFormatter">Preview</th>
                                                <th data-field="name" data-sortable="true">Name</th>
                                                <th data-field="gender" data-sortable="true">Gender</th>
                                                <th data-field="type" data-sortable="true">Type</th>
                                                <th data-field="category" data-sortable="true">Category</th>
                                                <th data-field="brand" data-sortable="true">Brand</th>
                                                <th data-field="color" data-sortable="true">Color</th>
                                                <th data-field="price" data-sortable="true">Price</th>
                                                <th data-field="discount" data-sortable="true">Discount</th>
                                            </tr>
                                        </thead>
                                    </table>
                                    <div className="modal fade" id="modalTable" tabIndex="-1" role="dialog">
                                        <div className="modal-dialog">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <button type="button" className="close" data-dismiss="modal">
                                                        <span aria-hidden="true">&times;</span></button>
                                                    <h4 className="modal-title">Modal table</h4>
                                                </div>
                                                <div className="modal-body">
                                                    <table id="detail-table"
                                                           data-locale="en-US"
                                                           data-height="299">
                                                        <thead>
                                                            <tr>
                                                                <th data-field="size">Size</th>
                                                                <th data-field="quantity">Quantity</th>
                                                            </tr>
                                                        </thead>
                                                    </table>
                                                </div>
                                                <div className="modal-footer">
                                                    <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );    
    },
    componentDidMount() {
        var that = this;
        $.get("/api/items")
            .done(function(data){
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
                if(windowSize < 768){
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
            })
            .fail(function(xhr, status, err){
                alert(xhr.responseJSON.message);
            });
    }
});

var TypesPage = React.createClass({
    changeOpt(event) {
        this.state.cates = this.state.types[event.target.value].categories;
        this.setState(this.state);
    },
    openModal(mode) {
        this.state.mode = mode;
        this.setState(this.state);
    },
    checkValid(text) {
        if (text === null || text.trim().length === 0) {
            return false;
        }
        if (this.state.mode === "type") {
            if (_.find(this.state.types, function(o){return o.name === text})) {
                alert(text + " has been existed!")
                return false;
            } else {
                return true;
            }
        } else {
            if (_.find(this.state.cates, text)) {
                alert(text + " has been existed!")
                return false;
            } else {
                return true;
            }
        }
    },
    addChange(){
        if (this.state.mode === "type") {
            if (this.checkValid(this.refs.newType.value)) {
                var newType = {name: this.refs.newType.value, categories: []};
                var that = this;
                addNewType(newType, function(data){
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
                updateType(type, function(data){
                    that.state.types[index] = data;
                    that.state.cates = data.categories;
                    that.setState(that.state);
                    alert("Added New Category!");
                });
            }
        }
        return;
    },
    getInitialState() {
        return {
            types: [],
            cates: []
        };    
    },
    componentDidMount() {
        var that = this;
        getTypes(function(data){
            if (data.length > 0) {
                that.state.types = data;
                that.state.cates = that.state.types[0].categories;
                that.setState(that.state);
            } else {
                return;   
            }
        });
    },
    render() {
        return (
            <div className="full-height">
                <ContentHeader>Manage Type</ContentHeader>
                <section className="content">
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="box">
                                <div className="box-header">
                                    <h3 className="box-title">Manage Types</h3>
                                </div>
                                <div className="box-body">
                                    <div className="row">
                                    {
                                        (this.state.types.length > 0) ? (
                                            <div className="col-md-offset-4 col-md-4">
                                                <label>Type</label>
                                                <select ref="type" onChange={this.changeOpt} className="form-control">
                                                    {
                                                        this.state.types.map(function(type, index){
                                                            return (
                                                                <option key={index} value={index}>{type.name}</option>
                                                            );
                                                        }, this)
                                                    }
                                                </select>
                                                <br/>
                                                <label>Categories</label>
                                                <ul className="list-types">
                                                    {
                                                        this.state.cates.map(function(cate, index){
                                                            return (
                                                                <li key={index}>{cate}</li>
                                                            );
                                                        }, this)
                                                    }
                                                </ul>
                                            </div>
                                        ) : (
                                            <h3 className="text-center">Don't have any types. Please add new Type first!</h3>
                                        )
                                    }
                                    </div>
                                    <div className="row">
                                        <div className="col-md-offset-4 col-md-4">
                                            <button data-toggle="modal" data-target="#addModal" className="btn btn-primary col-sm-12 col-xs-12" onClick={() => this.openModal("type")}>{"ADD NEW TYPE"}</button>
                                            {
                                                (this.state.types.length > 0) && (
                                                    <button data-toggle="modal" data-target="#addModal" className="btn btn-warning col-sm-12 col-xs-12" onClick={() => this.openModal("cate")}>ADD CATEGORY</button>
                                                )
                                            }
                                            <div id="addModal" className="modal fade" role="dialog">
                                                <div className="modal-dialog modal-sm">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                                                            {
                                                                (this.state.mode === "type") ? (
                                                                    <h4 className="modal-title">Add New Type</h4>
                                                                ) : (
                                                                    <h4 className="modal-title">Add New Category</h4>
                                                                )
                                                            }
                                                        </div>
                                                        <div className="modal-body text-center">
                                                            {
                                                                (this.state.mode === "type") ? (
                                                                    <input type='text' ref='newType' className="col-md-offset-1 col-md-10" placeholder="Type Name"/>
                                                                ) : (
                                                                    <input type='text' ref='newCate' className="col-md-offset-1 col-md-10" placeholder="Category Name"/>
                                                                )
                                                            }
                                                        </div>
                                                        <div className="modal-footer">
                                                            <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                                                            <button type="button" onClick={this.addChange} className="btn btn-primary" data-dismiss="modal">Add</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
});

var Table = React.createClass({
    getInitialState() {
        console.log("right");
        return {
            orders: formatOrders(this.props.children)   
        };
    },
    componentDidMount(){
        $('#table').bootstrapTable({
            data: this.state.orders
        });
        var windowSize = $(window).width();
        if(windowSize < 768){
            $('#table').bootstrapTable('toggleView');
        }
        var that = this;
        $('#table').on('click-row.bs.table', function (e, row, $element) {
            that.props.showModal(row);
        })
    },
    componentDidUpdate() {
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
    render() {
        return(
            <table id="table" data-locale="en-US" data-sort-name="status" data-sort-order="asc" data-pagination="true" data-search="true">
                <thead>
                    <tr>
                        <th data-field="_id" data-sortable="true">ID</th>
                        <th data-field="receiver" data-sortable="true">Receiver</th>
                        <th data-field="phone" data-sortable="true">Phone</th>
                        <th data-field="createdDate" data-sortable="true">Created Date</th>
                        <th data-field="updatedDate" data-sortable="true">Finished Date</th>
                        <th data-field="status" data-sortable="true">Status</th>
                        <th data-field="total" data-sortable="true">Total</th>
                    </tr>
                </thead>
            </table>
        )
    }
});

var OrdersPage = React.createClass({
    showModal(order){
        this.state.crnOrder = order;
        this.setState(this.state);
        $("#orderModal").modal();
    },
    componentDidMount() {
        var that = this;
        getOrders(function(data){
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
    nextStat() {
        if (this.state.crnOrder._id) {
            var that = this
            var bak = _.findIndex(this.state.orders, function(o) { return o._id == that.state.crnOrder._id; });
            if (this.state.crnOrder.status === "New") {
                this.state.crnOrder.status = "Pending";
            } else if (this.state.crnOrder.status === "Pending") {
                this.state.crnOrder.status = "Finished";
            } else {
                return;
            }
            $('#orderModal').modal('toggle');
            updateOrder(this.state.crnOrder, function(data){
                alert("Updated order!");
                that.state.orders[bak] = data;
                that.state.crnOrder =  {orderDetails: [],owner: {name: '',email: ''}};
//                console.log(that.state.crnOrder);
                that.setState(that.state);
            });
        }    
    },
    getInitialState() {
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
    render() {
        return (
            <div className="full-height">
                <ContentHeader>Orders Page</ContentHeader>
                <section className="content">
                    
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="box">
                                <div className="box-header">
                                    <h3 className="box-title">Orders Page</h3>
                                </div>
                                <div className="box-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                        {
                                            (this.state.orders.length > 0) && (
                                                <Table showModal={this.showModal}>{this.state.orders}</Table>
                                            )
                                        }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="orderModal" className="modal fade" role="dialog">
                      <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                          <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                            <h1 className="modal-title text-center">Order #{this.state.crnOrder._id}</h1>
                          </div>
                          <div className="modal-body">
                            <div className="row">
                                <div className="col-md-6 col-xs-12">
                                    <div className="row">
                                        <div className="col-md-12 col-xs-12 text-center">
                                            <h4>Receiver's</h4>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4 col-xs-12 text-right">
                                            <label>Name:</label>
                                        </div>
                                        <div className="col-md-8 col-xs-12 text-center">
                                            {this.state.crnOrder.receiver}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4 col-xs-12 text-right">
                                            <label>Phone:</label>
                                        </div>
                                        <div className="col-md-8 col-xs-12 text-center">
                                            {this.state.crnOrder.phone}
                                        </div>
                                    </div>
                                </div>
            
                                <div className="col-md-6 col-xs-12">
                                    <div className="row">
                                        <div className="col-md-12 col-xs-12 text-center">
                                            <h4>User's</h4>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4 col-xs-12 text-right">
                                            <label>Name:</label>
                                        </div>
                                        <div className="col-md-8 col-xs-12 text-center">
                                            {this.state.crnOrder.owner.name}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4 col-xs-12 text-right">
                                            <label>Email:</label>
                                        </div>
                                        <div className="col-md-8 col-xs-12 text-center">
                                            <a href={"mailto@" + this.state.crnOrder.owner.email}>{this.state.crnOrder.owner.email}</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12 col-xs-12 border-bot">
                                    <div className="row">
                                        <div className="col-md-2 col-xs-12 text-right">
                                            <label>Address:</label>
                                        </div>
                                        <div className="col-md-10 col-xs-12 text-center">
                                            {this.state.crnOrder.address}
                                        </div>
                                    </div>
                                    <div className="row ">
                                        <div className="col-md-2 col-xs-12 text-right">
                                            <label>Note:</label>
                                        </div>
                                        <div className="col-md-10 col-xs-12 text-center">
                                            {this.state.crnOrder.note}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                {
                                  this.state.crnOrder.orderDetails.map(function(detail, index){
                                    return (
                                        <div key={index} className={(this.state.crnOrder.orderDetails.length > 1) ? "col-md-4" : "col-md-offset-3 col-md-6"}>
                                          <div className="wrapper-cart">
                                              <div className="remove-product">

                                              </div>
                                              <div className="image">
                                                  <img alt="" src={detail.item.itemMetas[0].metaValue}/>
                                              </div>
                                              <h4 className="text-center">{detail.item.name}</h4>
                                              <div className="size-unit">Size: {detail.size} | Color: {detail.item.color}</div>
                                              <div className="price-unit">{format(detail.price - detail.discount)}</div>
                                              <div className='text-center div-change-qtt'>
                                                  <span className="input">Quantity: {detail.quantity}</span>
                                              </div>
                                              <div className="subtotal">{format(detail.total)}</div>
                                          </div>
                                        </div>
                                    );
                                  }, this)
                                }
                                <div className="col-md-12">
                                    <div className="shopping-cart">
                                      <div className="row">
                                          <div className="col-md-offset-4 col-md-4 text-center total-amount">
                                              <span>Total: </span>
                                              <span className="">{this.state.crnOrder.total}</span>
                                          </div>
                                      </div>
                                    </div>
                                </div>
                            </div>
                          </div>
                            <div className="modal-footer">
                            {
                                (this.state.crnOrder.status === 'New') && (
                                    <button onClick={this.nextStat} className="btn btn-lg btn-warning" >Next to PENDING</button>
                                )     
                            }
                            {
                                (this.state.crnOrder.status === 'Pending') && (
                                    <button onClick={this.nextStat} className="btn btn-lg btn-success" >Next to FINISH</button>
                                )     
                            }
                           </div>
                        </div>
                      </div>
                    </div>
                </section>
            </div>
        );
    }
});

var AppAdmin = React.createClass({
    signOut() {
        Cookies.remove("token");
        cart = null;
        updateCartInUI();
        this.forceUpdate();
        this.props.router.push("/");
    },
    getInitialState(){
        return {user: getInfoUser()};    
    },
    render() {
        if (!isAdmin()) {
            return null;
        }
        return(
            <div className="full-height">
                <link href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" rel="stylesheet" type="text/css" />
                <link href="../css/allskins.css" rel="stylesheet" type="text/css" />
                <link href="../css/AdminLTE.css" rel="stylesheet" type="text/css" />
                <div className="wrapper skin-blue">
                    <NaviBar signOut={this.signOut}>{this.state.user}</NaviBar>
                    <SideBar>{this.state.user}</SideBar>
                    <div className="content-wrapper">
                        {this.props.children}
                    </div>
                    <footer className="main-footer">
                        <div className="pull-right hidden-xs">
                            <b>Version</b> 2.2.0
                        </div>
                        <strong>Copyright © 2014-2015 <a href="http://almsaeedstudio.com">Almsaeed Studio</a>.</strong>
                        All rights reserved.
                    </footer>
                </div>
            </div>
        );    
    },
    componentDidMount() {
        if (!isAdmin()) {
            return;
        }
        loadScript();
    },
    componentWillMount() {
        if (!isAdmin()) {
            this.props.router.push("/");
            return;
        }
    }
});

function loadScript() {
    $.getScript( "/js/dist/app.min.js")
        .done(function( script, textStatus ) {
            console.log( textStatus );
        })
        .fail(function( xhr, status, err ) {
            console.log("failed!");
        });
}


/* ------------------------------   ROUTER   --------------------------------*/

ReactDOM.render(
    <Router history={ReactRouter.hashHistory}>
        <Route path="/" component={AppCustomer}>
            <IndexRoute component={Home}/>
            <Route path="shop" component={Shop}/>
            <Route path="about" component={About}/>
            <Route path="contact" component={Contact}/>
            <Route path="login" component={Login}/>
            <Route path="cart" component={Cart}/>
            <Route path="product/:itemId" component={Product}/>
            <Route path="orderInfo" component={OrderInfo}/>
            <Route path="ordersList" component={OrdersList}/>
        </Route>
        <Route path="/admin" component={AppAdmin}>
            <IndexRoute component={SvHome}/>
            <Route path="newproduct" component={NewProduct}/>
            <Route path="viewproduct" component={ViewProduct}/>
            <Route path="types" component={TypesPage}/>
            <Route path="orders" component={OrdersPage}/>
        </Route>
    </Router>
    ,
    document.getElementById("root")
);