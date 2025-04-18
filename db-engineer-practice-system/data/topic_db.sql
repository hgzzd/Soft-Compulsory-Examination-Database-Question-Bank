/*
 Navicat Premium Data Transfer

 Source Server         : Mysql8(Windosw)
 Source Server Type    : MySQL
 Source Server Version : 80039
 Source Host           : localhost:3306
 Source Schema         : topic_db

 Target Server Type    : MySQL
 Target Server Version : 80039
 File Encoding         : 65001

 Date: 18/04/2025 00:53:13
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for answer_records
-- ----------------------------
DROP TABLE IF EXISTS `answer_records`;
CREATE TABLE `answer_records`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '答题记录ID',
  `practice_id` int NOT NULL COMMENT '练习记录ID',
  `question_id` int NOT NULL COMMENT '题目ID',
  `user_answer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '用户答案',
  `is_correct` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否正确（1:正确 0:错误）',
  `time_spent` int NULL DEFAULT NULL COMMENT '答题用时（秒）',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_practice_id`(`practice_id` ASC) USING BTREE,
  INDEX `idx_question_id`(`question_id` ASC) USING BTREE,
  CONSTRAINT `fk_answer_practice` FOREIGN KEY (`practice_id`) REFERENCES `practice_records` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '答题记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of answer_records
-- ----------------------------

-- ----------------------------
-- Table structure for exam_sets
-- ----------------------------
DROP TABLE IF EXISTS `exam_sets`;
CREATE TABLE `exam_sets`  (
  `exam_set_id` int NOT NULL AUTO_INCREMENT COMMENT '套题唯一ID',
  `exam_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '套题名称（如\"2023年数据库系统工程师综合知识\"）',
  `year` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '年份（如\"2023\"）',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '套题描述',
  PRIMARY KEY (`exam_set_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '套题元信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of exam_sets
-- ----------------------------
INSERT INTO `exam_sets` VALUES (1, '2023年上半年数据库系统工程师试题', '2023', '2023年上半年数据库系统工程师基础知识试题');
INSERT INTO `exam_sets` VALUES (2, '2022年上半年数据库系统工程师试题', '2022', '2022年上半年数据库系统工程师基础知识试题');

-- ----------------------------
-- Table structure for options
-- ----------------------------
DROP TABLE IF EXISTS `options`;
CREATE TABLE `options`  (
  `exam_set_id` int NOT NULL,
  `question_number` int NOT NULL,
  `option_label` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `option_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`exam_set_id`, `question_number`, `option_label`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of options
-- ----------------------------
INSERT INTO `options` VALUES (1, 1, 'A', '接口和外设');
INSERT INTO `options` VALUES (1, 1, 'B', '运算器、控制器和寄存器');
INSERT INTO `options` VALUES (1, 1, 'C', 'CPU、主存及外设部件');
INSERT INTO `options` VALUES (1, 1, 'D', 'DMA控制器和中断控制器');
INSERT INTO `options` VALUES (1, 2, 'A', '高速缓存地址');
INSERT INTO `options` VALUES (1, 2, 'B', '主存物理地址');
INSERT INTO `options` VALUES (1, 2, 'C', '硬盘的扇区地址');
INSERT INTO `options` VALUES (1, 2, 'D', '虚拟地址');
INSERT INTO `options` VALUES (1, 3, 'A', '1');
INSERT INTO `options` VALUES (1, 3, 'B', '2');
INSERT INTO `options` VALUES (1, 3, 'C', '4');
INSERT INTO `options` VALUES (1, 3, 'D', '8');
INSERT INTO `options` VALUES (1, 4, 'A', '被选中设备的地址');
INSERT INTO `options` VALUES (1, 4, 'B', '待传送数据的起始地址');
INSERT INTO `options` VALUES (1, 4, 'C', '中断服务程序入口地址');
INSERT INTO `options` VALUES (1, 4, 'D', '主程序的断点地址');
INSERT INTO `options` VALUES (1, 5, 'A', '单链表');
INSERT INTO `options` VALUES (1, 5, 'B', '单循环链表');
INSERT INTO `options` VALUES (1, 5, 'C', '双链表');
INSERT INTO `options` VALUES (1, 5, 'D', '数组');
INSERT INTO `options` VALUES (1, 6, 'A', 'h==NULL');
INSERT INTO `options` VALUES (1, 6, 'B', 'h->next==NULL');
INSERT INTO `options` VALUES (1, 6, 'C', 'h->next-next==NULL');
INSERT INTO `options` VALUES (1, 6, 'D', 'h->next=h');
INSERT INTO `options` VALUES (1, 7, 'A', 'p->next==NULL');
INSERT INTO `options` VALUES (1, 7, 'B', 'p->next=h');
INSERT INTO `options` VALUES (1, 7, 'C', 'p->next->next==NULL');
INSERT INTO `options` VALUES (1, 7, 'D', 'p->next->next==h');
INSERT INTO `options` VALUES (1, 8, 'A', '15');
INSERT INTO `options` VALUES (1, 8, 'B', '11');
INSERT INTO `options` VALUES (1, 8, 'C', '9');
INSERT INTO `options` VALUES (1, 8, 'D', '0');
INSERT INTO `options` VALUES (1, 9, 'A', 'E');
INSERT INTO `options` VALUES (1, 10, 'A', '2');
INSERT INTO `options` VALUES (1, 10, 'B', '3');
INSERT INTO `options` VALUES (1, 10, 'C', '4');
INSERT INTO `options` VALUES (1, 10, 'D', '5');
INSERT INTO `options` VALUES (1, 11, 'A', '源代码测试');
INSERT INTO `options` VALUES (1, 11, 'B', '二进制代码测试');
INSERT INTO `options` VALUES (1, 11, 'C', '动态渗透测试');
INSERT INTO `options` VALUES (1, 11, 'D', '模糊测试');
INSERT INTO `options` VALUES (1, 12, 'A', '流密码');
INSERT INTO `options` VALUES (1, 12, 'B', '分组密码');
INSERT INTO `options` VALUES (1, 12, 'C', '替换密码');
INSERT INTO `options` VALUES (1, 12, 'D', 'HASH碰撞');
INSERT INTO `options` VALUES (1, 13, 'A', '木马');
INSERT INTO `options` VALUES (1, 13, 'B', '暴力攻击');
INSERT INTO `options` VALUES (1, 13, 'C', 'IP地址欺骗');
INSERT INTO `options` VALUES (1, 13, 'D', '格式化字符串攻击');
INSERT INTO `options` VALUES (1, 14, 'A', '网络钓鱼属于社会工程攻击');
INSERT INTO `options` VALUES (1, 14, 'B', '网络钓鱼与Web服务没有关系');
INSERT INTO `options` VALUES (1, 14, 'C', '典型的网络钓鱼攻击是将被攻击者引诱到一个钓鱼网站');
INSERT INTO `options` VALUES (1, 14, 'D', '网络钓鱼融合了伪装、欺骗等多种攻击方式');
INSERT INTO `options` VALUES (1, 15, 'A', '对机房中旋转的计算机硬件进行保护');
INSERT INTO `options` VALUES (1, 15, 'B', '攻击监视器的闪光、声音、无线电或其他信号来检测通信与计算');
INSERT INTO `options` VALUES (1, 15, 'C', '利用物理系统接口的弱点来渗透系统');
INSERT INTO `options` VALUES (1, 15, 'D', '通过侦听网络数据报文来获取用户数据');
INSERT INTO `options` VALUES (1, 16, 'A', '发表权');
INSERT INTO `options` VALUES (1, 16, 'B', '发行权');
INSERT INTO `options` VALUES (1, 16, 'C', '展览权');
INSERT INTO `options` VALUES (1, 16, 'D', '署名权');
INSERT INTO `options` VALUES (1, 17, 'A', '合同法');
INSERT INTO `options` VALUES (1, 17, 'B', '物权法');
INSERT INTO `options` VALUES (1, 17, 'C', '版权法');
INSERT INTO `options` VALUES (1, 17, 'D', '刑法');
INSERT INTO `options` VALUES (1, 18, 'A', '查找时间');
INSERT INTO `options` VALUES (1, 18, 'B', '旋转延迟时间');
INSERT INTO `options` VALUES (1, 18, 'C', '传输时间');
INSERT INTO `options` VALUES (1, 18, 'D', '计算时间');
INSERT INTO `options` VALUES (1, 19, 'A', '就绪到运行');
INSERT INTO `options` VALUES (1, 19, 'B', '运行到就绪');
INSERT INTO `options` VALUES (1, 19, 'C', '等待到运行');
INSERT INTO `options` VALUES (1, 19, 'D', '运行到等待');
INSERT INTO `options` VALUES (1, 20, 'A', '锁变量');
INSERT INTO `options` VALUES (1, 20, 'B', 'Peterson方法');
INSERT INTO `options` VALUES (1, 20, 'C', 'TSL指令');
INSERT INTO `options` VALUES (1, 20, 'D', '信号量');
INSERT INTO `options` VALUES (1, 21, 'A', '时钟算法');
INSERT INTO `options` VALUES (1, 21, 'B', '先入先出算法');
INSERT INTO `options` VALUES (1, 21, 'C', '二次机会算法');
INSERT INTO `options` VALUES (1, 21, 'D', '最近未使用算法');
INSERT INTO `options` VALUES (1, 22, 'A', '顺序');
INSERT INTO `options` VALUES (1, 22, 'B', '选择');
INSERT INTO `options` VALUES (1, 22, 'C', '循环');
INSERT INTO `options` VALUES (1, 22, 'D', '函数');
INSERT INTO `options` VALUES (1, 23, 'A', '基本');
INSERT INTO `options` VALUES (1, 23, 'B', '用户定义');
INSERT INTO `options` VALUES (1, 23, 'C', '指针');
INSERT INTO `options` VALUES (1, 23, 'D', '构造');
INSERT INTO `options` VALUES (1, 24, 'A', '错误的功能');
INSERT INTO `options` VALUES (1, 24, 'B', '遗漏的功能');
INSERT INTO `options` VALUES (1, 24, 'C', '程序数据结构的有效性');
INSERT INTO `options` VALUES (1, 24, 'D', '初始化或终止性错误');
INSERT INTO `options` VALUES (1, 25, 'A', '螺旋模型');
INSERT INTO `options` VALUES (1, 25, 'B', '瀑布模型');
INSERT INTO `options` VALUES (1, 25, 'C', 'V模型');
INSERT INTO `options` VALUES (1, 25, 'D', '原型化模型');
INSERT INTO `options` VALUES (1, 26, 'A', '外部系统');
INSERT INTO `options` VALUES (1, 26, 'B', '数据存储');
INSERT INTO `options` VALUES (1, 26, 'C', '加工');
INSERT INTO `options` VALUES (1, 26, 'D', '外部实体');
INSERT INTO `options` VALUES (1, 27, 'A', '类图');
INSERT INTO `options` VALUES (1, 27, 'B', '序列图');
INSERT INTO `options` VALUES (1, 27, 'C', '部署图');
INSERT INTO `options` VALUES (1, 27, 'D', '状态图');
INSERT INTO `options` VALUES (1, 28, 'A', '序列图');
INSERT INTO `options` VALUES (1, 28, 'B', '类图');
INSERT INTO `options` VALUES (1, 28, 'C', '部署图');
INSERT INTO `options` VALUES (1, 28, 'D', '状态图');
INSERT INTO `options` VALUES (1, 29, 'A', '数模转换');
INSERT INTO `options` VALUES (1, 29, 'B', '路由转发');
INSERT INTO `options` VALUES (1, 29, 'C', '认证');
INSERT INTO `options` VALUES (1, 29, 'D', '地址转换');
INSERT INTO `options` VALUES (1, 30, 'A', '传输层');
INSERT INTO `options` VALUES (1, 30, 'B', '会话层');
INSERT INTO `options` VALUES (1, 30, 'C', '表示层');
INSERT INTO `options` VALUES (1, 30, 'D', '应用层');
INSERT INTO `options` VALUES (1, 31, 'A', 'telnet支持命令模式和会话模式');
INSERT INTO `options` VALUES (1, 31, 'B', 'telnet采用明文传输');
INSERT INTO `options` VALUES (1, 31, 'C', 'telnet默认端口是23');
INSERT INTO `options` VALUES (1, 31, 'D', 'telnet采用UDP协议');
INSERT INTO `options` VALUES (1, 32, 'A', 'FTP');
INSERT INTO `options` VALUES (1, 32, 'B', 'HTTP');
INSERT INTO `options` VALUES (1, 32, 'C', 'SSL');
INSERT INTO `options` VALUES (1, 32, 'D', 'DNS');
INSERT INTO `options` VALUES (1, 33, 'A', 'SQL Server');
INSERT INTO `options` VALUES (1, 33, 'B', 'MySQL');
INSERT INTO `options` VALUES (1, 33, 'C', 'HarmonyOS');
INSERT INTO `options` VALUES (1, 33, 'D', 'openGauss');
INSERT INTO `options` VALUES (1, 34, 'A', '数据结构');
INSERT INTO `options` VALUES (1, 34, 'B', '数据操作');
INSERT INTO `options` VALUES (1, 34, 'C', '并发控制');
INSERT INTO `options` VALUES (1, 34, 'D', '数据的完整性约束');
INSERT INTO `options` VALUES (1, 35, 'A', '逻辑模式');
INSERT INTO `options` VALUES (1, 35, 'B', '外模式');
INSERT INTO `options` VALUES (1, 35, 'C', '概念模式');
INSERT INTO `options` VALUES (1, 35, 'D', '内模式');
INSERT INTO `options` VALUES (1, 36, 'A', 'R⋃S');
INSERT INTO `options` VALUES (1, 36, 'B', 'R⋂S');
INSERT INTO `options` VALUES (1, 36, 'C', 'R-S');
INSERT INTO `options` VALUES (1, 36, 'D', 'R×S');
INSERT INTO `options` VALUES (1, 37, 'A', 'E');
INSERT INTO `options` VALUES (1, 37, 'B', 'F,G');
INSERT INTO `options` VALUES (1, 37, 'C', 'H,K');
INSERT INTO `options` VALUES (1, 37, 'D', 'E,F,G');
INSERT INTO `options` VALUES (1, 38, 'A', 'GRANT SELECT ON TABLE Course TO WANG');
INSERT INTO `options` VALUES (1, 38, 'B', 'GRANT SELECT ON VIEW Course TO WANG');
INSERT INTO `options` VALUES (1, 38, 'C', 'REVOKE SELECT ON TABLE Course TO WANG');
INSERT INTO `options` VALUES (1, 38, 'D', 'REVOKE SELECT ON VIEW Course TO WANG');
INSERT INTO `options` VALUES (1, 39, 'A', '一定属于BCNF');
INSERT INTO `options` VALUES (1, 39, 'B', '消除了插入和删除异常');
INSERT INTO `options` VALUES (1, 39, 'C', '仍存在一定的插入和删除异常');
INSERT INTO `options` VALUES (1, 39, 'D', '属于BCNF且消除了插入和删除异常');
INSERT INTO `options` VALUES (1, 40, 'A', '_');
INSERT INTO `options` VALUES (1, 40, 'B', '%');
INSERT INTO `options` VALUES (1, 40, 'C', '?');
INSERT INTO `options` VALUES (1, 40, 'D', '*');
INSERT INTO `options` VALUES (1, 41, 'A', '视图是虚拟表');
INSERT INTO `options` VALUES (1, 41, 'B', '视图可以从视图导出');
INSERT INTO `options` VALUES (1, 41, 'C', '视图的定义存放在数据库中');
INSERT INTO `options` VALUES (1, 41, 'D', '所有视图都可以更新');
INSERT INTO `options` VALUES (1, 42, 'A', 'Sage<>NULL');
INSERT INTO `options` VALUES (1, 42, 'B', 'Sage!=NULL');
INSERT INTO `options` VALUES (1, 42, 'C', 'Sage IS NOT NULL');
INSERT INTO `options` VALUES (1, 42, 'D', 'Sage NOT IS NULL');
INSERT INTO `options` VALUES (1, 43, 'A', 'SELECT子句');
INSERT INTO `options` VALUES (1, 43, 'B', 'WHERE子句');
INSERT INTO `options` VALUES (1, 43, 'C', 'GROUP BY子句');
INSERT INTO `options` VALUES (1, 43, 'D', 'HAVING子句');
INSERT INTO `options` VALUES (1, 44, 'A', '使用UNIQUE索引');
INSERT INTO `options` VALUES (1, 44, 'B', '使用CLUSTER索引');
INSERT INTO `options` VALUES (1, 44, 'C', '使用ORDER BY子句');
INSERT INTO `options` VALUES (1, 44, 'D', '使用GROUP BY子句');
INSERT INTO `options` VALUES (1, 45, 'A', '实体完整性');
INSERT INTO `options` VALUES (1, 45, 'B', '参照完整性');
INSERT INTO `options` VALUES (1, 45, 'C', '用户定义的完整性');
INSERT INTO `options` VALUES (1, 45, 'D', '概念模型完整性');
INSERT INTO `options` VALUES (1, 46, 'A', '\"学号\"与\"姓名\"之间相互函数依赖');
INSERT INTO `options` VALUES (1, 46, 'B', '\"学号\"与\"姓名\"之间相互不函数依赖');
INSERT INTO `options` VALUES (1, 46, 'C', '\"姓名\"函数依赖于\"学号\"，反之不然');
INSERT INTO `options` VALUES (1, 46, 'D', '\"学号\"函数依赖于\"姓名\"，反之不然');
INSERT INTO `options` VALUES (1, 47, 'A', '1NF');
INSERT INTO `options` VALUES (1, 47, 'B', '2NF');
INSERT INTO `options` VALUES (1, 47, 'C', '3NF');
INSERT INTO `options` VALUES (1, 47, 'D', 'BCNF');
INSERT INTO `options` VALUES (1, 48, 'A', '非平凡的函数依赖');
INSERT INTO `options` VALUES (1, 48, 'B', '平凡的函数依赖');
INSERT INTO `options` VALUES (1, 48, 'C', '平凡的多值依赖');
INSERT INTO `options` VALUES (1, 48, 'D', '非函数依赖的多值依赖');
INSERT INTO `options` VALUES (1, 49, 'A', '原子性');
INSERT INTO `options` VALUES (1, 49, 'B', '一致性');
INSERT INTO `options` VALUES (1, 49, 'C', '隔离性');
INSERT INTO `options` VALUES (1, 49, 'D', '持久性');
INSERT INTO `options` VALUES (1, 50, 'A', '事务故障');
INSERT INTO `options` VALUES (1, 50, 'B', '系统故障');
INSERT INTO `options` VALUES (1, 50, 'C', '介质故障');
INSERT INTO `options` VALUES (1, 50, 'D', '计算机病毒');
INSERT INTO `options` VALUES (1, 51, 'A', '脏读');
INSERT INTO `options` VALUES (1, 51, 'B', '丢失修改');
INSERT INTO `options` VALUES (1, 51, 'C', '不可重复读');
INSERT INTO `options` VALUES (1, 51, 'D', '幻读');
INSERT INTO `options` VALUES (1, 52, 'A', 'Read Uncommitted');
INSERT INTO `options` VALUES (1, 52, 'B', 'Read Committed');
INSERT INTO `options` VALUES (1, 52, 'C', 'Repeatable Read');
INSERT INTO `options` VALUES (1, 52, 'D', 'Serializable');
INSERT INTO `options` VALUES (1, 53, 'A', '非空');
INSERT INTO `options` VALUES (1, 53, 'B', '主键');
INSERT INTO `options` VALUES (1, 53, 'C', '外键');
INSERT INTO `options` VALUES (1, 53, 'D', '唯一性');
INSERT INTO `options` VALUES (1, 54, 'A', '主键');
INSERT INTO `options` VALUES (1, 54, 'B', 'CHECK');
INSERT INTO `options` VALUES (1, 54, 'C', 'defalut');
INSERT INTO `options` VALUES (1, 54, 'D', '唯一性');
INSERT INTO `options` VALUES (1, 55, 'A', 'SELECT');
INSERT INTO `options` VALUES (1, 55, 'B', 'UPDATE');
INSERT INTO `options` VALUES (1, 55, 'C', 'DELETE');
INSERT INTO `options` VALUES (1, 55, 'D', 'INSERT');
INSERT INTO `options` VALUES (1, 56, 'A', 'referencing');
INSERT INTO `options` VALUES (1, 56, 'B', 'when');
INSERT INTO `options` VALUES (1, 56, 'C', 'if');
INSERT INTO `options` VALUES (1, 56, 'D', 'for each row');
INSERT INTO `options` VALUES (1, 57, 'A', '触发器用于实现一些复杂的业务规则');
INSERT INTO `options` VALUES (1, 57, 'B', '触发器内部可以使用事务控制语句');
INSERT INTO `options` VALUES (1, 57, 'C', '触发器只能被动触发，不能直接调用');
INSERT INTO `options` VALUES (1, 57, 'D', '触发器内部不能使用DDL语句');
INSERT INTO `options` VALUES (1, 58, 'A', '一级封锁');
INSERT INTO `options` VALUES (1, 58, 'B', '二级封锁');
INSERT INTO `options` VALUES (1, 58, 'C', '三级封锁');
INSERT INTO `options` VALUES (1, 58, 'D', '两段锁');
INSERT INTO `options` VALUES (1, 59, 'A', 'B树索引');
INSERT INTO `options` VALUES (1, 59, 'B', '散列索引');
INSERT INTO `options` VALUES (1, 59, 'C', '位图索引');
INSERT INTO `options` VALUES (1, 59, 'D', '倒序索引');
INSERT INTO `options` VALUES (1, 60, 'A', '尽可能地减少多表查询');
INSERT INTO `options` VALUES (1, 60, 'B', '只检索需要的属性列');
INSERT INTO `options` VALUES (1, 60, 'C', '尽量使用相关子查询');
INSERT INTO `options` VALUES (1, 60, 'D', '经常提交修改，尽量释放锁');
INSERT INTO `options` VALUES (1, 61, 'A', '表合并');
INSERT INTO `options` VALUES (1, 61, 'B', '水平分解');
INSERT INTO `options` VALUES (1, 61, 'C', '物理分区');
INSERT INTO `options` VALUES (1, 61, 'D', '垂直分解');
INSERT INTO `options` VALUES (1, 62, 'A', '表合并');
INSERT INTO `options` VALUES (1, 62, 'B', '水平分解');
INSERT INTO `options` VALUES (1, 62, 'C', '物理分区');
INSERT INTO `options` VALUES (1, 62, 'D', '垂直分解');
INSERT INTO `options` VALUES (1, 63, 'A', '提高查询语句执行效率');
INSERT INTO `options` VALUES (1, 63, 'B', '实现数据的物理独立性');
INSERT INTO `options` VALUES (1, 63, 'C', '提高更新语句执行效率');
INSERT INTO `options` VALUES (1, 63, 'D', '实现数据的逻辑独立性');
INSERT INTO `options` VALUES (1, 64, 'A', '确定数据分布');
INSERT INTO `options` VALUES (1, 64, 'B', '确定关系模式');
INSERT INTO `options` VALUES (1, 64, 'C', '确定存储结构');
INSERT INTO `options` VALUES (1, 64, 'D', '确定访问方式');
INSERT INTO `options` VALUES (1, 65, 'A', '读错误');
INSERT INTO `options` VALUES (1, 65, 'B', '写错误');
INSERT INTO `options` VALUES (1, 65, 'C', '逻辑错误');
INSERT INTO `options` VALUES (1, 65, 'D', '系统掉电');
INSERT INTO `options` VALUES (1, 66, 'A', '延迟修改');
INSERT INTO `options` VALUES (1, 66, 'B', '立即修改');
INSERT INTO `options` VALUES (1, 66, 'C', '撤销');
INSERT INTO `options` VALUES (1, 66, 'D', '重做');
INSERT INTO `options` VALUES (1, 67, 'A', '中止');
INSERT INTO `options` VALUES (1, 67, 'B', '回滚');
INSERT INTO `options` VALUES (1, 67, 'C', '重启');
INSERT INTO `options` VALUES (1, 67, 'D', '终止');
INSERT INTO `options` VALUES (1, 68, 'A', '非易失性');
INSERT INTO `options` VALUES (1, 68, 'B', '易失性');
INSERT INTO `options` VALUES (1, 68, 'C', '永久性');
INSERT INTO `options` VALUES (1, 68, 'D', '虚拟');
INSERT INTO `options` VALUES (1, 69, 'A', '局部性');
INSERT INTO `options` VALUES (1, 69, 'B', '全局性');
INSERT INTO `options` VALUES (1, 69, 'C', '重构性');
INSERT INTO `options` VALUES (1, 69, 'D', '完整性');
INSERT INTO `options` VALUES (1, 70, 'A', '列存储，图存储，文件存储');
INSERT INTO `options` VALUES (1, 70, 'B', 'KEY-VALUE存储，图存储，关系表存储');
INSERT INTO `options` VALUES (1, 70, 'C', '对象存储，XML存储，层次存储');
INSERT INTO `options` VALUES (1, 70, 'D', '对象存储，图存储，关系表存储');
INSERT INTO `options` VALUES (1, 71, 'A', 'DB');
INSERT INTO `options` VALUES (1, 71, 'B', 'DBMS');
INSERT INTO `options` VALUES (1, 71, 'C', 'SQL');
INSERT INTO `options` VALUES (1, 71, 'D', 'DDL');
INSERT INTO `options` VALUES (1, 72, 'A', 'database administrators(DBAs)');
INSERT INTO `options` VALUES (1, 72, 'B', 'application programmers');
INSERT INTO `options` VALUES (1, 72, 'C', 'end users');
INSERT INTO `options` VALUES (1, 72, 'D', 'programmers');
INSERT INTO `options` VALUES (1, 73, 'A', 'DDL');
INSERT INTO `options` VALUES (1, 73, 'B', 'DML');
INSERT INTO `options` VALUES (1, 73, 'C', 'SQL');
INSERT INTO `options` VALUES (1, 73, 'D', 'MML');
INSERT INTO `options` VALUES (1, 74, 'A', 'DDL');
INSERT INTO `options` VALUES (1, 74, 'B', 'DML');
INSERT INTO `options` VALUES (1, 74, 'C', 'SQL');
INSERT INTO `options` VALUES (1, 74, 'D', 'MML');
INSERT INTO `options` VALUES (1, 75, 'A', 'maintenance');
INSERT INTO `options` VALUES (1, 75, 'B', 'security');
INSERT INTO `options` VALUES (1, 75, 'C', 'performance');
INSERT INTO `options` VALUES (1, 75, 'D', 'capacity');
INSERT INTO `options` VALUES (2, 1, 'A', '指令周期');
INSERT INTO `options` VALUES (2, 1, 'B', '时钟周期');
INSERT INTO `options` VALUES (2, 1, 'C', '总线周期');
INSERT INTO `options` VALUES (2, 1, 'D', 'CPU周期');
INSERT INTO `options` VALUES (2, 2, 'A', '20△t');
INSERT INTO `options` VALUES (2, 2, 'B', '21△t');
INSERT INTO `options` VALUES (2, 2, 'C', '22△t');
INSERT INTO `options` VALUES (2, 2, 'D', '24△t');
INSERT INTO `options` VALUES (2, 3, 'A', '①②');
INSERT INTO `options` VALUES (2, 3, 'B', '①③');
INSERT INTO `options` VALUES (2, 3, 'C', '②③');
INSERT INTO `options` VALUES (2, 3, 'D', '①②③');
INSERT INTO `options` VALUES (2, 4, 'A', '减少信息传输线的数量');
INSERT INTO `options` VALUES (2, 4, 'B', '提高信息的传输速度');
INSERT INTO `options` VALUES (2, 4, 'C', '减少总的信息传输量');
INSERT INTO `options` VALUES (2, 4, 'D', '提高信息传输的并行性');
INSERT INTO `options` VALUES (2, 5, 'A', '78 21+36*34-');
INSERT INTO `options` VALUES (2, 5, 'B', '78 21 36 34-*+');
INSERT INTO `options` VALUES (2, 5, 'C', '78 21 36 34+*-');
INSERT INTO `options` VALUES (2, 5, 'D', '36 34-21*78+');
INSERT INTO `options` VALUES (2, 6, 'A', '栈');
INSERT INTO `options` VALUES (2, 6, 'B', '队列');
INSERT INTO `options` VALUES (2, 6, 'C', '数组');
INSERT INTO `options` VALUES (2, 6, 'D', '串');
INSERT INTO `options` VALUES (2, 7, 'A', '5');
INSERT INTO `options` VALUES (2, 7, 'B', '6');
INSERT INTO `options` VALUES (2, 7, 'C', '7');
INSERT INTO `options` VALUES (2, 7, 'D', '8');
INSERT INTO `options` VALUES (2, 8, 'A', '串是仅由字符构成的有限序列');
INSERT INTO `options` VALUES (2, 8, 'B', '串是取值范围受限的线性表');
INSERT INTO `options` VALUES (2, 8, 'C', '空串不包含任何字符');
INSERT INTO `options` VALUES (2, 8, 'D', '串只可以采用顺序存储方式');
INSERT INTO `options` VALUES (2, 9, 'A', '顺序存储、有序排列');
INSERT INTO `options` VALUES (2, 9, 'B', '散列存储、有序排列');
INSERT INTO `options` VALUES (2, 9, 'C', '顺序存储、无序排列');
INSERT INTO `options` VALUES (2, 9, 'D', '散列存储、无序排列');
INSERT INTO `options` VALUES (2, 10, 'A', '快速排序');
INSERT INTO `options` VALUES (2, 10, 'B', '冒泡排序');
INSERT INTO `options` VALUES (2, 10, 'C', '堆排序');
INSERT INTO `options` VALUES (2, 10, 'D', '希尔排序');
INSERT INTO `options` VALUES (2, 11, 'A', 'HTTPS');
INSERT INTO `options` VALUES (2, 11, 'B', 'SSH');
INSERT INTO `options` VALUES (2, 11, 'C', 'IPSec');
INSERT INTO `options` VALUES (2, 11, 'D', 'Socks');
INSERT INTO `options` VALUES (2, 12, 'A', '指纹识别');
INSERT INTO `options` VALUES (2, 12, 'B', '人脸识别');
INSERT INTO `options` VALUES (2, 12, 'C', '口令');
INSERT INTO `options` VALUES (2, 12, 'D', '手写签名');
INSERT INTO `options` VALUES (2, 13, 'A', 'AES');
INSERT INTO `options` VALUES (2, 13, 'B', 'RSA');
INSERT INTO `options` VALUES (2, 13, 'C', 'MD5');
INSERT INTO `options` VALUES (2, 13, 'D', 'DES');
INSERT INTO `options` VALUES (2, 14, 'A', '加密');
INSERT INTO `options` VALUES (2, 14, 'B', '认证');
INSERT INTO `options` VALUES (2, 14, 'C', '授权');
INSERT INTO `options` VALUES (2, 14, 'D', '备份');
INSERT INTO `options` VALUES (2, 15, 'A', '病毒');
INSERT INTO `options` VALUES (2, 15, 'B', '蠕虫');
INSERT INTO `options` VALUES (2, 15, 'C', '木马');
INSERT INTO `options` VALUES (2, 15, 'D', '宏');
INSERT INTO `options` VALUES (2, 16, 'A', '甲乙丙均');
INSERT INTO `options` VALUES (2, 16, 'B', '先申请者');
INSERT INTO `options` VALUES (2, 16, 'C', '先试用者');
INSERT INTO `options` VALUES (2, 16, 'D', '先发明者');
INSERT INTO `options` VALUES (2, 17, 'A', '著作权');
INSERT INTO `options` VALUES (2, 17, 'B', '专利权');
INSERT INTO `options` VALUES (2, 17, 'C', '商标权');
INSERT INTO `options` VALUES (2, 17, 'D', '商业秘密权');
INSERT INTO `options` VALUES (2, 18, 'A', '中断驱动I/O');
INSERT INTO `options` VALUES (2, 18, 'B', '程序驱动I/O');
INSERT INTO `options` VALUES (2, 18, 'C', 'DMA');
INSERT INTO `options` VALUES (2, 18, 'D', 'TLB');
INSERT INTO `options` VALUES (2, 19, 'A', '先来先服务');
INSERT INTO `options` VALUES (2, 19, 'B', '优先级调度');
INSERT INTO `options` VALUES (2, 19, 'C', '短作业优先');
INSERT INTO `options` VALUES (2, 19, 'D', '轮转算法');
INSERT INTO `options` VALUES (2, 20, 'A', '转换检测缓冲区');
INSERT INTO `options` VALUES (2, 20, 'B', '虚拟内存');
INSERT INTO `options` VALUES (2, 20, 'C', '多级页表');
INSERT INTO `options` VALUES (2, 20, 'D', '内存映射');
INSERT INTO `options` VALUES (2, 21, 'A', '地址空间');
INSERT INTO `options` VALUES (2, 21, 'B', '栈');
INSERT INTO `options` VALUES (2, 21, 'C', '寄存器');
INSERT INTO `options` VALUES (2, 21, 'D', '程序计数器');
INSERT INTO `options` VALUES (2, 22, 'A', '结构体');
INSERT INTO `options` VALUES (2, 22, 'B', '数组');
INSERT INTO `options` VALUES (2, 22, 'C', '全局变量');
INSERT INTO `options` VALUES (2, 22, 'D', '局部变量');
INSERT INTO `options` VALUES (2, 23, 'A', '函数是一段具有独立功能的程序单元');
INSERT INTO `options` VALUES (2, 23, 'B', '函数是先声明后引用');
INSERT INTO `options` VALUES (2, 23, 'C', '函数的定义包括函数首部和函数体');
INSERT INTO `options` VALUES (2, 23, 'D', '函数允许嵌套定义');
INSERT INTO `options` VALUES (2, 24, 'A', 'C');
INSERT INTO `options` VALUES (2, 24, 'B', 'C++');
INSERT INTO `options` VALUES (2, 24, 'C', 'Ruby');
INSERT INTO `options` VALUES (2, 24, 'D', 'JavaScript');
INSERT INTO `options` VALUES (2, 25, 'A', '螺旋模型');
INSERT INTO `options` VALUES (2, 25, 'B', '瀑布模型');
INSERT INTO `options` VALUES (2, 25, 'C', 'V模型');
INSERT INTO `options` VALUES (2, 25, 'D', '原型化模型');
INSERT INTO `options` VALUES (2, 26, 'A', '功能需求');
INSERT INTO `options` VALUES (2, 26, 'B', '非功能需求');
INSERT INTO `options` VALUES (2, 26, 'C', '设计约束');
INSERT INTO `options` VALUES (2, 26, 'D', '过程约束');
INSERT INTO `options` VALUES (2, 27, 'A', '外部系统');
INSERT INTO `options` VALUES (2, 27, 'B', '数据存储');
INSERT INTO `options` VALUES (2, 27, 'C', '加工');
INSERT INTO `options` VALUES (2, 27, 'D', '用户');
INSERT INTO `options` VALUES (2, 28, 'A', '类图');
INSERT INTO `options` VALUES (2, 28, 'B', '对象图');
INSERT INTO `options` VALUES (2, 28, 'C', '序列图');
INSERT INTO `options` VALUES (2, 28, 'D', '状态图');
INSERT INTO `options` VALUES (2, 29, 'A', 'FTP');
INSERT INTO `options` VALUES (2, 29, 'B', 'SFTP');
INSERT INTO `options` VALUES (2, 29, 'C', 'TFTP');
INSERT INTO `options` VALUES (2, 29, 'D', 'ICMP');
INSERT INTO `options` VALUES (2, 30, 'A', '将域名解析为IP地址');
INSERT INTO `options` VALUES (2, 30, 'B', '将MAC地址解析为IP地址');
INSERT INTO `options` VALUES (2, 30, 'C', '将IP地址解析为MAC地址');
INSERT INTO `options` VALUES (2, 30, 'D', '将主机名解析为IP地址');
INSERT INTO `options` VALUES (2, 31, 'A', 'SMTP');
INSERT INTO `options` VALUES (2, 31, 'B', 'POP');
INSERT INTO `options` VALUES (2, 31, 'C', 'IMAP');
INSERT INTO `options` VALUES (2, 31, 'D', 'FTP');
INSERT INTO `options` VALUES (2, 32, 'A', '防火墙');
INSERT INTO `options` VALUES (2, 32, 'B', 'WEB防火墙');
INSERT INTO `options` VALUES (2, 32, 'C', '入侵检测系统');
INSERT INTO `options` VALUES (2, 32, 'D', '堡垒机');
INSERT INTO `options` VALUES (2, 33, 'A', '固定和变化');
INSERT INTO `options` VALUES (2, 33, 'B', '变化和固定');
INSERT INTO `options` VALUES (2, 33, 'C', '固定和固定');
INSERT INTO `options` VALUES (2, 33, 'D', '变化和变化');
INSERT INTO `options` VALUES (2, 34, 'A', '结构复杂');
INSERT INTO `options` VALUES (2, 34, 'B', '没有通用化的查询工具');
INSERT INTO `options` VALUES (2, 34, 'C', '没有严格的数学支撑');
INSERT INTO `options` VALUES (2, 34, 'D', '实现细节对程序员不可见');
INSERT INTO `options` VALUES (2, 35, 'A', '内模式改变时，外模式必须改变');
INSERT INTO `options` VALUES (2, 35, 'B', '外模式改变时，逻辑模式必须改变');
INSERT INTO `options` VALUES (2, 35, 'C', '数据库中存储文件的结构对应于内模式');
INSERT INTO `options` VALUES (2, 35, 'D', '一个数据库只有一个外模式');
INSERT INTO `options` VALUES (2, 36, 'A', '实体完整性');
INSERT INTO `options` VALUES (2, 36, 'B', '参照完整性');
INSERT INTO `options` VALUES (2, 36, 'C', '元组完整性');
INSERT INTO `options` VALUES (2, 36, 'D', '用户定义的完整性');
INSERT INTO `options` VALUES (2, 37, 'A', '表的行次序可以任意交换');
INSERT INTO `options` VALUES (2, 37, 'B', '表的列次序不能任意交换');
INSERT INTO `options` VALUES (2, 37, 'C', '同一个表的两个列可以有相同的属性名');
INSERT INTO `options` VALUES (2, 37, 'D', '同一个数据库的两个表可以同名');
INSERT INTO `options` VALUES (2, 38, 'A', 'E×F');
INSERT INTO `options` VALUES (2, 38, 'B', 'E⋂F');
INSERT INTO `options` VALUES (2, 38, 'C', 'E⋃F');
INSERT INTO `options` VALUES (2, 38, 'D', 'E⨝F');
INSERT INTO `options` VALUES (2, 39, 'A', 'SQL只适用于关系型数据库');
INSERT INTO `options` VALUES (2, 39, 'B', 'SQL是一种结构化查询语言');
INSERT INTO `options` VALUES (2, 39, 'C', 'SQL语句不能嵌入到C语句中执行');
INSERT INTO `options` VALUES (2, 39, 'D', '所有关系型数据库系统都必须支持SQL99标准的所有特性');
INSERT INTO `options` VALUES (2, 40, 'A', '原子性');
INSERT INTO `options` VALUES (2, 40, 'B', '一致性');
INSERT INTO `options` VALUES (2, 40, 'C', '隔离性');
INSERT INTO `options` VALUES (2, 40, 'D', '持久性');
INSERT INTO `options` VALUES (2, 41, 'A', 'NOT NULL');
INSERT INTO `options` VALUES (2, 41, 'B', 'UNIQUE');
INSERT INTO `options` VALUES (2, 41, 'C', 'CHECK');
INSERT INTO `options` VALUES (2, 41, 'D', 'DEFAULT');
INSERT INTO `options` VALUES (2, 42, 'A', 'SELECT Mname,Mphone,Ddate,Dvalue FROM Member, Deal WHERE Mname LIKE \"%陈\" and Member.M_id = Deal.M_id');
INSERT INTO `options` VALUES (2, 42, 'B', 'SELECT Mname,Mphone,Ddate,Dvalue FROM Member, Deal WHERE Mname LIKE \"陈%\" and Member.M_id = Deal.M_id');
INSERT INTO `options` VALUES (2, 42, 'C', 'SELECT Mname,Mphone,Ddate,Dvalue FROM Member, Deal WHERE Member.M_id = Deal.M_id');
INSERT INTO `options` VALUES (2, 42, 'D', 'SELECT Mname,Mphone,Ddate,Dvalue FROM Member, Deal WHERE Mname LIKE \"%陈%\"');
INSERT INTO `options` VALUES (2, 43, 'A', '{电子科技大学，西安电子科技大学，杭州电子科技大学，桂林电子科技大学}');
INSERT INTO `options` VALUES (2, 43, 'B', '{教育部，浙江，广西}');
INSERT INTO `options` VALUES (2, 43, 'C', '{教育部，教育部，浙江，广西}');
INSERT INTO `options` VALUES (2, 43, 'D', '{四川，陕西，浙江，广西}');
INSERT INTO `options` VALUES (2, 44, 'A', '无任何权限');
INSERT INTO `options` VALUES (2, 44, 'B', '插入D表的权限');
INSERT INTO `options` VALUES (2, 44, 'C', '插入M表的权限');
INSERT INTO `options` VALUES (2, 44, 'D', '插入D和M表的权限');
INSERT INTO `options` VALUES (2, 45, 'A', '行级前');
INSERT INTO `options` VALUES (2, 45, 'B', '行级后');
INSERT INTO `options` VALUES (2, 45, 'C', '语句级前');
INSERT INTO `options` VALUES (2, 45, 'D', '语句级后');
INSERT INTO `options` VALUES (2, 46, 'A', '平凡函数依赖');
INSERT INTO `options` VALUES (2, 46, 'B', '部分函数依赖');
INSERT INTO `options` VALUES (2, 46, 'C', '传递函数依赖');
INSERT INTO `options` VALUES (2, 46, 'D', '多值依赖');
INSERT INTO `options` VALUES (2, 47, 'A', '2NF');
INSERT INTO `options` VALUES (2, 47, 'B', '3NF');
INSERT INTO `options` VALUES (2, 47, 'C', '4NF');
INSERT INTO `options` VALUES (2, 47, 'D', 'BCNF');
INSERT INTO `options` VALUES (2, 48, 'A', '具有无损连接性，保持函数依赖');
INSERT INTO `options` VALUES (2, 48, 'B', '具有无损连接性，不保持函数依赖');
INSERT INTO `options` VALUES (2, 48, 'C', '不具有无损连接性，保持函数依赖');
INSERT INTO `options` VALUES (2, 48, 'D', '不具有无损连接性，不保持函数依赖');
INSERT INTO `options` VALUES (2, 49, 'A', 'Y→X');
INSERT INTO `options` VALUES (2, 49, 'B', 'X→Y');
INSERT INTO `options` VALUES (2, 49, 'C', 'Y→→X');
INSERT INTO `options` VALUES (2, 49, 'D', 'X→→Y');
INSERT INTO `options` VALUES (2, 50, 'A', '消除决定因素非码的非平凡函数依赖');
INSERT INTO `options` VALUES (2, 50, 'B', '消除主属性对码的部分和传递函数依赖');
INSERT INTO `options` VALUES (2, 50, 'C', '消除非平凡的多值依赖');
INSERT INTO `options` VALUES (2, 50, 'D', '消除非平凡且非函数依赖的多值依赖');
INSERT INTO `options` VALUES (2, 51, 'A', '由程序调用执行');
INSERT INTO `options` VALUES (2, 51, 'B', '由增删改事件激活，自动执行');
INSERT INTO `options` VALUES (2, 51, 'C', '由SELECT语句激活，自动执行');
INSERT INTO `options` VALUES (2, 51, 'D', '由系统时钟事件激活，自动执行');
INSERT INTO `options` VALUES (2, 52, 'A', '存储过程可以有参数');
INSERT INTO `options` VALUES (2, 52, 'B', '存储过程可以使用游标');
INSERT INTO `options` VALUES (2, 52, 'C', '存储过程可以调用触发器');
INSERT INTO `options` VALUES (2, 52, 'D', '存储过程是数据库对象');
INSERT INTO `options` VALUES (2, 53, 'A', '建立冗余');
INSERT INTO `options` VALUES (2, 53, 'B', '并发控制');
INSERT INTO `options` VALUES (2, 53, 'C', '加密');
INSERT INTO `options` VALUES (2, 53, 'D', '创建完整性约束');
INSERT INTO `options` VALUES (2, 54, 'A', '只能读不能写');
INSERT INTO `options` VALUES (2, 54, 'B', '只能写不能读');
INSERT INTO `options` VALUES (2, 54, 'C', '既可读又可写');
INSERT INTO `options` VALUES (2, 54, 'D', '不能读不能写');
INSERT INTO `options` VALUES (2, 55, 'A', '①');
INSERT INTO `options` VALUES (2, 55, 'B', '①②');
INSERT INTO `options` VALUES (2, 55, 'C', '②③');
INSERT INTO `options` VALUES (2, 55, 'D', '③');
INSERT INTO `options` VALUES (2, 56, 'A', 'A=5,B=20');
INSERT INTO `options` VALUES (2, 56, 'B', 'A=7,B=6');
INSERT INTO `options` VALUES (2, 56, 'C', 'A=25,B=24');
INSERT INTO `options` VALUES (2, 56, 'D', 'A=9,B=8');
INSERT INTO `options` VALUES (2, 57, 'A', '是正确的');
INSERT INTO `options` VALUES (2, 57, 'B', '是可串行化的');
INSERT INTO `options` VALUES (2, 57, 'C', '是不正确的');
INSERT INTO `options` VALUES (2, 57, 'D', '会产生死锁');
INSERT INTO `options` VALUES (2, 58, 'A', '一级封锁协议');
INSERT INTO `options` VALUES (2, 58, 'B', '二级封锁协议');
INSERT INTO `options` VALUES (2, 58, 'C', '三级封锁协议');
INSERT INTO `options` VALUES (2, 58, 'D', '两段锁协议');
INSERT INTO `options` VALUES (2, 59, 'A', '是可串行化的，一定会发生死锁');
INSERT INTO `options` VALUES (2, 59, 'B', '是可串行化的，可能会发生死锁');
INSERT INTO `options` VALUES (2, 59, 'C', '不是可串行化的，一定会发生死锁');
INSERT INTO `options` VALUES (2, 59, 'D', '不是可串行化的，可能会发生死锁');
INSERT INTO `options` VALUES (2, 60, 'A', '数据转储');
INSERT INTO `options` VALUES (2, 60, 'B', '登记日志文件');
INSERT INTO `options` VALUES (2, 60, 'C', '数据库镜像');
INSERT INTO `options` VALUES (2, 60, 'D', '封锁机制');
INSERT INTO `options` VALUES (2, 61, 'A', '逻辑结构设计、概念结构设计、物理结构设计');
INSERT INTO `options` VALUES (2, 61, 'B', '概念结构设计、逻辑结构设计、物理结构设计');
INSERT INTO `options` VALUES (2, 61, 'C', '概念结构设计、物理结构设计、逻辑结构设计');
INSERT INTO `options` VALUES (2, 61, 'D', '物理结构设计、逻辑结构设计、概念结构设计');
INSERT INTO `options` VALUES (2, 62, 'A', '数据库中的字典');
INSERT INTO `options` VALUES (2, 62, 'B', '查询数据的字典');
INSERT INTO `options` VALUES (2, 62, 'C', '关于数据库中数据的描述');
INSERT INTO `options` VALUES (2, 62, 'D', '不可更新的');
INSERT INTO `options` VALUES (2, 63, 'A', '一元联系');
INSERT INTO `options` VALUES (2, 63, 'B', '二元联系');
INSERT INTO `options` VALUES (2, 63, 'C', '三元联系');
INSERT INTO `options` VALUES (2, 63, 'D', '四元联系');
INSERT INTO `options` VALUES (2, 64, 'A', '发表');
INSERT INTO `options` VALUES (2, 64, 'B', '发表时间');
INSERT INTO `options` VALUES (2, 64, 'C', '用户');
INSERT INTO `options` VALUES (2, 64, 'D', '无');
INSERT INTO `options` VALUES (2, 65, 'A', 'BEGIN TRANSACTION');
INSERT INTO `options` VALUES (2, 65, 'B', 'UNDO');
INSERT INTO `options` VALUES (2, 65, 'C', 'COMMIT');
INSERT INTO `options` VALUES (2, 65, 'D', 'REDO');
INSERT INTO `options` VALUES (2, 66, 'A', '系统故障');
INSERT INTO `options` VALUES (2, 66, 'B', '介质故障');
INSERT INTO `options` VALUES (2, 66, 'C', '事务内部故障');
INSERT INTO `options` VALUES (2, 66, 'D', '计算机病毒');
INSERT INTO `options` VALUES (2, 67, 'A', '①②③');
INSERT INTO `options` VALUES (2, 67, 'B', '②③④');
INSERT INTO `options` VALUES (2, 67, 'C', '①③④');
INSERT INTO `options` VALUES (2, 67, 'D', '①②③④');
INSERT INTO `options` VALUES (2, 68, 'A', '数据的组织面向主题');
INSERT INTO `options` VALUES (2, 68, 'B', '数据是集成的');
INSERT INTO `options` VALUES (2, 68, 'C', '数据是相对不稳定的');
INSERT INTO `options` VALUES (2, 68, 'D', '数据是反映历史变化的');
INSERT INTO `options` VALUES (2, 69, 'A', '成本低');
INSERT INTO `options` VALUES (2, 69, 'B', '结构简单');
INSERT INTO `options` VALUES (2, 69, 'C', '拓展性强');
INSERT INTO `options` VALUES (2, 69, 'D', '数据冗余低');
INSERT INTO `options` VALUES (2, 70, 'A', 'MapReduce的计算过程分解为两个主要阶段：Map阶段和Reduce阶段');
INSERT INTO `options` VALUES (2, 70, 'B', '用户无需编写Map函数和Reduce函数');
INSERT INTO `options` VALUES (2, 70, 'C', 'MapReduce中存在数据chuck的冗余复制');
INSERT INTO `options` VALUES (2, 70, 'D', '在同等硬件条件下，MapReduce的性能一般低于并行数据库');
INSERT INTO `options` VALUES (2, 71, 'A', 'inefficient');
INSERT INTO `options` VALUES (2, 71, 'B', 'efficient');
INSERT INTO `options` VALUES (2, 71, 'C', 'easy');
INSERT INTO `options` VALUES (2, 71, 'D', 'uneasiness');
INSERT INTO `options` VALUES (2, 72, 'A', 'many');
INSERT INTO `options` VALUES (2, 72, 'B', 'past');
INSERT INTO `options` VALUES (2, 72, 'C', 'big');
INSERT INTO `options` VALUES (2, 72, 'D', 'much');
INSERT INTO `options` VALUES (2, 73, 'A', 'distributed');
INSERT INTO `options` VALUES (2, 73, 'B', 'single');
INSERT INTO `options` VALUES (2, 73, 'C', 'many');
INSERT INTO `options` VALUES (2, 73, 'D', 'data');
INSERT INTO `options` VALUES (2, 74, 'A', 'table');
INSERT INTO `options` VALUES (2, 74, 'B', 'row');
INSERT INTO `options` VALUES (2, 74, 'C', 'system');
INSERT INTO `options` VALUES (2, 74, 'D', 'interface');
INSERT INTO `options` VALUES (2, 75, 'A', 'used');
INSERT INTO `options` VALUES (2, 75, 'B', 'affected');
INSERT INTO `options` VALUES (2, 75, 'C', 'supported');
INSERT INTO `options` VALUES (2, 75, 'D', 'exploited');

-- ----------------------------
-- Table structure for practice_records
-- ----------------------------
DROP TABLE IF EXISTS `practice_records`;
CREATE TABLE `practice_records`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '练习记录ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `duration` int NOT NULL DEFAULT 0 COMMENT '练习时长（分钟）',
  `total_questions` int NOT NULL DEFAULT 0 COMMENT '题目总数',
  `correct_count` int NOT NULL DEFAULT 0 COMMENT '正确题目数',
  `incorrect_count` int NOT NULL DEFAULT 0 COMMENT '错误题目数',
  `score` int NOT NULL DEFAULT 0 COMMENT '分数（百分制）',
  `exam_set_id` int NULL DEFAULT NULL COMMENT '关联的试卷ID，如果有',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_start_time`(`start_time` ASC) USING BTREE,
  INDEX `fk_practice_exam`(`exam_set_id` ASC) USING BTREE,
  CONSTRAINT `fk_practice_exam` FOREIGN KEY (`exam_set_id`) REFERENCES `exam_sets` (`exam_set_id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_practice_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '练习记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of practice_records
-- ----------------------------

-- ----------------------------
-- Table structure for questions
-- ----------------------------
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions`  (
  `question_id` int NOT NULL AUTO_INCREMENT COMMENT '题目唯一ID',
  `exam_set_id` int NOT NULL COMMENT '关联的套题ID',
  `question_number` int NOT NULL COMMENT '题目在套题中的编号（1-75）',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '题目内容（含题干和选项描述）',
  `question_type` enum('single_choice','multiple_choice') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'single_choice' COMMENT '题目类型（单选/多选）',
  `correct_answer` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '正确答案（如\"A\"或\"A,B\"）',
  PRIMARY KEY (`question_id`) USING BTREE,
  INDEX `fk_exam_set_id`(`exam_set_id` ASC) USING BTREE,
  CONSTRAINT `fk_exam_set_id` FOREIGN KEY (`exam_set_id`) REFERENCES `exam_sets` (`exam_set_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 151 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '题目信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of questions
-- ----------------------------
INSERT INTO `questions` VALUES (1, 1, 1, '计算机中，系统总线用于（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (2, 1, 2, '在由高速缓存，主存和硬盘构成的三级存储体系中，CPU执行指令时需要读取数据，那么DMA控制器和中断CPU发出的数据地址是（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (3, 1, 3, '设信息位是8位，用海明码来发现并纠正1位出错的情况，则校验码的位数至少为（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (4, 1, 4, '中断向量提供（）', 'single_choice', 'C');
INSERT INTO `questions` VALUES (5, 1, 5, '如果一个线性表最常用的操作是存取第i个元素及其后继（若存在）的值，那么使该操作最快的存储方式是（）。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (6, 1, 6, '设有一个具有头结点的单链表，指针h指向其头结点，则当（）时该单链表为空。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (7, 1, 7, '如果该单链表非空，且指针p指向链尾，那么（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (8, 1, 8, '如果一棵二叉树有10个度为2的结点，5个度为1的结点，那么度为0的结点个数为（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (9, 1, 9, '若一棵二叉树的先序遍历序列为EFHIGJK，中序遍历序列为HFIEJKG,则该二叉树根结点的右孩子为（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (10, 1, 10, '已知一个有序表为（12，18，24，35，47，50，62，83，90，115，134），当折半查找值为90的元素时，经过（）次比较后查找成功。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (11, 1, 11, '自动向应用程序注入意想不到的输入，以发现可利用的脆弱性的测试方法是（）。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (12, 1, 12, '生日攻击属于（）加密模式。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (13, 1, 13, 'Windows操作系统设置在多次无效登录后锁定账号，可以防止（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (14, 1, 14, '以下关于网络钓鱼的叙述中，不正确的是（）', 'single_choice', 'B');
INSERT INTO `questions` VALUES (15, 1, 15, '以下不属于物理安全的是（）', 'single_choice', 'D');
INSERT INTO `questions` VALUES (16, 1, 16, '著作权中，（）的保护期限不受期限限制。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (17, 1, 17, '国际上为保护计算机软件知识产权不受侵犯所采用的主要方式是实施（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (18, 1, 18, '从磁盘读取数据的时候，占总时间比重最高的是（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (19, 1, 19, '以下进程状态转换，不会发生的转换是（）的转换。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (20, 1, 20, 'IC方法中，（）不需要忙等待。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (21, 1, 21, '页面替换算法中，（）采用访问页面的引用位和修改位作为参考指标。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (22, 1, 22, '程序控制结构中，（）提供了在两种或多种分支中选择其中一个的逻辑。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (23, 1, 23, '按照数据组织形式的不同，枚举属于（）类型。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (24, 1, 24, '黑盒测试不能发现的错误是（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (25, 1, 25, '软件过程模型中，（）主要用于解决需求的不确定性问题。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (26, 1, 26, '数据流图设计中（）指出了系统所需数据的发源地和系统所产生数据的归宿地，是指软件系统之外的人员或组织。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (27, 1, 27, '在UML图中，（）展现了一组对象、接口、协作和它们之间的关系。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (28, 1, 28, '在UML图中，（）展现了运行处理节点及其构件的配置，组出了体系结构的静态实施视图。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (29, 1, 29, 'Modem的主要作用是（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (30, 1, 30, '在OSI参考模型中，负责对应用层消息进行压缩、加密功能的层次为（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (31, 1, 31, '以下关于Telnet的叙述中，不正确的是（）。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (32, 1, 32, 'WWW控制协议是（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (33, 1, 33, '（）是国产数据库管理系统。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (34, 1, 34, '数据模型的组成要素不包括（）的。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (35, 1, 35, '视图属于数据库系统三级模式结构的（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (36, 1, 36, '设有关系R(E,F,G)和S(F,G,H,K)，关系代数表达式（）可正确计算。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (37, 1, 37, '如果进行运算R-S，其结果集包含属性（）。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (38, 1, 38, '\"授予用户WANG对视图Course的查询权限\"功能的SQL语句是（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (39, 1, 39, '若关系模式R(U,F)属于3NF，则（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (40, 1, 40, '在SQL中，LIKE后表示任意长度字符串的通配符是（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (41, 1, 41, '以下关于视图的叙述中，错误的是（）。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (42, 1, 42, '在SQL中，表达年龄（Sage）非空的WHERE子句为（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (43, 1, 43, '对于不包含子查询的SELECT语句，聚集函数不允许出现的位置是（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (44, 1, 44, '在SQL中，能够改变基本表中元组的物理存储位置的方法是（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (45, 1, 45, '设有关系：选课（学号，姓名，课程号，成绩），规定姓名不重复，那么这一规则属于（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (46, 1, 46, '\"学号\"与\"姓名\"之间的数据依赖可表述为（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (47, 1, 47, '选课关系最高属于（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (48, 1, 48, '在关系模式R(A,B,C,D)中，AB->->B显然成立，因为此数据依赖本质上是（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (49, 1, 49, '当多个事务执行时，任一事务的更新操作，在其成功提交之前，对其他事务都是不可见的，这指的是事务的（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (50, 1, 50, '数据库管理系统需要处理多种故障，其中CPU故障属于（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (51, 1, 51, '一个事务正在访问数据并且对数据进行了修改，而这个修改还没有提交到数据库中，这时另外一个事务也访问了这个数据，然后使用了这个数据，这种现象称为（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (52, 1, 52, '在事务隔离级别中，（）隔离级别禁止不可重复读和脏读现象，但是有时可能出现幻读数据。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (53, 1, 53, '（）约束通过被引用表中实际存在的记录值，对引用表中相应属性的取值进行了约束和限制。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (54, 1, 54, '某大学学生管理系统中，要求学生的年龄在16~22岁间，该规则可以通过（）约束来实现。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (55, 1, 55, '触发器涉及到的激发事件不包括（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (56, 1, 56, '在行级触发器中，只有（）语句的条件表达式值为真，触发器才会触发。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (57, 1, 57, '以下关于触发器的说法中，错误的是（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (58, 1, 58, '（）协议规定对任何数据进行读写之前必须对该数据加锁，且在释放一个封锁之后，事务不再申请和获得任何其他封锁。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (59, 1, 59, '如果经常使用范围查询，（）会更高效。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (60, 1, 60, '以下关于SQL语句优化的说法中，错误的是（）', 'single_choice', 'C');
INSERT INTO `questions` VALUES (61, 1, 61, '在数据库运行阶段，如果频繁访问两个表中的关联数据，则考虑采用（）的方法。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (62, 1, 62, '如果表中元组数量很大，导致操作效率降低，在不修改程序和表逻辑模式的情况下，可以考虑采用（）的方法。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (63, 1, 63, '引入索引的目的是（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (64, 1, 64, '数据库物理设计的主要工作不包括（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (65, 1, 65, '（）属于事务故障。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (66, 1, 66, '（）机制先在日志中记录一个事务的所有write操作，而该事务的所有write操作拖延到事务最后一条语句被执行后才执行，来保证事务的原子性。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (67, 1, 67, '事务故障时可能已对数据库进行了修改，为了消除该事务对数据库的影响，要利用日志文件中的记录，强行（）该事务，将数据库恢复到初始状态。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (68, 1, 68, '磁盘属于（）存储器。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (69, 1, 69, '分布式数据库的设计主要考虑数据分布的设计，数据分布主要目的是提高访问的（），即通过数据的合理分布，尽可能使更多的数据能够就地存放，以减少远距离的数据访问。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (70, 1, 70, 'NoSQL数据库的存储模型有（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (71, 1, 71, '（）is a software package, designed to store, retrieve, query and manage data.', 'single_choice', 'B');
INSERT INTO `questions` VALUES (72, 1, 72, 'Most of the time, （）are the only ones to directly interact with a system.', 'single_choice', 'A');
INSERT INTO `questions` VALUES (73, 1, 73, 'They use （）to deal with database schemas and descriptions, of how the data should reside in the database.', 'single_choice', 'A');
INSERT INTO `questions` VALUES (74, 1, 74, 'They use （）to deal with data manipulation which includes most common SQL statements such as SELECT, INSERT, UPDATE, DELETE, etc.', 'single_choice', 'B');
INSERT INTO `questions` VALUES (75, 1, 75, 'They also focus on managing and maintaining the （）of the database system: prevent unauthorized access of the data.', 'single_choice', 'B');
INSERT INTO `questions` VALUES (76, 2, 1, '计算机操作的最小时间单位是（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (77, 2, 2, '设指令由取指、分析、执行3个子部件完成，并且每个子部件的时间均为△t，若采用常规标量单流水线处理机，连续执行20条指令，共需（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (78, 2, 3, '计算机系统中，I/O接口的功能有（）。①数据传输及缓存 ②设备状态检测和反馈 ③I/O操作的控制与定时', 'single_choice', 'D');
INSERT INTO `questions` VALUES (79, 2, 4, '计算机中使用系统总线结构的目的是便于增减外设，同时（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (80, 2, 5, '计算机在处理算术表达式78+21*（36-34）时，先将其转换成的后缀形式表示为（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (81, 2, 6, '计算机在处理算术表达式78+21*（36-34）时，利用（）进行计算。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (82, 2, 7, '依次在初始为空的队列中插入元素5、6、7、8以后，紧接着做了两次删除操作，此时的队头元素是（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (83, 2, 8, '以下关于串的叙述中，错误的是（）。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (84, 2, 9, '折半查找要求查找表中的数据为（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (85, 2, 10, '（）的基本思想是先将待排的记录划分为独立的两个部分，然后分别对这两部分记录再执行该排序算法，最终使整个序列有序。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (86, 2, 11, 'TCP/IP的四层模型中，每一层都提供了安全协议，以下属于网络层案例协议的是（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (87, 2, 12, '不属于基于生物特征的认证技术。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (88, 2, 13, '属于公钥加密算法。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (89, 2, 14, '确保计算机系统机密性的方法中不包括（）。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (90, 2, 15, '以下恶意代码中，不需要宿主程序的是（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (91, 2, 16, '甲乙丙三人分别就相同内容的计算机程序的发时创造，先后向国务院专利行政部门提出申请，（）可以获得专利权。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (92, 2, 17, '（）的保护期限是可以延长的。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (93, 2, 18, '在数据块的传输过程中，（）不需要CPU的参与。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (94, 2, 19, '以下调度算法最适用于交互式系统的是（）。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (95, 2, 20, '能够不访问页表，实现快速将虚拟地址映射到物理地址的硬件机制是（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (96, 2, 21, '以下为同一进程的多个线程间共享的是（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (97, 2, 22, '系统为（）分配的存储空间在程序运行过程中一般是不改变的。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (98, 2, 23, '以下关于C语言函数的说法中，不正确的是（）。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (99, 2, 24, '（）是一种解释性、面向对象、动态类型的脚本语言。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (100, 2, 25, '软件过程模型中，（）首次引入风险管理。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (101, 2, 26, '某软件需求\"发送消息需要在1秒钟内得到响应\"，该需求属于（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (102, 2, 27, '数据流图设计中，（）描述中输入数据流到输出数据流之间的转换。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (103, 2, 28, '在UML图中，（）是场景的图形化表示，描述了以时间顺序组织的对象之间的交互活动。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (104, 2, 29, '下列协议中，可以用于文件安全传输的是（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (105, 2, 30, 'DNS协议的功能是（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (106, 2, 31, '下列不属于电子邮件收发协议的是（）。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (107, 2, 32, '某信息系统不断受到SQL注入攻击，应部署（）进行安全防护，实时阻断攻击行为。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (108, 2, 33, '模式是数据库中全体数据的逻辑结构和特征的描述，模式在某一时刻的一个具体值称为该模式的一个实例。模式和实体分别是相对（）的。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (109, 2, 34, '与层次模型和网络模型相比，关系模型（）。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (110, 2, 35, '以下关于数据库三级模式的说法中，正确的是（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (111, 2, 36, '以下选项中，（）不属于关系模型中的完整性约束。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (112, 2, 37, '在关系型数据库中，（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (113, 2, 38, '假设有关系E（学校名称，所在地）和F（学校名称，专业代码，分数线），查询所有学校所有专业的分数线，以及学校所在地的信息，对应的关系表达式为（）。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (114, 2, 39, '以下关于SQL的描述中，正确的是（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (115, 2, 40, '并发执行的各个事务之间不能相互干扰，属于事务的（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (116, 2, 41, '某会员管理系统需要对会员的账户余额进行限制，业务规则是\"账户余额不能小于100\"。该业务规则可采用（）约束实现。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (117, 2, 42, '某应用系统有两个表，会员表Member(M_id,Mname,Mphone,Mgender,Mage,Mbalance,Mvisible）和消费记录表Deal(D_id,Ddate,Dtype,Dvalue,M_id),其中M_id为会员编码。如果要查询\"陈\"姓会员的消费记录，对应的SQL语句为（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (118, 2, 43, '下表记录了某系统中各个学校的基本信息，关系运算π主管部门(E)的结果是（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (119, 2, 44, '数据库管理员对经理U1、U2赋予表D和M的插入权限。U1赋予实习生U3对表D的插入权限。U2发现当U3说服顾客办理信用卡后，每次都要找他注册，为了减少工作量，他也对U3赋予表M的插入权限，一段时间后，U1离职，数据库管理员收回权限，执行的SQL语句为REVOKE M FROM U1 CASCADE 此时U3仍具有的权限为（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (120, 2, 45, '某数据库中有会员卡基本信息表（含余额信息）和消费记录表，现在需要通过触发器实现\"新增消费记录后自动更新会员表的余额属性\"，采用（）触发器比较适合。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (121, 2, 46, '在关系模式\"学生（学号，姓名，性别，年龄，系号，系名）\"中，一个学生只能属于一个系，\"系名\"对于码\"学号\"是数据依赖是（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (122, 2, 47, '该关系模式最高属于（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (123, 2, 48, '将\"学生\"分解为两个关系模式：S（学号，姓名，性别，年龄，系号）和D（系号，系名），此分解（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (124, 2, 49, '关系模式R(U,F)中，U是属性集，F是函数依赖集，X、Y是U的子集。若Y→X∈F+，则（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (125, 2, 50, '为了把一个满足BCNF的关系模式规范化为4NF，需要（）。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (126, 2, 51, '以下关于触发器的说法中，正确的是（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (127, 2, 52, '以下关于存储过程的说法中，错误的是（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (128, 2, 53, '数据库恢复的基础是（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (129, 2, 54, '如果事务T获得了数据项R上的X锁，对T对R（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (130, 2, 55, '一级封锁协议能够防止（）。①丢失修改 ②不可重复读 ③读脏数据', 'single_choice', 'A');
INSERT INTO `questions` VALUES (131, 2, 56, '此并发调度执行结束后A和B的值分别为（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (132, 2, 57, '该调度（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (133, 2, 58, '要求事务在读数据前必须先加S锁，读完后即释放的协议是（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (134, 2, 59, '两个事务T1和T2遵守两段锁协议，则并发调度结果（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (135, 2, 60, '（）不属于数据库恢复技术。', 'single_choice', 'D');
INSERT INTO `questions` VALUES (136, 2, 61, '数据库设计的6个阶段依次是：需求分析，（），数据库实施，数据库运行和维护。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (137, 2, 62, '数据字典是（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (138, 2, 63, '某学生想要设计一个博客系统，在数据库的概念设计阶段提出了如下图所示的E-R模型，其中的联系类型为（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (139, 2, 64, '联系的属性为（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (140, 2, 65, '事务故障出现后，系统自动执行（）以撤销该事务。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (141, 2, 66, '由于机房断电，某个使用检查点记录的数据库出现故障，该故障属于（）。', 'single_choice', 'A');
INSERT INTO `questions` VALUES (142, 2, 67, '大数据的特性一般包括（）。①数量大 ②速度增长快 ③多样性 ④价值密度低', 'single_choice', 'D');
INSERT INTO `questions` VALUES (143, 2, 68, '数据仓库是为了构建新的分析处理环境而出现的一种数据存储和组织技术，其特征不包括（）。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (144, 2, 69, '相比于集中式数据库，分布式数据库具有（）的优点。', 'single_choice', 'C');
INSERT INTO `questions` VALUES (145, 2, 70, '以下关于MapReduce技术的说法中，不正确的是（）。', 'single_choice', 'B');
INSERT INTO `questions` VALUES (146, 2, 71, 'Corporate decision makers require access to information from multiple such sources.Seting up queries on individual sources is both cumbersome and（）.', 'single_choice', 'A');
INSERT INTO `questions` VALUES (147, 2, 72, 'Moreover, the sources of data may store only current data,whereas decision makers mayneedaccessto（）dataaswell.', 'single_choice', 'B');
INSERT INTO `questions` VALUES (148, 2, 73, 'Adatawarehouseisarepository(orarchive) of information gathered from multiple sources,stored under a unified schema,at a（）site.', 'single_choice', 'B');
INSERT INTO `questions` VALUES (149, 2, 74, 'Thus,data warehouses provide the user with a single consolidated（）to data,making decision-support queries easier to write.', 'single_choice', 'D');
INSERT INTO `questions` VALUES (150, 2, 75, 'Moreover,by accessinginformationfordecisionsupportfromadatawarehouse,thedecisionmaker ensures that online transaction-processing systerms are not（）by the decision-support workdoad.', 'single_choice', 'B');

-- ----------------------------
-- Table structure for user_favorites
-- ----------------------------
DROP TABLE IF EXISTS `user_favorites`;
CREATE TABLE `user_favorites`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `question_id` int NOT NULL COMMENT '题目ID',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_user_question`(`user_id` ASC, `question_id` ASC) USING BTREE,
  INDEX `fk_favorite_question`(`question_id` ASC) USING BTREE,
  CONSTRAINT `fk_favorite_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_favorite_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户收藏表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_favorites
-- ----------------------------

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码（加密存储）',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '邮箱',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户头像URL',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `last_login` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态（1:正常 0:禁用）',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `idx_email`(`email` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------

-- ----------------------------
-- Table structure for wrong_questions
-- ----------------------------
DROP TABLE IF EXISTS `wrong_questions`;
CREATE TABLE `wrong_questions`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '错题ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `question_id` int NOT NULL COMMENT '题目ID',
  `wrong_count` int NOT NULL DEFAULT 1 COMMENT '错误次数',
  `last_wrong_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最近一次错误时间',
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '用户笔记',
  `status` enum('new','reviewing','mastered') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'new' COMMENT '状态',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_user_question`(`user_id` ASC, `question_id` ASC) USING BTREE,
  INDEX `fk_wrong_question`(`question_id` ASC) USING BTREE,
  CONSTRAINT `fk_wrong_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_wrong_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户错题表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of wrong_questions
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
