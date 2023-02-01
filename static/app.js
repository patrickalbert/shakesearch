const Controller = {
  search: (ev) => {
    ev.preventDefault();
    const form = document.getElementById("form");
    const data = Object.fromEntries(new FormData(form));
    const response = fetch(`/search?q=${data.query}`).then((response) => {
      response.json().then((results) => {
        Controller.updateTable(results, query);
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
      console.log('result', result);
      rows.push(`<tr>${i++}<tr/>`);
      rows.push(`<tr>${result.LocationTitle}<tr/>`);
      rows.push(`<tr>${result.Result}<tr/>`);
      rows.push(`<hr />`);
    }
    table.innerHTML = rows;
  },

  // insertMarks: (string, query) => {
  //   const regex = new RegExp(query, "gi");
  //   return string.replace(regex, (query) => `<mark>${query}</mark>`);
  // },
};

const form = document.getElementById("form");
form.addEventListener("submit", Controller.search);
