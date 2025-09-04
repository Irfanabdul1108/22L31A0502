import React, { useState, useEffect } from 'react';

// --- SVG Icons ---
const LinkIcon = ({ className = "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
    </svg>
);

const CopyIcon = ({ copied }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        {copied ? <path d="M20 6 9 17l-5-5" /> : <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>}
        {!copied && <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>}
    </svg>
);

const BarChartIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-slate-400">
        <line x1="12" x2="12" y1="20" y2="10" />
        <line x1="18" x2="18" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M3 6h18"></path>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

// --- Timer Component for Expiry Countdown ---
const Timer = ({ expiryTimestamp }) => {
    const [remainingTime, setRemainingTime] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            const timeLeft = expiryTimestamp - now;

            if (timeLeft <= 0) {
                setRemainingTime('Expired');
                return;
            }

            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            setRemainingTime(`Expires in: ${minutes}m ${seconds.toString().padStart(2, '0')}s`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [expiryTimestamp]);

    return (
        <p className={`text-xs mt-1 ${remainingTime === 'Expired' ? 'text-red-400 font-semibold' : 'text-slate-500'}`}>
            {remainingTime}
        </p>
    );
};


// --- Main App Component ---
export default function App() {
    const [longUrl, setLongUrl] = useState('');
    const [shortenedUrls, setShortenedUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copiedUrlId, setCopiedUrlId] = useState(null);

    // Load and filter URLs from localStorage on initial render
    useEffect(() => {
        try {
            const storedUrls = localStorage.getItem('shortenedUrls');
            if (storedUrls) {
                const now = new Date().getTime();
                const parsedUrls = JSON.parse(storedUrls);
                // Filter out any links that have already expired
                const activeUrls = parsedUrls.filter(url => url.expiresAt > now);
                setShortenedUrls(activeUrls);
            }
        } catch (e) {
            console.error("Failed to parse URLs from localStorage:", e);
        }
    }, []);
    
    // Periodically check for and remove expired URLs from state
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            setShortenedUrls(prevUrls => prevUrls.filter(url => url.expiresAt > now));
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Update localStorage whenever the list of URLs changes
    useEffect(() => {
        localStorage.setItem('shortenedUrls', JSON.stringify(shortenedUrls));
    }, [shortenedUrls]);

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return /^(https?:\/\/)/.test(string);
        } catch (_) {
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!isValidUrl(longUrl)) {
            setError('Please enter a valid URL (e.g., https://example.com).');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
            if (response.ok) {
                const shortUrl = await response.text();
                const newUrl = {
                    id: self.crypto.randomUUID(),
                    original: longUrl,
                    short: shortUrl,
                    clicks: 0,
                    createdAt: new Date().getTime(),
                    expiresAt: new Date().getTime() + 30 * 60 * 1000, // 30 minutes from now
                };
                setShortenedUrls(prev => [newUrl, ...prev]);
                setLongUrl('');
            } else {
                setError(await response.text() || 'Failed to shorten URL.');
            }
        } catch (err) {
            setError('An error occurred. Please check your network connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (shortUrl, id) => {
        const textArea = document.createElement("textarea");
        textArea.value = shortUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setCopiedUrlId(id);
        setTimeout(() => setCopiedUrlId(null), 2000);
    };

    const handleUrlClick = (id) => {
        setShortenedUrls(prev =>
            prev.map(url => url.id === id ? { ...url, clicks: url.clicks + 1 } : url)
        );
    };

    const handleDelete = (id) => {
        setShortenedUrls(prev => prev.filter(url => url.id !== id));
    };

    return (
        <div className="app">
  <div className="container">
    <header className="header">
      <h1 className="title">URL Shortener</h1>
      <p className="subtitle">Create short, expiring links in seconds.</p>
    </header>

    <main>
      <div className="form-card">
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <LinkIcon className="icon" />
            <input
              type="text"
              placeholder="Enter a long URL to shorten..."
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              className="url-input"
              disabled={loading}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <svg
                  className="spinner"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="circle"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="path"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z"
                  ></path>
                </svg>
                Shortening...
              </>
            ) : (
              "Shorten URL"
            )}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      {shortenedUrls.length > 0 && (
        <div className="links-section">
          <h2 className="links-title">Your Links</h2>
          {shortenedUrls.map((url) => (
            <div key={url.id} className="link-card">
              <div className="link-details">
                <p className="original-url" title={url.original}>
                  {url.original}
                </p>
                <a
                  href={url.short}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleUrlClick(url.id)}
                  className="short-url"
                >
                  {url.short}
                </a>
                <Timer expiryTimestamp={url.expiresAt} />
              </div>
              <div className="link-actions">
                <div className="clicks" title="Total Clicks">
                  <BarChartIcon />
                  <span>{url.clicks}</span>
                </div>
                <button
                  onClick={() => handleCopy(url.short, url.id)}
                  className={`copy-btn ${
                    copiedUrlId === url.id ? "copied" : ""
                  }`}
                >
                  <CopyIcon copied={copiedUrlId === url.id} />
                  <span>
                    {copiedUrlId === url.id ? "Copied!" : "Copy"}
                  </span>
                </button>
                <button
                  onClick={() => handleDelete(url.id)}
                  className="delete-btn"
                  title="Delete Link"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  </div>
</div>

    );
}

