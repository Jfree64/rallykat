export default {
  name: "player",
  title: "Player",
  type: "document",
  fieldsets: [
    {
      name: "oldScores",
      title: "Old Scores",
      options: { collapsible: true, collapsed: true },
    },
  ],
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
      name: "color",
      title: "Car Color (hex, e.g. #FF7A00)",
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
      name: "mwScore",
      title: "Most Wanted Score",
      type: "number",
    },
    {
      name: "efScore",
      title: "Empire Fall Score",
      type: "number",
      fieldset: "oldScores",
    },
    {
      name: "score",
      title: "Season 1 Score",
      type: "number",
      fieldset: "oldScores",
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
      title: "Most Wanted Score",
      name: "mwScore",
      by: [{ field: "mwScore", direction: "desc" }],
    },
    {
      title: "Empire Fall Score",
      name: "efScore",
      by: [{ field: "efScore", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      name: "name",
      mwScore: "mwScore",
      nickname: "nickname",
      emoji: "emoji",
    },
    prepare(selection: any) {
      const { name, mwScore, nickname, emoji } = selection
      return {
        title: name,
        subtitle: `${mwScore ?? 0} - ${nickname}`,
        media: <span>{emoji} </span>,
      }
    },
  },
};
