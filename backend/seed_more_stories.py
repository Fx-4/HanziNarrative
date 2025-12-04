"""
Seed additional interactive stories for HSK 1, 2, and 3
Creating many stories using appropriate vocabulary for each level
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import Story, User
from datetime import datetime

stories_data = [
    # ==================== ADDITIONAL HSK 1 STORIES ====================
    {
        "title": "我的朋友 (My Friend)",
        "content": """我有一个好朋友，她叫小红。

小红很漂亮，也很好。她是学生，她学习很好。

我们常常一起吃饭，一起看书。我很喜欢她！""",
        "hsk_level": 1,
        "english_translation": "I have a good friend, her name is Xiaohong.\n\nXiaohong is very pretty and very nice. She is a student, she studies well.\n\nWe often eat together and read books together. I like her very much!"
    },
    {
        "title": "去商店 (Going to the Store)",
        "content": """妈妈说："我们去商店买东西。"

我和妈妈去商店。商店很大，东西很多。

我买了一本书。妈妈买了水果和菜。

我们很高兴！""",
        "hsk_level": 1,
        "english_translation": "Mom says: 'Let's go to the store to buy things.'\n\nMom and I go to the store. The store is very big, there are many things.\n\nI bought a book. Mom bought fruits and vegetables.\n\nWe are very happy!"
    },
    {
        "title": "学校的一天 (A Day at School)",
        "content": """今天是星期一，我去学校。

上午，我学习汉语和数学。老师很好，我很喜欢老师。

中午，我在学校吃午饭。下午，我有两节课。

四点，我回家。今天很好！""",
        "hsk_level": 1,
        "english_translation": "Today is Monday, I go to school.\n\nIn the morning, I study Chinese and math. The teacher is very nice, I like the teacher very much.\n\nAt noon, I eat lunch at school. In the afternoon, I have two classes.\n\nAt 4 o'clock, I go home. Today was great!"
    },
    {
        "title": "我喜欢的东西 (Things I Like)",
        "content": """我喜欢很多东西。

我喜欢吃苹果和米饭。我喜欢喝水和茶。

我也喜欢看书和看电视。我喜欢我的猫。

我最喜欢的是我的家人！""",
        "hsk_level": 1,
        "english_translation": "I like many things.\n\nI like to eat apples and rice. I like to drink water and tea.\n\nI also like to read books and watch TV. I like my cat.\n\nWhat I like most is my family!"
    },
    {
        "title": "今天天气 (Today's Weather)",
        "content": """今天天气很好，很热。

我和朋友去外面玩。我们去公园。

公园里有很多人。有的人在跑步，有的人在休息。

我们很开心！""",
        "hsk_level": 1,
        "english_translation": "Today's weather is very good, very hot.\n\nMy friend and I go outside to play. We go to the park.\n\nThere are many people in the park. Some people are running, some people are resting.\n\nWe are very happy!"
    },
    {
        "title": "我的狗 (My Dog)",
        "content": """我有一只狗，叫小白。

小白很可爱。它喜欢吃肉，也喜欢喝水。

每天，我和小白一起玩。小白是我的好朋友。

我很爱小白！""",
        "hsk_level": 1,
        "english_translation": "I have a dog, called Xiaobai.\n\nXiaobai is very cute. It likes to eat meat and also likes to drink water.\n\nEvery day, I play with Xiaobai. Xiaobai is my good friend.\n\nI love Xiaobai very much!"
    },
    {
        "title": "学习汉字 (Learning Chinese Characters)",
        "content": """我是学生，我学习汉语。

汉字很多，有的很难。但是老师教得很好。

我每天写汉字。我也看中文书。

我觉得汉语很有意思！""",
        "hsk_level": 1,
        "english_translation": "I am a student, I study Chinese.\n\nThere are many Chinese characters, some are very difficult. But the teacher teaches very well.\n\nI write Chinese characters every day. I also read Chinese books.\n\nI think Chinese is very interesting!"
    },
    {
        "title": "喝咖啡 (Drinking Coffee)",
        "content": """今天很冷。我想喝热的东西。

我去咖啡店。我点了一杯咖啡。

咖啡很好喝。我坐在那儿看书。

我很喜欢这个咖啡店！""",
        "hsk_level": 1,
        "english_translation": "Today is very cold. I want to drink something hot.\n\nI go to a coffee shop. I order a cup of coffee.\n\nThe coffee is delicious. I sit there and read a book.\n\nI really like this coffee shop!"
    },
    {
        "title": "打电话 (Making a Phone Call)",
        "content": """晚上，我给妈妈打电话。

妈妈问："你好吗？"我说："我很好！"

妈妈说她很想我。我也很想妈妈。

明天我要回家看妈妈！""",
        "hsk_level": 1,
        "english_translation": "In the evening, I call my mom.\n\nMom asks: 'How are you?' I say: 'I'm very good!'\n\nMom says she misses me very much. I also miss mom very much.\n\nTomorrow I will go home to see mom!"
    },
    {
        "title": "坐出租车 (Taking a Taxi)",
        "content": """今天我要去医院看医生。

医院很远，我坐出租车去。

出租车很快。二十分钟，我到了医院。

出租车很方便！""",
        "hsk_level": 1,
        "english_translation": "Today I need to go to the hospital to see a doctor.\n\nThe hospital is very far, I take a taxi to go.\n\nThe taxi is very fast. In twenty minutes, I arrived at the hospital.\n\nTaxis are very convenient!"
    },

    # ==================== ADDITIONAL HSK 2 STORIES ====================
    {
        "title": "第一次做饭 (First Time Cooking)",
        "content": """今天我第一次自己做饭。

我想做米饭和炒菜。开始的时候，我不知道怎么做。我打电话问妈妈。

妈妈告诉我："先洗菜，然后切好。再放油，最后炒一炒。"

我按照妈妈说的做了。虽然不太好吃，但是我很高兴。

爸爸说："第一次做得不错！"我觉得做饭很有意思。""",
        "hsk_level": 2,
        "english_translation": "Today I cooked by myself for the first time.\n\nI wanted to make rice and stir-fry vegetables. At the beginning, I didn't know how to do it. I called mom to ask.\n\nMom told me: 'First wash the vegetables, then cut them well. Then add oil, finally stir-fry.'\n\nI did it according to what mom said. Although it wasn't very delicious, I was very happy.\n\nDad said: 'Not bad for the first time!' I think cooking is very interesting."
    },
    {
        "title": "找工作 (Looking for a Job)",
        "content": """我大学毕业了，现在要找工作。

这几天，我去了很多公司面试。有的公司太远，有的工作太累。

昨天，我去了一家银行面试。那里的人很友好，工作也不错。

今天早上，银行给我打电话，说我可以去工作了！

我太高兴了！我要好好工作，让父母高兴。""",
        "hsk_level": 2,
        "english_translation": "I graduated from university, now I need to find a job.\n\nThese days, I went to many companies for interviews. Some companies are too far, some jobs are too tiring.\n\nYesterday, I went to a bank for an interview. The people there are very friendly, the work is also good.\n\nThis morning, the bank called me and said I can start working!\n\nI'm so happy! I will work hard and make my parents happy."
    },
    {
        "title": "搬家 (Moving House)",
        "content": """我们家要搬家了。新家比现在的家大一点儿。

上个星期，我和爸爸去看了新房子。房子有三个房间，还有一个小花园。

这个周末，我们开始搬东西。我帮爸爸妈妈搬了很多东西，很累。

但是我很高兴，因为新家离学校更近了。

以后我可以走路去学校，不用坐公交车了！""",
        "hsk_level": 2,
        "english_translation": "Our family is moving house. The new home is a bit bigger than the current one.\n\nLast week, dad and I went to see the new house. The house has three rooms and also a small garden.\n\nThis weekend, we started moving things. I helped mom and dad move many things, very tiring.\n\nBut I'm very happy, because the new home is closer to school.\n\nFrom now on I can walk to school, don't need to take the bus anymore!"
    },
    {
        "title": "生日派对 (Birthday Party)",
        "content": """今天是我的生日，我请了很多朋友来家里。

妈妈准备了很多好吃的东西。有蛋糕、水果、还有我最喜欢的饺子。

朋友们都带来了礼物。有的送书，有的送衣服，还有的送玩具。

我们一起唱歌、跳舞、玩游戏。大家都很开心。

这是我最快乐的一天！我要谢谢所有的朋友。""",
        "hsk_level": 2,
        "english_translation": "Today is my birthday, I invited many friends to come to my house.\n\nMom prepared many delicious things. There's cake, fruits, and also my favorite dumplings.\n\nFriends all brought gifts. Some gave books, some gave clothes, and some gave toys.\n\nWe sang together, danced, and played games. Everyone was very happy.\n\nThis is my happiest day! I want to thank all my friends."
    },
    {
        "title": "丢失的钱包 (The Lost Wallet)",
        "content": """昨天下午，我发现我的钱包不见了。

钱包里有我的学生证、银行卡，还有一些钱。我很着急，到处找。

我想起来，中午我去过超市。我马上回超市问。

服务员说："有一位老人捡到了钱包，已经交给我们了。"

我拿回了钱包，什么都没少。我很感谢那位老人。

以后我一定要小心，不能再丢东西了。""",
        "hsk_level": 2,
        "english_translation": "Yesterday afternoon, I discovered my wallet was missing.\n\nThe wallet had my student ID, bank card, and some money. I was very anxious and looked everywhere.\n\nI remembered, at noon I went to the supermarket. I immediately went back to the supermarket to ask.\n\nThe clerk said: 'An old person found the wallet and already gave it to us.'\n\nI got back my wallet, nothing was missing. I'm very grateful to that old person.\n\nFrom now on I must be careful, can't lose things again."
    },
    {
        "title": "运动的好处 (Benefits of Exercise)",
        "content": """以前我不喜欢运动，总是觉得很累。

但是医生说我应该多运动，对身体好。所以我决定每天早上跑步。

刚开始很难，跑一会儿就累了。但是我没有放弃，每天坚持。

现在，我已经跑了两个月了。我的身体变得更健康了，也不容易生病了。

我觉得运动真的很重要。我会一直坚持下去！""",
        "hsk_level": 2,
        "english_translation": "Before I didn't like exercise, always felt very tired.\n\nBut the doctor said I should exercise more, it's good for the body. So I decided to run every morning.\n\nAt first it was very difficult, after running for a while I got tired. But I didn't give up, I persisted every day.\n\nNow, I've already run for two months. My body has become healthier, and I don't get sick easily.\n\nI think exercise is really important. I will keep persisting!"
    },
    {
        "title": "买衣服 (Buying Clothes)",
        "content": """周末，我和朋友去商场买衣服。

我看中了一件红色的毛衣，很漂亮。但是价格有点儿贵。

我问服务员："能不能便宜一点儿？"服务员说："今天打八折。"

我试了试，大小正好。颜色我也很喜欢。

最后我买了这件毛衣。朋友说穿上很好看。我很满意！""",
        "hsk_level": 2,
        "english_translation": "On the weekend, my friend and I went to the mall to buy clothes.\n\nI took a fancy to a red sweater, very beautiful. But the price was a bit expensive.\n\nI asked the clerk: 'Can it be a bit cheaper?' The clerk said: 'Today it's 20% off.'\n\nI tried it on, the size was just right. I also really like the color.\n\nFinally I bought this sweater. My friend said it looks very good when worn. I'm very satisfied!"
    },
    {
        "title": "帮助别人 (Helping Others)",
        "content": """今天在公交车上，我看到一位老奶奶站着。

车上人很多，没有座位了。我马上站起来，让老奶奶坐。

老奶奶说："谢谢你，小朋友！"我说："不客气，这是我应该做的。"

旁边的人都说我做得对。我心里很高兴。

虽然我要站一会儿，但是能帮助别人，我觉得很值得。""",
        "hsk_level": 2,
        "english_translation": "Today on the bus, I saw an old grandma standing.\n\nThere were many people on the bus, no seats left. I immediately stood up and let the grandma sit.\n\nThe grandma said: 'Thank you, child!' I said: 'You're welcome, this is what I should do.'\n\nPeople nearby all said I did the right thing. I felt very happy inside.\n\nAlthough I have to stand for a while, being able to help others, I think it's very worthwhile."
    },
    {
        "title": "学骑自行车 (Learning to Ride a Bicycle)",
        "content": """我一直想学骑自行车，但是总是害怕摔倒。

上周，哥哥说要教我。我们去公园练习。

开始的时候，哥哥扶着我。慢慢地，我能自己骑一点儿了。

虽然摔了几次，但是我没有放弃。经过一个星期的练习，我终于学会了！

现在我可以骑车去学校了。我很感谢哥哥的帮助。""",
        "hsk_level": 2,
        "english_translation": "I always wanted to learn to ride a bicycle, but was always afraid of falling.\n\nLast week, my older brother said he would teach me. We went to the park to practice.\n\nAt the beginning, my brother held me. Slowly, I could ride a bit by myself.\n\nAlthough I fell a few times, I didn't give up. After a week of practice, I finally learned!\n\nNow I can ride a bike to school. I'm very grateful for my brother's help."
    },
    {
        "title": "参观博物馆 (Visiting a Museum)",
        "content": """昨天学校组织我们去历史博物馆参观。

博物馆很大，里面有很多古代的东西。有陶器、书画、还有很多我不认识的东西。

老师给我们讲解了中国的历史。我听得很认真，还拍了很多照片。

通过这次参观，我学到了很多知识。我觉得历史很有意思。

以后有机会，我还想再去博物馆。""",
        "hsk_level": 2,
        "english_translation": "Yesterday the school organized us to visit the history museum.\n\nThe museum is very big, inside there are many ancient things. There's pottery, calligraphy and paintings, and many things I don't recognize.\n\nThe teacher explained Chinese history to us. I listened very carefully and also took many photos.\n\nThrough this visit, I learned a lot of knowledge. I think history is very interesting.\n\nIf there's a chance in the future, I want to go to the museum again."
    },

    # ==================== HSK 3 STORIES ====================
    {
        "title": "面试经历 (Interview Experience)",
        "content": """上个月，我参加了一次重要的面试。

面试前，我非常紧张。我担心自己表现不好，所以提前准备了很多。我复习了专业知识，也练习了自我介绍。

面试那天，我穿上最正式的衣服，早早就到了。面试官问了我很多问题，包括我的经验、能力和对这份工作的理解。

我尽量表现得自信和专业。虽然有些问题比较难，但我都认真回答了。

一周后，我收到了通知，我被录取了！这次经历让我明白，只要认真准备，就能获得成功。""",
        "hsk_level": 3,
        "english_translation": "Last month, I participated in an important interview.\n\nBefore the interview, I was very nervous. I worried about not performing well, so I prepared a lot in advance. I reviewed professional knowledge and also practiced self-introduction.\n\nOn the day of the interview, I wore my most formal clothes and arrived early. The interviewer asked me many questions, including my experience, abilities, and understanding of this job.\n\nI tried to appear confident and professional. Although some questions were quite difficult, I answered them all seriously.\n\nA week later, I received a notice that I was accepted! This experience made me understand that as long as you prepare seriously, you can achieve success."
    },
    {
        "title": "环境保护 (Environmental Protection)",
        "content": """最近，我们城市开始重视环境保护问题。

以前，街上常常有很多垃圾，河水也不干净。现在政府采取了很多措施：增加了垃圾桶，规定不能随便扔垃圾，还组织了清洁活动。

我和同学们也参加了社区的环保活动。我们在公园里捡垃圾，还种了一些树。

通过这些活动，我认识到环境保护的重要性。每个人都应该为保护环境做出贡献。

我决定从小事做起：节约用水、用电，减少使用塑料袋，多乘坐公共交通工具。

我相信，只要大家一起努力，我们的环境一定会变得更美好。""",
        "hsk_level": 3,
        "english_translation": "Recently, our city started to value environmental protection issues.\n\nBefore, there was often a lot of garbage on the streets, and the river water wasn't clean either. Now the government has taken many measures: added trash cans, stipulated that you can't throw garbage randomly, and also organized cleaning activities.\n\nMy classmates and I also participated in community environmental protection activities. We picked up garbage in the park and also planted some trees.\n\nThrough these activities, I realized the importance of environmental protection. Everyone should contribute to protecting the environment.\n\nI decided to start with small things: save water and electricity, reduce using plastic bags, take more public transportation.\n\nI believe that as long as everyone works together, our environment will definitely become better."
    },
    {
        "title": "文化差异 (Cultural Differences)",
        "content": """我来中国学习已经半年了。在这段时间里，我体验到了很多有趣的文化差异。

在饮食方面，中国人喜欢用筷子，而我们国家用刀叉。刚开始我用筷子很不方便，经常掉东西。但是通过练习，现在我已经能熟练使用了。

在社交方面，中国人见面时会问"你吃了吗？"这让我很惊讶，因为在我们国家，这样问可能被认为是不礼貌的。后来我才知道，这只是一种关心的表达方式。

另外，中国人非常重视家庭关系。节假日时，很多人会回家和家人团聚。这让我很感动。

通过了解这些文化差异，我不仅学会了尊重不同的文化，也更好地融入了中国的生活。""",
        "hsk_level": 3,
        "english_translation": "I've been studying in China for half a year. During this time, I've experienced many interesting cultural differences.\n\nIn terms of diet, Chinese people like to use chopsticks, while our country uses knives and forks. At first it was very inconvenient for me to use chopsticks, I often dropped things. But through practice, now I can use them skillfully.\n\nIn social aspects, when Chinese people meet they ask 'Have you eaten?' This surprised me, because in our country, asking this might be considered impolite. Later I learned that this is just a way of expressing care.\n\nAlso, Chinese people attach great importance to family relationships. During holidays, many people go home to reunite with their families. This moved me very much.\n\nBy understanding these cultural differences, I not only learned to respect different cultures, but also better integrated into Chinese life."
    },
    {
        "title": "克服困难 (Overcoming Difficulties)",
        "content": """去年，我决定参加马拉松比赛。这对我来说是一个巨大的挑战。

我以前从来没有跑过这么长的距离。为了准备比赛，我制定了详细的训练计划。每天早上六点，我就开始跑步。

训练过程很艰苦。有时候我跑到一半就想放弃，腿疼得厉害，呼吸也很困难。但是每当这时，我就想起自己的目标，告诉自己一定要坚持。

我还遇到了一些意外情况。有一次训练时，我摔倒了，膝盖受了伤。医生建议我休息，但我担心影响训练。最后，我决定听从医生的建议，好好休息了一周。

经过三个月的努力训练，比赛的日子终于到了。那天天气很热，但我坚持跑完了全程。

当我冲过终点线的那一刻，我激动得流下了眼泪。这次经历教会我：只要有决心和毅力，就没有克服不了的困难。""",
        "hsk_level": 3,
        "english_translation": "Last year, I decided to participate in a marathon race. This was a huge challenge for me.\n\nI had never run such a long distance before. To prepare for the race, I made a detailed training plan. Every morning at 6 o'clock, I started running.\n\nThe training process was very hard. Sometimes I wanted to give up halfway through running, my legs hurt badly, and breathing was also difficult. But whenever this happened, I thought of my goal and told myself I must persist.\n\nI also encountered some unexpected situations. Once during training, I fell and injured my knee. The doctor suggested I rest, but I worried it would affect my training. Finally, I decided to follow the doctor's advice and rested well for a week.\n\nAfter three months of hard training, the day of the race finally arrived. The weather was very hot that day, but I persisted in finishing the whole course.\n\nThe moment I crossed the finish line, I was so moved I shed tears. This experience taught me: as long as you have determination and perseverance, there's no difficulty that can't be overcome."
    },
    {
        "title": "志愿者经历 (Volunteer Experience)",
        "content": """今年暑假，我参加了一个志愿者项目，去山区支教。

出发前，我既兴奋又紧张。我准备了很多教学材料，希望能给孩子们带去知识和快乐。

到达山区后，我发现那里的条件比我想象的还要艰苦。学校设施简陋，孩子们的学习资源很少。但是，他们学习的热情让我非常感动。

在支教期间，我教孩子们语文、数学和英语。课余时间，我还和他们一起玩游戏、唱歌。孩子们都很喜欢我，总是围着我问各种问题。

有一个学生叫小明，他特别聪明，但家里很贫困。我鼓励他好好学习，并承诺会继续关注他的学习情况。

一个月的支教很快就结束了。离别时，孩子们都哭了。他们送给我一张画，上面画着我和他们在一起的场景。

这次经历让我深刻体会到教育的重要性。我决定以后要多参加这样的活动，帮助更多需要帮助的孩子。""",
        "hsk_level": 3,
        "english_translation": "This summer vacation, I participated in a volunteer project to teach in mountainous areas.\n\nBefore departing, I was both excited and nervous. I prepared many teaching materials, hoping to bring knowledge and happiness to the children.\n\nAfter arriving in the mountainous area, I found that the conditions there were even harder than I imagined. The school facilities were simple, and the children's learning resources were very limited. However, their enthusiasm for learning moved me very much.\n\nDuring the teaching period, I taught the children Chinese, math, and English. In spare time, I also played games and sang with them. The children all liked me very much and always surrounded me asking various questions.\n\nThere was a student called Xiaoming, he was especially smart, but his family was very poor. I encouraged him to study hard and promised to continue paying attention to his learning situation.\n\nThe one month of teaching ended quickly. When parting, the children all cried. They gave me a drawing that showed me and them together.\n\nThis experience made me deeply realize the importance of education. I decided to participate in more such activities in the future to help more children who need help."
    },
    {
        "title": "时间管理 (Time Management)",
        "content": """上大学后，我发现自己的时间总是不够用。

课程很多，作业也很多，还要参加社团活动。我经常熬夜完成作业，第二天上课时很困。这样的状态持续了一个学期，我的成绩开始下降。

我意识到必须改变这种情况。我开始学习时间管理的方法。

首先，我制定了一个详细的时间表。我把每天的时间分成几个部分：上课时间、学习时间、运动时间和休息时间。

其次，我学会了分清任务的优先级。重要而紧急的事情先做，不重要的事情可以推迟或者不做。

另外，我还改掉了拖延的习惯。以前我总是把事情拖到最后才做，现在我养成了立即行动的习惯。

经过一段时间的实践，我的生活变得有序多了。我不再熬夜，有更多时间做自己喜欢的事情，成绩也提高了。

我明白了，时间管理不是为了填满每一分钟，而是为了让生活更有质量。""",
        "hsk_level": 3,
        "english_translation": "After entering university, I found that I always didn't have enough time.\n\nThere were many courses, a lot of homework, and I also had to participate in club activities. I often stayed up late to complete homework, and was very sleepy in class the next day. This state continued for a semester, and my grades began to decline.\n\nI realized I must change this situation. I started learning time management methods.\n\nFirst, I made a detailed schedule. I divided each day's time into several parts: class time, study time, exercise time, and rest time.\n\nSecond, I learned to distinguish task priorities. Important and urgent things should be done first, unimportant things can be postponed or not done.\n\nAlso, I got rid of the habit of procrastination. Before I always delayed things until the last minute, now I've developed the habit of taking immediate action.\n\nAfter a period of practice, my life became much more orderly. I no longer stay up late, have more time to do things I like, and my grades have improved too.\n\nI understand that time management is not about filling every minute, but about making life better quality."
    },
    {
        "title": "健康生活方式 (Healthy Lifestyle)",
        "content": """以前我的生活习惯很不健康。我经常吃快餐，很少运动，睡眠也不规律。

去年体检时，医生告诉我，我的身体出现了一些问题：体重超标，血压偏高。医生建议我改变生活方式。

这个警告让我意识到健康的重要性。我决定从现在开始改变。

在饮食方面，我减少了油腻和高热量食物的摄入，增加了蔬菜和水果。我学会了自己做饭，这样可以控制食材和调料的使用。

在运动方面，我每周坚持锻炼三次。有时去健身房，有时在公园跑步，周末还会去游泳。

在作息方面，我规定自己每晚十一点前必须睡觉，早上七点起床。保证每天有八小时的睡眠。

除此之外，我还养成了喝水的习惯，每天至少喝八杯水。我也减少了使用电子产品的时间，给眼睛更多休息。

坚持了半年后，我再次体检。结果显示，我的各项指标都恢复正常了。我感到精力充沛，心情也变好了。

这次经历让我明白：健康是最宝贵的财富，我们应该珍惜它。""",
        "hsk_level": 3,
        "english_translation": "Before, my lifestyle habits were very unhealthy. I often ate fast food, rarely exercised, and sleep was irregular too.\n\nDuring last year's physical examination, the doctor told me that some problems appeared in my body: overweight, high blood pressure. The doctor suggested I change my lifestyle.\n\nThis warning made me realize the importance of health. I decided to change from now on.\n\nIn terms of diet, I reduced intake of greasy and high-calorie foods, increased vegetables and fruits. I learned to cook myself, so I can control the use of ingredients and seasonings.\n\nIn terms of exercise, I persist in exercising three times a week. Sometimes I go to the gym, sometimes I run in the park, and on weekends I go swimming.\n\nIn terms of schedule, I stipulate that I must sleep before 11 PM every night and get up at 7 AM. Guarantee eight hours of sleep every day.\n\nBesides this, I also developed the habit of drinking water, at least eight glasses per day. I also reduced the time using electronic products, giving my eyes more rest.\n\nAfter persisting for half a year, I had another physical examination. The results showed that all my indicators returned to normal. I feel energetic and my mood has become better too.\n\nThis experience made me understand: health is the most precious wealth, we should cherish it."
    },
    {
        "title": "创业梦想 (Entrepreneurial Dream)",
        "content": """我一直有一个梦想：拥有自己的咖啡店。

去年，我终于决定把这个梦想变成现实。我开始做各种准备工作。

首先，我学习了咖啡的相关知识。我参加了专业的咖啡师培训课程，学习如何制作各种咖啡，如何品鉴咖啡的好坏。

然后，我开始寻找合适的店铺位置。我走访了很多地方，最后在学校附近找到了一个理想的位置。那里人流量大，租金也相对合理。

接下来是装修。我希望店铺的风格既舒适又有特色。我和设计师讨论了很久，最终确定了一个温馨简约的设计方案。

在资金方面，我用了自己的积蓄，还向家人借了一些钱。我深知创业有风险，但我愿意为梦想冒险。

开业前，我制定了详细的经营计划，包括产品定价、营销策略等。我还招聘了两名员工。

开业那天，很多朋友来支持我。虽然我很紧张，但看到顾客们满意的笑容,我觉得所有的努力都是值得的。

现在，咖啡店已经经营了三个月。虽然还面临很多挑战，但我相信，只要坚持，梦想就一定能实现。""",
        "hsk_level": 3,
        "english_translation": "I've always had a dream: to own my own coffee shop.\n\nLast year, I finally decided to turn this dream into reality. I started doing various preparations.\n\nFirst, I learned relevant knowledge about coffee. I attended professional barista training courses, learning how to make various coffees and how to appraise the quality of coffee.\n\nThen, I started looking for a suitable shop location. I visited many places and finally found an ideal location near the school. There's large foot traffic there and the rent is relatively reasonable.\n\nNext was decoration. I hoped the shop's style would be both comfortable and distinctive. I discussed with the designer for a long time and finally determined a warm and simple design plan.\n\nIn terms of funds, I used my own savings and also borrowed some money from family. I deeply know that entrepreneurship has risks, but I'm willing to take risks for my dream.\n\nBefore opening, I made a detailed business plan, including product pricing, marketing strategies, etc. I also hired two employees.\n\nOn opening day, many friends came to support me. Although I was very nervous, seeing customers' satisfied smiles, I felt all the efforts were worthwhile.\n\nNow, the coffee shop has been operating for three months. Although it still faces many challenges, I believe that as long as I persist, the dream will definitely be realized."
    },
    {
        "title": "跨文化交流 (Cross-Cultural Communication)",
        "content": """我是一名汉语国际教育专业的学生。去年，我有机会去德国做交换生。

刚到德国时，我对一切都感到陌生。语言不通，文化不同，让我感到很不适应。

在课堂上，我发现德国学生的学习方式和中国很不一样。他们更注重独立思考和批判性思维，经常在课堂上提出不同的观点和教授讨论。而在中国，我们习惯于听老师讲课，很少主动发表意见。

在生活中，我也发现了很多有趣的差异。德国人非常准时，如果约定了时间，一定会准时到达。他们也很注重个人隐私，不会随便问别人的年龄或收入。

为了更好地融入当地生活,我积极参加各种活动。我加入了学校的国际学生组织，认识了来自世界各地的朋友。我还经常和德国同学交流，向他们介绍中国文化。

通过这次经历，我不仅提高了德语水平，更重要的是学会了从不同的角度看问题。我意识到，世界上没有绝对正确的文化，每种文化都有其独特的价值。

回国后，我更加珍惜自己的文化，同时也更加开放地接受其他文化。我希望将来能成为一名优秀的汉语教师，帮助更多外国人了解中国文化。""",
        "hsk_level": 3,
        "english_translation": "I am a student majoring in Teaching Chinese as a Foreign Language. Last year, I had the opportunity to be an exchange student in Germany.\n\nWhen I first arrived in Germany, I felt strange about everything. Language barriers and cultural differences made me feel very unadapted.\n\nIn class, I found that German students' learning methods are very different from China. They pay more attention to independent thinking and critical thinking, often raising different viewpoints in class and discussing with professors. In China, we're used to listening to teachers' lectures and rarely actively express opinions.\n\nIn life, I also discovered many interesting differences. Germans are very punctual, if a time is agreed upon, they will definitely arrive on time. They also attach great importance to personal privacy and won't casually ask about others' age or income.\n\nTo better integrate into local life, I actively participated in various activities. I joined the school's international student organization and met friends from all over the world. I also often communicated with German classmates, introducing Chinese culture to them.\n\nThrough this experience, I not only improved my German level, but more importantly learned to look at problems from different angles. I realized that there is no absolutely correct culture in the world, each culture has its unique value.\n\nAfter returning home, I cherish my own culture more, and at the same time more openly accept other cultures. I hope to become an excellent Chinese teacher in the future, helping more foreigners understand Chinese culture."
    },
    {
        "title": "读书的力量 (The Power of Reading)",
        "content": """小时候，我不喜欢读书。我觉得读书很枯燥，宁愿花时间玩游戏或看电视。

这种情况一直持续到高中。有一天，老师推荐我们读一本名叫《活着》的小说。刚开始我并不感兴趣，但在老师的鼓励下，我还是开始读了。

读着读着，我被故事深深吸引了。主人公福贵经历了许多苦难，失去了所有亲人，但他仍然坚强地活着。这个故事让我思考生命的意义，也让我开始重新审视自己的生活。

从那以后，我爱上了读书。我读各种类型的书：小说、散文、诗歌、历史、哲学……每本书都像是打开了一扇新的窗户，让我看到不同的世界。

通过读书，我的思维变得更加开阔，对世界的理解也更加深刻。我学会了从不同的角度思考问题，变得更加包容和理性。

读书还提高了我的写作能力。以前我写作文时总是不知道写什么，现在我能够流畅地表达自己的想法。

现在，读书已经成为我生活中不可缺少的一部分。无论多忙,我每天都会抽出时间读书。在书的世界里，我找到了心灵的宁静和精神的慰藉。

我相信，读书的力量是巨大的。它不仅能增长知识，更能塑造人格，让我们成为更好的人。""",
        "hsk_level": 3,
        "english_translation": "When I was little, I didn't like reading. I thought reading was very boring, and preferred to spend time playing games or watching TV.\n\nThis situation continued until high school. One day, the teacher recommended we read a novel called 'To Live'. At first I wasn't interested, but under the teacher's encouragement, I still started reading.\n\nAs I read, I was deeply attracted by the story. The protagonist Fugui experienced many hardships and lost all his relatives, but he still lived on strongly. This story made me think about the meaning of life and also made me re-examine my own life.\n\nFrom then on, I fell in love with reading. I read various types of books: novels, essays, poetry, history, philosophy... Each book is like opening a new window, letting me see different worlds.\n\nThrough reading, my thinking became more open, and my understanding of the world also became deeper. I learned to think about problems from different angles and became more tolerant and rational.\n\nReading also improved my writing ability. Before when I wrote compositions I never knew what to write, now I can fluently express my thoughts.\n\nNow, reading has become an indispensable part of my life. No matter how busy I am, I set aside time to read every day. In the world of books, I find peace of mind and spiritual comfort.\n\nI believe the power of reading is enormous. It can not only increase knowledge, but also shape character, making us better people."
    },
]

def seed_more_stories():
    db = SessionLocal()
    try:
        print("\n" + "="*60)
        print("Seeding Additional Interactive Stories")
        print("="*60 + "\n")

        # Get or create admin user
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            print("[WARNING] Admin user not found. Please create admin user first.")
            return

        added = 0
        skipped = 0

        # Count by level
        hsk1_added = 0
        hsk2_added = 0
        hsk3_added = 0

        for story_data in stories_data:
            # Check if story already exists
            existing = db.query(Story).filter(
                Story.title == story_data["title"]
            ).first()

            if existing:
                print(f"[SKIP] {story_data['title']} - already exists")
                skipped += 1
                continue

            # Create story
            story = Story(
                title=story_data["title"],
                content=story_data["content"],
                english_translation=story_data.get("english_translation"),
                hsk_level=story_data["hsk_level"],
                author_id=admin.id,
                is_published=True,
                created_at=datetime.utcnow()
            )
            db.add(story)
            print(f"[ADD] HSK {story_data['hsk_level']}: {story_data['title']}")
            added += 1

            # Count by level
            if story_data["hsk_level"] == 1:
                hsk1_added += 1
            elif story_data["hsk_level"] == 2:
                hsk2_added += 1
            elif story_data["hsk_level"] == 3:
                hsk3_added += 1

        db.commit()

        print("\n" + "="*60)
        print("[SUCCESS] Additional Story Seeding Complete!")
        print("="*60)
        print(f"  Added: {added} stories")
        print(f"  Skipped: {skipped} stories")
        print(f"\n  HSK 1 stories added: {hsk1_added}")
        print(f"  HSK 2 stories added: {hsk2_added}")
        print(f"  HSK 3 stories added: {hsk3_added}")
        print(f"  Total new stories: {added}")

    except Exception as e:
        print(f"\nError: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_more_stories()
