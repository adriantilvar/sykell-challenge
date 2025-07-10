package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type urlInfo struct {
	ID                 string `json:"id"`
	HTMLVersion        string `json:"htmlVersion"`
	PageTitle          string `json:"pageTitle"`
	H1Count            int    `json:"h1Count"`
	H2Count            int    `json:"h2Count"`
	H3Count            int    `json:"h3Count"`
	H4Count            int    `json:"h4Count"`
	InternalLinksCount int    `json:"internalLinksCount"`
	ExternalLinksCount int    `json:"externalLinksCount"`
	BrokenLinksCount   int    `json:"brokenLinksCount"`
	HasLoginForm       bool   `json:"hasLoginForm"`
}

var info = []urlInfo{
	{"1", "HTML5", "Example Site 1", 1, 3, 2, 0, 10, 5, 1, false},
	{"2", "HTML 4.01 Transitional", "Legacy Webpage", 2, 1, 0, 0, 7, 2, 0, true},
	{"3", "HTML5", "Corporate Portal", 1, 5, 4, 2, 20, 8, 3, true},
	{"4", "XHTML 1.0 Strict", "Blog - Tech Thoughts", 1, 6, 3, 1, 12, 10, 0, false},
}

func main() {
	router := gin.Default()
	router.GET("/urls", getUrls)

	router.Run("localhost:1534")
}

func getUrls(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, info)
}
