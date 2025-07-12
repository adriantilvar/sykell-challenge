package crawler

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"slices"
	"strconv"
	"strings"

	"golang.org/x/net/html"
)

type urlInfo struct {
	HtmlVersion        string `json:"htmlVersion"`
	Title              string `json:"pageTitle"`
	H1Count            int    `json:"h1Count"`
	H2Count            int    `json:"h2Count"`
	H3Count            int    `json:"h3Count"`
	H4Count            int    `json:"h4Count"`
	InternalLinksCount int    `json:"internalLinksCount"`
	ExternalLinksCount int    `json:"externalLinksCount"`
	BrokenLinksCount   int    `json:"brokenLinksCount"`
	HasLoginForm       bool   `json:"hasLoginForm"`
}

var IGNORED_TAGS = []string{"script", "link", "meta"}

func CrawlPage(baseUrl string) (*urlInfo, error) {
	res, getError := http.Get(baseUrl)
	if getError != nil {
		return nil, errors.New("could not connect to URL")
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return nil, fmt.Errorf("response status: %v (expected 200)", res.StatusCode)
	}

	doc, parseError := html.Parse(res.Body)
	if parseError != nil {
		return nil, errors.New("could not parse HTML body")
	}

	htmlVersion := getHtmlVersion(doc)
	title := getTag("^title$", doc)
	headings := make(map[string][]*html.Node)
	getAllTags(`h[1-4]`, doc, headings)
	links := getLinks(doc, baseUrl)
	hasLogin := containsLogin(doc)

	return &urlInfo{
		HtmlVersion:        htmlVersion,
		Title:              title.FirstChild.Data,
		H1Count:            len(headings["h1"]),
		H2Count:            len(headings["h2"]),
		H3Count:            len(headings["h3"]),
		H4Count:            len(headings["h4"]),
		InternalLinksCount: len(links["internal"]),
		ExternalLinksCount: len(links["external"]),
		BrokenLinksCount:   len(links["inaccessible"]),
		HasLoginForm:       hasLogin,
	}, nil
}

func getHtmlVersion(node *html.Node) string {
	if node.Type == html.DoctypeNode {
		if len(node.Attr) == 0 {
			return "HTML5"
		}

		public := node.Attr[0].Val
		public = strings.TrimPrefix(public, "-//W3C//DTD ")
		public = strings.TrimSuffix(public, "//EN")

		return public
	}

	for child := node.FirstChild; child != nil; child = child.NextSibling {
		if found := getHtmlVersion(child); found != "" {
			return found
		}
	}

	return ""
}

func getTag(pattern string, node *html.Node) *html.Node {
	re := regexp.MustCompile(pattern)

	if node.Type == html.ElementNode && re.MatchString(node.Data) {
		return node
	}

	for child := node.FirstChild; child != nil; child = child.NextSibling {
		if !slices.Contains(IGNORED_TAGS, child.Data) {
			if found := getTag(pattern, child); found != nil {
				return found
			}
		}
	}

	return nil
}

func getAllTags(pattern string, node *html.Node, result map[string][]*html.Node) {
	r := regexp.MustCompile(pattern)

	if node.Type == html.ElementNode && r.MatchString(node.Data) {
		result[node.Data] = append(result[node.Data], node)
	}

	for child := node.FirstChild; child != nil; child = child.NextSibling {
		if !slices.Contains(IGNORED_TAGS, child.Data) {
			getAllTags(pattern, child, result)
		}
	}
}

func getLinks(root *html.Node, baseUrl string) map[string][]string {
	links := make(map[string][]*html.Node)
	getAllTags("^a$", root, links)

	categorizedLinks := make(map[string][]string)

	for _, node := range links["a"] {
		href := getAttribute("href", node)
		if isLinkExternal(href, baseUrl) {
			categorizedLinks["external"] = append(categorizedLinks["external"], href)

			if isLinkBroken(href) {
				categorizedLinks["inaccessible"] = append(categorizedLinks["inaccessible"], href)
			}
		} else {
			categorizedLinks["internal"] = append(categorizedLinks["internal"], href)
		}
	}

	return categorizedLinks
}

func getAttribute(attributeName string, node *html.Node) string {
	for _, attr := range node.Attr {
		if attr.Key == attributeName {
			return attr.Val
		}
	}

	return ""
}

func isLinkExternal(link string, baseUrl string) bool {
	parsedRoot, err := url.Parse(baseUrl)
	if err != nil {
		panic(err)
	}

	domain := parsedRoot.Scheme + "://" + parsedRoot.Host
	return (strings.HasPrefix(link, "https://") || strings.HasPrefix(link, "http://")) &&
		!strings.HasPrefix(link, domain)
}

func isLinkBroken(link string) bool {
	req, err := http.NewRequest("GET", link, nil)
	if err != nil {
		panic(err)
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36")

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer res.Body.Close()

	status := strconv.Itoa(res.StatusCode)

	return strings.HasPrefix(status, "4") || strings.HasPrefix(status, "5")
}

func containsLogin(root *html.Node) bool {
	inputs := make(map[string][]*html.Node)
	getAllTags("input", root, inputs)

	return slices.ContainsFunc(inputs["input"], func(n *html.Node) bool {
		inputType := getAttribute("type", n)

		return inputType == "email" || inputType == "password"
	})
}
