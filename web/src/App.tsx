import { useState } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import "./App.css";

type TestResult = {
  status: number;
  body: unknown;
} | null;

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return "#22c55e";
  if (status >= 400 && status < 500) return "#f59e0b";
  if (status >= 500) return "#ef4444";
  return "#888";
}

// POST /auth/google — stores returned access + refresh tokens
function GoogleAuthTest({
  token,
  apiUrl,
  onTokens,
}: {
  token: string;
  apiUrl: string;
  onTokens: (accessToken: string, refreshToken: string) => void;
}) {
  const [result, setResult] = useState<TestResult>(null);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  async function runTest() {
    setLoading(true);
    setResult(null);
    setNetworkError(null);
    try {
      const res = await fetch(`${apiUrl}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: token }),
      });
      const body = await res.json().catch(() => null);
      setResult({ status: res.status, body });
      if (res.ok && body) {
        const b = body as { access_token?: string; refresh_token?: string };
        if (b.access_token && b.refresh_token) {
          onTokens(b.access_token, b.refresh_token);
        }
      }
    } catch {
      setNetworkError("Network error - request did not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="endpoint-test">
      <p className="endpoint-test-desc">
        Signs in an existing user. Returns 403 if no active account exists.
      </p>
      <button
        className="endpoint-test-btn"
        onClick={runTest}
        disabled={loading}
      >
        {loading ? "Testing..." : "Test"}
      </button>
      {networkError && (
        <p className="endpoint-test-network-error">{networkError}</p>
      )}
      {result && (
        <div className="endpoint-test-result">
          <span
            className="endpoint-test-status"
            style={{ color: statusColor(result.status) }}
          >
            {result.status}
          </span>
          {result.body !== null && (
            <pre className="endpoint-test-body">
              {JSON.stringify(result.body, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// POST /auth/register — original simple endpoint test
function EndpointTest({
  token,
  apiUrl,
  endpoint,
  description,
}: {
  token: string;
  apiUrl: string;
  endpoint: string;
  description: string;
}) {
  const [result, setResult] = useState<TestResult>(null);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  async function runTest() {
    setLoading(true);
    setResult(null);
    setNetworkError(null);
    try {
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: token }),
      });
      const body = await res.json().catch(() => null);
      setResult({ status: res.status, body });
    } catch {
      setNetworkError("Network error - request did not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="endpoint-test">
      <p className="endpoint-test-desc">{description}</p>
      <button
        className="endpoint-test-btn"
        onClick={runTest}
        disabled={loading}
      >
        {loading ? "Testing..." : "Test"}
      </button>
      {networkError && (
        <p className="endpoint-test-network-error">{networkError}</p>
      )}
      {result && (
        <div className="endpoint-test-result">
          <span
            className="endpoint-test-status"
            style={{ color: statusColor(result.status) }}
          >
            {result.status}
          </span>
          {result.body !== null && (
            <pre className="endpoint-test-body">
              {JSON.stringify(result.body, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// GET /auth/me — uses Bearer access token
function MeTest({
  apiUrl,
  accessToken,
  onAccessTokenChange,
}: {
  apiUrl: string;
  accessToken: string;
  onAccessTokenChange: (v: string) => void;
}) {
  const [result, setResult] = useState<TestResult>(null);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  async function runTest() {
    setLoading(true);
    setResult(null);
    setNetworkError(null);
    try {
      const res = await fetch(`${apiUrl}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const body = await res.json().catch(() => null);
      setResult({ status: res.status, body });
    } catch {
      setNetworkError("Network error - request did not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="endpoint-test">
      <p className="endpoint-test-desc">
        Returns the authenticated user's profile. Requires a valid access token.
      </p>
      <div className="token-input-row">
        <label className="token-input-label">access_token</label>
        <input
          className="token-input"
          type="text"
          value={accessToken}
          onChange={(e) => onAccessTokenChange(e.target.value)}
          placeholder="Paste or run POST /auth/google above to auto-fill"
          spellCheck={false}
        />
      </div>
      <button
        className="endpoint-test-btn"
        onClick={runTest}
        disabled={loading || !accessToken}
      >
        {loading ? "Testing..." : "Test"}
      </button>
      {networkError && (
        <p className="endpoint-test-network-error">{networkError}</p>
      )}
      {result && (
        <div className="endpoint-test-result">
          <span
            className="endpoint-test-status"
            style={{ color: statusColor(result.status) }}
          >
            {result.status}
          </span>
          {result.body !== null && (
            <pre className="endpoint-test-body">
              {JSON.stringify(result.body, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// POST /auth/refresh — uses refresh token
function RefreshTest({
  apiUrl,
  refreshToken,
  onRefreshTokenChange,
  onTokens,
}: {
  apiUrl: string;
  refreshToken: string;
  onRefreshTokenChange: (v: string) => void;
  onTokens: (accessToken: string, refreshToken: string) => void;
}) {
  const [result, setResult] = useState<TestResult>(null);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  async function runTest() {
    setLoading(true);
    setResult(null);
    setNetworkError(null);
    try {
      const res = await fetch(`${apiUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const body = await res.json().catch(() => null);
      setResult({ status: res.status, body });
      if (res.ok && body) {
        const b = body as { access_token?: string; refresh_token?: string };
        if (b.access_token && b.refresh_token) {
          onTokens(b.access_token, b.refresh_token);
        }
      }
    } catch {
      setNetworkError("Network error - request did not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="endpoint-test">
      <p className="endpoint-test-desc">
        Exchanges a refresh token for a new access token and refresh token pair.
      </p>
      <div className="token-input-row">
        <label className="token-input-label">refresh_token</label>
        <input
          className="token-input"
          type="text"
          value={refreshToken}
          onChange={(e) => onRefreshTokenChange(e.target.value)}
          placeholder="Paste or run POST /auth/google above to auto-fill"
          spellCheck={false}
        />
      </div>
      <button
        className="endpoint-test-btn"
        onClick={runTest}
        disabled={loading || !refreshToken}
      >
        {loading ? "Testing..." : "Test"}
      </button>
      {networkError && (
        <p className="endpoint-test-network-error">{networkError}</p>
      )}
      {result && (
        <div className="endpoint-test-result">
          <span
            className="endpoint-test-status"
            style={{ color: statusColor(result.status) }}
          >
            {result.status}
          </span>
          {result.body !== null && (
            <pre className="endpoint-test-body">
              {JSON.stringify(result.body, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

interface JwtClaims {
  [key: string]: unknown;
}

function decodeJwt(token: string): JwtClaims {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}

function CopyableBox({ content, label }: { content: string; label: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="jwt-token-box">
      <pre>{label}</pre>
      <button className="copy-btn" onClick={copy}>
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function JwtSection({ token, claims }: { token: string; claims: JwtClaims }) {
  const apiUrl = import.meta.env.VITE_API_URL as string;

  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  function handleTokens(at: string, rt: string) {
    setAccessToken(at);
    setRefreshToken(rt);
  }

  const curlCommand =
    `curl -X POST ${apiUrl}/auth/google \\\n` +
    `  -H "Content-Type: application/json" \\\n` +
    `  -d '{"id_token": "${token}"}'`;

  const formatValue = (v: unknown): string => {
    if (typeof v === "number" && String(v).length === 10) {
      return `${v}  (${new Date(v * 1000).toISOString()})`;
    }
    return String(v);
  };

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
          <tr className="claims-divider">
            <td colSpan={2}></td>
          </tr>
          <tr>
            <td className="claim-key claim-key--api">access_token</td>
            <td className="claim-value">
              {accessToken ? (
                <span className="claim-token-value">{accessToken}</span>
              ) : (
                <span className="claim-token-empty">
                  — run POST /auth/google to populate
                </span>
              )}
            </td>
          </tr>
          <tr>
            <td className="claim-key claim-key--api">refresh_token</td>
            <td className="claim-value">
              {refreshToken ? (
                <span className="claim-token-value">{refreshToken}</span>
              ) : (
                <span className="claim-token-empty">
                  — run POST /auth/google to populate
                </span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Test: POST /auth/register</h3>
      <EndpointTest
        token={token}
        apiUrl={apiUrl}
        endpoint="/auth/register"
        description="Creates a new user. Returns 409 if the Google identity is already registered."
      />

      <h3>Test: POST /auth/google</h3>
      <GoogleAuthTest
        token={token}
        apiUrl={apiUrl}
        onTokens={handleTokens}
      />

      <h3>Test: GET /auth/me</h3>
      <MeTest
        apiUrl={apiUrl}
        accessToken={accessToken}
        onAccessTokenChange={setAccessToken}
      />

      <h3>Test: POST /auth/refresh</h3>
      <RefreshTest
        apiUrl={apiUrl}
        refreshToken={refreshToken}
        onRefreshTokenChange={setRefreshToken}
        onTokens={handleTokens}
      />
    </div>
  );
}

function App() {
  const [claims, setClaims] = useState<JwtClaims | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSuccess(response: CredentialResponse) {
    if (!response.credential) return;
    setToken(response.credential);
    setClaims(decodeJwt(response.credential));
    setError(null);
  }

  function handleError() {
    setError("Google sign-in failed. Please try again.");
  }

  function handleLogout() {
    googleLogout();
    setToken(null);
    setClaims(null);
  }

  const picture = claims?.picture as string | undefined;
  const name = claims?.name as string | undefined;
  const email = claims?.email as string | undefined;

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
  );
}

export default App;
