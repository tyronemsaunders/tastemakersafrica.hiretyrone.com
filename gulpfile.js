/**
 *
 *  Get the gulp packages
 *
 */
var gulp = require('gulp'), //install gulp globally as well
	vfs = require('vinyl-fs'),
	jshint = require('gulp-jshint'), //make sure jshint is installed globally with gulp-jshint
	templateCache = require('gulp-angular-templatecache'), // Concatenates and registers AngularJS templates in the $templateCache
    sass = require('gulp-sass'), //prefer global node-gyp installed
    autoprefixer = require('gulp-autoprefixer'),
    gulpConcat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify     = require('gulp-uglify'),
    cssnano = require('gulp-cssnano'),
    csslint = require('gulp-csslint'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    merge = require('merge-stream'),
    nunjucksRender = require('gulp-nunjucks-render'),
    del = require('del'),
    glob = require('glob'),
    streamqueue = require('streamqueue'),
    fs = require('fs');

/**
*
*  Setup configuration to keep tasks DRY
*
*/
var config = require('./config.json');
var pkg = require('./package.json');

/**
 *  
 *  Build site javascript
 *  
 */
gulp.task('build-js', ['order-vendor-js', 'order-site-js', 'html-templates'], function() {	
		
	var stream = gulp.src(config.src.app.js.vendor)
					.pipe(plumber({
						errorHandler : function (err) {
							console.log(err); //output errors to the console
							this.emit('end'); //tell gulp to end the task that errored out to prevent the task hanging
						}
					}))
					.pipe(jshint()) // lint each file to ensure that it follows project conventions
					.pipe(gulp.dest(config.dest.build.js.vendor)); //move files to build directory
	
	return stream;
});

/**
 *  
 *  reBuild site javascript
 *  
 */
gulp.task('rebuild-js', ['order-site-js', 'html-templates'], function() {	
		
	var stream = gulp.src(config.src.app.js.vendor)
					.pipe(plumber({
						errorHandler : function (err) {
							console.log(err); //output errors to the console
							this.emit('end'); //tell gulp to end the task that errored out to prevent the task hanging
						}
					}))
					.pipe(jshint()) // lint each file to ensure that it follows project conventions
					.pipe(gulp.dest(config.dest.build.js.vendor)); //move files to build directory
	
	return stream;
});

/**
 *  
 *  Compile site javascript
 *  
 */
gulp.task('compile-js', ['build-js'], function() {
	
	return streamqueue({objectMode: true},
			gulp.src(config.dest.build.js.vendor + '/**'),
			gulp.src(config.dest.build.js.site + '/**')
	)
	.pipe(sourcemaps.init()) // initialize sourcemaps
	  .pipe(gulpConcat("app.js")) // combine individual files into one file
	  .pipe(rename({basename: pkg.name + '-' + pkg.version}))
	  .pipe(ngAnnotate())
	  .pipe(rename({suffix: '.min'})) // rename file for minification
	  .pipe(uglify().on('error', gutil.log)) // minify the concatentated file
	.pipe(sourcemaps.write()) //inline source mpas are embedded in the source file
	.pipe(gulp.dest(config.dest.prod.js)); //move files to build directory
});

/**
 *  
 *  Convert html templates to javascript
 *  
 */
gulp.task('html-templates', function() {
	var vendorSrc = config.src.vendor.templates;
	var appSrc = config.src.app.templates;
	
	return streamqueue({objectMode: true},
			gulp.src(vendorSrc),
			gulp.src(appSrc)
	)
	.pipe(plumber({
		errorHandler : function (err) {
			console.log(err); //output errors to the console
			this.emit('end'); //tell gulp to end the task that errored out to prevent the task hanging
		}
	}))
	.pipe(templateCache('templates.js', {
		module : 'templates',
		standalone : 'true'
	}))
	.pipe(jshint()) // lint each file to ensure that it follows project conventions
	.pipe(gulp.dest(config.dest.build.js.site)); //move files to build directory
});

/**
 *  
 *  Order the Vendor javascript files based on the config array
 *  
 */
gulp.task('order-vendor-js', function(callback) {
	var arr = config.src.vendor.js;
	var destination = config.dest.src.js.vendor;
	
	var width = (arr.length + '').length;
	var orderedFiles = [];
	var counter = 0;
	
	for (var i = 0; i < arr.length; i++) {
		var prefixer = charPadding(i, width);
		
		gulp.src(arr[i])
		    .pipe(rename({
		    	prefix : prefixer + '-'
		    }))
		    .pipe(gulp.dest(destination));
		
		if (++counter == arr.length) {
			callback(null);
		}
	}	
});

/**
 *  
 *  Order the site javascript files based on the directory structure
 *  
 */
gulp.task('order-site-js', function(callback) {
	
	var arr = glob.sync(config.src.app.js.site[0]);
	var counter = 0;
	
	for (var i = 0; i < arr.length; i++) {
		var dirLevel = arr[i].split('/').length + '';
		var indexer;
		
		if (arr[i].indexOf('.module') > 0) {
			indexer = '1';
		} else if (arr[i].indexOf('.config') > 0) {
			indexer = '2';
		} else if (arr[i].indexOf('.run') > 0) {
			indexer = '3';
		} else if (arr[i].indexOf('.controller') > 0) {
			indexer = '4';
		} else if (arr[i].indexOf('.factory') > 0) {
			indexer = '5';
		} else if (arr[i].indexOf('.service') > 0) {
			indexer = '6';
		} else if (arr[i].indexOf('.provider') > 0) {
			indexer = '7';
		} else if (arr[i].indexOf('.directive') > 0) {
			indexer = '8';
		} else {
			indexer = '0';
		}
		
		var prefixer = dirLevel + indexer;
		
		var searchString = 'src/app/';
		var pathStart = arr[i].indexOf(searchString) + searchString.length;
		var pathEnd = arr[i].lastIndexOf('/');
		var newPath = arr[i].substring(pathStart, pathEnd);
		
		
		gulp.src(arr[i])
			.pipe(plumber({
				errorHandler : function (err) {
					console.log(err); //output errors to the console
					this.emit('end'); //tell gulp to end the task that errored out to prevent the task hanging
				}
			}))
			.pipe(jshint()) // lint each file to ensure that it follows project conventions
		    .pipe(rename({
		    	prefix : prefixer + '-'
		    }))
		    .pipe(gulp.dest(config.dest.build.js.site + '/' + newPath));
		
		if (++counter == arr.length) {
			callback(null);
		}
	}
});

/**
 *  
 *  Build Styles
 *  
 */
gulp.task('build-styles', ['copy-vendor-styles-to-src'], function() {
	/**
	 * Build Vendor CSS
	 * 1. Build include paths for scss partials 
	 * 2. Concatenate vendor scss/css into the proper order
	 * 3. Prefix css
	 * 4. lint css
	 * 5. rename file
	 * 6. send to destination
	 */
	var vendorPartials = config.src.app.styles.vendorPartials;
	var includePathArray = [];
	var tmpArray = [];
	
	for (var i = 0; i < vendorPartials.length; i++) {
		tmpArray = glob.sync(vendorPartials[i]);
		
		for (var j = 0; j < tmpArray.length; j++) {
			if (tmpArray[j] && fs.lstatSync(tmpArray[j]).isDirectory()) {
				includePathArray.push(tmpArray[j]);
			}
		}
	}
	
	var vendor = gulp.src(config.src.app.styles.vendor)
					.pipe(plumber({
						errorHandler : function (err) {
							console.log(err); //output errors to the console
							this.emit('end'); //tell gulp to end the task that errored out to prevent the task hanging
						}
					}))
					.pipe(gulpConcat('styles-vendor.scss'))
				    .pipe(sass({
				    	includePaths : includePathArray
				    }))
				    .pipe(autoprefixer({
					  browsers: ['last 2 versions'], //add CSS prefixes for last 2 browser versions
		              cascade: false //visual cascade is extra work for not much payoff
				    }))
				    .pipe(csslint())
				    //.pipe(csslint.formatter())
				    .pipe(rename({basename: pkg.name + '-' + pkg.version + '-vendor'})) // rename file
				    .pipe(gulp.dest(config.dest.build.css.vendor)) //move files to build directory
					.pipe(gulp.dest(config.dest.build.css.core)); //move files to build directory
	
	/**
	 * Build Site CSS
	 * 1. Concatenate vendor scss/css into the proper order
	 * 2. Prefix css
	 * 3. lint css
	 * 4. rename file
	 * 5. send to destination
	 */
	var site = gulp.src(config.src.app.styles.site)
					.pipe(plumber({
						errorHandler : function (err) {
							console.log(err); //output errors to the console
							this.emit('end'); //tell gulp to end the task that errored out to prevent the task hanging
						}
					}))
					.pipe(gulpConcat('styles-site.scss'))
				    .pipe(sass({
				    	includePaths : includePathArray
				    }))
				    .pipe(autoprefixer({
					  browsers: ['last 2 versions'], //add CSS prefixes for last 2 browser versions
				      cascade: false //visual cascade is extra work for not much payoff
				    }))
				    .pipe(csslint())
				    //.pipe(csslint.formatter())
				    .pipe(rename({basename: pkg.name + '-' + pkg.version + '-site'})) // rename file
				    .pipe(gulp.dest(config.dest.build.css.site)) //move files to build directory
					.pipe(gulp.dest(config.dest.build.css.core)); //move files to build directory
	
	return merge(vendor, site);					  
});

/**
 *  
 *  Breuild Styles
 *  
 */
gulp.task('rebuild-styles', function() {
	/**
	 * Build Vendor CSS
	 * 1. Build include paths for scss partials 
	 * 2. Concatenate vendor scss/css into the proper order
	 * 3. Prefix css
	 * 4. lint css
	 * 5. rename file
	 * 6. send to destination
	 */
	var vendorPartials = config.src.app.styles.vendorPartials;
	var includePathArray = [];
	var tmpArray = [];
	
	for (var i = 0; i < vendorPartials.length; i++) {
		tmpArray = glob.sync(vendorPartials[i]);
		
		for (var j = 0; j < tmpArray.length; j++) {
			if (tmpArray[j] && fs.lstatSync(tmpArray[j]).isDirectory()) {
				includePathArray.push(tmpArray[j]);
			}
		}
	}
	
	var vendor = gulp.src(config.src.app.styles.vendor)
					.pipe(plumber({
						errorHandler : function (err) {
							console.log(err); //output errors to the console
							this.emit('end'); //tell gulp to end the task that errored out to prevent the task hanging
						}
					}))
					.pipe(gulpConcat('styles-vendor.scss'))
				    .pipe(sass({
				    	includePaths : includePathArray
				    }))
				    .pipe(autoprefixer({
					  browsers: ['last 2 versions'], //add CSS prefixes for last 2 browser versions
		              cascade: false //visual cascade is extra work for not much payoff
				    }))
				    .pipe(csslint())
				    //.pipe(csslint.formatter())
				    .pipe(rename({basename: pkg.name + '-' + pkg.version + '-vendor'})) // rename file
				    .pipe(gulp.dest(config.dest.build.css.vendor)) //move files to build directory
					.pipe(gulp.dest(config.dest.build.css.core)); //move files to build directory
	
	/**
	 * Build Site CSS
	 * 1. Concatenate vendor scss/css into the proper order
	 * 2. Prefix css
	 * 3. lint css
	 * 4. rename file
	 * 5. send to destination
	 */
	var site = gulp.src(config.src.app.styles.site)
					.pipe(plumber({
						errorHandler : function (err) {
							console.log(err); //output errors to the console
							this.emit('end'); //tell gulp to end the task that errored out to prevent the task hanging
						}
					}))
					.pipe(gulpConcat('styles-site.scss'))
				    .pipe(sass({
				    	includePaths : includePathArray
				    }))
				    .pipe(autoprefixer({
					  browsers: ['last 2 versions'], //add CSS prefixes for last 2 browser versions
				      cascade: false //visual cascade is extra work for not much payoff
				    }))
				    .pipe(csslint())
				    //.pipe(csslint.formatter())
				    .pipe(rename({basename: pkg.name + '-' + pkg.version + '-site'})) // rename file
				    .pipe(gulp.dest(config.dest.build.css.site)) //move files to build directory
					.pipe(gulp.dest(config.dest.build.css.core)); //move files to build directory
	
	return merge(vendor, site);					  
});

/**
 *  
 *  Compile Styles
 *  
 */
gulp.task('compile-styles', ['build-styles'], function() {
	var vendorSrc = glob.sync(config.dest.build.css.vendor + '/*.css');
	var appSrc = glob.sync(config.dest.build.css.site + '/*.css');
	
	return streamqueue({objectMode: true},
			gulp.src(vendorSrc, {base : "."}),
			gulp.src(appSrc, {base : "."})
	)
	.pipe(sourcemaps.init()) // initialize sourcemaps
	  .pipe(gulpConcat('styles.css')) // combine individual files into one file
	  .pipe(rename({basename: pkg.name + '-' + pkg.version}))
	  .pipe(rename({suffix: '.min'})) // rename file for minification
	  .pipe(cssnano()) // minify the concatentated file
	.pipe(sourcemaps.write()) //inline source mpas are embedded in the source file
	.pipe(gulp.dest(config.dest.prod.css)); //move files to production directory				  
});

/**
 *  
 *  copy vendor to src
 *  
 */
gulp.task('copy-vendor-styles-to-src', function() {
	var styles = gulp.src(config.src.vendor.styles)
						.pipe(vfs.dest('src/assets/styles/vendor', {overwrite: false}));
	
	var stylePartials = gulp.src(config.src.vendor.stylePartials)
						.pipe(vfs.dest('src/assets/styles/vendor/partials', {overwrite: false}));
	
	var fonts = gulp.src(config.src.vendor.assets.fonts)
						.pipe(vfs.dest('src/assets/fonts', {overwrite: false}));
	
	return merge(styles, stylePartials, fonts);
});

/**
 *  
 *  copy src assets to build
 *  
 */
gulp.task('build-assets', ['copy-vendor-styles-to-src'], function() {
	var media = gulp.src(config.src.app.assets.media)
						.pipe(gulp.dest(config.dest.build.media));
	
	var fonts = gulp.src(config.src.app.assets.fonts)
						.pipe(gulp.dest(config.dest.build.fonts));
	
	return merge(media, fonts);
});

/**
 *  
 *  copy src assets to build
 *  
 */
gulp.task('rebuild-assets', function() {
	var media = gulp.src(config.src.app.assets.media)
						.pipe(gulp.dest(config.dest.build.media));
	
	var fonts = gulp.src(config.src.app.assets.fonts)
						.pipe(gulp.dest(config.dest.build.fonts));
	
	return merge(media, fonts);
});

/**
 *  
 *  copy build assets to production
 *  
 */
gulp.task('compile-assets', ['build-assets'], function() {
	var media = gulp.src(config.dest.build.media + '/**')
						.pipe(gulp.dest(config.dest.prod.media));
	
	var fonts = gulp.src(config.dest.build.fonts + '/**')
						.pipe(gulp.dest(config.dest.prod.fonts));
	
	return merge(media, fonts);
});

/**
 *  
 *  build the index.html file
 *  
 */
gulp.task('index:build', ['build-js', 'build-styles'], function() {	

	var vendorScripts = fixPathArray(glob.sync(config.dest.build.js.vendor + '/**/*.js') || []);
	var siteScripts = fixPathArray(glob.sync(config.dest.build.js.site + '/**/*.js') || []);
	var scriptsArray = (vendorScripts || []).concat(siteScripts);

	
	var vendorStyles = glob.sync(config.dest.build.css.core + '/*vendor.css') || [];
	var siteStyles = glob.sync(config.dest.build.css.core + '/*site.css') || []; 
	var stylesArray = fixPathArray(vendorStyles).concat(fixPathArray(siteStyles));
	
	var stream = gulp.src('src/index.tpl.html')
					.pipe(nunjucksRender({
						data : {
							scripts : scriptsArray,
							styles : stylesArray
						}
					}))
					.pipe(rename('index.html'))
					.pipe(gulp.dest('build'));
	return stream;
});

/**
 *  
 *  rebuild the index.html file
 *  
 */
gulp.task('index:rebuild', function() {	

	var vendorScripts = fixPathArray(glob.sync(config.dest.build.js.vendor + '/**/*.js') || []);
	var siteScripts = fixPathArray(glob.sync(config.dest.build.js.site + '/**/*.js') || []);
	var scriptsArray = (vendorScripts || []).concat(siteScripts);

	
	var vendorStyles = glob.sync(config.dest.build.css.core + '/*vendor.css') || [];
	var siteStyles = glob.sync(config.dest.build.css.core + '/*site.css') || []; 
	var stylesArray = fixPathArray(vendorStyles).concat(fixPathArray(siteStyles));
	
	var stream = gulp.src('src/index.tpl.html')
					.pipe(nunjucksRender({
						data : {
							scripts : scriptsArray,
							styles : stylesArray
						}
					}))
					.pipe(rename('index.html'))
					.pipe(gulp.dest('build'));
	return stream;
});

gulp.task('index:production', ['compile-js', 'compile-styles'], function() {	
	var scriptsArray = glob.sync(config.dest.prod.js + '/*.js') || [];
		scriptsArray = fixPathArray(scriptsArray);
		
	var stylesArray = glob.sync(config.dest.prod.css + '/*.css') || [];
		stylesArray = fixPathArray(stylesArray);
	
	var stream = gulp.src('src/index.tpl.html')
					.pipe(nunjucksRender({
						data : {
							scripts : scriptsArray,
							styles : stylesArray
						}
					}))
					.pipe(rename('index.html'))
					.pipe(gulp.dest('bin'));
	return stream;
});

/**
 *  
 *  clean build and production directories
 *  
 */
gulp.task('clean', function() {	
	return del([
	  'build/**/*',
	  'bin/**/*'
	]);
});

/**
 *  
 *  Run the build task for development
 *  
 */
gulp.task('build', ['build-js', 'build-styles', 'build-assets', 'index:build']);

/**
 *  
 *  Run the compile task for production
 *  
 */
gulp.task('compile', ['compile-js', 'compile-styles', 'compile-assets', 'index:production']);

/**
 *  
 *  Run the karma task for development
 *  
 */
gulp.task('karma', function() {
	//To Be Determined
});

/**
 *  
 *  Run the watch task for development
 *  
 */
gulp.task('watch', ['build'], function() {
	
	//watch css and scss files
	var siteStyles = config.src.app.styles.site || [];
	var vendorStyles = glob.sync('src/assets/styles/vendor/**') || [];
	var watchedStyles = siteStyles.concat(vendorStyles);
	
	gulp.watch(watchedStyles, ['rebuild-styles'], function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
	
	//watch javascript files
	gulp.watch(config.src.app.js.site, ['rebuild-js'], function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
	
	//watch javascript files
	gulp.watch(config.src.app.js.vendor, ['rebuild-js'], function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
	
	//watch template files
	gulp.watch(config.src.app.templates, ['rebuild-js'], function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
	
	//watch index.tpl.html
	gulp.watch('src/index.tpl.html', ['index:rebuild'], function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
	
	//watch media assets
	gulp.watch(config.src.app.assets.media, ['rebuild-assets'], function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
	
	//watch fonts
	gulp.watch(config.src.app.assets.fonts, ['rebuild-assets'], function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
	
	//watch gulpfile
	gulp.watch('gulpfile.js', ['rebuild-js', 'rebuild-styles', 'rebuild-assets'], function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
	
	//watch config.json
	gulp.watch('config.json', ['rebuild-js', 'rebuild-styles', 'rebuild-assets'], function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
});

/**
 *  
 *  Run the default task
 *  
 */
gulp.task('default', ['watch'], function() {
	
});


/**
 *  Function to remove the base from a path
 */
function fixPath(filename) {
	return filename.substring(filename.indexOf('/') + 1);
}

function fixPathArray(arr) {
	var newArray = [];
	var counter = 0;
	
	for (var i = 0; i < arr.length; i++) {
		newArray.push(fixPath(arr[i]));
		
		if (++counter == arr.length) {
			return newArray;
		}
	}
}

/**
 *  Function to pad numbers with leading character
 */
function charPadding(num, width, char) {
	//default parameters
	width = typeof width !== 'undefined' ? width : 4;
	char = typeof char !== 'undefined' ? char : '0';
	
	//convert num to string
	num = num + '';
	
	if (num.length >= width) {
		//number is okay
		return num
		
	} else {
		while (num.length < width) {
			num = char + num;
		}
		return num
	}
}