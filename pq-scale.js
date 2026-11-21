/* 中文心理健康教育改写。保留项目原有 Q1–Q23 编号与分组。 */
const friendshipScale = {
    version: "fqs-zh-education-2",
    options: ["完全不符合", "有一点符合", "有些符合", "比较符合", "非常符合"],
    items: [
        "我和这位朋友空闲时都在一起。",
        "这位朋友会想出一些我们可以一起做的有趣的事。",
        "放学后或周末，我和这位朋友会去对方家里。",
        "有时我和这位朋友会坐下来，聊聊学校、运动或其他我们喜欢的话题。",
        "我有时会和这位朋友打架。",
        "即使我请这位朋友停下来，对方有时还是会继续烦我。",
        "我和这位朋友常常争吵。",
        "我和这位朋友在很多事情上意见不一样。",
        "如果我没带午餐，需要一点钱买吃的，这位朋友会借钱给我。",
        "我遇到麻烦时，这位朋友会帮我。",
        "如果我需要帮助，这位朋友会帮我。",
        "如果有别的同学来烦我，这位朋友会帮我。",
        "如果有别的同学找我麻烦，这位朋友会站出来为我说话。",
        "如果我在学校或家里遇到问题，我可以和这位朋友说。",
        "有些烦心事即使没法告诉别人，我也能和这位朋友说。",
        "和这位朋友吵架后，即使我道歉，对方还是会生我的气。",
        "如果我或这位朋友做了让对方不高兴的事，我们很容易和好。",
        "我和这位朋友吵架或打架之后，只要道歉就能和好。",
        "如果这位朋友搬走了，我会想念对方。",
        "和这位朋友在一起时，我很开心。",
        "即使这位朋友不在身边，我也会想到对方。",
        "当我把一件事做得很好时，这位朋友会为我高兴。",
        "这位朋友有时会为我做些事，或让我感觉自己很特别。"
    ],
    dimensions: [
        {
            id: "companionship", label: "陪伴", items: [1, 2, 3, 4],
            meaning: "一起度过的时间、共同活动和感兴趣的话题。",
            reflection: "想起一次你们都乐在其中的相处。那时你们在做什么？"
        },
        {
            id: "conflict", label: "冲突", items: [5, 6, 7, 8],
            meaning: "意见分歧、争吵，以及表示想让对方停下来后仍被打扰的体验。",
            reflection: "遇到分歧时，你希望怎样表达感受，或让对方知道你需要暂停？"
        },
        {
            id: "help", label: "帮助", items: [9, 10, 11, 12, 13],
            meaning: "遇到困难或受到打扰时，你感受到的帮助和支持。",
            reflection: "下一次需要帮忙时，你最希望对方做哪一件具体的事？"
        },
        {
            id: "security", label: "安全感", items: [14, 15, 16, 17, 18],
            meaning: "遇到烦心事时能否放心开口，以及不愉快后能否和好。",
            reflection: "发生误会后，哪一种沟通方式会让你更愿意重新开口？"
        },
        {
            id: "closeness", label: "亲密感", items: [19, 20, 21, 22, 23],
            meaning: "相处时的愉快、分开时的想念，以及被重视的感受。",
            reflection: "对方做过哪一件小事，让你感受到自己被在乎？"
        }
    ]
};

function scoreFriendship(response) {
    const ratings = friendshipScale.items.map((_, index) => response?.[`Q${index + 1}`]);
    if (ratings.some(value => !Number.isInteger(value) || value < 0 || value > 4)) {
        throw new RangeError("每题都需要 0–4 的有效作答索引");
    }

    // jsPsych 试次数据保留 0–4 的原始选项索引，本地导出保留 1–5 的原始作答。
    const raw = ratings.map(value => value + 1);
    const keyed = [...raw];
    keyed[15] = 6 - raw[15];

    const dimensions = friendshipScale.dimensions.map(dimension => {
        const sum = dimension.items.reduce((total, number) => total + keyed[number - 1], 0);
        return { ...dimension, mean: sum / dimension.items.length };
    });
    return { raw, dimensions };
}
