import { formatDate } from "../utils/formatDate";

export default {
  name: "series",
  title: "Series",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "startDate",
      title: "Start Date",
      type: "date",
    },
    {
      name: "endDate",
      title: "End Date",
      type: "date",
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
      name: "events",
      title: "Events",
      type: "array",
      of: [{ type: "reference", to: [{ type: "event" }] }],
    }
  ],

  preview: {
    select: {
      name: "name",
      startDate: "startDate",
      endDate: "endDate",
    },
    prepare({ name, startDate, endDate }: { name: string, startDate: string, endDate: string }) {
      return {
        title: name,
        subtitle: `${formatDate(startDate)} - ${formatDate(endDate)}`,
      }
    },
  },
};
