import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [matchCaseToggle, setMatchCaseToggle] = useState(false);
  const [queryResults, setQueryResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [readingPanelContent, setReadingPanelContent] = useState('');
  
  
  useEffect(() => {
    if (queryResults.length > 0 && currentIndex > 0) {
      const requestPath = `http://localhost:3001/reader?idx=${currentIndex}`
      const response = fetch(requestPath).then((response) => {
        response.json().then((result) => {
          setReadingPanelContent(result.PageText)
        });
      });
    }
  }, [currentIndex, readingPanelContent, queryResults])

  const handleSubmit = (values) => {
    const queryValue = values.query;
    const matchCaseValue = values.matchCase;
    const wholeWordValue = values.wholeWord;
    setQuery(queryValue);
    setMatchCaseToggle(matchCaseValue);

    const requestPath = `http://localhost:3001/search?q=${queryValue}&match-case=${matchCaseValue}&whole-word=${wholeWordValue}`

    const response = fetch(requestPath).then((response) => {
      response.json().then((results) => {
        setQueryResults(results)
      });
    });

    setCurrentIndex(0);
  }

  const insertMarks = (text) => {
    const patternFlags = matchCaseToggle ? 'g' : 'gi';
    const pattern = new RegExp(query, patternFlags);
    const markedResult = text.replace(pattern, '<mark>$&</mark>');
    return markedResult;
  }

  const handleResultClick = (matchIndex) => {
    console.log('handleResultClick', matchIndex);
    setCurrentIndex(matchIndex);
    const requestPath = `http://localhost:3001/reader?idx=${matchIndex}`
    const response = fetch(requestPath).then((response) => {
      response.json().then((result) => {
        setReadingPanelContent(result.PageText)
      });
    });
  }

  const fetchPreviousPage = () => {
    // TODO: look at this
    if (currentIndex < 4000) {
      setCurrentIndex(2000)
    }
    if (currentIndex > 4000) {
      setCurrentIndex(currentIndex - 4000)
    }
  }
  
  const fetchNextPage = () => {
    setCurrentIndex(currentIndex + 4000)
  }

  return (
    <div className="App">
      <h1>ShakeSearch</h1>
      <Container>
        <Row>
          <Formik
              initialValues={{
                query: '',
                matchCase: false,
                wholeWord: false,
              }}
              validate={values => {
                const errors = {};
                if (!values.query) {
                  errors.query = 'Please enter a search query';
                }
                return errors;
              }}
              onSubmit={handleSubmit}
            >
              <Form>
                <div className="form-controls">
                  <div className="form-item">
                    <Field type="text" id="query" name="query" placeholder="Enter your query" />  
                    <ErrorMessage className="error-message" name="query" component="span" />
                  </div>
                  <div className="form-item">
                    <label>
                      Match Case
                      <Field type="checkbox" id="matchCase" name="matchCase" />
                    </label>
                  </div>
                  <div className="form-item">
                    <label>
                      Whole Word
                      <Field type="checkbox" id="wholeWord" name="wholeWord" />
                    </label>  
                  </div>
                  <div className="form-item">
                    <Button variant="primary" type="submit">Search</Button> 
                  </div>
                </div>
              </Form>
            </Formik>
        </Row>
        <Row>
          {queryResults.length > 0 && (
            <strong>{`Results: ${queryResults.length}`}</strong>
          )}
          <Col sm={ currentIndex > 0 ? 6 : 12 }>
            <div className="search-results-panel overflow-scroll">
              {queryResults.length > 0 && queryResults.map((result, index) => (
                <div key={`result-${index}`} className="search-result" onClick={() => handleResultClick(result.Index)}>
                  <strong>Result # {index + 1}</strong><br />
                  <div className="result-text" dangerouslySetInnerHTML={{__html: insertMarks(result.Result)}}></div>
                  <strong><i>{result.LocationTitle}</i></strong>
                  <hr />
                </div>
              ))}
            </div>
          </Col>
          {currentIndex > 0 && (
            <Col sm={6}>
              <Button className="page-nav-btn" variant="light" onClick={() => fetchPreviousPage()}>Previous Page</Button>
              <Button className="page-nav-btn" variant="light" onClick={() => fetchNextPage()}>Next Page</Button>
              <Button className="page-nav-btn" variant="danger" onClick={() => setCurrentIndex(0)}>X</Button>
              <div className="reading-panel overflow-scroll">
                <div className="result-text" dangerouslySetInnerHTML={{__html: insertMarks(readingPanelContent)}}></div>
              </div>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
}

export default App;