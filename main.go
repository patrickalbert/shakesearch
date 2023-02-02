package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"index/suffixarray"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"regexp"
)

func main() {
	searcher := Searcher{}
	err := searcher.Load("completeworks.txt")
	if err != nil {
		log.Fatal(err)
	}

	titleErr := searcher.LoadWorkTitleIndexes()
	if titleErr != nil {
		log.Fatal(titleErr)
	}

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	http.HandleFunc("/search", handleSearch(searcher))

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	fmt.Printf("Listening on port %s...", port)
	err = http.ListenAndServe(fmt.Sprintf(":%s", port), nil)
	if err != nil {
		log.Fatal(err)
	}
}

type Searcher struct {
	CompleteWorks    string
	SuffixArray      *suffixarray.Index
	WorkTitleIndexes []WorkTitleResult
}

type SearchQuery struct {
	QueryString string
	MatchCase   bool
	WholeWord   bool
}

func handleSearch(searcher Searcher) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		query, ok := r.URL.Query()["q"]
		matchCase := r.URL.Query()["match-case"]
		wholeWord := r.URL.Query()["whole-word"]

		if !ok || len(query[0]) < 1 {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("missing search query in URL params"))
			return
		}

		activeQuery := SearchQuery{
			QueryString: query[0],
			MatchCase:   matchCase[0] == "true",
			WholeWord:   wholeWord[0] == "true",
		}

		results := searcher.Search(activeQuery)
		buf := &bytes.Buffer{}
		enc := json.NewEncoder(buf)
		err := enc.Encode(results)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("encoding failure"))
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(buf.Bytes())
	}
}

func (s *Searcher) Load(filename string) error {
	dat, err := ioutil.ReadFile(filename)
	if err != nil {
		return fmt.Errorf("Load: %w", err)
	}
	s.CompleteWorks = string(dat)
	s.SuffixArray = suffixarray.New(dat)
	return nil
}

type WorkTitleResult struct {
	WorkTitle      string
	WorkTitleIndex int
}

func (s *Searcher) LoadWorkTitleIndexes() error {

	// Since this is from the table of contents, we can safely assume that the titles indexs will be in descending sorted order
	workTitles := []string{
		"THE SONNETS",
		"ALL’S WELL THAT ENDS WELL",
		"THE TRAGEDY OF ANTONY AND CLEOPATRA",
		"AS YOU LIKE IT",
		"THE COMEDY OF ERRORS",
		"THE TRAGEDY OF CORIOLANUS",
		"CYMBELINE",
		"THE TRAGEDY OF HAMLET, PRINCE OF DENMARK",
		"THE FIRST PART OF KING HENRY THE FOURTH",
		"THE SECOND PART OF KING HENRY THE FOURTH",
		"THE LIFE OF KING HENRY THE FIFTH",
		"THE FIRST PART OF HENRY THE SIXTH",
		"THE SECOND PART OF KING HENRY THE SIXTH",
		"THE THIRD PART OF KING HENRY THE SIXTH",
		"KING HENRY THE EIGHTH",
		"KING JOHN",
		"THE TRAGEDY OF JULIUS CAESAR",
		"THE TRAGEDY OF KING LEAR",
		"LOVE’S LABOUR’S LOST",
		"THE TRAGEDY OF MACBETH",
		"MEASURE FOR MEASURE",
		"THE MERCHANT OF VENICE",
		"THE MERRY WIVES OF WINDSOR",
		"A MIDSUMMER NIGHT’S DREAM",
		"MUCH ADO ABOUT NOTHING",
		"THE TRAGEDY OF OTHELLO, MOOR OF VENICE",
		"PERICLES, PRINCE OF TYRE",
		"KING RICHARD THE SECOND",
		"KING RICHARD THE THIRD",
		"THE TRAGEDY OF ROMEO AND JULIET",
		"THE TAMING OF THE SHREW",
		"THE TEMPEST",
		"THE LIFE OF TIMON OF ATHENS",
		"THE TRAGEDY OF TITUS ANDRONICUS",
		"THE HISTORY OF TROILUS AND CRESSIDA",
		"TWELFTH NIGHT; OR, WHAT YOU WILL",
		"THE TWO GENTLEMEN OF VERONA",
		"THE TWO NOBLE KINSMEN",
		"THE WINTER’S TALE",
		"A LOVER’S COMPLAINT",
		"THE PASSIONATE PILGRIM",
		"THE PHOENIX AND THE TURTLE",
		"THE RAPE OF LUCRECE",
		"VENUS AND ADONIS",
	}

	workTitleResult := WorkTitleResult{}
	workTitleResultList := []WorkTitleResult{}

	for _, title := range workTitles {
		patternString := title
		// TODO: a smarter regex here would improve accuracy, but I got stuck with new line matching
		pattern := regexp.MustCompile(patternString)
		idxs := s.SuffixArray.FindAllIndex(pattern, -1)
		if len(idxs) > 1 {
			workTitleResult.WorkTitle = title
			workTitleResult.WorkTitleIndex = idxs[1][0]
			workTitleResultList = append(workTitleResultList, workTitleResult)
		} else {
			workTitleResult.WorkTitle = title
			workTitleResult.WorkTitleIndex = idxs[0][0]
			workTitleResultList = append(workTitleResultList, workTitleResult)
		}
	}

	s.WorkTitleIndexes = workTitleResultList
	return nil
}

type SearchResult struct {
	Result        string
	LocationTitle string
}

func (s *Searcher) Search(query SearchQuery) []SearchResult {
	pattern := regexp.MustCompile(genRegexPattern(query))
	slices := s.SuffixArray.FindAllIndex(pattern, -1)
	idxs := []int{}
	for _, slice := range slices {
		idxs = append(idxs, slice[0])
	}
	result := SearchResult{}
	resultList := []SearchResult{}

	for _, idx := range idxs {
		leftIdx := 0
		rightIdx := 1

		// Assumes work title indexes sorted in ascending order
		for rightIdx < len(s.WorkTitleIndexes) {
			if (idx > s.WorkTitleIndexes[leftIdx].WorkTitleIndex) && (idx < s.WorkTitleIndexes[rightIdx].WorkTitleIndex) {
				result.LocationTitle = s.WorkTitleIndexes[leftIdx].WorkTitle
				break
			} else {
				leftIdx++
				rightIdx++
			}
		}

		result.Result = s.CompleteWorks[idx-250 : idx+250]
		resultList = append(resultList, result)
	}
	return resultList
}

func genRegexPattern(query SearchQuery) string {
	pattern := query.QueryString

	if query.WholeWord {
		pattern = "\\b" + query.QueryString + "\\b"
	}

	if !query.MatchCase {
		pattern = "(?i)" + pattern
	}

	return pattern
}
