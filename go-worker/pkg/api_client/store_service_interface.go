package apiclient

import (
	"context"

	"github.com/ArtroxGabriel/desafio-gdash-2025-02/go-worker/pkg/dto"
)

type ClientInterface interface {
	SaveData(ctx context.Context, data *dto.CurrentWeatherResponseDTO) error
}
