const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Paginas publicas (estaticas)
app.use(express.static(path.join(__dirname, 'public')));

// Escuchemos en un puerto
app.listen(port, () => {
    console.log("Estoy en http://localhost:" + port);
});