export default {
  name: "player",
  title: "Player",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "emoji",
      title: "Emoji",
      type: "string",
    },
    {
      name: "nickname",
      title: "Nickname",
      type: "string",
    },
    {
      name: "handle",
      title: "3 Letter Handle",
      type: "string",
    },
    {
      name: "efScore",
      title: "Empire Fall Score",
      type: "number",
    },
    {
      name: "score",
      title: "Season 1 Score",
      type: "number",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "handle",
        maxLength: 96,
      },
    },
    {
      name: "email",
      title: "Email",
      type: "string",
    },
    {
      name: "instagram",
      title: "Instagram Handle",
      type: "string",
    }
  ],
  orderings: [
    {
      title: "Empire Fall Score",
      name: "efScore",
      by: [{ field: "efScore", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      name: "name",
      efScore: "efScore",
      nickname: "nickname",
      emoji: "emoji",
    },
    prepare(selection: any) {
      const { name, efScore, nickname, emoji } = selection
      return {
        title: name,
        subtitle: `${efScore} - ${nickname}`,
        media: <span>{emoji} </span>,
      }
    },
  },
};
