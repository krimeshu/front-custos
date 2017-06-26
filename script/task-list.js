/**
 * Created by krimeshu on 2017/4/14.
 */

var TaskList = [
    { name: 'compile_sass', load: () => require('./tasks/compile-sass'), desc: '编译 SASS 文件' },
    { name: 'run_babel', load: () => require('./tasks/run-babel'), desc: '使用 babel 转换 ES6 脚本' },
    { name: 'prepare_build', load: () => require('./tasks/prepare-build'), desc: '准备项目构建 (转移到构建目录)' },
    { name: 'replace_const', load: () => require('./tasks/replace-const'), desc: '替换定义的常量' },
    { name: 'vue_php_ssr_template', load: () => require('./tasks/vue-php-ssr-template'), desc: '处理Vue-PHP服务端模板 (仅供测试)' },
    { name: 'prefix_crafter', load: () => require('./tasks/prefix-crafter'), desc: '自动添加 CSS3 前缀' },
    { name: 'sprite_crafter', load: () => require('./tasks/sprite-crafter'), desc: '自动合并雪碧图' },
    { name: 'run_csso', load: () => require('./tasks/run-csso'), desc: '压缩样式文件' },
    { name: 'join_include', load: () => require('./tasks/join-include'), desc: '合并包含的文件内容' },
    { name: 'find_bundle_entry', load: () => require('./tasks/find-bundle-entry'), desc: '通过分析 html 文件标记脚本打包的入口' },
    { name: 'rollup_bundle', load: () => require('./tasks/rollup-bundle'), desc: '使用 rollup 打包脚本' },
    { name: 'run_browserify', load: () => require('./tasks/run-browserify'), desc: '使用 browserify 打包脚本' },
    { name: 'allot_link', load: () => require('./tasks/allot-link'), desc: '处理链接关系，分发文件' },
    { name: 'optimize_image', load: () => require('./tasks/optimize-image'), desc: '压缩图片文件' },
    { name: 'do_dist', load: () => require('./tasks/do-dist'), desc: '输出项目文件 (构建目录转到输出目录)' }
];

module.exports = TaskList;