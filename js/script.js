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

  function renderTable(roundIndex) {
    tbody.innerHTML = "";

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