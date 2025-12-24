package apiclient

import (
	"net/http"

	"github.com/samber/do/v2"
)

var Package = do.Package(
	do.Eager(&http.Client{
		Timeout: DefaultTimeout,
	}),
	do.Lazy(NewClientService),
)
