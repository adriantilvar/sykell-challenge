package main

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"crawler"
)

func main() {
	router := gin.Default()
	router.Use(corsMiddleware())

	router.GET("/url-info", getUrlInfo)

	router.Run("localhost:1534")
}

func getUrlInfo(c *gin.Context) {
	urlInfo, err := crawler.CrawlPage(c.Query("url"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, urlInfo)
}

func corsMiddleware() gin.HandlerFunc {
	allowedOrigin := "http://localhost:3000"

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		if origin == allowedOrigin {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
