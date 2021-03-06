var Article = require('../models/article-model'),
		moment	= require('moment'),
		Q 			= require('q');
		
exports.listArticles = function (req, res) {
	var country = req.params.country;
	var qdate = moment(moment().subtract(1,"day"),"MMMM DD YYYY").unix();
	if (country!='all') {
		Article.articlesModel.find({"domain":country}, function (err, result) { res.json(result); }).sort({"pubdate":-1}).limit(25);
	}	else {
		Article.articlesModel.find({}, function (err, result) { res.json(result); }).sort({"pubdate":-1}).limit(25);
	}
}
exports.top5 = function (req,res) {
	var country = req.params.country;
	var	today = moment(moment().format("MMMM DD YYYY")).unix();
	Article.articlesModel.find({"pubdate": {$gte:today}, "domain":country}, function (err, result) {
		res.json(result);
	})
	.sort({"views":-1})
	.limit(5);
}
exports.exportArticles = function (req, res) {
	var country 	= req.params.country,
		startDate 	= req.params.startDate;
		endDate		= req.params.endDate;
	qopt_builder(country,null,startDate,endDate, function(callback) {
		Article.articlesModel.find(callback,function (err, result) {
			res.render('export', {"result":result});
		})
		.sort({"pubdate":"-1"});
	})
}
exports.queryArticles = function(req,res) {
	var country = req.query.country,
		category = req.query.category,
		sdate = req.query.sdate,
		edate = req.query.edate;
	qopt_builder(country, category, sdate, edate, function(callback) {
		Article.articlesModel.find(callback, function(err, result) {
			res.json(result);
		})
		.sort({"pubdate":"-1"})
	})
}
// query options builder
exports.findOneArticle = function(nodeID) { // #longquery
	Article.findOneByNodeID(nodeID, function(err, result) {
		return result;
	})
}
function qopt_builder(country,category,sdate,edate,callback) {
	var opts = {};
	if (country != undefined) opts.domain = country;
	if (category != undefined) opts.category = category;
	if (sdate != undefined) { // start date specified
		opts.pubdate = {};
		if (edate != undefined) { // end date specified
			var datetimeformat = "MMMM DD YYYY, hh:mm";
			edate += ', 23:59';
			opts.pubdate.$gte = moment(moment(sdate + ', 00:00', datetimeformat)).unix();
			opts.pubdate.$lte = moment(moment(edate, datetimeformat)).unix();
		} else {
			opts.pubdate.$gte = moment(moment(sdate + ', 00:00', datetimeformat)).unix();
			opts.pubdate.$lte = moment(moment(sdate + ', 23:59', datetimeformat)).unix();
		}
	};
	callback(opts);
}