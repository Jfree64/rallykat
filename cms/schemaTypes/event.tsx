import { formatDate } from "../utils/formatDate";

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
  orderings: [
    {
      title: "Date",
      name: "date",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      name: "name",
      date: "date",
      emoji: "emoji",
    },
    prepare({ name, date, emoji }: { name: string, date: string, emoji: string }) {
      return {
        title: `// ${name}`,
        subtitle: formatDate(date),
        media: <span>{emoji} </span>,
      }
    },
  },
};
