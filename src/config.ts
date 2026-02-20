const getBaseUrl = () => {
  if (__DEV__) {
    return 'http://[2a01:4f8:1c19:cda4::1]:3000'
  }
  return 'https://your-production-url.com'
}

export const API_BASE_URL = getBaseUrl()
