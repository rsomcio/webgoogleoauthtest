import { useState } from 'react'
import { GoogleLogin, googleLogout } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import './App.css'

interface JwtClaims {
  [key: string]: unknown
}

function decodeJwt(token: string): JwtClaims {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

function CopyableBox({ content, label }: { content: string; label: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="jwt-token-box">
      <pre>{label}</pre>
      <button className="copy-btn" onClick={copy}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

function JwtSection({ token, claims }: { token: string; claims: JwtClaims }) {
  const apiUrl = import.meta.env.VITE_API_URL as string
  const curlCommand =
    `curl -X POST ${apiUrl}/auth/google \\\n` +
    `  -H "Content-Type: application/json" \\\n` +
    `  -d '{"id_token": "${token}"}'`

  const formatValue = (v: unknown): string => {
    if (typeof v === 'number' && String(v).length === 10) {
      // Unix timestamp — show both raw and human-readable
      return `${v}  (${new Date(v * 1000).toISOString()})`
    }
    return String(v)
  }

  return (
    <div className="jwt-section">
      <h3>JWT Credential</h3>
      <CopyableBox content={token} label={token} />

      <h3>cURL Command</h3>
      <CopyableBox content={curlCommand} label={curlCommand} />

      <h3>Decoded Claims</h3>
      <table className="claims-table">
        <thead>
          <tr>
            <th>Claim</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(claims).map(([key, value]) => (
            <tr key={key}>
              <td className="claim-key">{key}</td>
              <td className="claim-value">{formatValue(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function App() {
  const [claims, setClaims] = useState<JwtClaims | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleSuccess(response: CredentialResponse) {
    if (!response.credential) return
    setToken(response.credential)
    setClaims(decodeJwt(response.credential))
    setError(null)
  }

  function handleError() {
    setError('Google sign-in failed. Please try again.')
  }

  function handleLogout() {
    googleLogout()
    setToken(null)
    setClaims(null)
  }

  const picture = claims?.picture as string | undefined
  const name = claims?.name as string | undefined
  const email = claims?.email as string | undefined

  return (
    <div className="login-page">
      <div className="login-card">
        {claims && token ? (
          <>
            <div className="profile">
              {picture && <img src={picture} alt={name} className="avatar" />}
              <h2>{name}</h2>
              <p className="email">{email}</p>
              <button className="logout-btn" onClick={handleLogout}>
                Sign out
              </button>
            </div>
            <JwtSection token={token} claims={claims} />
          </>
        ) : (
          <>
            <div className="login-header">
              <h1>Welcome</h1>
              <p>Sign in to continue</p>
            </div>
            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap
                shape="rectangular"
                theme="outline"
                size="large"
                text="signin_with"
              />
            </div>
            {error && <p className="error">{error}</p>}
          </>
        )}
      </div>
    </div>
  )
}

export default App
