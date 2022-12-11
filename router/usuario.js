const { Router } = require("express");
const { validationResult, check } = require("express-validator");
const { validarJWT } = require('../middleware/validar-jwt')
const { validarRolAdmin } = require('../middleware/validar-rol-admin')

const Usuario = require("../models/Usuario");
const bcript = require('bcryptjs')

const router = Router();

router.post("/",
  [
    check("nombre", "invalid.nombre").not().isEmpty(),
    check("email", "invalid.email").isEmail(),
    check("rol", "invalid.rol").isIn(["Administrador", "Docente"]),
    check('estado','invalid.estado').isIn(['Activo','Inactivo']),
    check("contrasena", "invalid.contrasena").not().isEmpty(),
    validarJWT,
    validarRolAdmin,
  ],
  async function (req, res) {
    try {
      console.log(req.body);
      const errors = validationResult(req)
      if(!errors.isEmpty()){
        return res.status(400).json({mensaje: errors.array()})
      }

      const existeEmail = await Usuario.findOne({ email: req.body.email });
      if (existeEmail) {
        return res.send("El email ya existe");
      }

      let usuario = new Usuario();
      usuario.nombre = req.body.nombre;
      usuario.email = req.body.email;
      usuario.estado = req.body.estado;
      usuario.rol= req.body.rol;
      const salt = bcript.genSaltSync()
      const contrasena = bcript.hashSync(req.body.contrasena, salt)
        
      usuario.contrasena = contrasena
      usuario.fechaCreacion = new Date();
      usuario.fechaActualizacion = new Date();

      usuario = await usuario.save();
      res.send(usuario);
    } catch (error) {
      console.log(error);
      res.send("Ocurrio un error");
    }
  }
);

router.get("/", [validarJWT, validarRolAdmin],async function (req, res) {
  try {
    const usuario = await Usuario.find();
    res.send(usuario);
  } catch (error) {
    console.log(error);
    res.status(500).send({mensaje: 'Internal error server'})
  }
});

router.get("/:usuarioId", async function (req, res) {
  try {
    const usuario = await Usuario.findById(req.params.usuarioId);
    if (!usuario) {
      return res.status(404).send("Marca no existe");
    }
    res.send(usuario);
  } catch (error) {
    console.log(error);
    res.status(500).send("Ocurrio un error al consultar usuario");
  }
});

router.put("/:usuarioId", async function (req, res) {
  try {
    console.log("Archivo recibido", req.body, req.params);

    let usuario = await Usuario.findById(req.params.usuarioId);

    if (!usuario) {
      return res.send("Usuario no existe");
    }

    const existeUsuario = await Usuario.findOne({
      email: req.body.email,
      _id: { $ne: usuario._id },
    });
    console.log("Respuesta existe usuario", existeUsuario);

    if (existeUsuario) {
      return res.send("Email ya existe");
    }

    usuario.email = req.body.email;
    usuario.nombre = req.body.nombre;
    usuario.estado = req.body.estado;
    usuario.fechaActualizacion = new Date();

    usuario = await usuario.save();
    res.send(usuario);
  } catch (error) {
    console.log(error);
    res.send("Ocurrio un error");
  }
});
module.exports = router;
