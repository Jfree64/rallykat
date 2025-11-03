export default {
  name: "map",
  title: "Map",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "file",
      title: "File",
      type: "file",
      options: {
        accept: ".gpx",
      },
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
  ],
};