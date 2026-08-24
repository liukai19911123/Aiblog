/*
 * 博客的文字、链接和文章索引都在这里修改。
 * 新增文章：在 posts/ 中添加 Markdown 文件，再在 posts 数组添加一项。
 */
window.BLOG_CONFIG = {
  title: '片刻之间',
  tagline: 'NOTES ON CODE & LIFE',
  description: '把复杂的事想清楚，把值得的事写下来。',
  heroTitle: '在技术与生活的<br><em>缝隙里</em>，保持好奇。',
  heroIntro: '这里收集我的技术笔记、产品思考和生活观察。写作不是给答案，而是把问题照得更亮一点。',
  author: '你的名字',
  authorRole: '独立开发者 · 长期主义者',
  email: 'hello@example.com',
  socials: [
    { label: 'GitHub', url: 'https://github.com/' },
    { label: 'Email', url: 'mailto:hello@example.com' }
  ],
  posts: [
    {
      slug: 'build-a-calm-digital-garden',
      title: '如何搭建一个真正属于自己的数字花园',
      date: '2026-08-18',
      category: '创作手记',
      tags: ['个人博客', '写作', '数字花园'],
      excerpt: '从工具选择到内容结构，记录这个纯静态博客的设计过程，以及为什么简单往往更接近长期可维护。',
      file: 'posts/build-a-calm-digital-garden.md',
      featured: true,
      published: true
    },
    {
      slug: 'javascript-without-frameworks',
      title: '不用框架，也能写出清晰的前端应用',
      date: '2026-08-09',
      category: '技术笔记',
      tags: ['JavaScript', '架构', '静态网站'],
      excerpt: '路由、状态、渲染和内容加载并不一定需要庞大的工具链。回到浏览器原生能力，重新理解前端的基本组成。',
      file: 'posts/javascript-without-frameworks.md',
      published: true
    },
    {
      slug: 'write-to-think',
      title: '写作不是表达的终点，而是思考的起点',
      date: '2026-07-26',
      category: '生活观察',
      tags: ['写作', '思考', '方法'],
      excerpt: '很多模糊的想法，只有落到纸面上才会暴露缺口。写作的真正价值，是迫使我们完成一次诚实的推理。',
      file: 'posts/write-to-think.md',
      published: true
    }
  ]
};
