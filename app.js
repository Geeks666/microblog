var express = require('express');
var path = require('path');
var crypto = require('crypto');
var User = require('./models/user.js')
var partials = require('express-partials');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session')
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');
var User = require('./models/user')
var Post = require('./models/post')
var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash())
app.use(partials());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
	secret: settings.cookieServer,
	store: new MongoStore({url:'mongodb://localhost/microblog'})
}))
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
  res.locals.user=req.session.user;

  var err = req.flash('error');
  var success = req.flash('success');

  res.locals.error = err.length ? err : null;
  res.locals.success = success.length ? success : null;
   
  next();
});

app.get('/', function(req, res, next) {
	Post.get(null,function(err,posts){
		if (err) {
			posts = [];
		};
		//进入模板之后length属性消失！有[]解决！
		// console.log(posts.length)
		res.render('index', { title: 'Express' ,posts:[posts]});
	})
});
app.get('/reg', function(req, res, next) {
  res.render('reg', { title: '用户注册' });
});
app.get('/login', function(req, res, next) {
  res.render('login', { title: '用户登入' });
});
app.use('/logout', index);
app.use('/users', users);
app.post('/reg',function(req,res,next){
	//检验用户两次输入的口令是否一致！
	if(req.body['password-repeat'] !=req.body['password']){
		req.flash('error','两次输入的口令不一致!');
		return res.redirect('/reg');
	}
	//生成口令的散列值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	var newUser = new User({
		name: req.body.username,
		password: password,
	})
	User.get(newUser.name,function(err,user){
		if (user) {
			err = 'username already exists.'
		};
		if (err) {
			req.flash('error',err);
			return res.redirect('/reg');
		};
		newUser.save(function(err){
			if (err) {
				req.flash('error',err);
				return res.redirect('/reg');
			};
			req.session.user = newUser;
			req.flash('success','注功!');
			res.redirect('/u/'+req.session.user);
		});
	});
});
app.post('/login',function(req,res,next){
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	// console.log(req.body.username)
	User.get(req.body.username,function(err,user){
		// console.log(user)
		if (!user){
			req.flash('error','用户不存在!');
			return res.redirect('/login');
		};
		if (user.password != password) {
			req.flash('error','用户口令错误!');
			return res.redirect('/login');
		};
		req.session.user = user.name;
		req.flash('success','登入成功!');
		// console.log(req.session.user)
		res.redirect('/u/'+req.session.user)
	})
})
app.get('/logout', function(req, res, next) {
  req.session.user = null;
  req.flash('success','退出成功');
  res.redirect('/')
});
app.get('/u/:user',function(req,res){
	User.get(req.params.user,function(err,user){	
		if (!user) {
			req.flash('error','用户不存在');
			return res.redirect('/');
		};
		Post.get(user.name,function(err,posts){
			if (err) {
				req.flash('error',err);
				return res.redirect('/');
			};
			res.render('user',{
				title: user.name,
				posts: [posts],
				user: user.name,
			})
		})
	})
})
app.post('/post',function(req,res){
	var currentUser = req.session.user;
	var post = new Post(currentUser,req.body.post);
	post.save(function(err){
		if (err) {
			req.flash('error',err);
			return res.redirect('/')
		};
		req.flash('success','发表成功！');
		res.redirect('/u/'+currentUser);
	})
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
