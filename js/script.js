// js/script.js

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("api/api.php");
        const data = await res.json();

        const jugadores = [];
        const parFila = [];

        // Recorremos los grupos de jugadores
        data.forEach(group => {
            if (!group.pairing_group || !group.pairing_group.players) return;

            group.pairing_group.players.forEach(jugador => {
                const nombre = `${jugador.last_name}, ${jugador.first_name.charAt(0)}.`;
                const scores = jugador.score_array || [];
                const par = jugador.tee?.hole_data?.par || [];
                const posicion = jugador.position ?? "-";

                // Guardamos solo una vez el PAR
                if (parFila.length === 0) {
                    parFila.push(...par);
                }

                // Calcular total y vs par
                const total = scores.reduce((sum, val) => sum + (val || 0), 0);
                const totalPar = par.reduce((sum, val) => sum + val, 0);
                const vsPar = total - totalPar;
                const vsParStr = vsPar > 0 ? `+${vsPar}` : `${vsPar}`;

                jugadores.push({ posicion, nombre, scores, vsPar: vsParStr });
            });
        });

        // Inyectamos PAR
        const filaPar = document.querySelector("#fila-par tr");
        for (let i = 0; i < 18; i++) {
            const th = document.createElement("th");
            th.classList.add("fila2");
            th.textContent = parFila[i] || "-";
            filaPar.appendChild(th);
        }

        // Inyectamos jugadores
        const tbody = document.getElementById("tabla-jugadores");
        jugadores.forEach(j => {
            const tr = document.createElement("tr");

            // Posición
            const tdPos = document.createElement("td");
            tdPos.textContent = j.posicion;
            tr.appendChild(tdPos);

            // Nombre
            const tdNombre = document.createElement("td");
            tdNombre.textContent = j.nombre;
            tr.appendChild(tdNombre);

            // Scores por hoyo
            for (let i = 0; i < 18; i++) {
                const td = document.createElement("td");
                td.textContent = j.scores[i] ?? "-";
                tr.appendChild(td);
            }

            // Agregamos fila
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Error al cargar datos:", err);
    }
});
