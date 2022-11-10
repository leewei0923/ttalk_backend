# Nest.js 简单配置的模板

## 开始

**下载**

```shell
git clone 

# 修改一些基本信息后
cd xiaoyu

npm i 
```



- 替换`HTTP`为fastify

- 版本控制

- 全局返回参数

- 环境配置
  - 自带环境配置
- 热重载

- api文档`Swagger`

- 配置数据库(MongoDB)

- 自定义日志



## 添加好友思路

A 添加 B 为好友

A 先搜索B，存在B，点击添加，已拿到B的account，存入数据库，同时通过websocket发送给B。

并在客户端提醒B，打开相应的页面拿到 A 发送的请求。同时返回同意的请求，并在添加一条好友数据。

B不在线

B 上线的时候.
