module.exports = (app) => {
    const puntuaciones = require('../controllers/puntuacion.controller.js');

    // Create a new puntuaciones
    app.post('/api/puntuaciones', puntuaciones.create);

    // Retrieve all puntuaciones
    app.get('/api/puntuaciones', puntuaciones.findAll);

    // Retrieve las puntuaciones en las que coincida la idFalla e IP
    app.get('/api/puntuaciones/existe/:idFalla/:ip', puntuaciones.existe);

    // Update a puntuaciones with puntuacionId
    app.put('/api/puntuaciones/:puntuacionId', puntuaciones.update);

    // Delete a puntuaciones with puntuacionId
    app.delete('/api/puntuaciones/:puntuacionId', puntuaciones.delete);
}