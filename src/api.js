// LinkedIn Profile API integration
const LINKEDIN_API_URL = 'https://test-api.isla.to/v1/linkedin/profile'
const LINKEDIN_API_KEY = import.meta.env.VITE_LINKEDIN_API_KEY

let _firstCall = true

export async function fetchLinkedInProfile(linkedinUrl) {
  const response = await fetch(LINKEDIN_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': LINKEDIN_API_KEY,
      'Content-Type': 'application/json',
      'Accept-Language': 'any',
    },
    body: JSON.stringify({ linkedin_url: linkedinUrl }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API error ${response.status}: ${text}`)
  }

  const json = await response.json()

  if (_firstCall) {
    console.log('[LinkedIn API] Full response JSON:', JSON.stringify(json, null, 2))
    _firstCall = false
  }

  // Response shape: { data: { ...profile }, message: "ok" }
  const p = json.data ?? json

  return {
    full_name:    p.full_name        || '',
    headline:     p.headline         || p.job_title || '',
    avatar_url:   p.profile_image_url || p.profile_picture_url || '',
    company:      p.company          || '',
    company_logo: p.company_logo_url || '',
  }
}
