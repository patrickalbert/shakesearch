const Controller = {
  search: (ev) => {
    ev.preventDefault();
    const form = document.getElementById("form");
    const data = Object.fromEntries(new FormData(form));
    const matchCaseToggle = !!data['match-case'];
    const wholeWordToggle = !!data['whole-word'];

    const requestPath = `/search?q=${data.query}&match-case=${matchCaseToggle}&whole-word=${wholeWordToggle}`
    console.log('requestPath', requestPath);

    const response = fetch(requestPath).then((response) => {
      response.json().then((results) => {
        Controller.updateTable(results, data.query, matchCaseToggle, wholeWordToggle);
      });
    });
  },

  updateTable: (results, query, matchCaseToggle, wholeWordToggle) => {
    const table = document.getElementById("table-body");
    const resultCount = document.getElementById("result-count");
    resultCount.innerText = `Results: ${results.length}`;
    const rows = [];
    let i = 1;
    for (let result of results) {
      const markedResult = Controller.insertMarks(result.Result, query);
      rows.push(`
        <div>
          <strong># ${i++}</strong><br />
          <blockquote>${markedResult}</blockquote><br />
          <i>${result.LocationTitle}</i><br />
        <div>
      `);
      rows.push(`<hr />`);
    }
    table.innerHTML = rows.join(" ");
  },

  insertMarks: (text, query, matchCaseToggle, wholeWordToggle) => {
    // fix the highlights based on toggles
    const pattern = new RegExp(query, "gi");
    const markedResult = text.replace(pattern, '<mark>$&</mark>');
    return markedResult
  },
};

const form = document.getElementById("form");
form.addEventListener("submit", Controller.search);
