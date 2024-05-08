/*
SQLyog Ultimate v13.1.1 (64 bit)
MySQL - 8.0.29 : Database - xiaoyu_tools
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
USE `xiaoyu_tools`;

/*Table structure for table `login_record` */

DROP TABLE IF EXISTS `login_record`;

CREATE TABLE `login_record` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8_general_ci DEFAULT NULL,
  `token` varchar(4000) CHARACTER SET utf8mb3 COLLATE utf8_general_ci DEFAULT NULL,
  `device` varchar(100) DEFAULT NULL,
  `ip` varchar(100) DEFAULT NULL,
  `login_status` tinyint(1) DEFAULT NULL,
  `start_time` bigint DEFAULT NULL,
  `end_time` bigint DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `os` varchar(100) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb3;

/*Table structure for table `oauth` */

DROP TABLE IF EXISTS `oauth`;

CREATE TABLE `oauth` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8_general_ci DEFAULT NULL,
  `oauth_name` varchar(100) DEFAULT NULL COMMENT '账户类型',
  `oauth_id` varchar(100) DEFAULT NULL,
  `account` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8_general_ci DEFAULT NULL COMMENT '账号',
  `password` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8_general_ci DEFAULT NULL COMMENT '密码',
  `salt` varchar(100) DEFAULT NULL COMMENT '盐值',
  `edit_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改日期',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;

/*Table structure for table `ttalk_user` */

DROP TABLE IF EXISTS `ttalk_user`;

CREATE TABLE `ttalk_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8_general_ci DEFAULT NULL,
  `account` varchar(100) DEFAULT NULL COMMENT '账号',
  `nickname` varchar(100) DEFAULT NULL COMMENT '昵称',
  `bird_date` varchar(100) DEFAULT NULL COMMENT '生日',
  `social` varchar(2000) DEFAULT NULL COMMENT '社交链接',
  `motto` varchar(500) DEFAULT NULL COMMENT '个性签名',
  `password` varchar(100) DEFAULT NULL,
  `add_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ip` varchar(100) DEFAULT NULL,
  `salt` varchar(100) DEFAULT NULL COMMENT '盐值',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb3;

/*Table structure for table `user` */

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `openid` varchar(100) NOT NULL COMMENT '微信openid',
  `account` varchar(100) DEFAULT NULL COMMENT '账号',
  `nickname` varchar(100) DEFAULT NULL COMMENT '昵称',
  `bird_date` varchar(100) DEFAULT NULL COMMENT '出生日期',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `gender` varchar(100) DEFAULT NULL COMMENT '性别',
  `avatar_url` varchar(1000) DEFAULT NULL COMMENT '头像地址',
  `edit_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
