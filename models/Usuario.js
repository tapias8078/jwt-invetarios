const {Schema,model} = require('mongoose')

const UsuarioSchema = Schema({
    nombre:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    contrasena:{
        type:String,
        required:true},
    estado:{
        type:String, required:true, 
        enum:['Activo','Inactivo']},
    rol:{
        type:String, required:true, 
        enum:['Administrador','Docente']},

    fechaCreacion:{
        type:Date,
        required:true
    },
    fechaActualizacion:{
        type:Date,
        required:true
    }


})

module.exports = model('Usuario',UsuarioSchema)