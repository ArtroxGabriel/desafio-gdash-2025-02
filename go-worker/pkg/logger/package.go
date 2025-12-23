// Package logger provides a structured logger using slog.
package logger

import (
	"log/slog"
	"os"

	"github.com/samber/do/v2"
)

var Package = do.Package(
	do.Eager(slog.New(slog.NewJSONHandler(os.Stdout, nil))),
)
