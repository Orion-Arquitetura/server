const express = require('express');
const { urlencoded, json } = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const usersRouter = require('./routes/usersRouter.js');
const dbconnection = require('./database/dbconn.js');
const authRouter = require('./routes/authRouter.js');
const refreshRouter = require('./routes/refreshRouter.js');
const logoutRouter = require('./routes/logoutRouter.js');
const projectsRouter = require('./routes/projectsRouter.js');
const filesPropsRouter = require('./routes/filesPropsRouter.js');
const filesRouter = require('./routes/filesRouter.js');
const nodemailer = require('nodemailer');
const reviewsRouter = require('./routes/reviewsRouter.js');
const Entrega = require('./database/models/entrega.js');
const mongoose = require("mongoose");
const entregasRouter = require('./routes/entregasRouter.js');
const notificationsRouter = require('./routes/notificationsRouter.js');
const relatoriosRouter = require('./routes/relatoriosRouter.js');

require("dotenv").config()
const app = express();

const corsOptions = process.env.NODE_ENV === "production" ? {
    origin: ["https://starmap.orionarquitetura.com", "https://starmap.cliente.orionarquitetura.com"],
    credentials: true,
} : {
    origin: [process.env.DEV_ORIGIN, "http://localhost:5174",],
    credentials: true,
}

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser(process.env.CK_SECRET));

dbconnection();

app.use('/auth', authRouter);
app.use('/refresh', refreshRouter);
app.use('/logout', logoutRouter);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);
app.use('/filesProps', filesPropsRouter);
app.use('/files', filesRouter);
app.use('/reviews', reviewsRouter);
app.use('/entregas', entregasRouter);
app.use('/notificacoes', notificationsRouter);
app.use('/relatorios', relatoriosRouter);

app.listen(4000, () => {
    console.log('Server running.');
});
