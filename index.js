require("dotenv").config()
const express = require("express")
const Note = require("./models/note")

const app = express()






const requestLogger = (req, res, next) => {
    console.log("Method:", req.method)
    console.log("Path  :", req.path)
    console.log("Body  :", req.body)
    console.log("---")
    next()
}

app.use(express.json())
app.use(express.static("dist"))
app.use(requestLogger)

let notes = [{ id: "1", content: "HTML is easy", important: true }, { id: "2", content: "Browser can execute only JavaScript", important: false }, { id: "3", content: "GET and POST are the most important methods of HTTP protocol", important: true }]

app.get("/", (req, res) => {
    res.send("<h1>hello world</h1>")
})

app.get("/api/notes", (req, res) => {
    Note.find({}).then(notes => {
        res.json(notes)
    })
})

app.get("/api/notes/:id", (req, res, next) => {
    const id = req.params.id
    Note.findById(id).then(note => {
        if (note) {
            res.json(note)
        } else {
            res.status(404).end()
        }
    }).catch(error => {
        next(error)
    })

})

app.delete("/api/notes/:id", (req, res, next) => {
    const id = req.params.id
    Note.findByIdAndDelete(id).then(result => {
        res.status(204).end()
    }).catch(error => next(error))
})



app.post("/api/notes", (req, res, next) => {
    const body = req.body
    if (!body.content) {
        return res.status(400).json({ error: "content missing" })
    }
    const note = new Note({
        content: body.content,
        important: body.important || false,
    })
    note.save().then(savedNote => {
        res.json(savedNote)
    }).catch(error => next(error))
})

app.put("/api/notes/:id", (req, res, next) => {
    const {content, important} = req.body
    Note.findById(req.params.id).then(note => {
        if (!note) {
            return res.status(404).end()
        }
        note.content = content
        note.important = important
        return note.save().then(savedNote => {
            return res.json(savedNote)
        })
    }).catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)

const errorHandler = (err, req, res, next) => {
    console.log(err.message)
    if (err.name === "CastError") {
        return res.status(400).json({ error: "malformatted id" })
    } else if (err.name === "ValidationError") {
        return res.status(400).json({error: err.message})
    }
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`)
})