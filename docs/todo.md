### 5.2 模块一：智能检索

#### 5.2.1 Agent多轮检索

**功能要求**：

- 接收自然语言查询 ✅
- 系统提示词引导决策（搜索/结束） ✅
- 调用搜索工具（Tavily API）✅
- 评估结果完整性 ✅
- 支持最多5轮迭代 ✅
- 每轮状态记录共享State ✅

**验收标准**：

- 30秒内返回最终答案 pending
- 迭代轮次界面实时显示 ✅
- 每轮搜索结果可追溯 half

#### 5.2.2 工具调用（Function Calling）

**功能要求**：

- 搜索工具包含清晰描述和参数 ✅
- 返回结构化结果（标题、摘要、链接、发布时间） half 还差摘要和发布时间
- 多轮结果累积合并 ✅
- 工具调用日志完整记录 pending

**验收标准**：

- 搜索记录在界面完整展示 ✅
- 结果含3-5条有效资讯 ✅
- 支持中英文混合搜索 pending

#### 5.2.3 监督者模式 pending

**功能要求**：

- 监督者节点分析任务复杂度
- 动态拆解分配给子Agent
- 子Agent可并行或串行执行
- 监督者汇总输出

**验收标准**：

- 支持2-3个子Agent协同
- 任务拆解过程可视化
- 汇总结果含多角度观点

### 5.3 模块二：协同分析

#### 5.3.1 群组发布与推送

**功能要求**：

- 资讯摘要自动发布到群组
- 自动打话题标签
- 推送订阅用户
- 支持评论和回复

**验收标准**：

- 发布内容含摘要、来源、标签
- 订阅用户收到推送通知
- 支持消息内交互

#### 5.3.2 讨论分叉（Fork）

**功能要求**：

- 展示检查点历史列表
- 用户选择检查点创建分叉
- 新线程继承原状态
- 分叉关系可追溯

**验收标准**：

- 分叉操作≤3步
- 分叉后保留上下文
- 关系在界面可视化

#### 5.3.3 AI多角色辩论

**功能要求**：

- 监督者拆解任务给3个子Agent
- 各Agent独立生成论证
- 汇总展示多方观点
- 支持投票和评论

**验收标准**：

- 每个Agent≥3条论据
- 观点清晰区分立场
- 投票实时更新

### 5.4 模块三：知识沉淀

#### 5.4.1 话题自动归档

**功能要求**：

- 自动提取1-3个话题标签
- 归档到对应话题空间
- 支持手动修正标签
- 话题空间展示归档内容

**验收标准**：

- 标签提取准确率>80%
- 归档含完整对话上下文
- 支持按标签检索

#### 5.4.2 RAG知识库

**功能要求**：

- **文档入库**：分块、向量化、存储
- **检索**：查询→向量检索→重排→生成
- 支持外部文档上传
- 检索来源可追溯

**验收标准**：

- 检索命中率>70%
- 支持PDF/Markdown/TXT
- 结果含来源引用

### 5.5 模块四：管理后台

#### 5.5.1 人工审核

**功能要求**：

- 审核节点自动中断
- 管理员可批准或拒绝
- 批准后resume继续
- 拒绝后终止并通知

**验收标准**：

- 中断界面提示等待审核
- 审核操作≤1分钟
- 审核记录写入日志

#### 5.5.2 检查点管理

**功能要求**：

- 展示检查点列表
- 从检查点恢复执行
- 从检查点分叉新线程
- 导出检查点快照

**验收标准**：

- 列表按时间排序
- 恢复后状态正确
- 快照导出为JSON

#### 5.5.3 确定性重放

**功能要求**：

- 选择检查点
- 重新执行完整流程
- 执行过程可视化
- 对比原始和重放结果

**验收标准**：

- 重放结果与原始一致
- 重放过程实时展示
- 重放耗时记录

### 5.6 模块五：认证与权限

#### 5.6.1 用户认证（JWT）

**功能要求**：

- 用户注册/登录
- JWT Token颁发
- Token自动刷新
- 密码加密存储

#### 5.6.2 权限控制（RBAC）

| 角色 | 权限范围 |
|------|----------|
| 管理员 | 全部权限 |
| 管理者 | 查看、创建、审核、审计 |
| 分析师 | 查看、创建 |
| 普通成员 | 查看 |
| 访客 | 仅查看公开内容 |



定义缓存进度信息至redis的方法 入参是批次id，执行操作、文件序号、进度
键为批次id+progress 值为当前执行的操作，文件序号、进度值

定义包括加载文件、分块、向量化存储三个子任务 接收文件序号、批次id
每个子任务里 调用缓存方法保存当前进度z
子任务里面的函数执行完之后，将结果通过redis进行存储（前面两个）
子任务1 键为批次id+文件序号+任务序号 值为文档列表 返回键
子任务2 键为批次id+文件序号+任务序号 值为分块列表 返回键
子任务3 

定义父任务 接收文件列表、批次id
遍历原始文件列表，创建链式任务，并执行，拿到结果

存储接口 接收文件列表，生成一个随机批次id，执行父任务，传入批次id，文件列表，拿到父任务结果 判断status是否正常，正常才返回批次id，不正常报错
进度接口 接收批次id，redis查询批次id+progress获取进度信息

更正存储接口 把临时文件存储的逻辑迁移到这里，然后传给父任务 类型是字符串列表


更正存储接口2.0 把临时文件存储的逻辑替换成oss上传，再根据上传返回的文件进行加载
先定义一个单个文件上传 接收client，readerdata（字节流）
利用uploader进行upload，传入data

再定义一个批量文件上传
async with启动同一个client ，创建上下文，无需手动关闭
在该上下文里遍历上传文件列表，创建tasks （协程）
利用asyncio。gather执行


在提交方法里调用 save接口获取batch id
拿到之后再创建定时任务 setinterval 轮询调用progress接口

查询知识库
获取qdrant存储的向量

创建多agent的角色根据不同的业务场景执行
定义角色以及对应的系统提示词和tools声明（其中包括一个协调者，他负责路由到具体的agent）
共享的state和通用生成agentnode（根据角色对应生成新的agent实例）
决策路由什么时候调用toolnode 什么时候调用agent node
构建图 声明agentnode toolnode compile

针对不同功能创建独立的agent
单独的state/node/graph

已实现1
前端检索可支持中断
封装一个添加中断信号的方法
接收config
根据config生成唯一key
检查全局requestmap是否有对应key，有的话就将其abort 并从原map删除
生成新的controller
然后往map set key 以及对应的controller
给config挂载signal为对应controller的signal
最后return 中断的方法
也是检查是否有对应key，然后取出来将其abort 并从原map删除

在newsapi里新增一个attr为cancelToken，和一个方法为cancelSearch，在该方法内判断this.cancelToken是否存在，存在才调用this.cancelToken()
在对应api正式发起请求之前 调用上述实现的方法并赋值给this.cancelToken

修改isseaching时的对应操作，不是显示正在检索中，而是 取消检索，在handlesearch里前置判断是否正在检索，是的话调用newsapi.cancelSearch取消调用

已实现2
在session文件新建属于ai的连接池 在fastapi启动的时候open连接，在关闭的时候关闭连接
修改astream入口，从请求参数里面拿threadid和checkpointer 有的话就跳过下面的，直接构造新的config传给astream
没有的话
创建配置，声明threadid 随机uuid，然后传给astream
在astream里面配置streammode updates和values
如果chunk的type是updates 那么判断chunk的data里是否有agent_node（key）有的话，就调用graph来get_state拿到当前的checkpointerid
构造json对象，以string格式yield给前端

在graph里声明一个数据库 saver类型的checkpointer，传进连接池，setup创建表，在compile的时候配置checkpointer
在graph astream的时候 除了messages 还要拿到checkpointer、parent、values.messages（需要判断最新的是不是aimessage） 拿最新的

前端拿到最新的checkpointer 调用onCheckpoint更新
初始新的对象包括 name、threadid、checkpointerid，parent(分叉点)，message，children为空数组
请求返回parent有checkpointid，那就根据这个id在表里查询，有的话先取出来然后往children里塞这个新的checkpoint数据，没有的话就直接在表set
查找方法：递归，入参node，targetkey
 
判断key是否在，在的话往children塞，并退出
不在，判断children是否为空，空的话直接退出；不为空继续遍历children再次调用方法
或者可以用栈
while循环
每次pop一个，判断key是否相等，相等往这个children里塞，然后return true，不相等，往stack push children 最后return false
遍历顶层数组，都执行上述方法，判断返回是否为true 是则return
循环结束之后 往数组添加

每次用户点击对应迭代，调用接口（复用之前的接口，除了chat 还可以传threadid、checkpointerid） 传入对应参数
通过checkpointer 保存每一次迭代的快照到数据库（编码），返回每一次快照的id，用户可以选择对应的id调起快照（解码）

 

已实现3
知识库rag
封装tool:
1.用户提问向量化 入参query return vectors  generate_document_vectors
2.在qdrant查询 入参是vectors 调用querypoint 需要带上payload 拿前50条 用一个列表收集payload
3.rerank 入参：备选文本列表 调用sentence 传入重排模型 构造提问文本和预选文本对，进行predict 拿到scores 进行排序 获取前5-10条 最好都是正数 返回正式的payload列表 payload里包括原始文本content、原始链接：source_url
构造上下文
遍历payload
通过粗检索和重排之后，筛选出与问题相匹配的文本片段如下：
1.原始文本：content (来源：source_url)

  


定义state messages
定义提示词 指导ai 按照指定流程调用对应tool 然后根据拿到的信息总结知识
定义agent node 输入系统提示词和当前的messages invoke
定义tool node 执行对应tool 并将得到的结果按照tool message的格式更新到state里面
构建图 声明 利用add sequence串起这些node 先是tool node 再是agentnode
 
定义service 调用agent的astream
判断是ai message 以及有content才yield
定义接口/knowledge/rag 返回streamingresponse

前端新增knowledge 接口调用 rag 入参query 配置contenttype post 
返回response
调用usestream的hook 获取read append data 按照打字机风格输出


当前需要删减的功能：1.资讯检索的创建分叉 2.投票 3.删除知识库文档 4.话题数量展示

待实现1
返回热门话题
定义热门：出现次数大于50 

在database knowledge下创建新的表 Tag ，先声明 包括id（雪花id，BigInteger 主键）、tag_name(String) class定义 还有个relationship定义（指向knowledge secondary中间表是Knowledge_Tag）
同时knowledge表也定义tag的relationship
继续创建新的关联表 Knowledge_Tag, 声明 knowledge的id和tag 的id 都是外键 用table直接创建 
用alembic创建新的迁移版本
alembic revision --autogenerate -m "Added account table" 生成新脚本
编写创表逻辑 op.create_table 用sa声明column
编写迁移脚本 把之前存储到document表里的tag数据迁移
用op.get_bind拿到db connection
声明tag缓存映射表
db 执行原生sql语句，声明sql语句select id，tags tag不能为空，用text转换，直接db.execute.fetchall 遍历获取id和tag，对每个tag进行split拆分，再次遍历拆分后的tag
先判断对应tagname是否在表内，不在，才select tag表查看是否有符合的tagname （原生sql）execute.fetchone 获取，如果没有才生成新的id，insert into tag表 id,tag_name values 动态参数:id,:tag_name execute第二个入参
如果tagname在映射表里，就直接通过tagname拿到id
然后往映射表里存key为name val为id
在每个tag的操作里，还要插入关联表
insert into knowledge_tag表 knowledge_id,tag_id values 动态参数:knowledge_id,:tag_id execute第二个入参
alembic upgrade head执行脚本


删除指定column
修改后端的store_original_knowledge_metadata存储逻辑
把asynio.gather下掉（会创建多个connection）替换成在数据库直接批量操作
除了tag其他的还是保留原表存储逻辑
需要批量插入三个表
先构建需要插入的数据，分别是knowledge_data（dict）、tag_data（dict）、re_data（）遍历metalist：先生成k的id，然后按照数据模型构造字典
k可以直接建，但是tag，需要再来一次遍历，然后判断tagname在不在map里，不在才生成对应id，创建对应key val为tag的dict，
同时在该判断外构造re_data
需要检查tag表里是否已经有对应tagname 有的话就把tag从原先的tag_data剔除掉
可以用scalars select tag_name tag表 where tag_name in_ list(tag_data.keys) fetchall拿到所有的tag结果
for遍历上述结果 判断row.tag_name是否在map里，在的话map pop掉这个key

然后开始执行sql语句
首先是knowledge execute insert knowledge表 第二个参数为knowledge_data
然后是tag execute insert tag表 第二个参数为list(tag_data.values)
最后是re execute insert re表 第二个参数为re_data
最后一次性commit

前端修改triggerExtract 取消拼接字符串的处理

声明path /knowledge/hot_topics 查询参数topN get请求
在service定义获取热门话题的get_hot_topics 入参是topN（默认为10）
定义sql语句  select tag_name，func.count(定义label为tag_count) join（左连接，以左表为准）连接knowledge_tag表 on tag表id与关联表id一致 group by tagid order by tag_count (降序) desc
execute执行该语句 fetchall
声明topics [ t.tag_name for t in result]
索引筛选前topN
返回










待实现2 
返回知识库文档列表相关数据
包括文档总数、本周新增数量以及新增的详细文档信息
包括标题、来源、概要、产生日期、标签、链接、

后端定义route /knowledge/docs 入参是topic（可选，返回全部）,page_num(必填)，page_size(此必填，默认为10)  get
定义请求数据模型 DocsRequest 对应上述请求入参 给page_num和page_size加上field_validate 判断info.data.topic是否存在 不存在 raise valueerror 存在 return v
定义service
初始一个result字典
如果有topic
需要选取knowledge对象、count和tag_name
1.select tag.id,tag.tag_name,knowledge.id join 关联表 on where tag.tag_name == topic limit page_size offset page_num-1
scalars执行该语句 fetchall拿到平铺形式的topic数据以及对应knowledge
for 循环result 构造knowledge.id和对应tag数据的映射表
2.select knowledge where knowledge.id _in(list)
scalars执行该语句 fetchall拿到符合条件的所有knowledge
声明空knowledge[] for 循环结果列表，构造完整的knowledge对象，填充对应映射表的tag数据，knowledge.append
3.select count(),关联表.tag_id join tag表 on where tag.tag_name == topic
scalar执行该语句 拿到total
db.commit
上述更新到result 结构是id,tag_name,knowledge:[],total,page_size,page_num

如果没有topic 默认查找近一周
从db里获取文档总数、按照时间范围查找近一周的文档，以及对应总数
分成两个select语句，
1.select 聚合func.count(knowledge.knowledge_id) where knowledge.create_at大于等于一周前的时间戳，小于等于当前时间戳-->用scalar执行 拿到total
2.利用selectionload结合relationship组装doc以及doc的tag列表数据 limit page_size scalars执行该语句 fetchall拿到对应knowledge数据
构造result，结构是 total，list[knowledge对象],page_size,page_num
db.commit
返回result

前端
让ai在documentlist写个分页器样式，核心逻辑自己实现
声明页数（默认为1）、页size（默认为10）、total（默认为0）
监听页数选择情况，更新页数
定义api接口 docs 入参topic也可以没有 get
修改filterByTopic逻辑，除了更新话题选中状态，再加上后端调用接口 更新documents
调用接口之前构造请求入参， 判断是否有selectedtopic，有的话传topic，没有的话传入pageSize和pageNum
更新pagenum、pagesize和total
删除原先的documents filter逻辑


待实现3.
修正checkpoint逻辑
当前传的有问题，用给定的checkpointid执行，会从当前节点的下一个开始
通过判断config是否有checkpointid来判断是否为初始
初始的时候get_state_history拿到最开始的节点，更新thread_id,checkpoint_id,query，iteration_count为1
非初始的时候，判断改成tool_node 更新iteration_count+1




资讯检索的保存到知识库功能
前端获取summary和results,用\n\n拼接成一段完整的text，new file生成 配置type为text/plain lastmodified
删除documentuploader的initial-的字段，新增savefiles字段（数组）,传入上面生成的[file]
如果documentuploader open且类型是save，await 调用handlefiles方法，入参为savefiles
修改loader的jsx mode的判断只针对文件上传操作的部分，但是把title、summary和tag的展示提出来（通用），把原先的modesave展示和确认的disabled删了
handlesubmit统一用onupload
把searchpage的onupload方法改成和knowledgepage一致（isuploading也是）

后端不涉及修改

测试pdf和markdown的文件上传、批量上传
创建分叉改成创建分叉讨论（同步到话题讨论）和保存到知识库并排展示，样式保持一致


数据库操作：删除关联表和知识库脏数据，在model增加完整性约束（unique、not null、外键）

一个话题对应多个消息
一个消息对应多个回复/多个react
一个用户对应多个消息/多个回复/多个react
待实现4
创建新话题

后端
新建route discussion文件，并在main集成
路径1为/discussion/create 入参是title、category、desc post请求 都是必填 
路径2/discussion/categories 返回种类映射表 无需入参 get请求
schemas 新增discussion文件 定义分类category枚举1-技术 2-产品 3-设计 4-团队 5-其他，请求体DiscussionCreate、DiscussionCategory（id,name） 

定义database新的数据模型 Discussion id（int p） title（str）、category（int）、desc（str） create_at(datetime) 外键userid
service1定义 create_new_discussion  还需要获取user的id，构造discussion对象
service2定义 get_categories 构造category对象
db.add
db.commit
db.refresh

前端
定义discussion api create和categories
在historicaltopics文件
1.定义title、category、desc三个state和topicCategory，以及对应的三个onchange，回调拿到的是e，在其中更新对应state
2.调用categories接口获取分类，然后更新topicCategory
然后在oncreatetopic里回传包含这三个字段的对象
 
在discussionpage文件创建oncreatetopic函数：先校验（是否都存在）再调用create提交
（稍后再考虑是否延时刷新请求）

待实现5 
获取历史话题列表
路径为/discussion/topiclist 入参为category(可选),sort(可选 1-最后活跃 2-消息数量 3-创建时间，默认按照创建时间)，searchtitle，pagesize，pagenum 方法为post
建立枚举topicfilterenum
定义service gettopiclist，入参requestparam、db
如果是2，单独处理
select topic count as messagecount orderby messagecount
if category
stmt = stmt.where()
scalars fetchall
然后索引取offset，pagesize

如果是其他情况
if 1:
select topic greatest(三个select max(createat)) as lastactivity limit pagesize offset order by lastactivity 

else:
select topic orderby creatat

单独获取total
select count as total 用 scalar

if category
stmt = stmt.where() 筛选的也单独获取一次 filternum 用 scalar

if searchtitle
stmt = stmt.where(like)

scalars fetchall


db.commit

for循环结果，构造topic对象 返回topic，pagesize，pagenum，total，filternum

前端
在discussion的api里新增gettopiclist loading禁止掉

在historicaltopics组件里
定义currenttopicid的state，
定义topicstats（包括pagesize、pagenum、total）的state
新增inithistoricaltopics方法，在该方法内发起请求，setHistoricalTopics更新topic，更新topicstats
在list下方复用已有的分页组件，把list展开项下的浏览、参与者、消息都删了
把handleSelectTopic的onselecttopic删了，只在点击详情的时候触发，只保留本地currenttopicid的更新，把currenttopicid的prop删掉
useeffect监听filtercategory、sort,searchtitle的变化，在usecallback的基础上添加防抖调用接口inithistoricaltopics（还是从1的页码开始），支持立即执行-->区分是不是首次（防抖的封装单独放在公共utils的目录下）
在discussionpage里的handleTopicSelect方法里获取到topicid之后调用详情接口和消息列表接口


待实现6
获取话题详情
需要包括topicid、title、status（近一个月有最新活跃消息/回复/react，只区分活跃和非活跃）、category、浏览量（该接口调用次数）、消息数、回复数、description、host、createat、参与者（返回全部用户名和个数）、最后活跃时间
路径为/discussion/topicdetail 入参是topicid（可选），方法get
定义service gettopicdetail，入参topicid，db
如果topicid不存在的话，那就先从topic表里按时间降序取第一行数据
select topicid orderby desc scalar
首先可以先获取topic表内的所有字段数据、话题主持人user信息
select topic username userid join user on id where topicid命中 execute fetchone
然后再统计message表 包括符合topic的消息数、messageid 最新createat事件，username、userid
select messasgecount messageid createat username、userid join user表 on id where topicid orderby desc execute fetchall
定义messageid集合 for循环上述结果添加到集合set
然后再统计reply表，在messageid集合里的reply数 createat大于等于1个月前，小于等于当前时间 username、userid join user表
select replycount replyid createat username、userid join user表 on id where in set orderby desc execute fetchall
然后统计reaction表，在messageid集合里的reaction数 createat大于等于1个月前，小于等于当前时间 username、userid join user表
select creatat username、userid join user表 on id where in set orderby desc execute fetchall
再把前面三个表拿到的userid都往映射表里放，已经有的就跳过，没有的就创建key为userid，value为包括userid和username的dict的映射，计算keys得到个数participantcount，通过values得到participantlist
再各取上述三组的第一行数据，取时间最大的为lastactivity，判断是否大于等于1个月前，小于等于当前 是的话status就是true 否则为false
最后构造结果{topicid,title,category,description,createat,host:username,status,lastactivity,participantcount,participantlist,messagegcount,replycount}
db.commit保存

浏览量暂时不考虑，涉及到单独的数据表统计了（监控）

前端
在discussion的api里新增gettopicdetail loading禁止掉
在usediscussionstate的hook里修改getDiscussionById 把mock替换成真实接口调用，调整一下相关的字段取值


待实现7
获取消息列表，除了包括原始message，还需要包括回复（仅包括前pagesize条，点击查看更多调用新的接口），react
每个消息完整字段包括messageid、create_at、username、ishost（是否为主持人）、content、reactions（每个包括reactionid、emoji、count）
封装请求schema messagerequest
路径为/discussion/messages 入参是topicid，pagesize、pagenum 方法post
定义service getmessages，入参messagerequest，db，user
先查询message+reactions
select message对象 selectinload reaction where topicid命中 limit+offset+orderby（createat） scalars fetchall
遍历message列表，按照messageid构造映射表 （...message，username:"",ishost:False,replies:[...],reactions:[...]）
然后再根据是否在keys的条件分组查询各个message的回复个数、前pagesize的回复内容
select reply where messageid in list(keys) limit pagesize orderby createat scalars fetchall
遍历replyresult 往messageid对应的replies里塞reply


查询username、ishost（topic的userid和message的userid一致）
select user.username,user.userid,case message.userid==topic.userid as ishost(sqlalchemy也能这样写，改成label就行) join user表和topic表 where messageid in set
execute fetchall
遍历userresult 重新给messageid的username和ishost进行赋值
返回结果列表，结构是(访问这个话题的当前用户)currentuser:{username,userid,}messages（...message，username,userid,ishost,replies:[...],reactions:[...]），pagesize，pagenum

前端
在discussion的api里新增getMessages loading禁止掉
在usemessages的hook里新增定义currentuser、pagesize、pagenum的state
修改usemessages hook里的initmessages 修改入参为topicid，pagenum，替换成真正的接口调用，更新currentuser、pagesize、pagenum、messages，并暴露出来，通过messagelist传给messageitem
修改messageitem的相关字段，1.当前用户的判断逻辑，直接判断message.userid是不是等于currentuser.userid，把issystem改为ishost，isopinion改为非issystem，react是emoji不是type，timestamp改为createat
在discussionpage声明ref，配置给messagelist，然后在这个ref.current添加scroll的事件监听，判断scrolltop是否大于等于scrollheight且没有在loading，是的话，再次调用initmessages调用，num+1
删除messagelist的滚动到底部的交互

修改一下不按固定页码来分页，下拉到底部然后根据最后一条消息的id来获取历史消息
后端修改请求schema discussion_id改为last_message_id,service也一样（pagesize不变）
由于雪花id是按时间戳来计算的，所以本身是递增的，可以按照传过来的id来比较，找历史数据，就找小于当前id的
（记得修改order 全都改为id，不要createat）
新消息插入到最顶部，点击查看的时候也是滚动到顶部


待实现8
发送消息
路径为/discussion/send_message 入参是topicid，content 用post
schemas 定义message体包括 id、content、create_at,userid(外键),topicid（外键）
定义database新的数据模型 Message id（int p） content（str）、create_at(datetime) 外键userid，外键topicid、reactions（relationship）、username（relationship）
service定义 send_message 入参是topicid，content、user
构造message对象
db.add
db.commit
db.refresh

在docker-compose文件配置三个服务，分别是Debezium、Debezium connector、Debezium connector registry（依赖connector，通过调用connector接口判断，entrypoint执行注册接口脚本）具体配置参考https://debezium.io/documentation/reference/3.6/kc-tutorial.html

配置成功之后安装aiokafka，在fastapi生命周期初始AIOKafkaConsumer，（需要配置topic、server、group-id、value-serializer-->需要把原始二进制value转换成可读，先decode解码再json.loads）然后把初始好的consumer挂载在app.state上，创建依赖注入通过app.state获取到consumer（另外把aisaver的初始化和依赖注入也改一下，把初始连接池的操作也放在生命周期，把checkpointer也挂载在app.state）

创建websocket
在创建个和api/v1同级的文件 websocket.py 专门存储websocket相关的路由
类似的，新建apirouter对象，利用router装饰器 router.websocket(/ws),然后在main添加这个router
router = APIRouter()

        @router.websocket("/ws/discussion")
        async def websocket_endpoint(websocket: WebSocket):
            await websocket.accept()
            while True:
                data = await websocket.receive_text()
                await websocket.send_text(f"Message text was: {data}")

        app.include_router(router)

封装一个统一的discussion的更新通知service notifydiscussion，需要websocket和依赖注入上述提到的consumer）主要就是判断是什么表/是什么op，根据表名拼接event
声明表名列表[message,reply,reaction]
async for consumer，拿到msg
如果source中database和table对应agent里的指定表名列表，且op为insert，payload为after的值，拼接event:notifynew+tablename，转换成json字符串，再通过websocket的sendtext把数据传输给前端
定义前后端传输协议字段 event，payload
 

前端
在utils下新增websocket连接服务
声明static websocket服务实例（所有实例共享），连接地址、事件监听器表（对应不同的生命周期，包括open、message、close，error，其中message可以进一步自定义）、重试次数、最大重试次数、基础延迟，最大延迟时间，定时器
该服务包括connect连接websocket服务（先判断是不是已经连接了，是的话就直接跳过。connect里会初始化一个websocket实例，有onopen、onmessage、onclose，onerror的事件监听，message拿到event，对event.data进行反序列化，拿到event和payload，在对应的事件监听里都进行emit）
还有on--添加事件监听回调，检查表里是否有对应事件，有的话就往对应事件里塞新的回调，没有就初始一个set，入参是event，cb
emit--执行回调，根据event找到对应事件列表，逐一执行，入参是event，data（可选）
off--删除事件监听回调，检查表里是否有对应事件，有的话就从对应列表里删除对应回调，入参，event和cb
send发送消息，判断是不是state已经ready了，ready了再发送消息，入参是event，payload
（在onclose的时候触发，error发生之后）指数退避重连，就是每次重试等待的时间越来越长
判断定时器是否存在，存在先清除clear+置null
判断是否超过重试次数，是的话直接退出，不是继续，定义延迟等待时间，基础延迟*（2的重试次数），更新重试次数，然后再设置timer settimeout
在该timer里执行connect

static getinstance里判断websocket服务实例是否存在，是的话直接返回，不是就新建一个

在discussion的api里新增sendMessage，loading禁止掉
修改messageinput的handlesubmit，在正式调用submit前，进行校验（是否填写，是否超过限制字数），通过后再走后面的，
修改usemessages的hook里的sendmessage方法，用接口替换掉原先的mock
暴露setMessages出来到discussionpage
在discussion目录下新建utils目录，新建batchmessagesscheduler 是个class
定义全局变量pendingmessages[] isrendering，
控制在requestanimationframe下一帧渲染。
add方法，入参是message，cb，更新this.cb，添加message到pending队列（判断一下是否为数组）。判断isrendering是否为true，不是就可以标记已经发起渲染了，然后执行requestanimationframe render 
render方法 执行cb，传入pendingmessages 然后重置pending队列 isrendering为false
在discussionpage里
1.新建batchmessagesscheduler的实例，在useeffect用ref.current保存
2.新建handlenewmessage 处理新增消息的回调，拿到回调的data之后按照原先的mock拼接包括replies、reactions（初始为空数组）构造成新的message，调用实例的add添加message，cb是setmessage+alert（新增pending.len条信息，点击查看），点击查看按钮滚动到新增的第一条消息
3.新增点击事件响应，handledetailbuttonclick 传入新增数量，document 获取消息列表，索引至倒数第n条，通过getboundingclient得到距离视口的位置，然后计算消息的位置，消息top-容器top+容器scrolltop 然后修改容器scrolltop为对应位置
4.useeffect 利用getinstance获取websocket服务实例，调用connect连接后端websocket服务，调用on注册事件notifynewmessage，cb是handlenewmessage

返回的信息只是包括了新插入的消息内容，有些用户详细信息没有返回，需要将用户信息在login的时候先redis缓存
然后在拦截到kafka消息之后，再从redis取，如果没有才从数据库取
改造redis的获取，把局限于celery的放到统一的配置文件redis_client里



待实现9
回复信息
路径为/discussion/reply_message 入参是message_id，content，用post
schemas 
定义reply体包括 id、content、create_at,userid(外键),message_id（外键） 添加configdict配置，支持modelvalidate
定义database新的数据模型 Reply id（int p） content（str）、create_at(datetime) 外键userid，外键messageid
service定义 reply_message 入参是messageid，content、user
构造reply对象
db.add
db.commit
db.refresh


前端
改写之前usecheckpoint 把添加新节点到对应父节点下的方法，提取成公共方法，放在utils目录下，也是class写法（NodeOperator），支持add和remove、指定将新节点放到对应的父节点字段、指定对比字段，最终返回新的树节点（多树） 构造函数接收comparekey、operatekey
在discussion的api里新增replyMessage
修改messageitem的handlereply 在正式调用reply前，进行校验（是否填写，是否超过限制字数），通过后再走后面的
在discussionpage页面新增replyToMessage方法，调用接口
创建更新reply的函数updatereplybyid
获取websocket返回的reply对象，调用根据对应的messageid，调用NodeOperator的add方法将新的reply插入到对应message的replies数组里，拿到新的messages，复用已有的batchmessagesscheduler的实例，传入messages，cb为setmessages
在discussionpage里借用原先已经创建好的websocket服务实例，调用on注册事件notifynewreply，cb是updatereplybyid 塞入新的data


待实现10
react表情
路径1为/discussion/react_message 入参是message_id，type,content 用post
路径2为/discussion/reactions 用get
schemas1 定义react请求体包括 message_id content type(表情类型1-8) schemas2 枚举（参考category）type+content
定义database新的数据模型 Reaction id（int p） type（int）、content(str) create_at(datetime)，外键userid，外键messageid
service定义 react_message 入参是messageid，type、user
构造reaction对象

db.add
db.commit
db.refresh


前端
指导ai修改react的交互 点击按钮在下方展示表情符号的选项，点击选中触发handlereact
定义枚举 emoji 8个 参考github 👍-1 👎-2 😀-3 🎉-4 🙃-5 ❤️-6 🚀-7 👀-8 https://emojipedia.org/eyes
在discussion的api里新增reactMessage和reactions（前端无需定义枚举了直接遍历即可）
在discussionpage里新增reactToMessage方法，调用接口
创建更新reaction的函数updatereactionbyid
获取websocket返回的reaction对象，根据对应的messageid，调用NodeOperator的add方法将新的reaction插入到对应message的reactions数组里，然后调用setmessages更新
在discussionpage里借用原先已经创建好的websocket服务实例，调用on注册事件notifynewreaction，cb是updatereactionbyid 塞入新的data

修改插入更新的回复和reaction的逻辑
用nodeoperator 但支持指定层数，以及在更新值的时候传入回调
其实就是遍历外层的tree然后看key是否命中，命中再去往对应的字段里塞值或者进一步搜索

websocket 鉴权
前端
修改websocket url 协议为wss（加密）
封装一个刷新websocket token的方法 refreshwebsockettoken,入参：过期时间
设置间隔时间：失效时间-当前时间-1min，间隔这段时间就调用refreshAccessToken方法拿到最新的token，然后再sendmessage event:refreshtoken content {token:xxx}
首次连接就发送带有token的信息 onopen的时候就先sendmessage json格式为event:validatetoken， content {token:xxx}这个token就是从getAccessToken里面拿的（会从storage里面拿，但是没有登录是没有的）
onmessage监听tokenvalidate事件，解析出content.expired_at看是否存在，存在就调用refreshwebsockettoken

后端
封装一个connection_manager（负责记录用户连接，后续发送给个人或者广播可用），有connect、sendtouser、broadcast
声明一个字典user_connection_map key为userid val为webscoket
connect 入参为userid和websocket，更新user_connection_map
sendtouser 入参为useridlist，msg 遍历这个map，然后判断userid是否在useridlist，是的话才获取websocket然后再sendtext
broadcast 入参为msg 直接遍历这个map，获取websocket然后再sendtext
disconnect 入参为userid 然后从map里找到对应的ws ws.close
在deps再封装一个类似getcurrentuser的鉴权方法，入参：token，ws
先websocket accept（删掉在路由函数的accept，初次连接的调用在依赖注入里实现）
try websocket.receive_text拿到jsondata，判断是否为validatetoken事件，不是的话直接raise except捕获到异常（还是区分一下不同的异常类型），然后websocket.close手动关闭websocket连接，返回状态码（code:status） 如果认证没问题就按照event:validatetoken， content {token:xxx，expired_at:(返回失效时间),code:status}发送消息给前端 调用connection_manager（记得初始化） connect添加connection 并返回当前的user

增加try except，捕获到异常的话直接就websocket.close

待实现11
ai 辩论生成器
需要生成不同的角色、立场、时间、内容、风格 生成进度

前端 
不用采用打字机的形式，直接渲染即可
无需定义debatestyle的state
在discussion新增api调用 get请求 无需loading
修改handlegenerate方法，替换接口请求，返回的是数组
修改相关的字段，删除掉role

后端
定义后端接口路径 /discussion/generate_ai_debate，入参为discussion_id
返回通用的response，不用stream
定义新的scheme 枚举style 英文名和中文名的映射
定义get_discussion_basicinfo的service 入参是discussionid ，具体实现参考原先的discussion detail，仅需获取题目、分类、描述即可
定义generate_ai_debate的service，
调用get_discussion_basicinfo 获取基本信息，然后按照格式拼接成字符串，最后用humanmessage包装
定义初始state，messages里面初始是humanmessage，其他都是空数组
调用图编译器 invoke传入初始state，拿到结果，并返回state里面的opinion

在agents下新建目录 ai_debater

定义state messages（list）、classifications（list），opinions（list）-->每个都是个具体对象，包括style、author、avatar、create_at、content
同时定义
1.主agent的派发格式 ClassifySchema style（辩论风格），theme（主题描述）
2.子agent的输出格式 OutputSchema author（用户名称），content（观点）

定义主agent和子agent的prompt，都放在同一份prompts文件里

帮我生成一份ai提示词，指导ai根据当前的话题背景信息（有话题标题、话题分类、话题描述）调用不同辩论风格的agent生成各自观点，输出的格式是style（辩论风格）和theme（话题描述）。辩论风格包括均衡辩论（有正反方）、深度批判、实用主义、理论探讨

在graph文件里
1.定义主agent 这个agent主要就是根据用户的提问（这里指discussion的主题和描述 初始messages），来判断要调用哪些agent，返回styles（定义prompt，然后按照既定的格式输出，更新到styles）既定的格式就是指四种（style，query） 用structured的方法
2.定义派发函数，根据主agent的返回，即styles，map分配send发起辩论生成
3.再定义四个子agent 每个子agent也基于querymessages和自己的prompt，按照author和content的规范输出，对于avatar 生成既定风格dicebear的http链接https://api.dicebear.com/10.x/big-smile/svg；然后再结合其他必需字段构建对象更新到opinions
4.声明图，然后添加上述的几个agent作为节点
5.定义图，start 到主agent 到派发函数 到四个子agent 再end
6.再编译图

待实现12
搜索和讨论的创建分叉功能
点击调用创建新话题的接口


后端
新建接口，定义路径/discussion/fork_new_discussion post请求 入参是discussion_id（可选）,content（必填，就是要分叉的原内容）
定义请求schema ForkRequest

在之前文本提取agent的目录下操作
新增prompt 
新增schema定义 title、category、desc

---暂时不要
定义get_message_content 的service，入参是messageid
直接根据messageid获取对应消息的content
select content where id scalar


定义fork_new_discussion 的service
先调用之前封装的get_discussion_basicinfo来获取讨论的基本信息，
再调用get_message_content来获取分叉原文
让ai结合背景信息（就是discussion）以及分叉原文（humanmessage）来生成新的标题、分类、描述（output schema）
拿到之后验证都存在就调用create_discussion的service来创建新话题，(修改原service，支持返回整个对象，记得转换一下类型，refresh之后就可以拿到了)拿到之后返回给前端

前端
在discussion新增接口调用
在discussionpage文件
1.handleMessageFork方法里替换mock数据
2.拿到discussion的对象，然后调用handleTopicSelect进行话题切换，同时重新获取历史话题列表
3.修改useeffect初次加载的逻辑，优先从url的查询参数里获取discussion_id，传给getDiscussionById


在searchpage里面修改handleCreateFork（删掉里面的createfork）
调用接口，成功之后就跳转到discussion的页面 window.location.href discussion.html


待实现13
增加心跳检测，避免突然断网等导致连接失败
在前端onopen的时候就可以创建定时器（timeout）
前端定时发送心跳检测数据给后端，event heartbeat  不需要content
然后在这个定时器里面再创建定时来检测后端是否有返回（就是比较当前时间和上一次响应时间的间隔是否超过阈值）
如果发现时间间隔已经超过指定间隔（超时了）主动触发close事件（尝试重试）
（注意在正式创建新的定时器之前要及时清理旧的定时器）

后端监听到对应事件 也发送event heartbeat
前端也监听这个事件，拿到返回值，就设置最新的响应时间 并重新心跳检测

 

待实现13
创建github actions 从分支提交触发工作流到构建镜像再到部署
在项目根目录创建.github/workflows/agent-build-deployment.yml
需要包括lint校验和前后端test再build 再deploy

lint



待实现13
完善分叉的信息展示
首页的调整
知识的处理
环境部署




待实现13
知识库的ai对话 记忆功能
压缩上下文 
检测用户反馈

待实现12
支持上传视频和发送图片

待实现13
可信度验证
文字-通过收集网络文章验证（还需要验证网络文章来源的可靠性，综合评分考虑）
视频和图片-先解析视频 分析视频二次加工程度 再与网络文章进行验证



















