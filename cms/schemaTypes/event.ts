export default {
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "date",
      title: "Date",
      type: "date",
    },
    {
      name: "emoji",
      title: "Emoji",
      type: "string",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
    },
    {
      name: "heats",
      title: "Heats",
      type: "array",
      of: [{ type: "heat" }],
    }
  ],

  preview: {
    select: {
      title: "name",
      subtitle: "handle",
    },
  },
};
