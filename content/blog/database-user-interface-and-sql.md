---
title: "数据库系统的用户接口与 SQL 语言"
date: 2026-03-04
description: "梳理数据库常见用户接口与 SQL 语言定位，覆盖 GUI/API/查询语言类型及其在工程中的实际边界。"
categories: ["数据库", "基础理论"]
tags: ["数据库", "SQL", "查询语言"]
---
## 数据库系统的用户接口

- 数据库查询语言
- GUI用户图形化界面
- API接口
- 类库

## 查询语言：

- 形式化的查询语言
- 表格式的查询语言
- 图形化的查询语言
- 受限的自然语言查询

sql不是图灵完备的，不能进行编程。必须和程序设计语言嵌合才能实现编程

### 关系型查询语言的基础

SQL是在以关系代数和关系演算的基础之上开发的

SQL是一个非过程化的查询语言（系统自动进行查询优化）

SQL（标准查询语言）：

- DDL 数据定义语言：删除和维护数据库中的数据模式
- QL查询语言：在数据中检索数据
- DML数据操作语言：插入删除更新
- DCL：用户权限管理

### 重要的术语和概念

- basetable 基表：真正存在于磁盘上的关系
- view视图：是一个虚拟的表，是根据基表的数据根据计算临时算出来的
- datatype support数据类型：数据库支持的数据类型，不同系统不一样
- NULL：空值，是一个保留字（会让二值逻辑变成三值逻辑：多一个null）
- UNIQUE：保留字，在创建表的时候回如果申明之后，其中的值不允许重复
- DEFAULT：保留字，可以指定一个缺省值
- PRIMARY KEY：指定某个属性是主键
- FOREIGN KEY：指定某个属性是外键
- CHECK：保留字，在定义表的时候，可以为之定义完整性约束

## 基本SQL查询

#### 基本SQL语言的查询架构：

```sql
SELECT [DISTINCT] targetlist --目标属性列表（distinct是可缺省选项，如果存在结果会消除重复元组）
FROM relation-list -- from子句 查询所涉及的表
WHERE qualification  -- 查询结果应该满足的条件（布尔表达式）
```

#### 一条查询语句在概念上看执行的过程：

1. 根据relation-list所涉及的表进行cross-product（笛卡尔乘积）拼成一张大表
2. 根据WHERE子句后面的条件进行筛选
3. 根据 targetlist中我需要查的属性，将筛选后的内容进行投影→得到结果
4. 如果加了DISTINCT关键字，则还要进行消除重复元组

#### 例子

| sid | bid | day      |
| --- | --- | -------- |
| 22  | 101 | 10/10/96 |
| 58  | 103 | 11/12/96 |

| sid | sname  | rating | age  |
| --- | ------ | ------ | ---- |
| 22  | dustin | 7      | 45.0 |
| 31  | lubber | 8      | 55.5 |
| 58  | rusty  | 10     | 35.0 |

| bid | bname | color |
| --- | ----- | ----- |
| 101 | tiger | red   |
| 103 | lion  | green |
| 105 | hero  | blue  |

| sid | sname  | rating | age  |
| --- | ------ | ------ | ---- |
| 28  | yuppy  | 9      | 35.0 |
| 31  | lubber | 8      | 55.5 |
| 44  | guppy  | 5      | 35.0 |
| 58  | rusty  | 10     | 35.0 |

```sql
SELECT S.sname --查找姓名
FROM Sailors S,Reserves R  --定义别名
WHERE S.aid=R.sid AND R.bid=103 --预定103号船的信息（链接了水手信息和船的信息）

```

| sid→sid1 | sname  | rating | age  | sid→sid2 | bid | day      |
| -------- | ------ | ------ | ---- | -------- | --- | -------- |
| 22       | dustin | 7      | 45.0 | 22       | 101 | 10/10/96 |
| 22       | dustin | 7      | 45.0 | 58       | 103 | 11/12/96 |
| 31       | lubber | 8      | 55.5 | 22       | 101 | 10/10/96 |
| 31       | lubber | 8      | 55.5 | 58       | 103 | 11/12/96 |
| 58       | rusty  | 10     | 35.0 | 22       | 101 | 10/10/96 |
| 58       | rusty  | 10     | 35.0 | 58       | 103 | 11/12/96 |

事实上按照理论上的方法去做的话 效率很低。所以真正的数据库产品不会按照这个过程进行。

在写SQL查询的时候，为了格式规范和方便操作，可在FROM中对表起一个别名（范围变量）

上述方法还可以通过嵌套查询来实现：

```sql
 SELECT S.sname
 FROM Sailors S
 WHERE S.sid IN (SELECT R.sid
                 FROM Reserves R
                 WHERE R.bid=103) --将子查询的结果作为父查询的条件

```

关联计算的写法：

```sql
 SELECT S.sname
 FROM Sailors S
 WHERE EXISTS (SELECT* --exists：存在
               FROM Reserves R
               WHERE R.bid-103 AND  S.sid -R.sid)
               --子查询的S.sid就是外面查询的水手的sid
```

```sql
SELECT S.sid
FROM Sailors S,Reserves R
WHERE S.sid=R.sid --查找订过船的水手
```

```sql
SELECT S.age,age1=S.age-5,2*S.age AS age2  --对结果属性起别名 age1是结果-5 age2是2倍的age
FROM Ssilor S
WHERE S.sname LIKE 'B_%B'
```

如果要查询同时定了红船和绿船的人

```sql
SELECT S.sid
FROM Sailors S,Boats B1,Reserves R1,Boats B2,Reserves R2
WHERE S.sid=R1.sid AND R1.bid=B1.bid AND S.sid=R2.sid AND R2.bid=B2.bid
      AND(B1.color='red' AND B2.color='green'）
      /*订船信息中 同一个人定了红船的绿船的信息分别出现一次，这样就能找到
      但是这种方式会产生很多无用的排列组合，很麻烦*/

```

相同的操作

```sql
SELECT S.sid
FROM Sailors S, Boats B, Reserves R
WHERE S.sid-R.sid AND R.bid=B.bid
      AND B.color='red'
INTERSECT --表示集合的交
SELECT S.sid
FROM Sailors S, Boats B, Reserves R
WHERE S.sid=R.sid AND R.bid=B.bid
      AND B.color='green'
      /*用集合的交集来选择*/

```

查找一个只被定过一次的船的id

```sql
 SELECT bid
 FROM Reserves R1
 WHERE bid NOT IN (
                   SELECT bid
                   FROM Reserves R2
                   WHERE R2.sid!=R1.sid)

```

- We've already seen IN, EXISTS and UNIQUE.、
- Can also use NOT IN, NOT EXISTS and NOT UNIQUE.Also available: op ANY, op ALL, op IN <,>,=,≤,≥,≠

查找所以预定过所有船的水手的sid

```sql
 SELECT S.sname
 FROM Sailors S
 WHERE NOT EXISTS
           ((SELECT B.bid FROM Boats B)
           EXCEPT
           (SELECT R.bid FROM Reserves R
           WHERE R.sid=S.sid))--否定之否定的思想
           /*寻找一个水手不存在*/

```

## SQL聚集函数运算

- COUNT（\*）计算在一个关系里面有多少个元组
- COUNT（\[DISTINCT]A）计算属性A中有多少个\[不同]的值
- SUM（\[DISTINCT]A）对属性A\[不同]的值进行求和
- AVG（\[DISTINCT]A）对属性A\[不同]的值进行求平均值
- MAX（A）对属性A求最大值
- MIN（A）对属性A求最小值

```sql
 SELECT COUNT (*)
 FROM Sailors S --求s有多少个元组（有多少水手）

 SELECT COUNT (DISTINCT S.rating)
 FROM Sailors S
 WHERE S.sname='Bob'--求所有叫Bob的水手不同的级别有多少

 SELECT AVG (S.age)
 FROM Sailors S
 WHERE S.rating=10 --查找级别为10的水手的平均年龄

 SELECT AVG (DISTINCT S.age)
 FROM Sailors S
 WHERE S.rating-10 --查找级别为10的不同年龄的水手的平均年龄

 SELECT S.sname
 FROM SailorsS
 WHERE S.rating= (SELECT MAX(S2.rating)
                  FROM Sailors S2) --水手表中级别最大值的人的姓名

```

## 对SQL运算的扩充

```sql
 SELECT DISTINCT] target-list
 FROM      relation-list
 WHERE     qualification
 GROUP BY  grouping-list
 HAVING    group-qualificatiom  --布尔表达式

```

group by:分组子句集 对经过WHERE子句筛选之后的元组，按照GROUP BY中按grouping-list分组属性值相等的归为一个组，对每一个组按照SELECT中进行运算得到结果，是一个组得到一个结果元组。

HAVING：对组进行筛选，对分组后的数据再进行筛选

例子：

| sid | sname   | rating | age  |
| --- | ------- | ------ | ---- |
| 22  | dustin  | 7      | 45.0 |
| 29  | brutus  | 1      | 33.0 |
| 31  | lubber  | 8      | 55.5 |
| 32  | andy    | 8      | 25.5 |
| 58  | rusty   | 10     | 35.0 |
| 64  | horatio | 7      | 35.0 |
| 71  | zorba   | 10     | 16.0 |
| 74  | horatio | 9      | 35.0 |
| 85  | art     | 3      | 25.5 |
| 95  | bob     | 3      | 63.5 |
| 96  | frodo   | 3      | 25.5 |

求每一个级别最年轻的水手age>18，并且这个级别必须要有两个或者两个以上的人才视作为有效：

```sql
 SELECT S.rating, MIN (S.age) AS minage
 FROM Sailors S
 WHERE S.age >=18 --年龄大于18
 GROUP BY S.rating--对级别分组
 HAVING COUNT (*) >1--数量要大于1（在每个组内进行计算）

```

| rating | minage |
| ------ | ------ |
| 3      | 25.5   |
| 7      | 35.0   |
| 8      | 25.5   |

![](/images/imported/w-ktny/image_mNVHng49it.png)

一个数据库系统并不会按照业务的语义来判断，而是直接在逻辑上判断

```sql
 SELECT B.bid, COUNT () AS scount
 FROM Boats B, Reserves R
 WHERE R.bid-B.bid -- AND B.color='red'
 GROUP BY B.bid
 HAVING B.color='red' --在bid中不存在color属性

```

上述代码就是在逻辑上说没啥问题，先链接分组后筛选。但是会导致报错（语法出问题了）

SELECT中的语句和HAVING语句中必须是GROUP BY中的子集

#### FROM子句的嵌套子查询

```sql
 SELECT Temp.rating
 FROM (SELECT S.rating, AVG (S.age) AS avgage
       FROM Sailors S
       GROUP BY S.rating) As Temp --这个查询就是对水手级别分组 对这个分组取值和平均年龄
 WHERE Temp.avgage =(SELECT MIN (Temp.avgage)
                     FROM Temp）

```

## 空值对查询结果的影响

由于引入空值，如果做大小判断逻辑返回值也是NULL，系统会认为这个是不合格的，会被抛弃掉。如果需要这个NULL的值，就得加上对NULL值的判断。

## SQL的新特性

### CAST表达式

语法图：

![](/images/imported/w-ktny/image_DwAQjufO45.png)

类似一个一个强制类型转换。

- 在做函数调用的时候 让其符合形式参数和实际参数匹配
- 改变计算的精度
- 给空值赋予一个数据类型，使得其符合计算要求

```sql
-- Students (name, school) Soldiers (name, service)
 CREATE VIEW prospects (name, school, service) AS SELECT name, school,
              CAST(NULL. AS Varchar(20))  -- 定义一个试图 由三个属性组成，AS后
                                          --是查询块（）然后加一列空列，使得并兼容
 FROM Students
 UNION
 SELECT name, CAST(NULL. AS Varchar(20)), service --同理也是补充一个空列
 FROM Soldiers;

```

### CASE表达式

```sql
 --Officers (name, status, rank, title)
 SELECT name, CASE status
     WHEN 1 THEN 'Active Duty' -- 用数字进行编码状态
     WHEN 2 THEN 'Reserve'
     WHEN 3 THEN 'Special Assignment'
     WHEN 4 THEN 'Retired'
 ELSE 'Unknown'
 END AS status
 FROM Officers ;

```

```sql
 -- Machines (serialno, type, year, hours used, accidents)
--求设备表中 求链锯的故障在总故障中的比例
 SELECT sum (CASE
                 WHEN type='chain saw'
                 THEN accidents
                 ELSE 0e0
             END)/ sum (accidents)
 FROM Machines;

```

### 子查询

子查询的作用是增强sql语句的功能，可以在SELECT,FROM WHERE中进行子查询

- 标量子查询：查询结果只会是一个数值

  凡是可以出现值的地方都能出现标量子查询
  ```sql
   SELECT d.deptname, d.location
   FROM dept AS d
   WHERE (SEL ECT avg(bonus)
           FROM emp
           WHERE deptno-d.deptno)
         > (SEL ECT avg(salary)
           FROM emp
           WHERE deptno-d.deptno)

  ```

  ```sql
   /* List the deptno, deptname, and the mar salary
    of all departments located in Nero York:*/
   SELECTd.deptno, d.deptname, (SELECTMAX (salary)
                                 FROM emp
                                 WHERE deptno-d.deptno) AS maxpay
   FROM dept ASd
   WHERE d.location ='New York;

  ```

- 表表达式：查询结果是一个表
- 公共表表达式：在复杂查询中不止出现一次子查询，一个表表达式出现多次（复用）

  使用with子句定义一个公共表表达式，这个公共表表达式可以当成一个临时视图
  ```sql
   /*Find the department who has the highest tota
   payment:*/
   WITH payroll (deptno, totalpay) AS
       (SELECT deptno, sum(salary)+sum(bonus)
       FROM emp
       GROUP BY deptno)
   SELECT deptno
   FROM payroll -- 调用公共表表达式
   WHERE totalpay = (SELECT max(totalpay)
                     FROM payroll）;

  ```

### 外连接

```sql
 /* Teacher ( name, rank)
     Course (subject, enrollment, quarter, teacher)*/
 WITH
 innerjoin(name, rank, subject, enrollment) AS
         (SELECTt.name, t.rank, c.subject, c.enrollment
          FROM teachers AS t, courses AS
           WHERE t.name-c.teacher ANDc.quarter-Fall 96).--内连接（自然链接）
 teacher-only(name, rank) AS --没有授课计划的老手
     (SELECT name, rank
      FROM teachers
      EXCEPT ALL--减去
      SELECT name, rank
      FROM innerjoin),--有课程的老师
---------------------------------------------------------------
 SELECT name, rank, subject, enrollment
 FROM innerjoin --上面的innerjoin的结果
 UNION ALL--连上去
 SELECT name, rank,
 CAST (NULL AS Varchar(20)) AS subject,--补充空列
 CAST (NULL AS Integer) AS enrollment -- 补充空列
 FROM teacher-only  -- 取没课上的老老师
 UNION ALL
 SELECT CAST (NULL AS Varchar(20)) AS name, --补充空列
        CAST (NULL AS Varchar(20)) AS rank, --补充空列
        subject, enrollment
 FROM course-only; --这是一条sql语句

```

### 递归查询

如果在公共表表达式里面用到自己的本身（递归调用）就是递归查询

If a common table expression uses itself in its definition, this is called recursion. It can calculate a complex recursive inference in one SQL statement. FedEmp (name, salary, manager)

```sql
 WITH agents (name, salary) AS
 ((SELECT name, salary        --initial query
     FROM FedEmp WHERE manager='Hoover)
     UNION ALL
     (SELECTf.name, f.salary     --recursivequery
     FROM  agents  AS a, FedEmp AS f
     WHERE f.manager = a.name))
 SELECT name                      --final query
```

例子：航班线路搜索问题

![](/images/imported/w-ktny/image_uKHLYfEvOC.png)

| Flight\_NO | Origin | Destination | Cost |
| ---------- | ------ | ----------- | ---- |
| HY120      | DFW    | JFK         | 225  |
| HY130      | DFW    | LAX         | 200  |
| HY140      | DFW    | ORD         | 100  |
| HY150      | DFW    | SFO         | 300  |
| HY210      | JFK    | DFW         | 225  |
| HY240      | JFK    | ORD         | 250  |
| HY310      | LAX    | DFW         | 200  |
| HY350      | LAX    | SFO         | 50   |
| HY410      | ORD    | DFW         | 100  |
| HY420      | ORD    | JFK         | 250  |
| HY450      | ORD    | SFO         | 275  |
| HY510      | SFO    | DFW         | 300  |
| HY530      | SFO    | LAX         | 50   |
| HY540      | SFO    | ORD         | 225  |

求最低票价SFO→JFK（在编程中为最短路径算法）

要实现这个查询，要做一个临时表 要做出SFO出发 所可能到达的目的地全部算出来（广度优先算法）

| 到达目的地 | 经过的路径 | 中转次数 | 花费 |
| ----- | ----- | ---- | -- |
|       |       |      |    |
|       |       |      |    |

```sql
 WITH trips (destination, route, nsegs, totalcost) AS
   ((SELECT destination, CAST(destination AS varchar(20)),1, cost
   --直达的机场
 FROM flights                          --initial query
 WHERE origin='SFO')
 UNION ALL
 (SELECT f.destination,                --递归运算
         CAST(t.routel ||∵|| f.destination AS varchar(20)), --字符串拼接
         tnsegs+1, t.totalcost+f.cost
 FROM trips t, flights f
 WHERE t.destination-f.origin
         AND f.destinationc>'SFO'       --不能回归原位
         AND f.origino'JFK'       --目的地
         AND t.nsegs<=3))    --最多跳数

```

## 数据操纵语言（DML）

#### DELETE

- 把表内满足条件的元组删除
- 例子
  ```sql
   DELETE FROM Person WHERE LastName = 'Rasmussn';

  ```

#### UPDATE

- 把满足条件的元组的某些值进行更新
  ```sql
   UPDATE Person SET Address ='Zhongshan 23', City =
   'Naning' WHERE LastName = 'Wilson'

  ```

#### Insert

- 向表内插入元组
- 例子
  ```sql
  Insert into employees values("smith")
  ```

## SQL中的视图

## 普通视图【虚表】

- 实现外模式
- 利用视图和逻辑模式的映射实现数据的逻辑独立性
- 数据库只存储视图的定义，不存储数据，数据在调用时临时计算，数据内容非永久保存
  ```sql
   CREATE VIEW YoungSailor AS SELECT sid, sname, rating --创建视图
   FROM Sailors
   WHERE age<26;
   CREATE VIEW Ratingavg, AS SELECT rating, AVG(age)  --创建视图
   FROM Sailors
   GROUP BY rating;

  ```

- 实现了数据库的安全性

  可以给不同的用户以不同的视图，保证数据安全
- 对视图内数据的修改的问题

  早期视图不允许更新（只读）。如果能反向映射的的话 对视图的修改可以对基表的内容进行修改，比如只做了选择和投影的视图（不同的数据库管理软件的实现和要求不一样）

## 临时视图

- 没有存储视图的定义
- 可以实现递归查询

## 嵌入式的SQL语言

为了实现和程序设计语言结合，解决的问题：

- 如何让程序设计语言接收SQL语言
- DBMS和应用程序如何交换数据和信息
- DBMS的查询结果是个集合，如何传递给程序设计语言中的变量
- DBMS支持的数据类型和应用程序支持的数据类型不是完全一样

解决方法

- 嵌入式SQL

  把SQL语句嵌入到其他语言的源代码中，然后在编译的时候把嵌入的代码当做库来使用
- 编程的API

  应用编程的接口，ODBC接口，只是一个标准，只给出了定义
- 封装的类

## C语言中嵌入SQL

- 由`EXEC SQL`开始 由`;`结尾
- 用宿主变量的方式在c与sql中传递值，这个宿主变量是sql类型
- 在sql中 用`:`+变量名来使用值
- 宿主变量不能被定义为数组或者其他数据类型
- 特殊的宿主变量 SQLCA 宿主通信区，用之交换信息，需要声明` EXEC SQL INCLUDE SQLCA`
- 使用` SQLCA.SQLCODE`来判断返回结果的状态
- 用`indicator`(短整形）来代表空值NULL

```c
 EXEC SQL BEGIN DECLARE SECTION;
 char SNO[7];
 char GIVENSNO[7];
 char CNO[6];
 char GIVENCNO[6];
 float GRADE;
 short GRADEl; /*indicator of GRADE*/
 EXEC SQL END DECLARE SECTION:

```

```c
 //CONNECT
 EXEC SQL. CONNECT :uid IDENTIFIED BY :pwd;
 //Execute DDL. or DML. Statements
 EXEC SQL INSERT INTO SC(SNO,CNO,GRADE) VALUES(SNO, CNO, GRADE);
 //Execute Query Statements
 EXEC SQL SELECT GRADE
   INTO :GRADE, :GRADEI
   FROM SC
   WHERE SNO=:GIVENSNO AND
   CNO-GIVENCNO;

```

## 游标

- 定义游标
  ```sql
  EXEC SQL DECLARE 游标名 CURSOR FOR
  SELECT
  FROM
  WHERE
  ```

- 执行游标【可以理解为打开一个文件】
  - `EXEC SQL OPEN 游标名`
- 取游标内每一条元组
  - `EXEC SQL FETCH 游标名`

    `INTO  :hostvar1,:hostvar2;`
- 判断查询结果是否取完
  - `SQLCA.SQLCODE ==100` 时取完
- 关闭CURSOR

  `CLOSE CURSOR`
