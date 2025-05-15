import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  studioHost: 'rallykat',
  api: {
    projectId: 'vfgeo3o3',
    dataset: 'production'
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
})
