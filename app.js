const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const Express = express();
Express.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    Express.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

Express.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
    *
    FROM
    cricket_team
    ORDER BY 
    player_id
    `;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

Express.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO
        cricket_team (player_name, jersey_number, role)
    VALUES
        (
            ${player_name},
            ${jersey_number},
            ${role},
        )`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});
Express.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
        *
    FROM
        cricket_team
    WHERE
        player_id = ${playerId}`;
  const player = await db.get(getPlayerQuery);
  response.send(player);
});
Express.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const updatedPlayerDetails = request.body;
  const { player_name, jersey_number, role } = updatedPlayerDetails;
  const updatePlayerQuery = `
    UPDATE
        cricket_team
    SET
        player_name = ${player_name},
        jersey_number = ${jersey_number},
        role = ${role}`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});
Express.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE
        cricket_team
    WHERE
        player_id = ${playerId}`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});
