// Package consumer represents the RabbitMQ queue consumer.
package consumer

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net"

	"github.com/ArtroxGabriel/desafio-gdash-2025-02/go-worker/cmd/config"
	apiclient "github.com/ArtroxGabriel/desafio-gdash-2025-02/go-worker/pkg/api_client"
	"github.com/ArtroxGabriel/desafio-gdash-2025-02/go-worker/pkg/dto"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/samber/do/v2"
)

type Consumer struct {
	logger *slog.Logger
	cfg    *config.Config

	apiClient apiclient.ClientInterface
}

func NewConsumer(i do.Injector) (*Consumer, error) {
	return &Consumer{
		logger: do.MustInvoke[*slog.Logger](i),
		cfg:    do.MustInvoke[*config.Config](i),

		apiClient: do.MustInvokeAs[apiclient.ClientInterface](i),
	}, nil
}

func (c *Consumer) Start(ctx context.Context) error {
	c.logger.InfoContext(ctx, "starting consumer")

	hostPort := net.JoinHostPort(c.cfg.Rabbitmq.Host, c.cfg.Rabbitmq.Port)
	path := fmt.Sprintf("amqp://%s:%s@%s/",
		c.cfg.Rabbitmq.Username,
		c.cfg.Rabbitmq.Password,
		hostPort,
	)

	conn, ch, msgs, err := c.setupConnection(ctx, path)
	if err != nil {
		return err
	}
	defer func() {
		c.logger.InfoContext(ctx, "closing rabbitmq connection")
		_ = ch.Close()
		_ = conn.Close()
	}()

	c.logger.InfoContext(ctx, "Consumer started, waiting for messages...")

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case d, ok := <-msgs:
			if !ok {
				return nil
			}

			data, ok := c.processMessage(ctx, d)
			if !ok {
				continue
			}

			err = c.apiClient.SaveData(ctx, data)
			if err != nil {
				c.logger.ErrorContext(ctx, "Error saving weather data",
					slog.Any("data", data),
					slog.String("error", err.Error()))
				continue
			}
			c.logger.InfoContext(ctx, "Weather data saved successfully")
		}
	}
}

func (c *Consumer) setupConnection(
	ctx context.Context,
	path string,
) (*amqp.Connection, *amqp.Channel, <-chan amqp.Delivery, error) {
	conn, err := amqp.Dial(path)
	if err != nil {
		c.logger.ErrorContext(ctx, "Failed to connect to RabbitMQ", slog.String("error", err.Error()))
		return nil, nil, nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		_ = conn.Close()
		c.logger.ErrorContext(ctx, "Failed to open a channel", slog.String("error", err.Error()))
		return nil, nil, nil, err
	}

	q, err := ch.QueueDeclare(
		c.cfg.Rabbitmq.Queue,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		_ = ch.Close()
		_ = conn.Close()
		return nil, nil, nil, err
	}

	msgs, err := ch.Consume(
		q.Name,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		_ = ch.Close()
		_ = conn.Close()
		return nil, nil, nil, err
	}

	return conn, ch, msgs, nil
}

func (c *Consumer) processMessage(ctx context.Context, d amqp.Delivery) (*dto.CurrentWeatherResponseDTO, bool) {
	var payload dto.CurrentWeatherResponseDTO

	if err := json.Unmarshal(d.Body, &payload); err != nil {
		c.logger.ErrorContext(ctx, "Failed to unmarshal message",
			slog.String("error", err.Error()))
		_ = d.Nack(false, false)
		return nil, false
	}

	c.logger.DebugContext(ctx, "Processed weather data",
		slog.Any("data", payload))

	_ = d.Ack(false)

	return &payload, true
}
