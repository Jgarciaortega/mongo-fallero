const Puntuacion = require('../models/puntuacion.model.js');

//Modificar puntuacion
exports.update = (req, res) => {

    let puntuacionId = req.params.puntuacionId;
    let update = req.body;

    Puntuacion.findByIdAndUpdate(puntuacionId, update,  (err, puntuacionUpdated) =>{

       if (err) res.status(500).send({message: `Error al actualizar la puntuacion: ${err}`})

       res.status(200).send({ product:puntuacionUpdated })
    })
    
};

//Borrar puntuacion
exports.delete = (req, res) => {
    let puntuacionId = req.params.puntuacionId;

    Puntuacion.findById(puntuacionId, (err, puntuacion) => {

        if (err) res.status(500).send({message: `Error al borrar la puntuacion: ${err}`})

        puntuacion.remove(err => {

           if (err) res.status(500).send({message: `Error al borrar la puntuacion: ${err}`})
            res.status(200).send({message: 'El producto ha sido eliminado'})
        })

    }) 
};

// Obtener todos los puntuaciones
exports.findAll = (req, res) => {

    Puntuacion.find().then(puntuaciones => {
        res.send(puntuaciones);
    }).catch(err => {
        res.status(500).send({
            message: err.message || " Algo fue mal mientras los capturabamos a todos"
        });
    });

};

//Encontrar si existe la votacion del usuario (coincide idFalla & ip)
exports.existe = (req, res) => {

    Puntuacion.find({ "idFalla": req.params.idFalla, "ip": req.params.ip })
        .then(coincidencias => {

            if (coincidencias == '') res.send(false);
            else res.send(coincidencias);

        }).catch(err => {
            res.status(500).send({
                message: err.message || " Algo fue mal mientras los capturabamos a todos"
            });
        });

};

// Crear y salvar
exports.create = (req, res) => {

    // Validamos el puntuacion
    if (!req.body) {
        console.log(req.body);
        return res.status(400).send({
            message: "puntuacion Vacio..."
        });
    }

    const puntuacion = new Puntuacion({
        idFalla: req.body.idFalla || "idFallaVacio",
        ip: req.body.ip || "127.0.0.1",
        puntuacion: req.body.puntuacion || 42
    })

    puntuacion.save().then(data => {
        res.send(data);
        console.log(res);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Something was wrong creating puntuacion"
        });
    });

};


