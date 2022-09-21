const express = require("express");
const Express = express();
Express.use(express.json());

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

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

//return a list of all the players from the team
//API 1

const convertPlayerToResponseObject = (objectItem) => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
    jerseyNumber: objectItem.jersey_number,
    role: objectItem.role,
  };
};

Express.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from cricket_team`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) => convertPlayerToResponseObject(eachPlayer))
  );
});

//post a player into database
//API 2

Express.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = ` INSERT INTO cricket_team (player_name, jersey_number, role) VALUES (${playerName},${jerseyNumber},${role})`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//get the player details based on the player id
//API 3

Express.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `select * from cricket_team where player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertPlayerToResponseObject(player));
});

//update the details of the player using player id
//API 4

Express.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerQuery = ` update cricket_team set player_name = ${playerName},jersey_number = ${jerseyNumber},role = ${role} where player_id = ${playerId}`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//delete the player details
//API 5

Express.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE FROM
        cricket_team
    WHERE
        player_id = ${playerId}`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = Express;
