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
