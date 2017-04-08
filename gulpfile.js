const path = require('path');
const cms = require('cms');
const consolidate = require('consolidate');
const marked = require('marked');

const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const cleanCss = require('gulp-clean-css');
const minifyHtml = require('gulp-htmlmin');
const runSequence = require('run-sequence');

const src = path.resolve(__dirname, 'src');
const content = path.resolve(src, 'content');
const templates = path.resolve(src, 'templates');
const output = path.resolve(__dirname, 'build');

gulp.task('html', () => {
  gulp.src(path.resolve(output, '**/*.html')).pipe(minifyHtml({
    removeComments: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true
  })).pipe(gulp.dest(output));
});

gulp.task('css', () => {
  gulp.src(path.resolve(src, 'scss', 'style.scss')).pipe(sass()).pipe(autoprefixer({
    browsers: [
      'last 2 versions'
    ]
  })).pipe(cleanCss()).pipe(gulp.dest(path.resolve(output, 'css')));
});

gulp.task('js', () => {
  gulp.src(path.resolve(src, 'js', 'scripts.js')).pipe(babel()).pipe(uglify()).pipe(gulp.dest(path.resolve(output, 'js')));
});

gulp.task('cms', () => cms({
  permalink: (permalink) => `${permalink}/`,
  base: '/cms-demo',
  template: consolidate.pug,
  paths: {
    content: content,
    templates: templates,
    output: output
  },
  extensions: {
    templates: [
      'pug'
    ]
  },
  shortcodes: {
    youtube: (attrs, content) => {
      return `<div class="youtube" style="padding-top:${(100 / attrs.width * attrs.height)}%">
        <iframe src="https://www.youtube.com/embed/${attrs.id}" frameborder="0"></iframe>
      </div>`;
    }
  },
  addons: {
    markdown: (input) => marked(input)
  },
  globals: {
    site: 'CMS Demo'
  }
}));

gulp.task('content', (done) => {
  runSequence('cms', 'html', done);
});

gulp.task('build', [
  'content',
  'css',
  'js'
]);

gulp.task('dev', [
  'build'
], () => {
  gulp.watch([
    path.resolve(content, '**/*'),
    path.resolve(templates, '**/*'),
    path.resolve(src, 'scss', '**/*'),
    path.resolve(src, 'js', '**/*')
  ], [
    'build'
  ]);
});
