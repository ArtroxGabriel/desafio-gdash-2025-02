// Package apiclient represents the serivice responsible for data storage operations.
package apiclient

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"math"
	"net/http"
	"time"

	"github.com/ArtroxGabriel/desafio-gdash-2025-02/go-worker/cmd/config"
	"github.com/ArtroxGabriel/desafio-gdash-2025-02/go-worker/pkg/dto"
	"github.com/samber/do/v2"
)

const (
	DefaultTimeout   = 5 * time.Second
	MaxRetries       = 3
	BaseBackoff      = 1 * time.Second
	BasePowerBackoff = 2
)

var _ ClientInterface = (*ClientService)(nil)

type ClientService struct {
	logger *slog.Logger
	cfg    *config.Config
	client *http.Client
	path   string
}

func NewClientService(i do.Injector) (*ClientService, error) {
	cfg := do.MustInvoke[*config.Config](i)
	return &ClientService{
		logger: do.MustInvoke[*slog.Logger](i),
		cfg:    cfg,
		client: do.MustInvoke[*http.Client](i),
		path:   fmt.Sprintf("%s/weather-snapshot", cfg.APIURL),
	}, nil
}

func (s *ClientService) SaveData(ctx context.Context, payload *dto.CurrentWeatherResponseDTO) error {
	jsonData, err := json.Marshal(payload)
	if err != nil {
		s.logger.ErrorContext(ctx, "Error marshaling JSON", slog.String("error", err.Error()))
		return err
	}

	var lastErr error

	for attempt := 0; attempt <= MaxRetries; attempt++ {
		if attempt > 0 {
			backoff := BaseBackoff * time.Duration(math.Pow(BasePowerBackoff, float64(attempt-1)))
			s.logger.InfoContext(ctx, "Retrying API request",
				slog.Int("attempt", attempt),
				slog.Duration("wait_time", backoff),
			)

			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(backoff):
			}
		}

		err = s.doRequest(ctx, jsonData)
		if err == nil {
			return nil
		}

		lastErr = err
	}

	s.logger.ErrorContext(ctx, "Max retries reached, failed to save data", slog.String("error", lastErr.Error()))
	return lastErr
}

func (s *ClientService) doRequest(ctx context.Context, data []byte) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.path, bytes.NewBuffer(data))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("network error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		s.logger.InfoContext(ctx, "Data saved successfully", slog.Int("status", resp.StatusCode))
		return nil
	}

	if resp.StatusCode >= 400 && resp.StatusCode < 500 {
		return fmt.Errorf("api client error (status %d): %s", resp.StatusCode, http.StatusText(resp.StatusCode))
	}

	return fmt.Errorf("api server error (status %d)", resp.StatusCode)
}
