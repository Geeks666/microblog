var mongodb = require('./db');

function Post(username,post,time){
	this.user = username;
	this.post = post;
	if (time ) {
		this.time = time;
	}else{
		this.time = Reversal(new Date());
	}
};
module.exports = Post;
Post.prototype.save = function save(callback){
	//存入mongodb的文档
	var post = {
		user: this.user,
		post: this.post,
		time: this.time,
	};
	mongodb.open(function(err,db){
		if (err) {
			return callback(err)
		};
		//读取posts集合
		db.collection('posts',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			};
			//为user属性添加索引
			collection.ensureIndex('user');
			//写入post文档
			collection.insert(post,{safe: true},function(err,post){
				mongodb.close();
				callback(err,post);
			})
		})
	})
}
function Reversal(time){
	var rYear = time.getFullYear();   //获取系统的年；
	var rMonth = time.getMonth()+1;   //获取系统月份，由于月份是从0开始计算，所以要加1
	rMonth = (rMonth<10) ? "0" +rMonth : rMonth
	var rDay = time.getDate(); // 获取系统日，
	rDay = (rDay<10) ? "0" +rDay : rDay
	var rHours = time.getHours(); //获取系统时，
	rHours = (rHours<10) ? "0" +rHours : rHours
	var rMinutes = time.getMinutes(); //分
	rMinutes = (rMinutes<10) ? "0" +rMinutes : rMinutes
	var rReconds = time.getSeconds(); //秒
	rReconds = (rReconds<10) ? "0" +rReconds : rReconds
	return (rYear+"-"+rMonth+"-"+rDay+"- "+rHours+":"+rMinutes+":"+rReconds)
}
Post.get = function get(username,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		};
		//读取psots集合
		db.collection('posts',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			};
			//查找user属性为username的文档，如果username是null则匹配全部
			var query = {};
			if (username) {
				query.user = username;
			};
			collection.find(query).sort({time:-1}).toArray(function(err,docs){
				mongodb.close();
				if (err) {
					callback(err,null);
				};
				//封装posts为post对象
				var posts = [];
				docs.forEach(function(doc,index){
					var post = new Post(doc.user,doc.post,doc.time);
					posts.push(post)
				});
				callback(null,posts);
			})
		})
	})
}