const Controller = {
  search: (ev) => {
    ev.preventDefault();
    const form = document.getElementById("form");
    const data = Object.fromEntries(new FormData(form));
    const response = fetch(`/search?q=${data.query}`).then((response) => {
      response.json().then((results) => {
        Controller.updateTable(results, data.query);
      });
    });
  },

  updateTable: (results, query) => {
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
          ${result.LocationTitle}<br />
          ${markedResult}<br />
        <div>
      `);
      rows.push(`<hr />`);
    }
    table.innerHTML = rows.join(" ");
  },

  insertMarks: (text, query) => {
    const pattern = new RegExp(query, "gi");
    const markedResult = text.replace(pattern, `<mark>${query}</mark>`);
    return markedResult
  },
};

const form = document.getElementById("form");
form.addEventListener("submit", Controller.search);
