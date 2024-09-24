import React, { useState, useEffect, useCallback } from "react";
import './App.css';

interface PokemonData {
  name: string;
}

interface PokemonDetails {
  forms: { name: string }[];
  sprites: {
    front_default: string;
  };
}

interface PokemonProps {
  pokemon: PokemonData;
  onRemove: (name: string) => void;
}

const Pokemon: React.FC<PokemonProps> = ({ pokemon, onRemove }) => {
  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
        if (!response.ok) {
          throw new Error(`Pokemon ${pokemon.name} not found`);
        }
        const data: PokemonDetails = await response.json();
        setDetails(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [pokemon.name]);

  const forms = details?.forms.map((form) => form.name).join(", ") || "No data";

  if (loading) return <p>Loading...</p>;

  return (
    <li className="pokemon">
      <div className="pokemon_name">Name: {pokemon.name}</div>
      <div className="pokemon_details">
      {details && (
        <>
          <p>Number of forms: {details.forms.length}</p>
          <p>Forms: {forms}</p>
          <img src={details.sprites.front_default} alt={pokemon.name} />
        </>
      )}
      <button onClick={() => onRemove(pokemon.name)}>X</button>
      </div>
    </li>
  );
};

interface PokemonListItem {
  name: string;
}

const SearchForm: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);

  useEffect(() => {
    const loadInitialPokemons = async () => {
      try {
        const responses = await Promise.all(
          Array.from({ length: 20 }, (_, i) =>
            fetch(`https://pokeapi.co/api/v2/pokemon/${i + 1}`)
          )
        );
        const data = await Promise.all(responses.map((res) => res.json()));
        setPokemonList(data);
      } catch (err) {
        console.error("Loading's error...", err);
      }
    };

    loadInitialPokemons();
  }, []);

  const fetchPokemon = async (name: string) => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!response.ok) {
        throw new Error(`Pokemon ${name} not found`);
      }
      const data = await response.json();
      
      setPokemonList((prevList) => {
        if (prevList.some((pokemon) => pokemon.name === data.name)) {
          return prevList;
        }
        return [data, ...prevList];
      });
      setError(null);
      setQuery(""); 
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      fetchPokemon(query.trim().toLowerCase());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleRemove = useCallback((name: string) => {
    setPokemonList((prevList) => prevList.filter((pokemon) => pokemon.name !== name));
  }, []);

  return (
    <>
      <div className="searching">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyUp={handleKeyPress}
          placeholder="Add new pokemon"
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {error && <p>{error}</p>}
      <ul className="list">
        {pokemonList.map((pokemon) => (
          <Pokemon key={pokemon.name} pokemon={pokemon} onRemove={handleRemove} />
        ))}
      </ul>
    </>
  );
};


const App: React.FC = () => {
  return <SearchForm />;
};

export default App;
