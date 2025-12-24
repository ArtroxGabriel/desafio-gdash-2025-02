package apiclient

import "fmt"

type ClientError struct {
	StatusCode int
	Message    string
}

func (e *ClientError) Error() string {
	return fmt.Sprintf("api client error (status %d): %s", e.StatusCode, e.Message)
}
