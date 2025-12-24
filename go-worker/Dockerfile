FROM golang:1.25-alpine AS builder

WORKDIR /app
COPY . .

RUN go mod download
RUN go build -o go-worker ./cmd/worker

FROM alpine:3.23.2
WORKDIR /app
COPY --from=builder /app/go-worker .
CMD ["./go-worker"]
