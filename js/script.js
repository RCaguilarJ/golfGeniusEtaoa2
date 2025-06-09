document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "api/fetch_gg_data.php"; // <-- cambio aquí

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            console.log("Respuesta de la API:", data);
            if (!Array.isArray(data)) {
                throw new Error("La respuesta no es un array como se esperaba.");
            }

            const filaPar = document.querySelector("#fila-par tr");
            const cuerpoJugadores = document.querySelector("#tabla-jugadores");

            data.forEach((grupo, index) => {
                const jugadores = grupo.pairing_group?.players;
                if (Array.isArray(jugadores) && jugadores.length > 0) {
                    const jugador = jugadores[0];

                    if (index === 0 && jugador.tee?.hole_data?.par) {
                        jugador.tee.hole_data.par.forEach(valor => {
                            const td = document.createElement("td");
                            td.textContent = valor;
                            filaPar.appendChild(td);
                        });
                    }

                    jugadores.forEach(jugador => {
                        const fila = document.createElement("tr");
                        fila.innerHTML = `
                            <td>${jugador.position || "-"}</td>
                            <td>${jugador.last_name || "-"}</td>
                            ${jugador.score_array.slice(0, 18).map(score => `<td>${score ?? ''}</td>`).join('')}
                        `;
                        cuerpoJugadores.appendChild(fila);
                    });
                }
            });
        })
        .catch(error => {
            console.error("Error al cargar datos de la API:", error);
        });
});
