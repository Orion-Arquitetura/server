
function isUserAdmin(req, res, next) {
    console.log(req.user.tipo)

    if (req.user.tipo === "administrador") {
        console.log("aqui")
        next()
        return
    }
    
    return res.sendStatus(401);
}

module.exports = isUserAdmin;
