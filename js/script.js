// Variable global para almacenar datos de jugadores
let globalPlayerData = {};

// Variable global para rastrear las filas expandidas
let expandedRows = new Map();

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("api/api.php");
    const data = await res.json();

    console.log("DATA RECIBIDA:", data);

    if (data.error) {
      throw new Error(data.error + (data.detalle ? `: ${data.detalle}` : ""));
    }

    const teeSheet = Array.isArray(data) ? data : data.tee_sheet ?? [];
    if (!Array.isArray(teeSheet))
      throw new Error("La respuesta no es un arreglo válido");

    const jugadores = [];

    teeSheet.forEach((group) => {
      if (!group.pairing_group || !group.pairing_group.players) return;

      group.pairing_group.players.forEach((jugador) => {
        const nombre = `${jugador.last_name}, ${jugador.first_name}`;
        const afiliacion = jugador.affiliation || "";
        const playerInfo = afiliacion ? `${nombre}\n${afiliacion}` : nombre;

        const posicion = jugador.position ?? "-";
        const vsPar = jugador.vs_par || "0";
        const totalScore = jugador.total_score || 0;
        const roundScores = jugador.round_scores || [];

        const r1 = roundScores[0] || "-";
        const r2 = roundScores[1] || "-";
        const r3 = roundScores[2] || "-";

        jugadores.push({
          posicion,
          playerInfo,
          vsPar,
          r1,
          r2,
          r3,
          totalScore,
          fullName: nombre,
          firstName: jugador.first_name,
          lastName: jugador.last_name,
          affiliation: jugador.affiliation || "",
          roundHoleScores: jugador.round_hole_scores || [] // Agregar datos de scores por hoyo
        });

        // Almacenar en datos globales
        globalPlayerData[nombre] = {
          roundHoleScores: jugador.round_hole_scores || [],
          roundScores: roundScores
        };
      });
    });

    console.log("JUGADORES PROCESADOS:", jugadores.length);

    const tbody = document.getElementById("tabla-jugadores");
    tbody.innerHTML = "";

    jugadores.forEach((j) => {
      const tr = document.createElement("tr");

      // Posición
      const tdPos = document.createElement("td");
      tdPos.textContent = j.posicion;
      tr.appendChild(tdPos);

      // Jugador (nombre + afiliación con icono) - Clickeable
      const tdPlayer = document.createElement("td");
      tdPlayer.style.textAlign = "left";
      tdPlayer.classList.add("player-cell", "player-clickable");
      tdPlayer.style.cursor = "pointer";

      if (j.playerInfo.includes("\n")) {
        const lines = j.playerInfo.split("\n");
        tdPlayer.innerHTML = `<span class="star-icon">★</span>${lines[0]}<br><small>${lines[1]}</small>`;
      } else {
        tdPlayer.innerHTML = `<span class="star-icon">★</span>${j.playerInfo}`;
      }

      // Agregar evento de clic para expandir detalles
      tdPlayer.addEventListener("click", () => {
        togglePlayerDetails(tr, j);
      });

      tr.appendChild(tdPlayer);

      // Total To Par
      const tdToPar = document.createElement("td");
      tdToPar.textContent = j.vsPar;
      tr.appendChild(tdToPar);

      // R1
      const tdR1 = document.createElement("td");
      tdR1.textContent = j.r1;
      tr.appendChild(tdR1);

      // R2
      const tdR2 = document.createElement("td");
      tdR2.textContent = j.r2;
      tr.appendChild(tdR2);

      // R3
      const tdR3 = document.createElement("td");
      tdR3.textContent = j.r3;
      tr.appendChild(tdR3);

      // Total Gross
      const tdTotal = document.createElement("td");
      tdTotal.textContent = j.totalScore;
      tr.appendChild(tdTotal);

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error al cargar datos:", err);
    const tbody = document.getElementById("tabla-jugadores");
    tbody.innerHTML = `<tr><td colspan="7" class="text-danger">Error: ${err.message}</td></tr>`;
  }
});

function togglePlayerDetails(playerRow, playerData) {
  const playerId = `${playerData.playerInfo.split('\n')[0]}`; // Usar el nombre como ID único
  
  // Verificar si ya está expandido
  if (expandedRows.has(playerId)) {
    // Contraer: remover la fila de detalles
    const detailRow = expandedRows.get(playerId);
    if (detailRow && detailRow.parentNode) {
      detailRow.parentNode.removeChild(detailRow);
    }
    expandedRows.delete(playerId);
    playerRow.classList.remove('expanded');
    return;
  }

  // Contraer cualquier otra fila expandida
  expandedRows.forEach((detailRow, id) => {
    if (detailRow && detailRow.parentNode) {
      detailRow.parentNode.removeChild(detailRow);
    }
    // Remover clase expanded de todas las filas
    const allRows = document.querySelectorAll('tr.expanded');
    allRows.forEach(row => row.classList.remove('expanded'));
  });
  expandedRows.clear();

  // Expandir: crear nueva fila de detalles
  const detailRow = createPlayerDetailRow(playerData);
  playerRow.parentNode.insertBefore(detailRow, playerRow.nextSibling);
  
  // Marcar como expandido
  expandedRows.set(playerId, detailRow);
  playerRow.classList.add('expanded');
}

function createPlayerDetailRow(playerData) {
  const detailRow = document.createElement('tr');
  detailRow.classList.add('player-detail-row');
  
  const detailCell = document.createElement('td');
  detailCell.colSpan = 7;
  detailCell.style.backgroundColor = '#f8f9fa';
  detailCell.style.padding = '20px';
  
  // Fechas reales del torneo Stocker Cup
  const roundDates = [
    { date: 'Thu, October 17', name: 'R1', isActive: false },
    { date: 'Fri, October 18', name: 'R2', isActive: false },
    { date: 'Sat, October 19', name: 'R3', isActive: true } // Ronda actual
  ];

  detailCell.innerHTML = `
    <div class="player-details">
      <div class="round-selector">
        <div class="round-tabs">
          ${roundDates.map(round => `
            <button class="round-tab ${round.isActive ? 'active' : ''}" 
                    data-date="${round.date}" 
                    onclick="showRoundDetails('${round.date}', '${playerData.playerInfo.split('\n')[0]}')">
              ${round.date}
            </button>
          `).join('')}
        </div>
      </div>
      <div class="scorecard-container">
        <div id="scorecard-${playerData.playerInfo.split('\n')[0].replace(/[^a-zA-Z0-9]/g, '')}" class="scorecard">
          <!-- La scorecard se cargará dinámicamente -->
        </div>
      </div>
    </div>
  `;

  detailRow.appendChild(detailCell);

  // Mostrar la ronda activa por defecto
  setTimeout(() => {
    const activeRound = roundDates.find(r => r.isActive);
    if (activeRound) {
      showRoundDetails(activeRound.date, playerData.playerInfo.split('\n')[0]);
    }
  }, 100);

  return detailRow;
}

function showRoundDetails(date, playerName) {
  const cleanPlayerName = playerName.replace(/[^a-zA-Z0-9]/g, '');
  const scorecardContainer = document.getElementById(`scorecard-${cleanPlayerName}`);
  
  if (!scorecardContainer) return;

  // Actualizar tabs activos
  const parentRow = scorecardContainer.closest('.player-detail-row');
  const tabs = parentRow.querySelectorAll('.round-tab');
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.date === date);
  });

  // Encontrar los datos del jugador desde el contexto global
  let playerData = null;
  
  // Buscar en los jugadores procesados
  const tbody = document.getElementById("tabla-jugadores");
  const playerRows = tbody.querySelectorAll('tr');
  
  for (let row of playerRows) {
    const playerCell = row.querySelector('.player-clickable');
    if (playerCell && playerCell.textContent.includes(playerName.split(',')[0])) {
      // Encontrar los datos asociados a esta fila
      const playerIndex = Array.from(playerRows).indexOf(row);
      // Buscar en los datos globales
      break;
    }
  }

  // Mapear las fechas a índices de ronda
  const dateToRoundIndex = {
    'Thu, October 17': 0, // R1
    'Fri, October 18': 1,  // R2
    'Sat, October 19': 2   // R3
  };

  const roundIndex = dateToRoundIndex[date];
  
  // Obtener los datos del jugador actual desde el DOM
  const currentPlayerData = getCurrentPlayerData(playerName);
  
  if (!currentPlayerData || !currentPlayerData.roundHoleScores || !currentPlayerData.roundHoleScores[roundIndex]) {
    // Fallback a datos mock si no hay datos reales
    showMockRoundDetails(date, playerName, scorecardContainer);
    return;
  }

  const holeScores = currentPlayerData.roundHoleScores[roundIndex];
  const roundTotal = currentPlayerData.roundScores[roundIndex];

  // Calcular Out e In totales
  const outScores = holeScores.slice(0, 9);
  const inScores = holeScores.slice(9, 18);
  const outTotal = outScores.reduce((sum, score) => sum + (score || 0), 0);
  const inTotal = inScores.reduce((sum, score) => sum + (score || 0), 0);

  // Par estándar (esto debería venir de la API idealmente)
  const standardPar = [4, 4, 4, 4, 4, 4, 4, 5, 4, 4, 4, 4, 4, 3, 4, 3, 4, 5];

  // Función para determinar el color del score basado en par
  function getScoreClass(score, par) {
    const diff = score - par;
    if (diff <= -2) return 'eagle'; // Eagle o mejor
    if (diff === -1) return 'birdie'; // Birdie
    if (diff === 0) return 'par'; // Par
    if (diff === 1) return 'bogey'; // Bogey
    if (diff >= 2) return 'double-bogey'; // Double bogey o peor
    return 'par';
  }

  // Crear la scorecard con colores y datos reales
  scorecardContainer.innerHTML = `
    <div class="scorecard-header">
      <h4>${date} - Preserve Golf Club (The)</h4>
    </div>
    <table class="scorecard-table">
      <thead>
        <tr>
          <th></th>
          ${Array.from({length: 9}, (_, i) => `<th>${i + 1}</th>`).join('')}
          <th class="out-column">Out</th>
          ${Array.from({length: 9}, (_, i) => `<th>${i + 10}</th>`).join('')}
          <th class="in-column">In</th>
          <th class="total-column">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="player-name-cell">${playerName}</td>
          ${outScores.map((score, i) => 
            `<td class="score-cell ${getScoreClass(score, standardPar[i])}">${score || '-'}</td>`
          ).join('')}
          <td class="out-total">${outTotal}</td>
          ${inScores.map((score, i) => 
            `<td class="score-cell ${getScoreClass(score, standardPar[i + 9])}">${score || '-'}</td>`
          ).join('')}
          <td class="in-total">${inTotal}</td>
          <td class="grand-total">${roundTotal}</td>
        </tr>
      </tbody>
    </table>
    <div class="legend">
      <span class="legend-item"><span class="legend-color eagle"></span> Eagle or Better</span>
      <span class="legend-item"><span class="legend-color birdie"></span> Birdie</span>
      <span class="legend-item"><span class="legend-color par"></span> Par</span>
      <span class="legend-item"><span class="legend-color bogey"></span> Bogey</span>
      <span class="legend-item"><span class="legend-color double-bogey"></span> Dbl. Bogey</span>
    </div>
  `;
}

// Función auxiliar para obtener los datos del jugador actual
function getCurrentPlayerData(playerName) {
  // Buscar en los datos globales
  return globalPlayerData[playerName] || null;
}

// Función fallback para mostrar datos mock
function showMockRoundDetails(date, playerName, container) {
  // Datos de ejemplo basados en Schultz, Jack de la imagen
  const mockScoreData = {
    'Thu, October 17': { 
      scores: [4, 3, 4, 4, 4, 3, 4, 6, 4, 36, 5, 4, 4, 5, 3, 5, 3, 5, 6, 40], 
      total: 76,
      course: 'Preserve Golf Club (The) (Stocker Cup Black RND 1)',
      par: [4, 4, 4, 4, 4, 4, 4, 5, 4, 37, 4, 4, 4, 4, 3, 4, 3, 4, 5, 35]
    },
    'Fri, October 18': { 
      scores: [4, 3, 4, 5, 4, 4, 4, 4, 4, 36, 3, 3, 3, 5, 2, 3, 3, 3, 4, 29], 
      total: 65,
      course: 'Preserve Golf Club (The) (Stocker Cup Black RND 2)',
      par: [4, 4, 4, 4, 4, 4, 4, 5, 4, 37, 4, 4, 4, 4, 3, 4, 3, 4, 5, 35]
    },
    'Sat, October 19': { 
      scores: [4, 3, 4, 4, 4, 4, 4, 4, 4, 35, 4, 3, 4, 4, 4, 4, 3, 4, 4, 34], 
      total: 69,
      course: 'Preserve Golf Club (The) (Stocker Cup Blue RND 3)',
      par: [4, 4, 4, 4, 4, 4, 4, 5, 4, 37, 4, 4, 4, 4, 3, 4, 3, 4, 5, 35]
    }
  };

  const roundData = mockScoreData[date];
  if (!roundData) return;

  // Función para determinar el color del score basado en par
  function getScoreClass(score, par) {
    const diff = score - par;
    if (diff <= -2) return 'eagle'; // Eagle o mejor
    if (diff === -1) return 'birdie'; // Birdie
    if (diff === 0) return 'par'; // Par
    if (diff === 1) return 'bogey'; // Bogey
    if (diff >= 2) return 'double-bogey'; // Double bogey o peor
    return 'par';
  }

  // Crear la scorecard con colores
  container.innerHTML = `
    <div class="scorecard-header">
      <h4>${date} - ${roundData.course}</h4>
    </div>
    <table class="scorecard-table">
      <thead>
        <tr>
          <th></th>
          ${Array.from({length: 9}, (_, i) => `<th>${i + 1}</th>`).join('')}
          <th class="out-column">Out</th>
          ${Array.from({length: 9}, (_, i) => `<th>${i + 10}</th>`).join('')}
          <th class="in-column">In</th>
          <th class="total-column">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="player-name-cell">${playerName}</td>
          ${roundData.scores.slice(0, 9).map((score, i) => 
            `<td class="score-cell ${getScoreClass(score, roundData.par[i])}">${score}</td>`
          ).join('')}
          <td class="out-total">${roundData.scores[9]}</td>
          ${roundData.scores.slice(10, 19).map((score, i) => 
            `<td class="score-cell ${getScoreClass(score, roundData.par[i + 10])}">${score}</td>`
          ).join('')}
          <td class="in-total">${roundData.scores[19]}</td>
          <td class="grand-total">${roundData.total}</td>
        </tr>
      </tbody>
    </table>
    <div class="legend">
      <span class="legend-item"><span class="legend-color eagle"></span> Eagle or Better</span>
      <span class="legend-item"><span class="legend-color birdie"></span> Birdie</span>
      <span class="legend-item"><span class="legend-color par"></span> Par</span>
      <span class="legend-item"><span class="legend-color bogey"></span> Bogey</span>
      <span class="legend-item"><span class="legend-color double-bogey"></span> Dbl. Bogey</span>
    </div>
  `;
}
