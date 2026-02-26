const getBaseUrl = () => {
  // TEMP: Use HTTP while HTTPS routing is being fixed
  return 'http://46.225.12.54:3000'
  // return 'https://cellar.zubi.wine'
}

export const API_BASE_URL = getBaseUrl()
