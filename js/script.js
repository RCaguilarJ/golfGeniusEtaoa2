document.addEventListener("DOMContentLoaded", () => {
  const roundSelect = document.getElementById("round-select");
  const tbody = document.getElementById("tabla-jugadores");

  // Cuando el usuario cambia de ronda
  roundSelect.addEventListener("change", () => {
    const roundId = roundSelect.value;
    obtenerDatos(roundId);
  });

  // Función que obtiene los datos del backend
  function obtenerDatos(roundId) {
    fetch(`api/api.php?round_id=${roundId}`)
      .then(res => res.json())
      .then(data => {
        // 🔎 Validación: asegurar que 'players' exista y sea un array
        if (!data.players || !Array.isArray(data.players)) {
          console.error("Los datos no contienen 'players':", data);
          tbody.innerHTML = `<tr><td colspan="22">⚠️ No hay datos disponibles para esta ronda.</td></tr>`;
          return;
        }

        // Renderizar la tabla con los jugadores
        renderTable(data.players);
      })
      .catch(error => {
        console.error("Error al obtener datos:", error);
        tbody.innerHTML = `<tr><td colspan="22">❌ Error al conectarse a la API.</td></tr>`;
      });
  }

  // Función que pinta la tabla
  function renderTable(players) {
    tbody.innerHTML = "";

    players.forEach(player => {
      const tr = document.createElement("tr");

      // POS
      const tdPos = document.createElement("td");
      tdPos.textContent = player.position ?? "-";
      tr.appendChild(tdPos);

      // PLAYER
      const tdName = document.createElement("td");
      tdName.textContent = `${player.last_name}, ${player.first_name}`;
      tr.appendChild(tdName);

      // UNDER
      const tdUnder = document.createElement("td");
      tdUnder.textContent = player.vs_par ?? "-";
      tr.appendChild(tdUnder);

      // HOLES 1–18
      const scores = player.round_hole_scores ?? [];
      for (let i = 0; i < 18; i++) {
        const td = document.createElement("td");
        td.textContent = scores[i] !== undefined ? scores[i] : "-";
        tr.appendChild(td);
      }

      // TOTAL
      const tdTotal = document.createElement("td");
      tdTotal.textContent = player.round_score ?? "-";
      tr.appendChild(tdTotal);

      tbody.appendChild(tr);
    });
  }

  // Cargar la ronda inicial al cargar la página
  obtenerDatos(roundSelect.value);
});
