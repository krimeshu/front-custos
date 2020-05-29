# front-custos

> 注意：3.0 系列将为最终更新，之后彻底不再继续维护。

整合前端开发中常用插件的任务流工具。

## 主要特点：

1. 全局安装，各项目适用，无需多次安装，方便管理
2. 以页面为入口，检测用到的文件，自动执行对应构建任务

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
