import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  studioHost: 'rallykat',
  api: {
    projectId: 'vfgeo3o3',
    dataset: 'production'
  },
  deployment: {
    appId: 'k69blqsbn5m54x7mwo43yl4v',
    autoUpdates: true
  },
})
