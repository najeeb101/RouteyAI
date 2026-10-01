// Extends app.json. The Mapbox download token is a secret (sk.…), so it comes from the
// environment — mobile/.env.local locally, an EAS secret for cloud builds — never from git.
module.exports = ({ config }) => {
  const downloadToken = process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN

  return {
    ...config,
    plugins: config.plugins.map((plugin) =>
      Array.isArray(plugin) && plugin[0] === '@rnmapbox/maps' && downloadToken
        ? [plugin[0], { ...plugin[1], RNMapboxMapsDownloadToken: downloadToken }]
        : plugin,
    ),
  }
}
