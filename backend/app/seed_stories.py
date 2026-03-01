"""
Seed the database with pre-written HSK stories (zero AI cost).
Run: python -m app.seed_stories
"""
from app.database import SessionLocal
from app.models import Story, User


STORIES = [
    # ── HSK 1 ──
    {
        "title": "我的家",
        "title_english": "My Home",
        "content": "我有一个家。我的家不大，但是很好。我爸爸和妈妈在家。我有一个小狗。小狗叫大大。大大很高兴。我们都很高兴。我爱我的家。",
        "content_pinyin": "Wǒ yǒu yī gè jiā. Wǒ de jiā bú dà, dànshì hěn hǎo. Wǒ bàba hé māma zài jiā. Wǒ yǒu yī gè xiǎo gǒu. Xiǎo gǒu jiào dàdà. Dàdà hěn gāoxìng. Wǒmen dōu hěn gāoxìng. Wǒ ài wǒ de jiā.",
        "english_translation": "I have a home. My home is not big, but it is very nice. My dad and mom are at home. I have a small dog. The small dog is called Dada. Dada is very happy. We are all very happy. I love my home.",
        "hsk_level": 1,
    },
    {
        "title": "今天的天气",
        "title_english": "Today's Weather",
        "content": "今天天气很好。太阳很大。我和我的朋友去学校。学校不远。我们走路去。路上有很多人。学校里有很多学生。老师说今天我们学中文。我很高兴。",
        "content_pinyin": "Jīntiān tiānqì hěn hǎo. Tàiyáng hěn dà. Wǒ hé wǒ de péngyǒu qù xuéxiào. Xuéxiào bù yuǎn. Wǒmen zǒulù qù. Lùshang yǒu hěn duō rén. Xuéxiào lǐ yǒu hěn duō xuéshēng. Lǎoshī shuō jīntiān wǒmen xué zhōngwén. Wǒ hěn gāoxìng.",
        "english_translation": "The weather is very good today. The sun is very big. My friend and I go to school. The school is not far. We walk there. There are many people on the road. There are many students in the school. The teacher says today we study Chinese. I am very happy.",
        "hsk_level": 1,
    },
    {
        "title": "我吃饭",
        "title_english": "I Eat",
        "content": "我早上六点起来。我先喝水。然后我吃早饭。我喜欢吃米饭和菜。中午我在学校吃饭。晚上我回家。妈妈做饭。妈妈做的饭很好吃。我很爱妈妈。",
        "content_pinyin": "Wǒ zǎoshang liù diǎn qǐlái. Wǒ xiān hē shuǐ. Ránhòu wǒ chī zǎofàn. Wǒ xǐhuān chī mǐfàn hé cài. Zhōngwǔ wǒ zài xuéxiào chī fàn. Wǎnshang wǒ huí jiā. Māma zuò fàn. Māma zuò de fàn hěn hǎochī. Wǒ hěn ài māma.",
        "english_translation": "I wake up at six in the morning. I drink water first. Then I eat breakfast. I like to eat rice and vegetables. At noon I eat at school. In the evening I go home. Mom cooks. Mom's cooking is very delicious. I love mom very much.",
        "hsk_level": 1,
    },
    # ── HSK 2 ──
    {
        "title": "坐公交车",
        "title_english": "Taking the Bus",
        "content": "今天早上，我坐公交车去上班。公交车上人很多。我旁边站着一个老人。我让他坐我的位子。他说谢谢。到了公司，我给同事买了咖啡。同事很高兴。工作一天很累，但是帮助别人让我觉得很开心。",
        "content_pinyin": "Jīntiān zǎoshang, wǒ zuò gōngjiāochē qù shàngbān. Gōngjiāochē shàng rén hěn duō. Wǒ pángbiān zhàn zhe yī gè lǎorén. Wǒ ràng tā zuò wǒ de wèizi. Tā shuō xièxie. Dào le gōngsī, wǒ gěi tóngshì mǎi le kāfēi. Tóngshì hěn gāoxìng. Gōngzuò yī tiān hěn lèi, dànshì bāngzhù biérén ràng wǒ juéde hěn kāixīn.",
        "english_translation": "This morning, I took the bus to work. There were many people on the bus. An old man was standing next to me. I let him sit in my seat. He said thank you. When I arrived at the company, I bought coffee for my colleague. My colleague was very happy. Working all day is tiring, but helping others makes me feel very happy.",
        "hsk_level": 2,
    },
    {
        "title": "去超市",
        "title_english": "Going to the Supermarket",
        "content": "周末的时候，我和妈妈去超市买东西。超市很大，里面有很多东西。我们买了水果、蔬菜和牛奶。妈妈还买了鸡蛋和面包。我想买一瓶可乐，妈妈说喝水比较好。我们买完东西就回家了。妈妈用买的菜做了一顿很好吃的饭。",
        "content_pinyin": "Zhōumò de shíhou, wǒ hé māma qù chāoshì mǎi dōngxi. Chāoshì hěn dà, lǐmiàn yǒu hěn duō dōngxi. Wǒmen mǎi le shuǐguǒ, shūcài hé niúnǎi. Māma hái mǎi le jīdàn hé miànbāo. Wǒ xiǎng mǎi yī píng kělè, māma shuō hē shuǐ bǐjiào hǎo. Wǒmen mǎi wán dōngxi jiù huíjiā le. Māma yòng mǎi de cài zuò le yī dùn hěn hǎochī de fàn.",
        "english_translation": "On the weekend, my mom and I went to the supermarket to buy things. The supermarket is very big, and there are many things inside. We bought fruit, vegetables, and milk. Mom also bought eggs and bread. I wanted to buy a bottle of cola, but mom said drinking water is better. After we finished shopping, we went home. Mom used the vegetables she bought to make a very delicious meal.",
        "hsk_level": 2,
    },
    {
        "title": "我的生日",
        "title_english": "My Birthday",
        "content": "昨天是我的生日。我的朋友们都来了。他们给我买了一个大蛋糕。蛋糕上面有很多水果。我们一起吃蛋糕、唱歌。朋友还送了我一本书和一件衣服。我很感谢他们。晚上我们一起看了一部电影。这是我最开心的一天。",
        "content_pinyin": "Zuótiān shì wǒ de shēngrì. Wǒ de péngyǒumen dōu lái le. Tāmen gěi wǒ mǎi le yī gè dà dàngāo. Dàngāo shàngmiàn yǒu hěn duō shuǐguǒ. Wǒmen yīqǐ chī dàngāo, chàng gē. Péngyǒu hái sòng le wǒ yī běn shū hé yī jiàn yīfu. Wǒ hěn gǎnxiè tāmen. Wǎnshang wǒmen yīqǐ kàn le yī bù diànyǐng. Zhè shì wǒ zuì kāixīn de yī tiān.",
        "english_translation": "Yesterday was my birthday. All my friends came. They bought me a big cake. The cake had a lot of fruit on top. We ate cake and sang songs together. My friends also gave me a book and a piece of clothing. I am very grateful to them. In the evening, we watched a movie together. This was my happiest day.",
        "hsk_level": 2,
    },
    # ── HSK 3 ──
    {
        "title": "第一次坐飞机",
        "title_english": "My First Flight",
        "content": "去年暑假，我第一次坐飞机去旅游。我去了北京。飞机飞了三个小时。从窗户往外看，下面的房子和汽车变得很小。到了北京以后，我参观了长城和故宫。长城非常壮观，我照了很多照片。北京的烤鸭很有名，我吃了以后觉得真的很好吃。这次旅行让我学到了很多关于中国历史的知识。我希望以后还能再去。",
        "content_pinyin": "Qùnián shǔjià, wǒ dì yī cì zuò fēijī qù lǚyóu. Wǒ qù le Běijīng. Fēijī fēi le sān gè xiǎoshí. Cóng chuānghù wǎng wài kàn, xiàmiàn de fángzi hé qìchē biàn de hěn xiǎo. Dào le Běijīng yǐhòu, wǒ cānguān le Chángchéng hé Gùgōng. Chángchéng fēicháng zhuàngguān, wǒ zhào le hěn duō zhàopiàn. Běijīng de kǎoyā hěn yǒumíng, wǒ chī le yǐhòu juéde zhēn de hěn hǎochī. Zhè cì lǚxíng ràng wǒ xué dào le hěn duō guānyú Zhōngguó lìshǐ de zhīshi. Wǒ xīwàng yǐhòu hái néng zài qù.",
        "english_translation": "Last summer vacation, I took a flight for the first time to travel. I went to Beijing. The flight took three hours. Looking out the window, the houses and cars below became very small. After arriving in Beijing, I visited the Great Wall and the Forbidden City. The Great Wall was very spectacular, and I took many photos. Beijing's roast duck is very famous, and I thought it was really delicious after I tried it. This trip taught me a lot about Chinese history. I hope I can go again in the future.",
        "hsk_level": 3,
    },
    {
        "title": "学习中文的经历",
        "title_english": "My Experience Learning Chinese",
        "content": "我是一个外国人，两年前开始学习中文。刚开始的时候，我觉得中文很难，特别是声调和写汉字。后来我找了一个中国朋友帮助我练习。每天我们用中文聊天半个小时。慢慢地，我的中文越来越好了。现在我可以看简单的中文书，也可以在餐厅用中文点菜。我的中国朋友都说我的发音进步很大。学中文虽然不容易，但是很有意思。",
        "content_pinyin": "Wǒ shì yī gè wàiguó rén, liǎng nián qián kāishǐ xuéxí zhōngwén. Gāng kāishǐ de shíhou, wǒ juéde zhōngwén hěn nán, tèbié shì shēngdiào hé xiě hànzì. Hòulái wǒ zhǎo le yī gè Zhōngguó péngyǒu bāngzhù wǒ liànxí. Měi tiān wǒmen yòng zhōngwén liáotiān bàn gè xiǎoshí. Mànmàn de, wǒ de zhōngwén yuè lái yuè hǎo le. Xiànzài wǒ kěyǐ kàn jiǎndān de zhōngwén shū, yě kěyǐ zài cāntīng yòng zhōngwén diǎncài. Wǒ de Zhōngguó péngyǒu dōu shuō wǒ de fāyīn jìnbù hěn dà. Xué zhōngwén suīrán bù róngyì, dànshì hěn yǒu yìsi.",
        "english_translation": "I am a foreigner and started learning Chinese two years ago. At the beginning, I felt Chinese was very difficult, especially the tones and writing characters. Later I found a Chinese friend to help me practice. Every day we chatted in Chinese for half an hour. Gradually, my Chinese got better and better. Now I can read simple Chinese books and order food in Chinese at restaurants. My Chinese friends all say my pronunciation has improved a lot. Although learning Chinese is not easy, it is very interesting.",
        "hsk_level": 3,
    },
    {
        "title": "我最喜欢的季节",
        "title_english": "My Favorite Season",
        "content": "一年有四个季节：春天、夏天、秋天和冬天。我最喜欢的季节是秋天。秋天的天气不冷也不热，非常舒服。树叶变成了红色和黄色，非常漂亮。秋天也是收获的季节，市场上有很多新鲜的水果。每年秋天，我都会和家人一起去公园散步，欣赏美丽的风景。有时候我们还会在草地上野餐。秋天让我感到非常幸福和平静。",
        "content_pinyin": "Yī nián yǒu sì gè jìjié: chūntiān, xiàtiān, qiūtiān hé dōngtiān. Wǒ zuì xǐhuān de jìjié shì qiūtiān. Qiūtiān de tiānqì bù lěng yě bú rè, fēicháng shūfu. Shùyè biàn chéng le hóngsè hé huángsè, fēicháng piàoliang. Qiūtiān yě shì shōuhuò de jìjié, shìchǎng shàng yǒu hěn duō xīnxiān de shuǐguǒ. Měi nián qiūtiān, wǒ dōu huì hé jiārén yīqǐ qù gōngyuán sànbù, xīnshǎng měilì de fēngjǐng. Yǒu shíhou wǒmen hái huì zài cǎodì shàng yěcān. Qiūtiān ràng wǒ gǎndào fēicháng xìngfú hé píngjìng.",
        "english_translation": "A year has four seasons: spring, summer, autumn, and winter. My favorite season is autumn. The weather in autumn is not cold and not hot, very comfortable. The leaves turn red and yellow, very beautiful. Autumn is also the harvest season, and there are many fresh fruits in the market. Every autumn, I go for walks in the park with my family and enjoy the beautiful scenery. Sometimes we also have picnics on the grass. Autumn makes me feel very happy and peaceful.",
        "hsk_level": 3,
    },

    # ── HSK 1 (additional) ──
    {
        "title": "我的朋友",
        "title_english": "My Friend",
        "content": "我有一个好朋友。他叫小明。小明是中国人。他今年二十岁。小明很高，也很好看。他喜欢看书。我们每天一起吃饭。小明会说英语和中文。他是一个很好的朋友。",
        "content_pinyin": "Wǒ yǒu yī gè hǎo péngyǒu. Tā jiào Xiǎomíng. Xiǎomíng shì Zhōngguó rén. Tā jīnnián èrshí suì. Xiǎomíng hěn gāo, yě hěn hǎokàn. Tā xǐhuān kàn shū. Wǒmen měi tiān yīqǐ chī fàn. Xiǎomíng huì shuō yīngyǔ hé zhōngwén. Tā shì yī gè hěn hǎo de péngyǒu.",
        "english_translation": "I have a good friend. His name is Xiaoming. Xiaoming is Chinese. He is twenty years old this year. Xiaoming is very tall and also good-looking. He likes to read books. We eat together every day. Xiaoming can speak English and Chinese. He is a very good friend.",
        "hsk_level": 1,
    },
    {
        "title": "在商店买东西",
        "title_english": "Shopping at the Store",
        "content": "今天我去商店买东西。我想买一些水果。苹果三块钱一个。我买了五个苹果。我还买了一瓶水。水两块钱。一共十七块钱。商店里的人很多。我回家了。",
        "content_pinyin": "Jīntiān wǒ qù shāngdiàn mǎi dōngxi. Wǒ xiǎng mǎi yīxiē shuǐguǒ. Píngguǒ sān kuài qián yī gè. Wǒ mǎi le wǔ gè píngguǒ. Wǒ hái mǎi le yī píng shuǐ. Shuǐ liǎng kuài qián. Yīgòng shíqī kuài qián. Shāngdiàn lǐ de rén hěn duō. Wǒ huí jiā le.",
        "english_translation": "Today I went to the store to buy things. I wanted to buy some fruit. Apples are three yuan each. I bought five apples. I also bought a bottle of water. The water is two yuan. The total is seventeen yuan. There are many people in the store. I went home.",
        "hsk_level": 1,
    },
    {
        "title": "我的一天",
        "title_english": "My Day",
        "content": "我早上七点起床。我洗脸、吃早饭。八点我去学校。我在学校学中文。中午十二点吃午饭。下午三点回家。回家后我看电视。晚上九点我睡觉。今天是好的一天。",
        "content_pinyin": "Wǒ zǎoshang qī diǎn qǐchuáng. Wǒ xǐ liǎn, chī zǎofàn. Bā diǎn wǒ qù xuéxiào. Wǒ zài xuéxiào xué zhōngwén. Zhōngwǔ shí'èr diǎn chī wǔfàn. Xiàwǔ sān diǎn huí jiā. Huí jiā hòu wǒ kàn diànshì. Wǎnshang jiǔ diǎn wǒ shuìjiào. Jīntiān shì hǎo de yī tiān.",
        "english_translation": "I get up at seven in the morning. I wash my face and eat breakfast. At eight I go to school. I study Chinese at school. At noon I eat lunch. At three in the afternoon I go home. After going home I watch TV. At nine in the evening I go to sleep. Today is a good day.",
        "hsk_level": 1,
    },
    {
        "title": "看医生",
        "title_english": "Seeing the Doctor",
        "content": "我今天不太好。我的头很疼。妈妈说我们去看医生。医生是一个女人。她很好。她说我要多喝水，多休息。妈妈买了一些药。我吃了药，然后睡觉了。",
        "content_pinyin": "Wǒ jīntiān bú tài hǎo. Wǒ de tóu hěn téng. Māma shuō wǒmen qù kàn yīshēng. Yīshēng shì yī gè nǚrén. Tā hěn hǎo. Tā shuō wǒ yào duō hē shuǐ, duō xiūxi. Māma mǎi le yīxiē yào. Wǒ chī le yào, ránhòu shuìjiào le.",
        "english_translation": "I am not feeling well today. My head hurts a lot. Mom says we should go see the doctor. The doctor is a woman. She is very nice. She says I need to drink more water and rest more. Mom bought some medicine. I took the medicine and then went to sleep.",
        "hsk_level": 1,
    },
    {
        "title": "打电话",
        "title_english": "Making a Phone Call",
        "content": "今天下午我给朋友打电话。我问他明天有没有时间。他说明天上午有时间。我们想一起去看电影。电影是下午两点开始。我们约好一点在电影院见面。我很高兴。",
        "content_pinyin": "Jīntiān xiàwǔ wǒ gěi péngyǒu dǎ diànhuà. Wǒ wèn tā míngtiān yǒu méiyǒu shíjiān. Tā shuō míngtiān shàngwǔ yǒu shíjiān. Wǒmen xiǎng yīqǐ qù kàn diànyǐng. Diànyǐng shì xiàwǔ liǎng diǎn kāishǐ. Wǒmen yuē hǎo yī diǎn zài diànyǐngyuàn jiànmiàn. Wǒ hěn gāoxìng.",
        "english_translation": "This afternoon I called my friend. I asked if he has time tomorrow. He said he has time tomorrow morning. We want to go see a movie together. The movie starts at two in the afternoon. We agreed to meet at one o'clock at the cinema. I am very happy.",
        "hsk_level": 1,
    },

    # ── HSK 2 (additional) ──
    {
        "title": "学做中国菜",
        "title_english": "Learning to Cook Chinese Food",
        "content": "我很喜欢吃中国菜，所以我开始学做饭。上个周末，我的中国朋友教我做西红柿炒鸡蛋。首先，要准备两个西红柿和三个鸡蛋。然后把鸡蛋打到碗里，加一点盐。先炒鸡蛋，再放西红柿。最后加一些糖。做好了！虽然我做得不太好，但是味道还不错。下次我想学做饺子。",
        "content_pinyin": "Wǒ hěn xǐhuān chī Zhōngguó cài, suǒyǐ wǒ kāishǐ xué zuò fàn. Shàng gè zhōumò, wǒ de Zhōngguó péngyǒu jiāo wǒ zuò xīhóngshì chǎo jīdàn. Shǒuxiān, yào zhǔnbèi liǎng gè xīhóngshì hé sān gè jīdàn. Ránhòu bǎ jīdàn dǎ dào wǎn lǐ, jiā yīdiǎn yán. Xiān chǎo jīdàn, zài fàng xīhóngshì. Zuìhòu jiā yīxiē táng. Zuò hǎo le! Suīrán wǒ zuò de bú tài hǎo, dànshì wèidào hái búcuò. Xià cì wǒ xiǎng xué zuò jiǎozi.",
        "english_translation": "I really like eating Chinese food, so I started learning to cook. Last weekend, my Chinese friend taught me to make scrambled eggs with tomatoes. First, prepare two tomatoes and three eggs. Then crack the eggs into a bowl and add a little salt. First fry the eggs, then add the tomatoes. Finally add some sugar. It's done! Although mine didn't turn out great, the taste was not bad. Next time I want to learn to make dumplings.",
        "hsk_level": 2,
    },
    {
        "title": "新的工作",
        "title_english": "New Job",
        "content": "上个月我找到了一份新工作。我在一家公司当老师，教外国人说中文。每天早上九点开始上班，下午五点下班。工作不太忙，同事们都很热情。我最喜欢的是教学生说中文。看到他们慢慢进步，我觉得很有意思。虽然工资不是很高，但是我很喜欢这份工作。",
        "content_pinyin": "Shàng gè yuè wǒ zhǎo dào le yī fèn xīn gōngzuò. Wǒ zài yī jiā gōngsī dāng lǎoshī, jiāo wàiguó rén shuō zhōngwén. Měi tiān zǎoshang jiǔ diǎn kāishǐ shàngbān, xiàwǔ wǔ diǎn xiàbān. Gōngzuò bú tài máng, tóngshìmen dōu hěn rèqíng. Wǒ zuì xǐhuān de shì jiāo xuéshēng shuō zhōngwén. Kàn dào tāmen mànmàn jìnbù, wǒ juéde hěn yǒu yìsi. Suīrán gōngzī bú shì hěn gāo, dànshì wǒ hěn xǐhuān zhè fèn gōngzuò.",
        "english_translation": "Last month I found a new job. I work as a teacher at a company, teaching foreigners to speak Chinese. I start work at nine every morning and finish at five in the afternoon. The work is not too busy, and my colleagues are all very friendly. My favorite thing is teaching students to speak Chinese. Seeing them improve gradually, I find it very interesting. Although the salary is not very high, I really like this job.",
        "hsk_level": 2,
    },
    {
        "title": "下雨天",
        "title_english": "Rainy Day",
        "content": "今天外面下大雨了。我没有带雨伞，所以我不能出去。我在家里看了一本书。这本书很有意思，讲的是一个小男孩的故事。下午雨停了，我出去散步。路上有很多水。空气很新鲜。我看到了一条彩虹。真的太漂亮了！下雨天也可以很开心。",
        "content_pinyin": "Jīntiān wàimiàn xià dà yǔ le. Wǒ méiyǒu dài yǔsǎn, suǒyǐ wǒ bù néng chūqù. Wǒ zài jiā lǐ kàn le yī běn shū. Zhè běn shū hěn yǒu yìsi, jiǎng de shì yī gè xiǎo nánhái de gùshi. Xiàwǔ yǔ tíng le, wǒ chūqù sànbù. Lùshang yǒu hěn duō shuǐ. Kōngqì hěn xīnxiān. Wǒ kàn dào le yī tiáo cǎihóng. Zhēn de tài piàoliang le! Xià yǔ tiān yě kěyǐ hěn kāixīn.",
        "english_translation": "Today it rained heavily outside. I didn't bring an umbrella, so I couldn't go out. I read a book at home. The book was very interesting, telling the story of a little boy. In the afternoon the rain stopped, and I went out for a walk. There was a lot of water on the road. The air was very fresh. I saw a rainbow. It was really beautiful! Rainy days can also be happy.",
        "hsk_level": 2,
    },
    {
        "title": "运动和健康",
        "title_english": "Exercise and Health",
        "content": "医生告诉我要多运动。我每天早上跑步半个小时。我还喜欢打篮球和游泳。周末的时候，我和朋友一起去爬山。运动以后，我觉得身体好多了。现在我不容易感冒了。我的朋友也开始和我一起运动。大家都觉得运动是一件很重要的事情。",
        "content_pinyin": "Yīshēng gàosù wǒ yào duō yùndòng. Wǒ měi tiān zǎoshang pǎobù bàn gè xiǎoshí. Wǒ hái xǐhuān dǎ lánqiú hé yóuyǒng. Zhōumò de shíhou, wǒ hé péngyǒu yīqǐ qù páshān. Yùndòng yǐhòu, wǒ juéde shēntǐ hǎo duō le. Xiànzài wǒ bù róngyì gǎnmào le. Wǒ de péngyǒu yě kāishǐ hé wǒ yīqǐ yùndòng. Dàjiā dōu juéde yùndòng shì yī jiàn hěn zhòngyào de shìqing.",
        "english_translation": "The doctor told me to exercise more. I run for half an hour every morning. I also like to play basketball and swim. On weekends, I go hiking with my friends. After exercising, I feel much better. Now I don't catch colds easily. My friends also started exercising with me. Everyone thinks exercise is a very important thing.",
        "hsk_level": 2,
    },
    {
        "title": "在饭店吃饭",
        "title_english": "Eating at a Restaurant",
        "content": "今天晚上我和家人去饭店吃饭。饭店的菜很多，我们看了菜单。爸爸点了一条鱼，妈妈点了一个鸡肉。我点了我最喜欢的宫保鸡丁。我们还要了三碗米饭和一瓶果汁。菜很快就来了。大家都说很好吃。吃完以后，爸爸付了钱。我们都很高兴。",
        "content_pinyin": "Jīntiān wǎnshang wǒ hé jiārén qù fàndiàn chī fàn. Fàndiàn de cài hěn duō, wǒmen kàn le càidān. Bàba diǎn le yī tiáo yú, māma diǎn le yī gè jīròu. Wǒ diǎn le wǒ zuì xǐhuān de gōngbǎo jīdīng. Wǒmen hái yào le sān wǎn mǐfàn hé yī píng guǒzhī. Cài hěn kuài jiù lái le. Dàjiā dōu shuō hěn hǎochī. Chī wán yǐhòu, bàba fù le qián. Wǒmen dōu hěn gāoxìng.",
        "english_translation": "Tonight my family and I went to a restaurant to eat. The restaurant had many dishes, and we looked at the menu. Dad ordered a fish, mom ordered a chicken dish. I ordered my favorite kung pao chicken. We also ordered three bowls of rice and a bottle of juice. The food came quickly. Everyone said it was delicious. After eating, dad paid the bill. We were all very happy.",
        "hsk_level": 2,
    },

    # ── HSK 3 (additional) ──
    {
        "title": "中国的春节",
        "title_english": "Chinese New Year",
        "content": "春节是中国最重要的节日。每年春节的时候，在外面工作的人都会回家和家人一起过年。过年前，大家会打扫房子，买新衣服，准备很多好吃的东西。除夕晚上，全家人坐在一起吃年夜饭。饭后，大人会给小孩压岁钱。晚上十二点的时候，到处都是烟花和鞭炮的声音。春节期间，人们会互相拜年，说"新年快乐"。这是一个充满欢乐和希望的节日。",
        "content_pinyin": "Chūnjié shì Zhōngguó zuì zhòngyào de jiérì. Měi nián Chūnjié de shíhou, zài wàimiàn gōngzuò de rén dōu huì huí jiā hé jiārén yīqǐ guònián. Guònián qián, dàjiā huì dǎsǎo fángzi, mǎi xīn yīfu, zhǔnbèi hěn duō hǎochī de dōngxi. Chúxī wǎnshang, quán jiā rén zuò zài yīqǐ chī niányèfàn. Fàn hòu, dàrén huì gěi xiǎohái yāsuìqián. Wǎnshang shí'èr diǎn de shíhou, dàochù dōu shì yānhuā hé biānpào de shēngyīn. Chūnjié qījiān, rénmen huì hùxiāng bàinián, shuō xīnnián kuàilè. Zhè shì yī gè chōngmǎn huānlè hé xīwàng de jiérì.",
        "english_translation": "Chinese New Year is China's most important holiday. Every year during Spring Festival, people working away from home return to celebrate with their families. Before the new year, everyone cleans their houses, buys new clothes, and prepares lots of delicious food. On New Year's Eve, the whole family sits together for the reunion dinner. After dinner, adults give children red envelopes with money. At midnight, fireworks and firecrackers can be heard everywhere. During the Spring Festival, people visit each other and say 'Happy New Year.' It is a holiday full of joy and hope.",
        "hsk_level": 3,
    },
    {
        "title": "网上购物",
        "title_english": "Online Shopping",
        "content": "现在越来越多的人喜欢在网上买东西。网上购物非常方便，不用出门就可以买到很多东西。上个星期，我在网上买了一双运动鞋。我选了很长时间，最后选了一双红色的。两天后快递就送到了。我试了一下，大小正好。网上的东西通常比商店便宜一些。不过有时候，收到的东西和图片上不太一样。所以买之前最好先看看其他人的评价。",
        "content_pinyin": "Xiànzài yuè lái yuè duō de rén xǐhuān zài wǎngshàng mǎi dōngxi. Wǎngshàng gòuwù fēicháng fāngbiàn, bú yòng chūmén jiù kěyǐ mǎi dào hěn duō dōngxi. Shàng gè xīngqī, wǒ zài wǎngshàng mǎi le yī shuāng yùndòng xié. Wǒ xuǎn le hěn cháng shíjiān, zuìhòu xuǎn le yī shuāng hóngsè de. Liǎng tiān hòu kuàidì jiù sòng dào le. Wǒ shì le yīxià, dàxiǎo zhènghǎo. Wǎngshàng de dōngxi tōngcháng bǐ shāngdiàn piányi yīxiē. Bùguò yǒu shíhou, shōu dào de dōngxi hé túpiàn shàng bú tài yīyàng. Suǒyǐ mǎi zhīqián zuìhǎo xiān kànkan qítā rén de píngjià.",
        "english_translation": "More and more people like to shop online now. Online shopping is very convenient - you can buy many things without leaving home. Last week, I bought a pair of sneakers online. I spent a long time choosing, and finally picked a red pair. Two days later the delivery arrived. I tried them on, and they fit perfectly. Things online are usually a bit cheaper than in stores. However, sometimes what you receive doesn't quite match the pictures. So it's best to read other people's reviews before buying.",
        "hsk_level": 3,
    },
    {
        "title": "我的室友",
        "title_english": "My Roommate",
        "content": "上大学以后，我有了一个室友。他是从南方来的，普通话说得不太标准，但是人很好。我们的作息时间不太一样，我习惯早睡早起，他喜欢晚睡晚起。刚开始的时候，我们经常因为这个问题吵架。后来我们互相让步，他晚上会戴耳机看视频，我早上起床会轻声关门。现在我们成了很好的朋友。我觉得和不同的人一起生活，能学到很多东西。",
        "content_pinyin": "Shàng dàxué yǐhòu, wǒ yǒu le yī gè shìyǒu. Tā shì cóng nánfāng lái de, pǔtōnghuà shuō de bú tài biāozhǔn, dànshì rén hěn hǎo. Wǒmen de zuòxī shíjiān bú tài yīyàng, wǒ xíguàn zǎo shuì zǎo qǐ, tā xǐhuān wǎn shuì wǎn qǐ. Gāng kāishǐ de shíhou, wǒmen jīngcháng yīnwèi zhège wèntí chǎojià. Hòulái wǒmen hùxiāng ràngbù, tā wǎnshang huì dài ěrjī kàn shìpín, wǒ zǎoshang qǐchuáng huì qīngshēng guān mén. Xiànzài wǒmen chéng le hěn hǎo de péngyǒu. Wǒ juéde hé bùtóng de rén yīqǐ shēnghuó, néng xué dào hěn duō dōngxi.",
        "english_translation": "After starting college, I got a roommate. He came from the south and his Mandarin wasn't very standard, but he was a really nice person. Our schedules were different - I was used to sleeping and waking early, while he liked to stay up late and sleep in. At first, we often argued about this. Later we compromised - he wears headphones when watching videos at night, and I close the door quietly when I get up in the morning. Now we've become very good friends. I think living with different people teaches you a lot.",
        "hsk_level": 3,
    },
    {
        "title": "养宠物",
        "title_english": "Keeping Pets",
        "content": "我家养了一只猫，名字叫花花。花花是一只橘色的猫，今年三岁了。它很聪明，也很可爱。每天我回家的时候，花花都会在门口等我。它最喜欢吃鱼。有时候它会跳到桌子上，把我的东西弄乱。虽然有点淘气，但是我还是很爱它。养宠物需要耐心，但是它们能带给我们很多快乐。",
        "content_pinyin": "Wǒ jiā yǎng le yī zhī māo, míngzì jiào Huāhuā. Huāhuā shì yī zhī júsè de māo, jīnnián sān suì le. Tā hěn cōngmíng, yě hěn kěài. Měi tiān wǒ huí jiā de shíhou, Huāhuā dōu huì zài ménkǒu děng wǒ. Tā zuì xǐhuān chī yú. Yǒu shíhou tā huì tiào dào zhuōzi shàng, bǎ wǒ de dōngxi nòng luàn. Suīrán yǒudiǎn táoqì, dànshì wǒ háishi hěn ài tā. Yǎng chǒngwù xūyào nàixīn, dànshì tāmen néng dài gěi wǒmen hěn duō kuàilè.",
        "english_translation": "My family keeps a cat named Huahua. Huahua is an orange cat, three years old this year. It's very smart and cute. Every day when I come home, Huahua waits for me at the door. Its favorite food is fish. Sometimes it jumps onto the table and messes up my things. Although it's a bit naughty, I still love it very much. Keeping pets requires patience, but they bring us a lot of happiness.",
        "hsk_level": 3,
    },
    {
        "title": "坐地铁",
        "title_english": "Taking the Subway",
        "content": "在大城市里，坐地铁是最方便的出行方式。每天早上，地铁站里都有很多人。大家排队上车，非常有秩序。地铁里面有空调，夏天坐地铁很凉快。我从家到公司要换一次线，大概需要四十分钟。坐地铁的时候，我通常会听音乐或者看手机上的新闻。虽然早上的地铁很挤，但是比开车快多了。",
        "content_pinyin": "Zài dà chéngshì lǐ, zuò dìtiě shì zuì fāngbiàn de chūxíng fāngshì. Měi tiān zǎoshang, dìtiě zhàn lǐ dōu yǒu hěn duō rén. Dàjiā páiduì shàng chē, fēicháng yǒu zhìxù. Dìtiě lǐmiàn yǒu kōngtiáo, xiàtiān zuò dìtiě hěn liángkuai. Wǒ cóng jiā dào gōngsī yào huàn yī cì xiàn, dàgài xūyào sìshí fēnzhōng. Zuò dìtiě de shíhou, wǒ tōngcháng huì tīng yīnyuè huòzhě kàn shǒujī shàng de xīnwén. Suīrán zǎoshang de dìtiě hěn jǐ, dànshì bǐ kāichē kuài duō le.",
        "english_translation": "In big cities, taking the subway is the most convenient way to travel. Every morning, there are many people at the subway station. Everyone lines up to board, very orderly. The subway has air conditioning, so it's nice and cool in summer. From home to my company, I need to transfer once, which takes about forty minutes. While riding the subway, I usually listen to music or read news on my phone. Although the morning subway is very crowded, it's much faster than driving.",
        "hsk_level": 3,
    },

    # ── HSK 4 ──
    {
        "title": "城市与乡村的生活",
        "title_english": "City and Country Life",
        "content": "我出生在一个小村庄，十八岁那年来到北京上大学。城市的生活跟农村完全不同。城市里有高楼大厦、繁华的商业街，交通也非常发达。但是城市的节奏太快了，每天都很忙碌。相比之下，我的家乡非常安静。空气很新鲜，到处都是绿色的田野。邻居之间的关系也很亲密，谁家有困难，大家都会互相帮助。虽然城市有更多的机会和资源，但是每当我感到压力很大的时候，我就会想念家乡的生活。我觉得最理想的生活方式是在城市工作，退休以后回到乡村养老。",
        "content_pinyin": "Wǒ chūshēng zài yī gè xiǎo cūnzhuāng, shíbā suì nà nián lái dào Běijīng shàng dàxué. Chéngshì de shēnghuó gēn nóngcūn wánquán bùtóng. Chéngshì lǐ yǒu gāolóu dàshà, fánhuá de shāngyè jiē, jiāotōng yě fēicháng fādá. Dànshì chéngshì de jiézòu tài kuài le, měi tiān dōu hěn mánglù. Xiāngbǐ zhī xià, wǒ de jiāxiāng fēicháng ānjìng. Kōngqì hěn xīnxiān, dàochù dōu shì lǜsè de tiányě. Línjū zhījiān de guānxì yě hěn qīnmì, shéi jiā yǒu kùnnán, dàjiā dōu huì hùxiāng bāngzhù. Suīrán chéngshì yǒu gèng duō de jīhuì hé zīyuán, dànshì měi dāng wǒ gǎndào yālì hěn dà de shíhou, wǒ jiù huì xiǎngniàn jiāxiāng de shēnghuó. Wǒ juéde zuì lǐxiǎng de shēnghuó fāngshì shì zài chéngshì gōngzuò, tuìxiū yǐhòu huí dào xiāngcūn yǎnglǎo.",
        "english_translation": "I was born in a small village and came to Beijing for college at eighteen. City life is completely different from rural life. Cities have skyscrapers, bustling commercial streets, and very developed transportation. But the pace of city life is too fast, and every day is very busy. In comparison, my hometown is very quiet. The air is fresh, and everywhere you look there are green fields. Neighbors have close relationships, and when someone has difficulties, everyone helps each other. Although cities offer more opportunities and resources, whenever I feel a lot of pressure, I miss life in my hometown. I think the ideal lifestyle is to work in the city and retire to the countryside.",
        "hsk_level": 4,
    },
    {
        "title": "手机改变了我们的生活",
        "title_english": "Smartphones Changed Our Lives",
        "content": "二十年前，人们主要用手机打电话和发短信。现在智能手机已经成为我们生活中不可缺少的一部分。我们用手机支付、点外卖、叫出租车、看新闻、学习知识。手机让我们的生活变得更加方便。但是也有一些问题。很多人整天盯着手机看，忽视了和身边人的交流。有些人甚至走路的时候也在看手机，这很危险。我认为我们应该合理地使用手机，不要让它控制我们的生活。放下手机，多和家人朋友面对面地交流，享受真实的生活。",
        "content_pinyin": "Èrshí nián qián, rénmen zhǔyào yòng shǒujī dǎ diànhuà hé fā duǎnxìn. Xiànzài zhìnéng shǒujī yǐjīng chéngwéi wǒmen shēnghuó zhōng bùkě quēshǎo de yī bùfèn. Wǒmen yòng shǒujī zhīfù, diǎn wàimài, jiào chūzūchē, kàn xīnwén, xuéxí zhīshi. Shǒujī ràng wǒmen de shēnghuó biàn de gèngjiā fāngbiàn. Dànshì yě yǒu yīxiē wèntí. Hěn duō rén zhěng tiān dīng zhe shǒujī kàn, hūshì le hé shēnbiān rén de jiāoliú. Yǒuxiē rén shènzhì zǒulù de shíhou yě zài kàn shǒujī, zhè hěn wēixiǎn. Wǒ rènwéi wǒmen yīnggāi hélǐ de shǐyòng shǒujī, bú yào ràng tā kòngzhì wǒmen de shēnghuó. Fàng xià shǒujī, duō hé jiārén péngyǒu miànduìmiàn de jiāoliú, xiǎngshòu zhēnshí de shēnghuó.",
        "english_translation": "Twenty years ago, people mainly used phones for calls and texts. Now smartphones have become an indispensable part of our lives. We use phones to pay, order food delivery, hail taxis, read news, and learn. Phones have made our lives more convenient. But there are also some problems. Many people stare at their phones all day, ignoring communication with people around them. Some people even look at their phones while walking, which is dangerous. I think we should use phones reasonably and not let them control our lives. Put down the phone, communicate face-to-face more with family and friends, and enjoy real life.",
        "hsk_level": 4,
    },
    {
        "title": "中国茶文化",
        "title_english": "Chinese Tea Culture",
        "content": "中国是茶的故乡，有几千年的饮茶历史。中国茶主要分为六大类：绿茶、红茶、白茶、黄茶、乌龙茶和黑茶。每种茶的味道和功效都不一样。绿茶清淡、红茶浓香、乌龙茶介于两者之间。在中国，喝茶不仅是一种习惯，更是一种文化。客人来的时候，主人一定会泡一壶好茶来招待。茶艺师会用专业的方法来泡茶，从烧水的温度到倒茶的顺序，每一步都很讲究。我每天都会喝两三杯茶。喝茶让我感到放松，也让我更加了解中国的传统文化。",
        "content_pinyin": "Zhōngguó shì chá de gùxiāng, yǒu jǐ qiān nián de yǐnchá lìshǐ. Zhōngguó chá zhǔyào fēn wéi liù dà lèi: lǜchá, hóngchá, báichá, huángchá, wūlóng chá hé hēichá. Měi zhǒng chá de wèidào hé gōngxiào dōu bù yīyàng. Lǜchá qīngdàn, hóngchá nóngxiāng, wūlóng chá jiè yú liǎng zhě zhījiān. Zài Zhōngguó, hē chá bùjǐn shì yī zhǒng xíguàn, gèng shì yī zhǒng wénhuà. Kèrén lái de shíhou, zhǔrén yīdìng huì pào yī hú hǎo chá lái zhāodài. Cháyì shī huì yòng zhuānyè de fāngfǎ lái pào chá, cóng shāo shuǐ de wēndù dào dào chá de shùnxù, měi yī bù dōu hěn jiǎngjiū. Wǒ měi tiān dōu huì hē liǎng sān bēi chá. Hē chá ràng wǒ gǎndào fàngsōng, yě ràng wǒ gèngjiā liǎojiě Zhōngguó de chuántǒng wénhuà.",
        "english_translation": "China is the homeland of tea, with thousands of years of tea-drinking history. Chinese tea is mainly divided into six categories: green tea, black tea, white tea, yellow tea, oolong tea, and dark tea. Each type of tea has a different taste and effect. Green tea is light, black tea is rich and aromatic, and oolong tea is somewhere in between. In China, drinking tea is not just a habit but a culture. When guests arrive, the host will definitely brew a pot of good tea. Tea masters use professional methods to brew tea, from water temperature to pouring order, every step is meticulous. I drink two or three cups of tea every day. Drinking tea makes me feel relaxed and helps me better understand Chinese traditional culture.",
        "hsk_level": 4,
    },
    {
        "title": "面试的经验",
        "title_english": "Job Interview Experience",
        "content": "上个月我去一家大公司面试。面试前我非常紧张，准备了很多可能被问到的问题。面试那天，我穿了一套正式的西装，提前半个小时到达公司。面试官是一位女士，态度很友好。她先让我做了自我介绍，然后问了我关于专业知识和工作经验的问题。我尽量用清楚的语言回答每一个问题。面试结束后，她说我的表现很好。一个星期后，我收到了录取通知。这次面试让我明白了准备的重要性。无论做什么事情，充分的准备都能增加成功的机会。",
        "content_pinyin": "Shàng gè yuè wǒ qù yī jiā dà gōngsī miànshì. Miànshì qián wǒ fēicháng jǐnzhāng, zhǔnbèi le hěn duō kěnéng bèi wèn dào de wèntí. Miànshì nà tiān, wǒ chuān le yī tào zhèngshì de xīzhuāng, tíqián bàn gè xiǎoshí dàodá gōngsī. Miànshìguān shì yī wèi nǚshì, tàidù hěn yǒuhǎo. Tā xiān ràng wǒ zuò le zìwǒ jièshào, ránhòu wèn le wǒ guānyú zhuānyè zhīshi hé gōngzuò jīngyàn de wèntí. Wǒ jìnliàng yòng qīngchǔ de yǔyán huídá měi yī gè wèntí. Miànshì jiéshù hòu, tā shuō wǒ de biǎoxiàn hěn hǎo. Yī gè xīngqī hòu, wǒ shōu dào le lùqǔ tōngzhī. Zhè cì miànshì ràng wǒ míngbai le zhǔnbèi de zhòngyào xìng. Wúlùn zuò shénme shìqing, chōngfèn de zhǔnbèi dōu néng zēngjiā chénggōng de jīhuì.",
        "english_translation": "Last month I went for an interview at a big company. I was very nervous before the interview and prepared many questions that might be asked. On the interview day, I wore a formal suit and arrived half an hour early. The interviewer was a lady with a very friendly attitude. She first asked me to introduce myself, then asked about my professional knowledge and work experience. I tried to answer each question clearly. After the interview, she said I performed well. A week later, I received the acceptance letter. This interview taught me the importance of preparation. No matter what you do, thorough preparation increases your chances of success.",
        "hsk_level": 4,
    },
    {
        "title": "旅行的意义",
        "title_english": "The Meaning of Travel",
        "content": "很多人喜欢旅行，但是每个人旅行的目的不一样。有的人旅行是为了放松身心，逃离日常生活的压力。有的人旅行是为了增长见识，了解不同地方的文化和风俗。还有的人旅行是为了美食，品尝各地的特色菜。对我来说，旅行最大的意义是认识新的朋友。去年我去云南旅行的时候，认识了一位当地的老奶奶。她请我去她家吃饭，给我讲了很多关于少数民族的故事。这些经历是花钱买不到的。我相信旅行能让我们变成更好的人。",
        "content_pinyin": "Hěn duō rén xǐhuān lǚxíng, dànshì měi gè rén lǚxíng de mùdì bù yīyàng. Yǒu de rén lǚxíng shì wèile fàngsōng shēnxīn, táolí rìcháng shēnghuó de yālì. Yǒu de rén lǚxíng shì wèile zēngzhǎng jiànshí, liǎojiě bùtóng dìfāng de wénhuà hé fēngsú. Hái yǒu de rén lǚxíng shì wèile měishí, pǐncháng gè dì de tèsè cài. Duì wǒ lái shuō, lǚxíng zuìdà de yìyì shì rènshi xīn de péngyǒu. Qùnián wǒ qù Yúnnán lǚxíng de shíhou, rènshi le yī wèi dāngdì de lǎo nǎinai. Tā qǐng wǒ qù tā jiā chī fàn, gěi wǒ jiǎng le hěn duō guānyú shǎoshù mínzú de gùshi. Zhèxiē jīnglì shì huā qián mǎi bú dào de. Wǒ xiāngxìn lǚxíng néng ràng wǒmen biàn chéng gèng hǎo de rén.",
        "english_translation": "Many people like to travel, but everyone's purpose for traveling is different. Some people travel to relax and escape the pressures of daily life. Some travel to broaden their horizons and learn about different cultures and customs. Others travel for food, tasting local specialties everywhere. For me, the greatest meaning of travel is meeting new friends. When I traveled to Yunnan last year, I met a local elderly grandmother. She invited me to eat at her home and told me many stories about ethnic minorities. These experiences are something money can't buy. I believe travel can make us better people.",
        "hsk_level": 4,
    },
    {
        "title": "环境保护从小事做起",
        "title_english": "Environmental Protection Starts Small",
        "content": "近年来，环境污染已经成为全世界都关注的问题。空气污染、水污染、垃圾问题越来越严重。作为普通人，我们能做什么呢？其实，保护环境可以从身边的小事做起。比如，我们可以减少使用塑料袋，去超市的时候自己带购物袋。出门的时候尽量坐公交车或者骑自行车，减少开车。在家里要注意节约用水用电。把垃圾分类也是很重要的。虽然一个人的力量很小，但是如果每个人都这样做，就能产生很大的影响。让我们一起为保护地球做出贡献吧。",
        "content_pinyin": "Jìn nián lái, huánjìng wūrǎn yǐjīng chéngwéi quán shìjiè dōu guānzhù de wèntí. Kōngqì wūrǎn, shuǐ wūrǎn, lājī wèntí yuè lái yuè yánzhòng. Zuòwéi pǔtōng rén, wǒmen néng zuò shénme ne? Qíshí, bǎohù huánjìng kěyǐ cóng shēnbiān de xiǎo shì zuòqǐ. Bǐrú, wǒmen kěyǐ jiǎnshǎo shǐyòng sùliào dài, qù chāoshì de shíhou zìjǐ dài gòuwù dài. Chūmén de shíhou jìnliàng zuò gōngjiāochē huòzhě qí zìxíngchē, jiǎnshǎo kāichē. Zài jiā lǐ yào zhùyì jiéyuē yòng shuǐ yòng diàn. Bǎ lājī fēnlèi yě shì hěn zhòngyào de. Suīrán yī gè rén de lìliàng hěn xiǎo, dànshì rúguǒ měi gè rén dōu zhèyàng zuò, jiù néng chǎnshēng hěn dà de yǐngxiǎng. Ràng wǒmen yīqǐ wèi bǎohù dìqiú zuòchū gòngxiàn ba.",
        "english_translation": "In recent years, environmental pollution has become a concern worldwide. Air pollution, water pollution, and waste problems are getting increasingly serious. As ordinary people, what can we do? Actually, protecting the environment can start with small things around us. For example, we can reduce plastic bag use and bring our own shopping bags to the supermarket. When going out, try to take the bus or ride a bicycle instead of driving. At home, pay attention to saving water and electricity. Sorting garbage is also very important. Although one person's power is small, if everyone does this, it can have a great impact. Let's contribute together to protecting our planet.",
        "hsk_level": 4,
    },
    {
        "title": "学一门外语的好处",
        "title_english": "Benefits of Learning a Foreign Language",
        "content": "随着全球化的发展，学习外语变得越来越重要。学习一门外语不仅能帮助我们和更多的人交流，还能让我们更好地了解另一种文化。研究表明，学习外语还能提高大脑的认知能力，让思维变得更加灵活。对于找工作来说，会说外语也是一个很大的优势。当然，学习外语并不容易，需要长期的坚持和练习。最重要的是要找到适合自己的学习方法，保持学习的兴趣。比如看外语电影、听外语歌曲，这些都是很好的学习方式。只要坚持下去，一定能够取得进步。",
        "content_pinyin": "Suízhe quánqiúhuà de fāzhǎn, xuéxí wàiyǔ biàn de yuè lái yuè zhòngyào. Xuéxí yī mén wàiyǔ bùjǐn néng bāngzhù wǒmen hé gèng duō de rén jiāoliú, hái néng ràng wǒmen gèng hǎo de liǎojiě lìng yī zhǒng wénhuà. Yánjiū biǎomíng, xuéxí wàiyǔ hái néng tígāo dànǎo de rènzhī nénglì, ràng sīwéi biàn de gèngjiā línghuó. Duìyú zhǎo gōngzuò lái shuō, huì shuō wàiyǔ yě shì yī gè hěn dà de yōushì. Dāngrán, xuéxí wàiyǔ bìng bù róngyì, xūyào chángqī de jiānchí hé liànxí. Zuì zhòngyào de shì yào zhǎo dào shìhé zìjǐ de xuéxí fāngfǎ, bǎochí xuéxí de xìngqù. Bǐrú kàn wàiyǔ diànyǐng, tīng wàiyǔ gēqǔ, zhèxiē dōu shì hěn hǎo de xuéxí fāngshì. Zhǐyào jiānchí xiàqù, yīdìng nénggòu qǔdé jìnbù.",
        "english_translation": "With globalization, learning foreign languages has become increasingly important. Learning a foreign language not only helps us communicate with more people but also lets us better understand another culture. Research shows that learning a foreign language can also improve brain cognitive ability and make thinking more flexible. For job hunting, speaking a foreign language is also a great advantage. Of course, learning a foreign language is not easy and requires long-term persistence and practice. The most important thing is to find a learning method that suits you and maintain your interest. For example, watching foreign films and listening to foreign songs are all great learning methods. As long as you persist, you will definitely make progress.",
        "hsk_level": 4,
    },
    {
        "title": "共享经济的发展",
        "title_english": "The Rise of the Sharing Economy",
        "content": "近几年，共享经济在中国发展得非常快。最常见的就是共享单车。在大城市的街道上，到处都能看到各种颜色的共享单车。人们只需要用手机扫一下二维码，就可以骑走。到达目的地后，把车停在路边就行了，非常方便。除了共享单车，还有共享充电宝、共享雨伞等。共享经济的好处是大家不需要每个人都买一样东西，可以节约资源。但是也有一些问题，比如有人不爱惜公共物品，或者乱停车影响交通。我觉得要让共享经济健康发展，每个人都应该提高自己的素质。",
        "content_pinyin": "Jìn jǐ nián, gòngxiǎng jīngjì zài Zhōngguó fāzhǎn de fēicháng kuài. Zuì chángjiàn de jiùshì gòngxiǎng dānchē. Zài dà chéngshì de jiēdào shàng, dàochù dōu néng kàn dào gè zhǒng yánsè de gòngxiǎng dānchē. Rénmen zhǐ xūyào yòng shǒujī sǎo yīxià èrwéimǎ, jiù kěyǐ qí zǒu. Dàodá mùdìdì hòu, bǎ chē tíng zài lùbiān jiù xíng le, fēicháng fāngbiàn. Chúle gòngxiǎng dānchē, hái yǒu gòngxiǎng chōngdiànbǎo, gòngxiǎng yǔsǎn děng. Gòngxiǎng jīngjì de hǎochù shì dàjiā bù xūyào měi gè rén dōu mǎi yī yàng dōngxi, kěyǐ jiéyuē zīyuán. Dànshì yě yǒu yīxiē wèntí, bǐrú yǒu rén bú àixī gōnggòng wùpǐn, huòzhě luàn tíngchē yǐngxiǎng jiāotōng. Wǒ juéde yào ràng gòngxiǎng jīngjì jiànkāng fāzhǎn, měi gè rén dōu yīnggāi tígāo zìjǐ de sùzhì.",
        "english_translation": "In recent years, the sharing economy has developed very rapidly in China. The most common is bike-sharing. On the streets of big cities, you can see shared bikes of various colors everywhere. People just need to scan a QR code with their phone to ride away. After reaching the destination, just park the bike on the roadside - very convenient. Besides shared bikes, there are also shared power banks, shared umbrellas, and more. The benefit of the sharing economy is that not everyone needs to buy the same things, saving resources. But there are also some problems, such as people not taking care of public property or parking randomly affecting traffic. I think for the sharing economy to develop healthily, everyone should improve their behavior.",
        "hsk_level": 4,
    },

    # ── HSK 5 ──
    {
        "title": "人工智能与未来教育",
        "title_english": "AI and the Future of Education",
        "content": "人工智能技术的飞速发展正在深刻地改变着教育的方式。传统的课堂教学模式中，一位老师需要面对几十个甚至上百个学生，很难做到因材施教。而人工智能可以根据每个学生的学习进度和薄弱环节，制定个性化的学习计划。例如，智能学习系统能够分析学生做题时的错误，针对性地推送相关知识点的练习。此外，虚拟现实技术也让学生能够身临其境地体验历史事件或科学实验。然而，教育不仅仅是知识的传授，更重要的是培养学生的思考能力、创造力和情感。在这些方面，机器暂时还无法完全取代人类教师。因此，未来最理想的教育模式应该是人工智能与教师的有机结合。",
        "content_pinyin": "Réngōng zhìnéng jìshù de fēisù fāzhǎn zhèngzài shēnkè de gǎibiàn zhe jiàoyù de fāngshì. Chuántǒng de kètáng jiàoxué móshì zhōng, yī wèi lǎoshī xūyào miànduì jǐ shí gè shènzhì shàng bǎi gè xuéshēng, hěn nán zuò dào yīn cái shī jiào. Ér réngōng zhìnéng kěyǐ gēnjù měi gè xuéshēng de xuéxí jìndù hé bóruò huánjié, zhìdìng gèxìnghuà de xuéxí jìhuà. Lìrú, zhìnéng xuéxí xìtǒng nénggòu fēnxī xuéshēng zuò tí shí de cuòwù, zhēnduìxìng de tuīsòng xiāngguān zhīshì diǎn de liànxí. Cǐwài, xūnǐ xiànshí jìshù yě ràng xuéshēng nénggòu shēn lín qí jìng de tǐyàn lìshǐ shìjiàn huò kēxué shíyàn. Rán'ér, jiàoyù bùjǐnjǐn shì zhīshi de chuánshòu, gèng zhòngyào de shì péiyǎng xuéshēng de sīkǎo nénglì, chuàngzào lì hé qínggǎn. Zài zhèxiē fāngmiàn, jīqì zànshí hái wúfǎ wánquán qǔdài rénlèi jiàoshī. Yīncǐ, wèilái zuì lǐxiǎng de jiàoyù móshì yīnggāi shì réngōng zhìnéng yǔ jiàoshī de yǒujī jiéhé.",
        "english_translation": "The rapid development of AI technology is profoundly changing the way education works. In the traditional classroom model, one teacher faces dozens or even hundreds of students, making individualized instruction very difficult. AI can create personalized learning plans based on each student's progress and weak areas. For example, intelligent learning systems can analyze students' mistakes and push targeted practice on relevant knowledge points. Additionally, virtual reality technology allows students to immersively experience historical events or scientific experiments. However, education is not just about transmitting knowledge - more importantly, it's about cultivating students' thinking ability, creativity, and emotional intelligence. In these aspects, machines cannot yet fully replace human teachers. Therefore, the ideal future education model should be an organic combination of AI and teachers.",
        "hsk_level": 5,
    },
    {
        "title": "中国的饮食文化",
        "title_english": "Chinese Food Culture",
        "content": "中国饮食文化历史悠久，博大精深。中国有八大菜系，每个菜系都有其独特的烹饪方法和风味特点。川菜以麻辣著称，粤菜讲究食材的原味，鲁菜擅长用酱，淮扬菜注重刀工。中国人吃饭不仅仅是为了填饱肚子，更是一种社交活动。朋友聚会、商务洽谈，往往都在餐桌上进行。中国人请客吃饭有很多讲究，比如座位的安排、上菜的顺序、敬酒的礼仪等。一顿饭下来，人们的感情也会更加深厚。随着时代的变化，年轻人的饮食习惯也在发生改变，快餐和外卖越来越流行。但是传统的中国美食文化仍然是中华民族宝贵的遗产。",
        "content_pinyin": "Zhōngguó yǐnshí wénhuà lìshǐ yōujiǔ, bódà jīngshēn. Zhōngguó yǒu bā dà càixì, měi gè càixì dōu yǒu qí dútè de pēngrèn fāngfǎ hé fēngwèi tèdiǎn. Chuāncài yǐ málà zhùchēng, yuècài jiǎngjiū shícái de yuánwèi, lǔcài shàncháng yòng jiàng, huáiyáng cài zhùzhòng dāogōng. Zhōngguó rén chīfàn bùjǐnjǐn shì wèile tián bǎo dùzi, gèng shì yī zhǒng shèjiāo huódòng. Péngyǒu jùhuì, shāngwù qiàtán, wǎngwǎng dōu zài cānzhuō shàng jìnxíng. Zhōngguó rén qǐngkè chīfàn yǒu hěn duō jiǎngjiū, bǐrú zuòwèi de ānpái, shàng cài de shùnxù, jìngjiǔ de lǐyí děng. Yī dùn fàn xiàlái, rénmen de gǎnqíng yě huì gèngjiā shēnhòu. Suízhe shídài de biànhuà, niánqīng rén de yǐnshí xíguàn yě zài fāshēng gǎibiàn, kuàicān hé wàimài yuè lái yuè liúxíng. Dànshì chuántǒng de Zhōngguó měishí wénhuà réngrán shì zhōnghuá mínzú bǎoguì de yíchǎn.",
        "english_translation": "Chinese food culture has a long history and is broad and profound. China has eight major cuisines, each with its unique cooking methods and flavor characteristics. Sichuan cuisine is famous for its spiciness, Cantonese cuisine emphasizes the natural flavor of ingredients, Shandong cuisine excels in sauces, and Huaiyang cuisine focuses on knife skills. For Chinese people, eating is not just about filling the stomach but is also a social activity. Friend gatherings and business negotiations often take place at the dining table. Chinese hospitality involves many rules, such as seating arrangements, the order of serving dishes, and toast etiquette. After a meal, people's relationships become deeper. As times change, young people's eating habits are also shifting, with fast food and delivery becoming increasingly popular. But traditional Chinese food culture remains a precious heritage of the Chinese nation.",
        "hsk_level": 5,
    },
    {
        "title": "读书的力量",
        "title_english": "The Power of Reading",
        "content": "古人说"读万卷书，行万里路"。在信息爆炸的时代，读书似乎变得不那么流行了。很多人习惯从短视频和社交媒体获取信息，却很少有耐心读完一本书。其实，读书和刷手机获取的信息是完全不同的。短视频提供的是碎片化的娱乐，而一本好书能给人系统的知识和深刻的思考。历史上许多伟大的人物都是狂热的读书爱好者。通过阅读，我们可以跨越时间和空间的限制，与古今中外的智者进行对话。一本好书可以改变一个人的世界观，甚至影响一生的方向。我建议大家每天至少抽出半个小时来阅读，不需要读很快，重要的是理解和思考。",
        "content_pinyin": "Gǔrén shuō dú wàn juǎn shū, xíng wàn lǐ lù. Zài xìnxī bàozhà de shídài, dúshū sìhū biàn de bú nàme liúxíng le. Hěn duō rén xíguàn cóng duǎn shìpín hé shèjiāo méitǐ huòqǔ xìnxī, què hěn shǎo yǒu nàixīn dú wán yī běn shū. Qíshí, dúshū hé shuā shǒujī huòqǔ de xìnxī shì wánquán bùtóng de. Duǎn shìpín tígōng de shì suìpiànhuà de yúlè, ér yī běn hǎo shū néng gěi rén xìtǒng de zhīshi hé shēnkè de sīkǎo. Lìshǐ shàng xǔduō wěidà de rénwù dōu shì kuángrè de dúshū àihào zhě. Tōngguò yuèdú, wǒmen kěyǐ kuàyuè shíjiān hé kōngjiān de xiànzhì, yǔ gǔjīn zhōngwài de zhìzhě jìnxíng duìhuà. Yī běn hǎo shū kěyǐ gǎibiàn yī gè rén de shìjièguān, shènzhì yǐngxiǎng yīshēng de fāngxiàng. Wǒ jiànyì dàjiā měi tiān zhìshǎo chōuchū bàn gè xiǎoshí lái yuèdú, bù xūyào dú hěn kuài, zhòngyào de shì lǐjiě hé sīkǎo.",
        "english_translation": "The ancients said 'Read ten thousand books, travel ten thousand miles.' In the age of information explosion, reading seems to have become less popular. Many people are used to getting information from short videos and social media, but rarely have the patience to finish a book. In fact, the information from reading books and scrolling phones is completely different. Short videos provide fragmented entertainment, while a good book gives systematic knowledge and deep thinking. Many great figures in history were avid readers. Through reading, we can transcend the limitations of time and space to have conversations with wise people throughout history. A good book can change a person's worldview and even influence the direction of their entire life. I suggest everyone spend at least half an hour reading every day - you don't need to read fast, what matters is understanding and thinking.",
        "hsk_level": 5,
    },
    {
        "title": "传统节日的现代意义",
        "title_english": "Modern Significance of Traditional Festivals",
        "content": "在现代化快速推进的今天，很多年轻人似乎对传统节日失去了兴趣，反而更热衷于过圣诞节、情人节等西方节日。这种现象引发了不少人的思考和讨论。传统节日不仅是放假的理由，它们承载着一个民族的历史记忆和文化基因。春节代表着团圆和新的开始，清明节提醒我们饮水思源，端午节让我们纪念爱国诗人屈原，中秋节象征着家人的团聚。如果我们丢失了这些节日的文化内涵，也就失去了自己的文化根基。当然，拥抱全球化并不意味着要放弃本民族的传统。我认为我们应该在继承传统的同时，用新的方式来重新诠释这些节日，让它们在新时代焕发新的生命力。",
        "content_pinyin": "Zài xiàndàihuà kuàisù tuījìn de jīntiān, hěn duō niánqīng rén sìhū duì chuántǒng jiérì shīqù le xìngqù, fǎn'ér gèng rèzhōng yú guò shèngdàn jié, qíngrén jié děng xīfāng jiérì. Zhè zhǒng xiànxiàng yǐnfā le bùshǎo rén de sīkǎo hé tǎolùn. Chuántǒng jiérì bùjǐn shì fàngjià de lǐyóu, tāmen chéngzài zhe yī gè mínzú de lìshǐ jìyì hé wénhuà jīyīn. Chūnjié dàibiǎo zhe tuányuán hé xīn de kāishǐ, qīngmíng jié tíxǐng wǒmen yǐnshuǐ sīyuán, duānwǔ jié ràng wǒmen jìniàn àiguó shīrén Qūyuán, zhōngqiū jié xiàngzhēng zhe jiārén de tuánjù. Rúguǒ wǒmen diūshī le zhèxiē jiérì de wénhuà nèihán, yě jiù shīqù le zìjǐ de wénhuà gēnjī. Dāngrán, yōngbào quánqiúhuà bìng bù yìwèi zhe yào fàngqì běn mínzú de chuántǒng. Wǒ rènwéi wǒmen yīnggāi zài jìchéng chuántǒng de tóngshí, yòng xīn de fāngshì lái chóngxīn quánshì zhèxiē jiérì, ràng tāmen zài xīn shídài huànfā xīn de shēngmìnglì.",
        "english_translation": "In today's rapidly modernizing world, many young people seem to have lost interest in traditional festivals, instead being more enthusiastic about Western holidays like Christmas and Valentine's Day. This phenomenon has sparked much thought and discussion. Traditional festivals are not just reasons for holidays - they carry a nation's historical memory and cultural DNA. Spring Festival represents reunion and new beginnings, Qingming Festival reminds us to remember our roots, Dragon Boat Festival commemorates the patriotic poet Qu Yuan, and Mid-Autumn Festival symbolizes family reunion. If we lose the cultural meaning of these festivals, we lose our cultural foundation. Of course, embracing globalization doesn't mean abandoning our own traditions. I believe we should inherit traditions while reinterpreting these festivals in new ways, giving them new vitality in the new era.",
        "hsk_level": 5,
    },
    {
        "title": "城市里的孤独",
        "title_english": "Loneliness in the City",
        "content": "在拥挤的大城市里，虽然人与人之间的距离很近，但心灵之间的距离可能比任何地方都远。每天无数的人挤在地铁里，彼此擦肩而过，却从不交流一句话。社交媒体上的朋友越来越多，现实生活中能说心里话的人却越来越少。很多独自在大城市奋斗的年轻人，白天忙于工作，晚上回到空荡荡的出租屋，只有手机屏幕的光陪伴着他们。这种现代社会特有的孤独感，已经成为一个不容忽视的问题。我觉得解决这个问题需要主动走出舒适圈，参加社区活动，培养共同的兴趣爱好。有时候，一句简单的问候就能打破人与人之间的隔阂。",
        "content_pinyin": "Zài yōngjǐ de dà chéngshì lǐ, suīrán rén yǔ rén zhījiān de jùlí hěn jìn, dàn xīnlíng zhījiān de jùlí kěnéng bǐ rènhé dìfāng dōu yuǎn. Měi tiān wúshù de rén jǐ zài dìtiě lǐ, bǐcǐ cā jiān ér guò, què cóng bù jiāoliú yī jù huà. Shèjiāo méitǐ shàng de péngyǒu yuè lái yuè duō, xiànshí shēnghuó zhōng néng shuō xīnlǐ huà de rén què yuè lái yuè shǎo. Hěn duō dúzì zài dà chéngshì fèndòu de niánqīng rén, báitiān máng yú gōngzuò, wǎnshang huí dào kōngdàngdàng de chūzūwū, zhǐyǒu shǒujī píngmù de guāng péibàn zhe tāmen. Zhè zhǒng xiàndài shèhuì tèyǒu de gūdú gǎn, yǐjīng chéngwéi yī gè bùróng hūshì de wèntí. Wǒ juéde jiějué zhège wèntí xūyào zhǔdòng zǒu chū shūshì quān, cānjiā shèqū huódòng, péiyǎng gòngtóng de xìngqù àihào. Yǒu shíhou, yī jù jiǎndān de wènhòu jiù néng dǎpò rén yǔ rén zhījiān de géhé.",
        "english_translation": "In crowded big cities, although the physical distance between people is very close, the distance between hearts may be farther than anywhere else. Every day countless people squeeze into subways, brushing past each other without exchanging a single word. Friends on social media keep increasing, but people you can confide in become fewer and fewer in real life. Many young people struggling alone in big cities are busy with work during the day and return to empty rental rooms at night, with only the glow of their phone screens for company. This loneliness unique to modern society has become a problem that cannot be ignored. I think solving this requires actively stepping out of our comfort zones, participating in community activities, and developing shared hobbies. Sometimes, a simple greeting can break down the barriers between people.",
        "hsk_level": 5,
    },

    # ── HSK 6 ──
    {
        "title": "科技进步的双刃剑效应",
        "title_english": "The Double-Edged Sword of Technological Progress",
        "content": "纵观人类文明发展史，每一次重大的科技突破都伴随着深远的社会变革。从蒸汽机到互联网，从基因编辑到人工智能，科技的力量在不断地重塑着我们的生活方式和价值观念。不可否认，科技进步极大地提升了人类的生活质量。现代医学延长了人类的寿命，信息技术缩短了人与人之间的距离，自动化生产提高了效率并降低了成本。然而，我们也不得不正视科技发展带来的负面影响。大数据时代的隐私泄露、人工智能可能导致的大规模失业、社交媒体对心理健康的侵蚀，这些问题都值得我们深思。更为根本的是，当技术发展的速度远远超过制度和伦理建设的速度时，人类社会将面临前所未有的挑战。因此，在享受科技红利的同时，我们必须建立健全的法律和伦理框架，确保技术的发展始终服务于人类的福祉。",
        "content_pinyin": "Zòngguān rénlèi wénmíng fāzhǎn shǐ, měi yī cì zhòngdà de kējì tūpò dōu bànsuí zhe shēnyuǎn de shèhuì biàngé. Cóng zhēngqìjī dào hùliánwǎng, cóng jīyīn biānjí dào réngōng zhìnéng, kējì de lìliàng zài bùduàn de chóng sù zhe wǒmen de shēnghuó fāngshì hé jiàzhí guānniàn. Bùkě fǒurèn, kējì jìnbù jídà de tíshēng le rénlèi de shēnghuó zhìliàng. Xiàndài yīxué yáncháng le rénlèi de shòumìng, xìnxī jìshù suōduǎn le rén yǔ rén zhījiān de jùlí, zìdònghuà shēngchǎn tígāo le xiàolǜ bìng jiàngdī le chéngběn. Rán'ér, wǒmen yě bùdébù zhèngshì kējì fāzhǎn dài lái de fùmiàn yǐngxiǎng. Dà shùjù shídài de yǐnsī xièlòu, réngōng zhìnéng kěnéng dǎozhì de dà guīmó shīyè, shèjiāo méitǐ duì xīnlǐ jiànkāng de qīnshí, zhèxiē wèntí dōu zhíde wǒmen shēnsī. Gèng wéi gēnběn de shì, dāng jìshù fāzhǎn de sùdù yuǎnyuǎn chāoguò zhìdù hé lúnlǐ jiànshè de sùdù shí, rénlèi shèhuì jiāng miànlín qián suǒ wèi yǒu de tiǎozhàn. Yīncǐ, zài xiǎngshòu kējì hónglì de tóngshí, wǒmen bìxū jiànlì jiànquán de fǎlǜ hé lúnlǐ kuàngjià, quèbǎo jìshù de fāzhǎn shǐzhōng fúwù yú rénlèi de fúzhǐ.",
        "english_translation": "Looking throughout the history of human civilization, every major technological breakthrough has been accompanied by profound social change. From the steam engine to the internet, from gene editing to artificial intelligence, the power of technology continuously reshapes our lifestyles and values. It is undeniable that technological progress has greatly improved the quality of human life. Modern medicine has extended human lifespans, information technology has shortened distances between people, and automated production has improved efficiency while reducing costs. However, we must also face the negative impacts of technological development. Privacy breaches in the big data era, massive unemployment potentially caused by AI, and the erosion of mental health by social media - these are all issues worthy of deep reflection. More fundamentally, when the speed of technological development far exceeds that of institutional and ethical development, human society will face unprecedented challenges. Therefore, while enjoying the dividends of technology, we must establish sound legal and ethical frameworks to ensure that technological development always serves human welfare.",
        "hsk_level": 6,
    },
    {
        "title": "文化认同与全球化",
        "title_english": "Cultural Identity and Globalization",
        "content": "在全球化浪潮席卷世界的今天，文化认同问题变得愈发复杂和敏感。一方面，全球化促进了不同文化之间的交流与融合，让我们能够接触到前所未有的丰富多元的文化体验。另一方面，强势文化的扩张也让许多弱势文化面临被同化甚至消亡的危机。以语言为例，据统计，全球每两周就有一种语言消失，而随着这些语言的消失，其所承载的独特世界观和知识体系也随之消亡。面对这一困境，简单地排斥全球化或者全盘接受外来文化都不是明智之举。关键在于如何在开放与坚守之间找到平衡。一个成熟的民族应当既有接纳外来优秀文化的胸怀，又有保护和传承本民族文化精髓的自觉。唯有如此，才能在全球化的大背景下实现文化的可持续发展，为世界文明的多样性做出独特的贡献。",
        "content_pinyin": "Zài quánqiúhuà làngcháo xíjuǎn shìjiè de jīntiān, wénhuà rèntóng wèntí biàn de yùfā fùzá hé mǐngǎn. Yī fāngmiàn, quánqiúhuà cùjìn le bùtóng wénhuà zhījiān de jiāoliú yǔ rónghé, ràng wǒmen nénggòu jiēchù dào qián suǒ wèi yǒu de fēngfù duōyuán de wénhuà tǐyàn. Lìng yī fāngmiàn, qiángshì wénhuà de kuòzhāng yě ràng xǔduō ruòshì wénhuà miànlín bèi tónghuà shènzhì xiāowáng de wēijī. Yǐ yǔyán wéi lì, jù tǒngjì, quánqiú měi liǎng zhōu jiù yǒu yī zhǒng yǔyán xiāoshī, ér suízhe zhèxiē yǔyán de xiāoshī, qí suǒ chéngzài de dútè shìjièguān hé zhīshi tǐxì yě suízhī xiāowáng. Miàn duì zhè yī kùnjìng, jiǎndān de páichì quánqiúhuà huòzhě quánpán jiēshòu wàilái wénhuà dōu bú shì míngzhì zhī jǔ. Guānjiàn zàiyú rúhé zài kāifàng yǔ jiānshǒu zhījiān zhǎo dào pínghéng. Yī gè chéngshú de mínzú yīngdāng jì yǒu jiēnà wàilái yōuxiù wénhuà de xiōnghuái, yòu yǒu bǎohù hé chuánchéng běn mínzú wénhuà jīngsuǐ de zìjué. Wéi yǒu rúcǐ, cái néng zài quánqiúhuà de dà bèijǐng xià shíxiàn wénhuà de kě chíxù fāzhǎn, wèi shìjiè wénmíng de duōyàng xìng zuòchū dútè de gòngxiàn.",
        "english_translation": "In today's world swept by the tide of globalization, cultural identity has become increasingly complex and sensitive. On one hand, globalization has promoted exchange and integration between different cultures, allowing us to access unprecedentedly rich and diverse cultural experiences. On the other hand, the expansion of dominant cultures has put many smaller cultures at risk of assimilation or even extinction. Take language as an example - statistics show that a language disappears globally every two weeks, and with these languages, the unique worldviews and knowledge systems they carry also vanish. Facing this dilemma, simply rejecting globalization or wholly accepting foreign culture is unwise. The key lies in finding balance between openness and preservation. A mature nation should have both the openness to embrace excellent foreign cultures and the consciousness to protect and pass on the essence of its own culture. Only in this way can we achieve sustainable cultural development in the context of globalization and make unique contributions to the diversity of world civilization.",
        "hsk_level": 6,
    },
    {
        "title": "论批判性思维的重要性",
        "title_english": "On the Importance of Critical Thinking",
        "content": "在信息泛滥的当代社会，批判性思维已经成为每个人必备的核心素养之一。所谓批判性思维，并非简单地对一切持否定态度，而是指在接受任何信息或观点之前，运用逻辑分析和理性判断来评估其可靠性和合理性。在社交媒体时代，虚假信息和情绪化的言论充斥着我们的视野。如果缺乏批判性思维，人们很容易被煽动性的标题所误导，或者陷入信息茧房，只接触与自己观点一致的内容。培养批判性思维首先要学会区分事实和观点，其次要养成追根溯源的习惯，不轻易相信未经证实的说法。同时，我们还需要具备换位思考的能力，理解不同立场背后的逻辑和利益诉求。批判性思维不会让我们变得愤世嫉俗，相反，它会帮助我们更加理性、客观地认识这个复杂的世界，做出更加明智的判断和决策。",
        "content_pinyin": "Zài xìnxī fànlàn de dāngdài shèhuì, pīpàn xìng sīwéi yǐjīng chéngwéi měi gè rén bìbèi de héxīn sùyǎng zhī yī. Suǒwèi pīpàn xìng sīwéi, bìng fēi jiǎndān de duì yīqiè chí fǒudìng tàidù, ér shì zhǐ zài jiēshòu rènhé xìnxī huò guāndiǎn zhīqián, yùnyòng luójí fēnxī hé lǐxìng pànduàn lái pínggū qí kěkào xìng hé hélǐ xìng. Zài shèjiāo méitǐ shídài, xūjiǎ xìnxī hé qíngxùhuà de yánlùn chōngchì zhe wǒmen de shìyě. Rúguǒ quēfá pīpàn xìng sīwéi, rénmen hěn róngyì bèi shāndòng xìng de biāotí suǒ wùdǎo, huòzhě xiànrù xìnxī jiǎnfáng, zhǐ jiēchù yǔ zìjǐ guāndiǎn yīzhì de nèiróng. Péiyǎng pīpàn xìng sīwéi shǒuxiān yào xuéhuì qūfēn shìshí hé guāndiǎn, qícì yào yǎngchéng zhuīgēn sùyuán de xíguàn, bù qīngyì xiāngxìn wèi jīng zhèngshí de shuōfǎ. Tóngshí, wǒmen hái xūyào jùbèi huàn wèi sīkǎo de nénglì, lǐjiě bùtóng lìchǎng bèihòu de luójí hé lìyì sùqiú. Pīpàn xìng sīwéi bú huì ràng wǒmen biàn de fèn shì jí sú, xiāngfǎn, tā huì bāngzhù wǒmen gèngjiā lǐxìng, kèguān de rènshi zhège fùzá de shìjiè, zuòchū gèngjiā míngzhì de pànduàn hé juécè.",
        "english_translation": "In today's information-saturated society, critical thinking has become one of the essential core competencies everyone needs. So-called critical thinking is not simply about having a negative attitude toward everything, but rather about using logical analysis and rational judgment to evaluate the reliability and reasonableness of any information or viewpoint before accepting it. In the social media era, false information and emotional rhetoric fill our horizons. Without critical thinking, people are easily misled by sensational headlines or fall into information echo chambers, only encountering content that aligns with their existing views. Cultivating critical thinking first requires learning to distinguish facts from opinions, and second, developing the habit of tracing things back to their sources and not easily believing unverified claims. At the same time, we need the ability to think from others' perspectives and understand the logic and interests behind different positions. Critical thinking won't make us cynical - on the contrary, it will help us understand this complex world more rationally and objectively, making wiser judgments and decisions.",
        "hsk_level": 6,
    },
    {
        "title": "中国古典哲学的现代启示",
        "title_english": "Modern Insights from Classical Chinese Philosophy",
        "content": "中国古典哲学博大精深，其核心思想在两千多年后的今天依然具有强大的生命力。儒家倡导的"仁义礼智信"构成了中国社会的道德基础，其"修身齐家治国平天下"的理念启示我们要从自我完善做起。道家老子提出的"道法自然"思想，在当今环境危机的背景下显得尤为深刻，提醒人类应当顺应而非违背自然规律。庄子的"逍遥游"则教导我们超越世俗的束缚，追求精神上的自由。墨家的"兼爱非攻"思想与当代的和平主义不谋而合。法家虽然强调严刑峻法，但其依法治国的理念对现代法治社会仍有参考价值。这些古老的智慧并非停留在故纸堆中的陈旧学说，而是经过时间淘洗后依然闪耀着光芒的思想瑰宝。在面对现代社会的种种困惑时，回顾这些先哲的教诲，往往能够为我们提供独特的视角和深刻的启迪。",
        "content_pinyin": "Zhōngguó gǔdiǎn zhéxué bódà jīngshēn, qí héxīn sīxiǎng zài liǎng qiān duō nián hòu de jīntiān yīrán jùyǒu qiángdà de shēngmìnglì. Rújiā chàngdǎo de rén yì lǐ zhì xìn gòuchéng le Zhōngguó shèhuì de dàodé jīchǔ, qí xiūshēn qíjiā zhìguó píng tiānxià de lǐniàn qǐshì wǒmen yào cóng zìwǒ wánshàn zuòqǐ. Dàojiā Lǎozǐ tíchū de dào fǎ zìrán sīxiǎng, zài dāngjīn huánjìng wēijī de bèijǐng xià xiǎn de yóuwéi shēnkè, tíxǐng rénlèi yīngdāng shùnyīng ér fēi wéibèi zìrán guīlǜ. Zhuāngzǐ de xiāoyáo yóu zé jiàodǎo wǒmen chāoyuè shìsú de shùfù, zhuīqiú jīngshén shàng de zìyóu. Mòjiā de jiān'ài fēigōng sīxiǎng yǔ dāngdài de hépíng zhǔyì bùmóu ér hé. Fǎjiā suīrán qiángdiào yánxíng jùnfǎ, dàn qí yī fǎ zhìguó de lǐniàn duì xiàndài fǎzhì shèhuì réng yǒu cānkǎo jiàzhí. Zhèxiē gǔlǎo de zhìhuì bìng fēi tíngliú zài gù zhǐ duī zhōng de chénjiù xuéshuō, ér shì jīngguò shíjiān táoxǐ hòu yīrán shǎnyào zhe guāngmáng de sīxiǎng guībǎo. Zài miàn duì xiàndài shèhuì de zhǒngzhǒng kùnhuò shí, huígù zhèxiē xiānzhé de jiàohuì, wǎngwǎng nénggòu wèi wǒmen tígōng dútè de shìjiǎo hé shēnkè de qǐdí.",
        "english_translation": "Classical Chinese philosophy is broad and profound, and its core ideas still possess powerful vitality over two thousand years later. The Confucian virtues of 'benevolence, righteousness, propriety, wisdom, and trustworthiness' form the moral foundation of Chinese society, and its concept of 'cultivating oneself, managing the family, governing the state, and bringing peace to the world' inspires us to start with self-improvement. The Daoist Laozi's idea of 'the Way follows nature' seems particularly profound against the backdrop of today's environmental crisis, reminding humanity to follow rather than defy natural laws. Zhuangzi's 'Free and Easy Wandering' teaches us to transcend worldly constraints and pursue spiritual freedom. The Mohist concept of 'universal love and non-aggression' coincides with contemporary pacifism. Although Legalism emphasized strict laws, its concept of rule by law still has reference value for modern societies. These ancient wisdoms are not outdated doctrines gathering dust, but intellectual treasures that still shine after the test of time. When facing the various confusions of modern society, reviewing the teachings of these ancient sages often provides us with unique perspectives and profound inspiration.",
        "hsk_level": 6,
    },
    {
        "title": "乡愁与身份认同",
        "title_english": "Nostalgia and Identity",
        "content": "对于许多离开故土、客居他乡的人来说，乡愁是一种挥之不去的情感。它不仅仅是对故乡的思念，更是对自我身份认同的一种深层追问。当一个人在异国他乡生活多年，他所使用的语言、遵循的习俗、品尝的食物都发生了变化。他可能说着流利的外语，融入了当地的社会，但在某些特定的时刻——也许是听到一首熟悉的歌曲，也许是闻到了某种食物的香味——一种难以名状的情感便会涌上心头。这种情感就是乡愁。余光中先生曾写道，乡愁是一枚小小的邮票，是一张窄窄的船票。在全球化的今天，乡愁有了更加复杂的内涵。移民二代可能对父母的故乡没有直接的记忆，却通过家庭传承的语言和文化习惯，建立起一种间接的联系。这种跨越时空的文化记忆，构成了他们身份认同中不可或缺的一部分。在多元文化的社会里，如何在融入与保持之间找到属于自己的位置，是每一个离散群体都需要面对的永恒命题。",
        "content_pinyin": "Duìyú xǔduō líkāi gùtǔ, kèjū tāxiāng de rén lái shuō, xiāngchóu shì yī zhǒng huī zhī bú qù de qínggǎn. Tā bùjǐnjǐn shì duì gùxiāng de sīniàn, gèng shì duì zìwǒ shēnfèn rèntóng de yī zhǒng shēncéng zhuīwèn. Dāng yī gè rén zài yìguó tāxiāng shēnghuó duō nián, tā suǒ shǐyòng de yǔyán, zūnxún de xísú, pǐncháng de shíwù dōu fāshēng le biànhuà. Tā kěnéng shuō zhe liúlì de wàiyǔ, róngrù le dāngdì de shèhuì, dàn zài mǒuxiē tèdìng de shíkè, yěxǔ shì tīng dào yī shǒu shúxī de gēqǔ, yěxǔ shì wén dào le mǒu zhǒng shíwù de xiāngwèi, yī zhǒng nán yǐ míng zhuàng de qínggǎn biàn huì yǒng shàng xīntóu. Zhè zhǒng qínggǎn jiùshì xiāngchóu. Yú Guāngzhōng xiānshēng céng xiě dào, xiāngchóu shì yī méi xiǎoxiǎo de yóupiào, shì yī zhāng zhǎizhǎi de chuánpiào. Zài quánqiúhuà de jīntiān, xiāngchóu yǒu le gèngjiā fùzá de nèihán. Yímín èr dài kěnéng duì fùmǔ de gùxiāng méiyǒu zhíjiē de jìyì, què tōngguò jiātíng chuánchéng de yǔyán hé wénhuà xíguàn, jiànlì qǐ yī zhǒng jiānjiē de liánxì. Zhè zhǒng kuàyuè shíkōng de wénhuà jìyì, gòuchéng le tāmen shēnfèn rèntóng zhōng bùkě huòquē de yī bùfèn. Zài duōyuán wénhuà de shèhuì lǐ, rúhé zài róngrù yǔ bǎochí zhījiān zhǎo dào shǔyú zìjǐ de wèizhì, shì měi yī gè lísàn qúntǐ dōu xūyào miàn duì de yǒnghéng mìngtí.",
        "english_translation": "For many people who have left their homeland to live elsewhere, nostalgia is a lingering emotion. It is not merely longing for one's hometown, but a deep inquiry into one's self-identity. When a person has lived in a foreign land for many years, the language they use, customs they follow, and food they taste have all changed. They may speak a foreign language fluently and have integrated into local society, but at certain moments - perhaps hearing a familiar song, perhaps catching the scent of a certain food - an indescribable emotion surges up. This emotion is nostalgia. The poet Yu Guangzhong once wrote that nostalgia is a small stamp, a narrow boat ticket. In today's globalized world, nostalgia has taken on more complex meaning. Second-generation immigrants may have no direct memories of their parents' homeland, yet through inherited language and cultural habits, they establish an indirect connection. This cultural memory that transcends time and space forms an indispensable part of their identity. In multicultural societies, how to find one's own place between integration and preservation is an eternal question that every diaspora community must face.",
        "hsk_level": 6,
    },
    {
        "title": "数字时代的阅读变迁",
        "title_english": "The Transformation of Reading in the Digital Age",
        "content": "从竹简到纸张，从印刷术到电子书，阅读的载体在不断演变，但阅读的本质始终未变。然而，数字时代的到来给传统的阅读方式带来了前所未有的冲击。碎片化阅读已经成为当代人获取信息的主要方式——人们在通勤路上刷新闻，在等餐时翻看朋友圈，在入睡前浏览短视频。这种阅读方式虽然高效，却往往停留在信息的表面，缺乏深度思考的空间。与之相对的是深度阅读，即沉浸式地阅读一本完整的书籍，与作者的思想进行深入对话。神经科学的研究表明，深度阅读能够激活大脑中负责情感共鸣和抽象思维的区域，而这是碎片化阅读所无法实现的。在这个注意力稀缺的时代，培养深度阅读的能力显得尤为珍贵。这并不意味着我们要完全抵制数字化阅读，而是要有意识地在碎片化阅读和深度阅读之间保持适当的平衡，让技术真正地服务于我们的精神成长。",
        "content_pinyin": "Cóng zhújiǎn dào zhǐzhāng, cóng yìnshuā shù dào diànzǐ shū, yuèdú de zàitǐ zài bùduàn yǎnbiàn, dàn yuèdú de běnzhì shǐzhōng wèi biàn. Rán'ér, shùzì shídài de dàolái gěi chuántǒng de yuèdú fāngshì dài lái le qián suǒ wèi yǒu de chōngjí. Suìpiànhuà yuèdú yǐjīng chéngwéi dāngdài rén huòqǔ xìnxī de zhǔyào fāngshì, rénmen zài tōngqín lùshang shuā xīnwén, zài děng cān shí fānkàn péngyǒu quān, zài rùshuì qián liúlǎn duǎn shìpín. Zhè zhǒng yuèdú fāngshì suīrán gāoxiào, què wǎngwǎng tíngliú zài xìnxī de biǎomiàn, quēfá shēndù sīkǎo de kōngjiān. Yǔ zhī xiāngduì de shì shēndù yuèdú, jí chénjìn shì de yuèdú yī běn wánzhěng de shūjí, yǔ zuòzhě de sīxiǎng jìnxíng shēnrù duìhuà. Shénjīng kēxué de yánjiū biǎomíng, shēndù yuèdú nénggòu jīhuó dànǎo zhōng fùzé qínggǎn gòngmíng hé chōuxiàng sīwéi de qūyù, ér zhè shì suìpiànhuà yuèdú suǒ wúfǎ shíxiàn de. Zài zhège zhùyìlì xīquē de shídài, péiyǎng shēndù yuèdú de nénglì xiǎn de yóuwéi zhēnguì. Zhè bìng bù yìwèi zhe wǒmen yào wánquán dǐzhì shùzìhuà yuèdú, ér shì yào yǒu yìshí de zài suìpiànhuà yuèdú hé shēndù yuèdú zhījiān bǎochí shìdāng de pínghéng, ràng jìshù zhēnzhèng de fúwù yú wǒmen de jīngshén chéngzhǎng.",
        "english_translation": "From bamboo slips to paper, from printing to e-books, the medium of reading has constantly evolved, but the essence of reading has never changed. However, the arrival of the digital age has brought unprecedented impact to traditional reading. Fragmented reading has become the primary way contemporary people consume information - scrolling news during commutes, checking social feeds while waiting for food, browsing short videos before sleep. While this reading style is efficient, it often stays on the surface of information, lacking space for deep thinking. In contrast is deep reading - immersively reading a complete book and engaging in profound dialogue with the author's ideas. Neuroscience research shows that deep reading activates brain regions responsible for emotional resonance and abstract thinking, which fragmented reading cannot achieve. In this age of scarce attention, cultivating the ability for deep reading is particularly precious. This doesn't mean we should completely resist digital reading, but rather consciously maintain an appropriate balance between fragmented and deep reading, letting technology truly serve our intellectual growth.",
        "hsk_level": 6,
    },
]


def seed():
    db = SessionLocal()
    try:
        # Get or create a user to be the author
        user = db.query(User).first()
        if not user:
            print("No users found. Please register a user first.")
            return

        existing = db.query(Story).filter(Story.title.in_([s["title"] for s in STORIES])).count()
        if existing > 0:
            print(f"Found {existing} existing seeded stories, skipping duplicates.")

        added = 0
        for s in STORIES:
            exists = db.query(Story).filter(Story.title == s["title"]).first()
            if exists:
                continue
            story = Story(
                title=s["title"],
                title_english=s["title_english"],
                content=s["content"],
                content_pinyin=s["content_pinyin"],
                english_translation=s["english_translation"],
                hsk_level=s["hsk_level"],
                author_id=user.id,
                is_published=True,
            )
            db.add(story)
            added += 1

        db.commit()
        print(f"Seeded {added} stories successfully! (HSK 1: 3, HSK 2: 3, HSK 3: 3)")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
