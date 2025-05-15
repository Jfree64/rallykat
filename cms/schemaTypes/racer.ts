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
      name: "handle",
      title: "Handle",
      type: "string",
    },
    {
      name: "score",
      title: "Score",
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

  preview: {
    select: {
      title: "name",
      subtitle: "handle",
    },
  },
};
