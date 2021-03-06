var gulp 	= require('gulp'),
	spawn	= require('child_process').spawn,
	node;

gulp.task('server', function() {
	if (node) node.kill();
	node = spawn('node', ['app.js'], {stdio: 'inherit'});
	node.on('close', function(code) {
		if (code === 8) gulp.log('Error detected, waiting for changes...');
	})
});

gulp.task('default', ['server'], function() {
	gulp.watch(['./gulpfile.js','./app.js', './server/*/*.js','./client/*/*.js','./lib/*.js'], ['server'])
});

process.on('exit', function() {
	if (node) node.kill();
})