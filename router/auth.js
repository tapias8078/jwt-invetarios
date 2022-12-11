const {Router} = require('express')
const {validationResult, check} = require('express-validator')
const Usuario = require('../models/Usuario')
const bcript = require('bcryptjs')
const {generarJWT} = require('../helpers/jwt')

const router = Router()

router.post('/', [
    check('email','email.requerido').isEmail(),
    check('contrasena','contrasena.requerida').not().isEmpty()

],async function(req,res){
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({mensaje: errors.array()})

        }

        const usuario = await Usuario.findOne({email: req.body.email})
        if(!usuario){
            return res.status(400).json({mensaje:'Usuario no encontrado'})
        }

        const esIgual = bcript.compareSync(req.body.contrasena, usuario.contrasena)// debuelve true o false

        if(!esIgual){
            return res.status(400).json({mensaje: 'Usuario no encontrado'})
        }

        const token = generarJWT(usuario)


        res.json({ _id: usuario._id, nombre: usuario.nombre, email: usuario.email, 
           rol: usuario.rol, acces_token: token})

    } catch (error) {
        console.log(error);
        res.status(500).json({mensaje:'internal server error'})

    }
})

module.exports = router