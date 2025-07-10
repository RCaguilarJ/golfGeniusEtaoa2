// document.addEventListener("DOMContentLoaded", async () => {
//   try {
//     const res = await fetch("api/api.php");
//     const data = await res.json();

//     console.log("DATA RECIBIDA:", data);

//     if (data.error) {
//       throw new Error(data.error + (data.detalle ? `: ${data.detalle}` : ""));
//     }

//     // Adaptamos: puede venir como data o data.tee_sheet
//     const teeSheet = Array.isArray(data) ? data : data.tee_sheet ?? [];

//     if (!Array.isArray(teeSheet)) {
//       throw new Error("La respuesta no es un arreglo válido");
//     }

//     const jugadores = [];

//     teeSheet.forEach((group) => {
//       if (!group.pairing_group || !group.pairing_group.players) return;

//       group.pairing_group.players.forEach((jugador) => {
//         const nombre = `${jugador.last_name}, ${jugador.first_name}`;
//         const afiliacion = jugador.affiliation || "";
//         const playerInfo = afiliacion ? `${nombre}\n${afiliacion}` : nombre;

//         const posicion = jugador.position ?? "-";
//         const vsPar = jugador.vs_par || "0";
//         const totalScore = jugador.total_score || 0;
//         const roundScores = jugador.round_scores || [];

//         // Asegurar que tenemos hasta 3 rondas (R1, R2, R3)
//         const r1 = roundScores[0] || "-";
//         const r2 = roundScores[1] || "-";
//         const r3 = roundScores[2] || "-";

//         jugadores.push({
//           posicion,
//           playerInfo,
//           vsPar,
//           r1,
//           r2,
//           r3,
//           totalScore,
//         });
//       });
//     });

//     console.log("JUGADORES PROCESADOS:", jugadores.length);

//     // Inyectamos jugadores en la nueva estructura
//     const tbody = document.getElementById("tabla-jugadores");
//     tbody.innerHTML = ""; // Limpia contenido previo

//     jugadores.forEach((j) => {
//       const tr = document.createElement("tr");

//       // Posición
//       const tdPos = document.createElement("td");
//       tdPos.textContent = j.posicion;
//       tr.appendChild(tdPos);

//       // Jugador (nombre + afiliación)
//       const tdPlayer = document.createElement("td");
//       tdPlayer.style.textAlign = "left";
//       if (j.playerInfo.includes("\n")) {
//         const lines = j.playerInfo.split("\n");
//         tdPlayer.innerHTML = `${lines[0]}<br><small class="text-muted">${lines[1]}</small>`;
//       } else {
//         tdPlayer.textContent = j.playerInfo;
//       }
//       tr.appendChild(tdPlayer);

//       // Total To Par
//       const tdToPar = document.createElement("td");
//       tdToPar.textContent = j.vsPar;
//       tr.appendChild(tdToPar);

//       // R1
//       const tdR1 = document.createElement("td");
//       tdR1.textContent = j.r1;
//       tr.appendChild(tdR1);

//       // R2
//       const tdR2 = document.createElement("td");
//       tdR2.textContent = j.r2;
//       tr.appendChild(tdR2);

//       // R3
//       const tdR3 = document.createElement("td");
//       tdR3.textContent = j.r3;
//       tr.appendChild(tdR3);

//       // Total Gross
//       const tdTotal = document.createElement("td");
//       tdTotal.textContent = j.totalScore;
//       tr.appendChild(tdTotal);

//       tbody.appendChild(tr);
//     });
//   } catch (err) {
//     console.error("Error al cargar datos:", err);
//     // Mostrar error en la tabla
//     const tbody = document.getElementById("tabla-jugadores");
//     tbody.innerHTML = `<tr><td colspan="7" class="text-danger">Error: ${err.message}</td></tr>`;
//   }
// });
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
        });
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

      // Jugador (nombre + afiliación con icono)
      const tdPlayer = document.createElement("td");
      tdPlayer.style.textAlign = "left";
      tdPlayer.classList.add("player-cell");

      if (j.playerInfo.includes("\n")) {
        const lines = j.playerInfo.split("\n");
        tdPlayer.innerHTML = `<span class="star-icon">★</span>${lines[0]}<br><small>${lines[1]}</small>`;
      } else {
        tdPlayer.innerHTML = `<span class="star-icon">★</span>${j.playerInfo}`;
      }
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
