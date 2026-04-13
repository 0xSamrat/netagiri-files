// Package fetcher is a rate-limited HTTP client for myneta.info.
//
// Global 2 req/sec token bucket — shared across every goroutine so worker
// concurrency does not amplify the outbound rate. Respect the source.
package fetcher

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"time"

	"golang.org/x/time/rate"
)

const (
	userAgent      = "NetaWatchScraper/1.0 (+civic transparency; contact via github.com/samratmukherjee/netawatch)"
	defaultTimeout = 90 * time.Second
	maxRetries     = 3
)

// Client wraps http.Client with a shared rate limiter and retry logic.
type Client struct {
	http    *http.Client
	limiter *rate.Limiter
	log     *slog.Logger
}

// New constructs a Client limited to 2 requests per second (one every 500ms).
func New(logger *slog.Logger) *Client {
	return &Client{
		http:    &http.Client{Timeout: defaultTimeout},
		limiter: rate.NewLimiter(rate.Every(500*time.Millisecond), 1),
		log:     logger,
	}
}

// Fetch performs a GET with retries on transient failures (5xx, network errors).
// Returns the response body on HTTP 200.
func (c *Client) Fetch(ctx context.Context, url string) ([]byte, error) {
	var lastErr error
	for attempt := 1; attempt <= maxRetries; attempt++ {
		if err := c.limiter.Wait(ctx); err != nil {
			return nil, fmt.Errorf("rate limiter wait: %w", err)
		}

		body, retry, err := c.doOnce(ctx, url)
		if err == nil {
			return body, nil
		}
		lastErr = err
		if !retry {
			return nil, err
		}

		backoff := time.Duration(attempt*attempt) * time.Second
		c.log.Warn("fetch retry",
			"url", url,
			"attempt", attempt,
			"backoff", backoff,
			"err", err,
		)
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(backoff):
		}
	}
	return nil, fmt.Errorf("fetch %s failed after %d attempts: %w", url, maxRetries, lastErr)
}

// doOnce executes a single HTTP GET. Returns retry=true for transient failures.
func (c *Client) doOnce(ctx context.Context, url string) ([]byte, bool, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, false, fmt.Errorf("new request: %w", err)
	}
	req.Header.Set("User-Agent", userAgent)
	req.Header.Set("Accept", "text/html,application/xhtml+xml")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, true, fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 500 {
		return nil, true, fmt.Errorf("http %d", resp.StatusCode)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, false, fmt.Errorf("http %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, true, fmt.Errorf("read body: %w", err)
	}
	return body, false, nil
}
