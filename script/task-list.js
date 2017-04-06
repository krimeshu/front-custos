/**
 * Created by krimeshu on 2017/4/14.
 */

var TaskList = [
    { name: 'compile_sass', load: () => require('./tasks/compile-sass'), desc: '编译SASS文件' },
    { name: 'run_babel', load: () => require('./tasks/run-babel'), desc: '使用babel转换es6脚本' },
    { name: 'prepare_build', load: () => require('./tasks/prepare-build'), desc: '准备项目构建' },
    { name: 'replace_const', load: () => require('./tasks/replace-const'), desc: '替换定义的常量' },
    { name: 'vue_php_ssr_template', load: () => require('./tasks/vue-php-ssr-template'), desc: '处理Vue-PHP服务端模板' },
    { name: 'prefix_crafter', load: () => require('./tasks/prefix-crafter'), desc: '添加CSS3前缀' },
    { name: 'sprite_crafter', load: () => require('./tasks/sprite-crafter'), desc: '自动合并雪碧图' },
    { name: 'run_csso', load: () => require('./tasks/run-csso'), desc: '压缩样式' },
    { name: 'join_include', load: () => require('./tasks/join-include'), desc: '合并包含的文件' },
    { name: 'rollup_bundle', load: () => require('./tasks/rollup-bundle'), desc: '通过rollup打包脚本' },
    { name: 'run_browserify', load: () => require('./tasks/run-browserify'), desc: '通过browserify打包脚本' },
    { name: 'allot_link', load: () => require('./tasks/allot-link'), desc: '分发关联文件' },
    { name: 'optimize_image', load: () => require('./tasks/optimize-image'), desc: '压缩图片' },
    { name: 'do_dist', load: () => require('./tasks/do-dist'), desc: '输出项目文件' },
    { name: 'do_upload', load: () => require('./tasks/do-upload'), desc: '上传文件' }
];

module.exports = TaskList;