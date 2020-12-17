const gulp = require('gulp');
const $ = require('gulp-load-plugins')();//自動引入套件名稱為gulp開頭的套件
 // var jade = require('gulp-jade');//引入gulp jade套件
 // var sass = require('gulp-sass');//引入gulp sass套件
 // var plumber = require('gulp-plumber');//引入gulp plumber套件
 // var postcss = require('gulp-postcss');//引入gulp postcss套件
 const autoprefixer = require('autoprefixer');//引入autoprefixer套件
 // const sourcemaps = require('gulp-sourcemaps');
 // const babel = require('gulp-babel');
 // const concat = require('gulp-concat');
 var mainBowerFiles = require('main-bower-files');
 var browserSync = require('browser-sync').create();
//  const cleanCSS = require('gulp-clean-css');
 var minimist = require('minimist');
 var gulpSequence = require('gulp-sequence');
 var envOptions = {
  	string:'env',
  	default:{env: 'develop'}
  }
  var options = minimist(process.argv.slice(2),envOptions);
  console.log(options);
  gulp.task('clean', function () {
  return gulp.src(['./.tmp','./public'],{read: false})
      .pipe($.clean());
});
 gulp.task('jade', function() {
    gulp.src('./source/**/*.jade')//原始檔案來源位置，**/*寫法，會針對所有子資料夾做編譯
      .pipe($.plumber())
      .pipe($.jade({
        pretty: true//可設定是否壓縮
      }))
      .pipe(gulp.dest('./public/'))//指定的輸出資料夾位置
      .pipe(browserSync.stream());
      });
      
  gulp.task('sass', function () {
    return gulp.src('./source/scss/**/*.scss')//原始檔案來源位置
       .pipe($.plumber())//避免有錯誤造成運作停止
       .pipe($.sourcemaps.init())
       .pipe($.sass().on('error', $.sass.logError))
       .pipe($.postcss([autoprefixer()])) // 直接引入 autoprefixer
       .pipe($.if(options.env === 'production', $.cleanCss()))
       .pipe($.sourcemaps.write('.'))
      //  .pipe($.cleanCss({compatibility: 'ie8'}))
      //  .pipe($.minfyCss())
       .pipe(gulp.dest('./public/css'))//指定的輸出資料夾位置
       .pipe(browserSync.stream());//自動重新整理
    });
  gulp.task('babel',() => {
    return gulp.src('./source/js/**/*.js')
       .pipe($.sourcemaps.init())
       .pipe($.babel({
            presets: ['@babel/env']
        }))
      //  .pipe($.babel({
      //      presets: ['es2015']
      //  }))
       .pipe($.concat('all.js'))//合併
       .pipe($.if(options.env === 'production',$.uglify(
                  {
                  compress:{
                    drop_console:true
                  }
                }
            )))
        //  {
  //  })))
       .pipe($.sourcemaps.write('.'))
       .pipe(gulp.dest('./public/js'))
       .pipe(browserSync.stream());
  });
  gulp.task('bower', function() {
    return gulp.src(mainBowerFiles())
        .pipe(gulp.dest('./.tmp/vendors'))
        .pipe($.concat('vendors.js'))
        .pipe($.uglify())
        .pipe(gulp.dest('./public/js'));
});
  gulp.task('vendorJs', ['bower'], function() {
    return gulp.src('./.tmp/vendors/**/*.js')
        .pipe($.concat('vendors.js'))
        .pipe($.if(options.env === 'production', $.uglify()))
        .pipe(gulp.dest('./public/js'));
  })
  gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    });
  });
  gulp.task('image-min', () => {
    return gulp.src('./source/images/*')
        .pipe($.if(options.env === 'production',$.imagemin()))
        .pipe(gulp.dest('./public/images'));
  });
  // gulp.task('minify-css', () => {
  //   return gulp.src('styles/*.css')
  //     .pipe(cleanCSS({compatibility: 'ie8'}))
  //     .pipe(gulp.dest('dist'));
  // });
  gulp.task('watch', function () { //會監控指定的任務名稱
      gulp.watch('./source/scss/**/*.scss', ['sass']);//監控是否有變動，有就會執行指定的任務名稱(例如'sass','jade')
      gulp.watch('./source/**/*.jade', ['jade']);
      gulp.watch('./source/js/**/*.js', ['babel']);
});
  gulp.task('default',['clean','jade','sass','babel','bower','browser-sync','watch']);
  gulp.task('build', gulpSequence('clean','jade','sass','babel','bower','vendorJs','image-min'));
  // gulp.task('build', gulpSequence('clean',['jade','sass','babel','bower','vendorJs']));
  // gulpSequence(['a', 'b'], 'c')
    // gulp.task('build',
  // gulp.series(
  //   'clean',
  //   gulp.parallel('jade', 'sass', 'babel', 'bower'),
  //   'vendorJs'
  // ))