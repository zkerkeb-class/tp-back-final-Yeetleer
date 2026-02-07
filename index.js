import express from 'express';
import cors from 'cors';
import pokemon from './schema/pokemon.js';

import './connect.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/assets', express.static('assets'));

//La pagination 20 par 20
app.get('/pokemons', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const nombre_pagination = 20;
  const skip = (page - 1) * nombre_pagination;
  try {
    const pokemons = await pokemon.find({}).skip(skip).limit(nombre_pagination);
    res.json(pokemons);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

//Recherche de Pokémon par ID
app.get('/pokemons/:id', async (req, res) => {
  try {
    const pokeId = parseInt(req.params.id, 10);
    const poke = await pokemon.findOne({ id: pokeId });
    if (poke) {
      res.json(poke);
    } else {
      res.status(404).json({ error: 'Pokemon not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Recherche de Pokémon par Nom
app.get('/pokemons/recherche/:name', async (req, res) => {
  try {
    const pokeName = req.params.name;
    const poke = await pokemon.findOne({ "name.french": { $regex: new RegExp(pokeName, "i") } 
    });
    if (poke) {
      res.json(poke);
    } else {
      res.status(404).json({ error: 'Pokemon not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//Ajout d'un Pokémon
app.post('/pokemons', async (req, res) => {
    const pokemon_fiche = new pokemon({
      id: req.body.id,
      name: {
        french: req.body.name.french
      },
      type: req.body.type,
      base: {
        HP: req.body.base.HP,
        Attack: req.body.base.Attack,
        Defense: req.body.base.Defense,
        SpecialAttack: req.body.base.SpecialAttack,
        SpecialDefense: req.body.base.SpecialDefense,
        Speed: req.body.base.Speed
      },
      image: req.body.image
    });

    try {
        const nouveau_pokemon = await pokemon_fiche.save();
        res.status(201).json(nouveau_pokemon);
    } catch (error) {
        res.status(400).json({ error: 'Invalid request' });
    }
});

//Modification d'un Pokémon
app.put('/pokemons/:id', async (req, res) => {
  try {
    const poke_update = await pokemon.findOneAndUpdate(
      { id: req.params.id }, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );

    if (!poke_update) {
      return res.status(404).json({ error: "This Pokemon doesn't exist" });
    }
    res.json(poke_update);
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

//Suppression d'un pokémon
app.delete('/pokemons/:id', async (req, res) => {
  try {
    const pokeID_delete = await pokemon.findOneAndDelete({ id: req.params.id });

    if (!pokeID_delete) {
      return res.status(404).json({ error: "This Pokemon doesn't exist" });
    }
    res.json({ message: "Le Pokémon a été supprimé" });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


console.log('Server is set up. Ready to start listening on a port.');

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});