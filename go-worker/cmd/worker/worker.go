package main

import (
	"context"
	"errors"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/ArtroxGabriel/desafio-gdash-2025-02/go-worker/cmd/config"
	"github.com/ArtroxGabriel/desafio-gdash-2025-02/go-worker/pkg/consumer"
	"github.com/ArtroxGabriel/desafio-gdash-2025-02/go-worker/pkg/logger"
	"github.com/samber/do/v2"

	"github.com/joho/godotenv"
	"github.com/sethvargo/go-envconfig"
)

func main() {
	_ = godotenv.Load(".env")
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	injector := do.New(
		logger.Package,
		consumer.Package,
	)

	log := do.MustInvoke[*slog.Logger](injector)

	var cfg config.Config
	if err := envconfig.Process(ctx, &cfg); err != nil {
		log.ErrorContext(ctx, "error loading configs", slog.String("error", err.Error()))
		return
	}
	do.ProvideValue(injector, &cfg)

	log.InfoContext(ctx, "configs loaded successfully")

	consumer := do.MustInvoke[*consumer.Consumer](injector)

	if err := consumer.Start(ctx); err != nil {
		if !errors.Is(err, context.Canceled) {
			log.ErrorContext(ctx, "error starting consumer",
				slog.String("error", err.Error()))
			return
		}
	}

	log.InfoContext(ctx, "Worker shut down gracefully")
}
