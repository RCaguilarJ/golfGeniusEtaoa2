document.addEventListener("DOMContentLoaded", () => {
  const eventSelect = document.getElementById("event-select");
  const roundSelect = document.getElementById("round-select");
  const tournamentSelect = document.getElementById("tournament-select");
  
  // 🎯 Crear contenedor de tabla dinámicamente
  const container = document.querySelector(".container");
  
  // 📅 Eventos de los selectores - cualquier cambio verifica si está completo
  eventSelect.addEventListener("change", verificarYCargar);
  roundSelect.addEventListener("change", verificarYCargar);
  tournamentSelect.addEventListener("change", verificarYCargar);

  function verificarYCargar() {
    console.log('Event:', eventSelect.value);
    console.log('Round:', roundSelect.value);
    console.log('Tournament Result:', tournamentSelect.value);
    
    if (eventSelect.value && roundSelect.value && tournamentSelect.value) {
      obtenerDatos();
    } else {
      // Mostrar mensaje de selección
      container.innerHTML = `
        <div class="table-responsive">
          <div class="selection-message">
            <h3>⚠️ Selecciona todos los campos</h3>
            <p>Por favor selecciona un <strong>Event</strong>, <strong>Round</strong> y <strong>Tournament</strong> para ver los resultados.</p>
          </div>
        </div>
      `;
    }
  }

  // 🔄 Función que obtiene los datos del backend
  function obtenerDatos() {
    const eventId = eventSelect.value;
    const roundId = roundSelect.value;
    const tournamentId = tournamentSelect.value;

    console.log('Obteniendo datos con:', {eventId, roundId, tournamentId});
    mostrarCargando();

    const url = `api/api.php?event_id=${eventId}&round_id=${roundId}&tournament_id=${tournamentId}`;
    console.log('URL completa:', url);
    
    fetch(url)
      .then(res => {
        console.log('Respuesta HTTP:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Datos recibidos:', data); 
        
        if (data.error) {
          mostrarError(`Error de API: ${data.error}`);
          return;
        }

        if (!data.players || !Array.isArray(data.players)) {
          console.error("Los datos no contienen 'players':", data);
          mostrarError("No hay datos disponibles para esta configuración.");
          return;
        }

        console.log('Renderizando tabla con', data.players.length, 'jugadores');
        crearTablaDinamica(data.players);
      })
      .catch(error => {
        console.error("Error al obtener datos:", error);
        mostrarError(`Error al conectarse a la API: ${error.message}`);
      });
  }

  // 🎨 Función que crea la tabla completa dinámicamente
  function crearTablaDinamica(players) {
    if (players.length === 0) {
      mostrarError("No hay jugadores en esta configuración.");
      return;
    }

    // Crear estructura de tabla completa
    container.innerHTML = `
      <div class="table-responsive">
        <table class="scorecard-table">
          <thead>
            <tr>
              <th>POS</th>
              <th>PLAYER</th>            
              <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th>
              <th>10</th><th>11</th><th>12</th><th>13</th><th>14</th><th>15</th><th>16</th><th>17</th><th>18</th>
              <th>UNDER</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody id="tabla-jugadores">
          </tbody>
        </table>
      </div>
    `;

    // Obtener el nuevo tbody y renderizar datos
    const tbody = document.getElementById("tabla-jugadores");
    renderTable(players, tbody);
  }

  // 🎨 Función que pinta los datos en la tabla
  function renderTable(players, tbody) {
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
      tdName.classList.add("player-name"); 
      tr.appendChild(tdName);

      // HOLES 1–18
      const scores = player.round_hole_scores ?? [];
      for (let i = 0; i < 18; i++) {
        const td = document.createElement("td");
        td.textContent = scores[i] !== undefined ? scores[i] : "-";
        tr.appendChild(td);
      }

      // UNDER
      const tdUnder = document.createElement("td");
      tdUnder.textContent = player.vs_par ?? "-";
      tr.appendChild(tdUnder);

      // TOTAL
      const tdTotal = document.createElement("td");
      tdTotal.textContent = player.round_score ?? "-";
      tr.appendChild(tdTotal);

      tbody.appendChild(tr);
    });
  }

  // ⏳ Mostrar estado de carga
  function mostrarCargando() {
    container.innerHTML = `
      <div class="table-responsive">
        <div class="loading-message">
          <h3>⏳ Cargando datos...</h3>
          <p>Obteniendo información de la API...</p>
        </div>
      </div>
    `;
  }

  // ⚠️ Mostrar mensaje de error
  function mostrarError(mensaje) {
    container.innerHTML = `
      <div class="table-responsive">
        <div class="error-message">
          <h3>⚠️ Error</h3>
          <p>${mensaje}</p>
        </div>
      </div>
    `;
  }

  // 🚀 Inicializar con mensaje de selección
  verificarYCargar();
});
