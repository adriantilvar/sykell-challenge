package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"crawler"
)

func main() {
	router := gin.Default()
	router.GET("/url-info", getUrlInfo)

	router.Run("localhost:1534")
}

func getUrlInfo(c *gin.Context) {
	urlInfo, err := crawler.CrawlPage(c.Query("url"))
	if err != nil {
		log.Fatal(err)
		c.JSON(http.StatusInternalServerError, nil)
	}

	c.JSON(http.StatusOK, urlInfo)
}
