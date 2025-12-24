// Import du module Express
const express = require("express");
const app = express();

// Définit le port donné par Infomaniak ou 3000 par défaut
const port = process.env.PORT || 3000;

// Sert les fichiers de ton dossier "public" (HTML, CSS, images, etc.)
app.use(express.static("public"));

// Exemple de route
app.get("/", (req, res) => {
  res.send("Hello depuis ton serveur Node.js 🚀");
});

// Démarre le serveur
app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});
