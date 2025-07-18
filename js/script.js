document.addEventListener("DOMContentLoaded", () => {
  const roundSelect = document.getElementById("round-select");
  const tbody = document.getElementById("tabla-jugadores");

  let players = [];

  fetch("api/api.php")
    .then(res => res.json())
    .then(data => {
      players = data;
      renderTable(roundSelect.value);
    });

  roundSelect.addEventListener("change", () => {
    renderTable(roundSelect.value);
  });
  function renderPlayersTable(jugadores) {
  const tbody = document.getElementById("tabla-jugadores");
  const table = tbody.closest("table");
  const thead = table.querySelector("thead");

  // Limpiar encabezado
  thead.innerHTML = "";

  // Crear fila principal de encabezado
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `
    <th>POS.</th>
    <th>PLAYER</th>
    <th>UNDER</th>
    ${Array.from({ length: 18 }, (_, i) => `<th>${i + 1}</th>`).join("")}
    <th>Total</th>
  `;
  thead.appendChild(headerRow);

  // Limpiar cuerpo
  tbody.innerHTML = "";

  jugadores.forEach((j) => {
    const tr = document.createElement("tr");

    // Posición
    tr.innerHTML += `<td>${j.posicion}</td>`;

    // Jugador
    tr.innerHTML += `
      <td style="text-align:left;">
        ${j.firstName} ${j.lastName}<br>
        <small>${j.affiliation}</small>
      </td>
    `;

    // Under par
    tr.innerHTML += `<td>${j.vsPar}</td>`;

    // Hoyos (última ronda disponible)
    const roundIndex = j.roundHoleScores.length - 1;
    const scores = j.roundHoleScores[roundIndex] || [];

    for (let h = 0; h < 18; h++) {
      tr.innerHTML += `<td>${scores[h] ?? "-"}</td>`;
    }

    // Total
    const total = j.roundScores[roundIndex] ?? "-";
    tr.innerHTML += `<td>${total}</td>`;

    tbody.appendChild(tr);
  });
}
  function renderTable(roundIndex) {
    tbody.innerHTML = "";

    // Crear encabezado principal
    const table = tbody.closest("table");
    const thead = table.querySelector("thead");
    thead.innerHTML = "";

    // Fila principal
    const mainHeaderRow = document.createElement("tr");
    mainHeaderRow.innerHTML = `
      <th>POS.</th>
      <th>PLAYER</th>
      <th>UNDER</th>
      <th colspan="18">HOLES</th>
      <th>TOTAL</th>
    `;
    thead.appendChild(mainHeaderRow);

    // Fila de hoyos
    const holesHeaderRow = document.createElement("tr");
    holesHeaderRow.innerHTML = `
      <th></th>
      <th></th>
      <th></th>
      ${Array.from({ length: 18 }, (_, i) => `<th>${i + 1}</th>`).join("")}
      <th></th>
    `;
    thead.appendChild(holesHeaderRow);

    players.forEach(player => {
      const tr = document.createElement("tr");

      const tdPos = document.createElement("td");
      tdPos.textContent = player.position;
      tr.appendChild(tdPos);

      const tdName = document.createElement("td");
      tdName.textContent = `${player.last_name}, ${player.first_name}`;
      tr.appendChild(tdName);

      const tdUnder = document.createElement("td");
      tdUnder.textContent = player.vs_par;
      tr.appendChild(tdUnder);

      const holeScores = player.round_hole_scores[roundIndex] || [];

      for (let i = 0; i < 18; i++) {
        const td = document.createElement("td");
        td.textContent = holeScores[i] !== undefined ? holeScores[i] : "-";
        tr.appendChild(td);
      }

      const tdTotal = document.createElement("td");
      tdTotal.textContent = player.round_scores[roundIndex] || "-";
      tr.appendChild(tdTotal);

      tbody.appendChild(tr);
    });
  }
});