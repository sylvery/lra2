var express  = require('express'),
	x = require('x-ray')(),
	moment = require('moment'),
	q = require('q'),
	articlesController 	= require('./server/controllers/articles-server-controller'),
	retriever = require('./lib/retriever'),
	timeout = require('./lib/timeouts'),
	compression = require('compression'),
	serveStatic = require('serve-static'),
	bodyParser = require('body-parser'),
	cookieSession = require('cookie-session'),
	cookieParser = require('cookie-parser'),
	// fs = require('fs'),
	// P12toPEM = require('google-p12-pem'),
	// nPEM = new P12toPEM,
	app = express();
	// google apis, auths & tokens
// P12toPEM('./lib/lra2-81167be3844b.p12',(function(err,obj){
// 		if(!err) {
// 			fs.writeFile(__dirname+'/lib/key.pem',obj, (err)=>{
// 				if (!err) console.log("key.pem saved in 'lib' directory");
// 				else console.log(err);
// 			})
// 		}
// 		else console.log(err)
// 	}))
var google = require('googleapis'),
	ga = google.analytics('v3');
// var authS2S = require('./node_modules/lra2-1e61de3b4a18.json');
var jwtClient = new google.auth.JWT(
		process.env.JWT_CLIENT_EMAIL,// || authS2S.client_email,
		'./lib/key.pem',
		process.env.JWT_PRIVATE_KEY,// || authS2S.private_key,
		process.env.JWT_SCOPE,// || authS2S.scope,
		null
	);
jwtClient.authorize(function(err,tokens) {
	if (err) {
		console.log(err)
		return;
	} else {
		jwtClient.setCredentials(tokens);
	}
})
// raw functions
function queryData(analytics) {
  analytics.data.ga.get({
    'auth': jwtClient,
    'ids': process.env.JWT_VIEW_ID,// || authS2S.view_id,
    'metrics': 'ga:pageviews',
    'dimensions': 'ga:pagePath',
    'start-date': '7daysAgo',
    'end-date': 'today',
    'sort': '-ga:pageviews',
    'max-results': 10,
    'filters': 'ga:pagePath=~/aust-and-digicel-support-school-infrastructure-bougainville-55047',
  }, function (err, response) {
    if (err) {
      console.log('\nERROR\n----------\n',err);
      return;
    }
    console.log('\nSUCCESS\n',JSON.stringify(response, null, 4));
  });  
}
// routes: google analytics
var gaRouter = express.Router();
gaRouter.get('/oauthcallback?:code',(req,res)=>{
	var code = req.params.code;
	console.log('req.params',req.params);
	queryData(ga);
	console.log('authentic');
	res.render('png');
})
gaRouter.get('/test', (req,res)=>{
	console.log('/test route accessed.')
	queryData(ga);
	res.render('search')
})
app.use('/ga',gaRouter);
// http requests
app.post('/', function(req, res) {
	res.redirect('/populate');
});
app.get('/', function(req, res) {
	res.render('articles');
});
app.get('/write/:country', function(req, res) {
  var country = req.params.country;
	retriever.getArticles(country,8,0);
	res.redirect('/page/'+country);
});
// api call to get stories
app.get('/articles/:country', articlesController.listArticles);
app.get('/page/:country', function(req, res){res.render(req.params.country)});
// uri call to get top 5 stories
app.get('/top/:country', articlesController.top5);
app.get('/top-5/:country', function(req, res) {res.render(req.params.country + '-top-5')});
// api call to export stories
app.get('/export/:country/:startDate', articlesController.exportArticles);
app.get('/export/:country', articlesController.exportArticles);
app.get('/search', (req, res) => {res.render('search')});
app.get('/query/', articlesController.queryArticles);
app.get('/api/query/', (req,res) => {res.render('query')});
// api call to populate stories
app.get('/populate', (req, res) => {res.render('populate')});
app.get('/populate/content/', function(req, res) {
	var country = req.query.country.toLowerCase(), pagesToScan = req.query.pages, startScanAt = req.query.counter;
	retriever.getArticles(country,pagesToScan,startScanAt);
	res.redirect('/page/'+country);
});
app.get('/populate/auto/', (req, res) => {
	console.log(req.query);
	var li = req.query.limit,
	cy = req.query.country,
	cr = Number.parseInt(req.query.counter);
	timeout.activateRetrieval(cy,cr,li);
	res.redirect('/page/'+cy);
});
// app.use & app.set codes
app.set('views',__dirname + '/client/views');
app.set('view engine','ejs');
app.use('/fonts', express.static(__dirname + '/public/fonts'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/img', express.static(__dirname + '/public/img'));
app.use('/client/js', express.static(__dirname + '/client/js'));
app.use('/server/js', express.static(__dirname + '/server/js'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(bodyParser.json());
// app.use(cookieParser());
// app.use(cookieSession({ secret: 'monobelle' }));
app.use(compression());
app.use(serveStatic('/public/*/*'));
app.use(serveStatic('/css/*.*'));
app.use(serveStatic('/js/*.*'));
app.use(serveStatic('/img/*.*'));
app.use(serveStatic('/client/js/*.*'));
app.use(serveStatic('/server/js/*.*'));
app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function() { console.log('app started at port ' + app.get('port')); });

// module.exports = express;