# front-custos

一个前端开发的试验工具，用于懒得或不会写 gulpfile 时，能快速对不同项目生成常用的 gulp 任务。

![screenshot-command-line](https://github.com/krimeshu/front-custos/raw/master/screenshot-command-line.png)

## 安装方法

全局安装 `front-custos`。

```bash
npm install front-custos -g
```

## 项目配置

项目相关处理保存在项目 `package.json` 的 `fcOpt` 字段下，推荐使用 `front-custos-gui` 进行具体任务的配置。

[https://github.com/krimeshu/front-custos-gui](https://github.com/krimeshu/front-custos-gui)

## 使用方法

在项目目录下执行：

```bash
front-custos .
```

即可根据 `package.json` 中的配置执行相关任务流。

还可附加配置内未添加的其它任务：

```bash
front-custos . -a do_upload
```
