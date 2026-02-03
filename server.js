// Importation des dépendances
import express from "express";
import cors from "cors";
import "dotenv/config";
import mysql from 'mysql2/promise';

// Initialisation de l'application Express
const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// TODO: Exercice 3 - Activer le middleware CORS
// Utiliser le module cors déjà importé en haut du fichier
app.use(cors());

// Connexion à la base de données MySQL
const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'todo-admin',
    password: 'todo-password',
    database: 'todolist_db',
});

// Route racine - Message de bienvenue
app.get('/', (req, res) => {
    res.json({ message: "Bienvenue sur l'API ToDo" });
});

// GET /api/todos - Récupère toutes les tâches
app.get('/api/todos', async (req, res) => {
    try {
        const [results] = await connection.query('SELECT * FROM todos');

        res.json({ message: "Liste des tâches", data: results });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

// POST /api/todos - Ajoute une nouvelle tâche
app.post('/api/todos', async (req, res) => {
    try {
        const sql = 'INSERT INTO `todos`(`text`, `completed`) VALUES (?, ?)';

        // Validation des paramètres
        if (!req.body.text) {
            return res.status(400).json({ message: "Le champ 'text' est requis" });
        }

        // Permettre l'envoi d'une tâche sans le champ completed qui est défini à false par défaut s'il n'est pas soumis dans la requête
        // if (!req.body.completed) {
        //     return res.status(400).json({ message: "Le champ 'completed' est requis" });
        // }

        const values = [req.body.text, req.body.completed || false];

        const [result] = await connection.execute(sql, values);

        res.status(201).json({
            message: "Tâche créée avec succès",
            data: { id: result.insertId, text: req.body.text, completed: req.body.completed || false }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

// PUT /api/todos/:id - Modifier une tâche existante
app.put('/api/todos/:id', async (req, res) => {
    try {
        const sql = 'UPDATE `todos` SET `text` = ?, `completed` = ? WHERE `id` = ?';

        if (!req.body.text) {
            return res.status(400).json({ message: "Le champ 'text' est requis" });
        }

        if (req.body.completed === undefined) {
            return res.status(400).json({ message: "Le champ 'completed' est requis" });
        }

        const values = [req.body.text, req.body.completed, req.params.id];

        const [result] = await connection.execute(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }

        res.json({
            message: "Tâche modifiée avec succès",
            data: { id: Number(req.params.id), text: req.body.text, completed: req.body.completed }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

// DELETE /api/todos/:id - Supprimer une tâche par son ID
app.delete('/api/todos/:id', async (req, res) => {
    try {
        const sql = 'DELETE FROM `todos` WHERE `id` = ?';

        const [result] = await connection.execute(sql, [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }

        res.json({ message: "Tâche supprimée avec succès" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Serveur démarré sur : http://localhost:${PORT}`);
});