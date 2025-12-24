FROM golang:1.25-alpine AS builder

WORKDIR /app
COPY . .

RUN go mod download
RUN go build -o go-worker ./cmd/worker

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/go-worker .
CMD ["./go-worker"]
