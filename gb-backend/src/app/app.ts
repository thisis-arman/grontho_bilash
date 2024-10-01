import { Application, Request, Response } from "express"

const express = require('express')
const app :Application = express()
const port = 3000

app.get('/', (req :Request, res :Response) => {
  res.send('Hello World!')
})



export default app;